"""
Mercado Pago Payment Service
Handles payment initialization, verification, and webhook processing
"""

import hashlib
import hmac
import logging
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any, Dict, Optional

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import Settings
from app.core.exceptions import PaymentError
from app.db.models.payment import Payment, PaymentCurrency, PaymentProvider, PaymentStatus
from app.db.schemas import Order
from app.services.stock_service import StockService

logger = logging.getLogger(__name__)


class MercadoPagoService:
    """Service for Mercado Pago payment integration"""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.access_token = settings.MERCADO_PAGO_ACCESS_TOKEN
        self.webhook_secret = settings.MERCADO_PAGO_WEBHOOK_SECRET
        self.api_base_url = "https://api.mercadopago.com"

    async def create_preference(
        self,
        db: AsyncSession,
        order_id: int,
        currency: PaymentCurrency = PaymentCurrency.CLP,
        payer_email: Optional[str] = None,
    ) -> Dict:
        """
        Create a Mercado Pago payment preference from an order.

        Fetches the order with items, calculates total from DB prices,
        and creates a preference with individual line items.

        Args:
            db: Database session
            order_id: Order ID to associate payment with
            currency: Payment currency (default CLP)
            payer_email: Payer email for pre-fill

        Returns:
            Dict with preference_id, init_point (checkout URL), and sandbox_init_point

        Raises:
            PaymentError: If preference creation fails
        """
        # Fetch order with items
        result = await db.execute(
            select(Order).where(Order.id == order_id).options(selectinload(Order.items))
        )
        order = result.scalar_one_or_none()

        if not order:
            raise PaymentError(f"Order {order_id} not found")

        if order.status == "cancelled":
            raise PaymentError(f"Order {order_id} is cancelled")

        if not order.items:
            raise PaymentError(f"Order {order_id} has no items")

        # Calculate total from DB (never trust client)
        total = sum(Decimal(str(item.price)) * item.quantity for item in order.items)

        # Create payment record
        payment = Payment(
            order_id=order_id,
            amount=total,
            currency=currency,
            provider=PaymentProvider.MERCADO_PAGO,
            status=PaymentStatus.PENDING,
        )
        db.add(payment)
        await db.commit()
        await db.refresh(payment)

        # Build individual items for the preference
        mp_items = []
        for item in order.items:
            mp_items.append(
                {
                    "id": str(item.product_id),
                    "title": f"Producto #{item.product_id}",
                    "quantity": item.quantity,
                    "currency_id": currency.value,
                    "unit_price": float(item.price),
                }
            )

        # Build preference payload
        is_production = self.settings.ENVIRONMENT == "production"

        preference_data = {
            "items": mp_items,
            "external_reference": str(order_id),
            "statement_descriptor": "HEALTHBYTES",
            "metadata": {
                "order_id": order_id,
                "payment_id": payment.id,
            },
        }

        # back_urls and notification_url require public HTTPS URLs (not localhost)
        # Works for production and for staging/testing with ngrok or similar public URLs
        backend_url = self.settings.BACKEND_URL or ""
        frontend_url = self.settings.FRONTEND_URL or ""
        is_public = is_production or backend_url.startswith("https://")

        if is_public and frontend_url:
            preference_data["back_urls"] = {
                "success": f"{frontend_url}/payment/success?orderId={order_id}",
                "failure": f"{frontend_url}/payment/failure?orderId={order_id}",
                "pending": f"{frontend_url}/payment/pending?orderId={order_id}",
            }
            preference_data["auto_return"] = "approved"

        if is_public and backend_url:
            preference_data["notification_url"] = (
                f"{backend_url}/api/v1/payments/mercadopago/webhook"
            )

        if payer_email:
            preference_data["payer"] = {"email": payer_email}

        # Call Mercado Pago API
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_base_url}/checkout/preferences",
                    json=preference_data,
                    headers={
                        "Authorization": f"Bearer {self.access_token}",
                        "Content-Type": "application/json",
                    },
                    timeout=30.0,
                )

                if response.status_code not in (200, 201):
                    error_detail = response.json() if response.text else {}
                    logger.error(
                        "Mercado Pago preference error: %s - %s",
                        response.status_code,
                        error_detail,
                    )
                    raise PaymentError(
                        f"Mercado Pago API error: {response.status_code} - {error_detail}"
                    )

                preference = response.json()

                # Update payment with preference ID
                payment.provider_payment_id = preference["id"]
                await db.commit()

                return {
                    "payment_id": payment.id,
                    "preference_id": preference["id"],
                    "init_point": preference["init_point"],
                    "sandbox_init_point": preference.get("sandbox_init_point"),
                }

        except httpx.RequestError as e:
            logger.error("Network error calling Mercado Pago: %s", e)
            raise PaymentError(f"Network error calling Mercado Pago: {str(e)}")

    async def get_payment_info(self, payment_id: str) -> Dict:
        """
        Get payment information from Mercado Pago

        Args:
            payment_id: Mercado Pago payment ID

        Returns:
            Payment information dict

        Raises:
            PaymentError: If request fails
        """
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.api_base_url}/v1/payments/{payment_id}",
                    headers={"Authorization": f"Bearer {self.access_token}"},
                    timeout=30.0,
                )

                if response.status_code != 200:
                    raise PaymentError(f"Failed to get payment info: {response.status_code}")

                return response.json()

        except httpx.RequestError as e:
            raise PaymentError(f"Network error: {str(e)}")

    async def process_webhook(
        self,
        db: AsyncSession,
        payment_id: str,
        topic: str,
        webhook_signature: Optional[str] = None,
        request_id: Optional[str] = None,
        background_tasks: Optional[Any] = None,
    ) -> Dict:
        """
        Process Mercado Pago webhook notification

        Args:
            db: Database session
            payment_id: Mercado Pago payment ID
            topic: Notification topic (payment, merchant_order)
            webhook_signature: Optional x-signature header for validation
            request_id: Optional x-request-id header for signature validation
            background_tasks: Optional FastAPI BackgroundTasks instance. When
                provided, the payment-success email is enqueued as a background
                task (decoupled from the DB session lifecycle). When None, the
                email is sent inline with a try/except fallback.

        Returns:
            Dict with processing status

        Raises:
            PaymentError: If processing fails
        """
        # Validate signature if provided
        if webhook_signature and self.webhook_secret:
            if not self._validate_x_signature(webhook_signature, payment_id, request_id):
                logger.warning("Invalid webhook signature for payment %s", payment_id)
                raise PaymentError("Invalid webhook signature")

        # Get payment info from Mercado Pago
        payment_info = await self.get_payment_info(payment_id)

        # Extract data
        status = payment_info.get("status")
        external_reference = payment_info.get("external_reference")

        if not external_reference:
            raise PaymentError("No external_reference in payment info")

        order_id = int(external_reference)

        # Find our payment record
        result = await db.execute(
            select(Payment).where(
                Payment.order_id == order_id,
                Payment.provider == PaymentProvider.MERCADO_PAGO,
            )
        )
        payment = result.scalar_one_or_none()

        if not payment:
            raise PaymentError(f"Payment not found for order {order_id}")

        # Update payment status based on MP status
        status_map = {
            "approved": PaymentStatus.COMPLETED,
            "pending": PaymentStatus.PENDING,
            "in_process": PaymentStatus.PROCESSING,
            "rejected": PaymentStatus.FAILED,
            "cancelled": PaymentStatus.CANCELLED,
            "refunded": PaymentStatus.REFUNDED,
        }

        new_status = status_map.get(status, PaymentStatus.PENDING)
        previous_status = payment.status

        # Idempotency guard: skip if already in the desired state
        if new_status == previous_status:
            logger.info(
                "Webhook idempotent: payment %s already in status %s, skipping",
                payment_id,
                new_status.value,
            )
            return {
                "payment_id": payment.id,
                "order_id": order_id,
                "status": new_status.value,
                "mp_payment_id": payment_id,
            }

        payment.status = new_status
        payment.provider_payment_id = payment_id
        payment.updated_at = datetime.now(UTC)

        if new_status == PaymentStatus.COMPLETED:
            payment.completed_at = datetime.now(UTC)

        # Update order status if payment completed
        if new_status == PaymentStatus.COMPLETED:
            result = await db.execute(select(Order).where(Order.id == order_id))
            order = result.scalar_one_or_none()
            if order:
                order.status = "confirmed"

        elif new_status in (PaymentStatus.FAILED, PaymentStatus.CANCELLED):
            result = await db.execute(
                select(Order).where(Order.id == order_id).options(selectinload(Order.items))
            )
            order = result.scalar_one_or_none()
            if order and order.status != "cancelled":
                order.status = "cancelled"
                # Release reserved stock for each item
                for item in order.items:
                    try:
                        await StockService.release_stock(
                            db=db,
                            product_id=item.product_id,
                            quantity=item.quantity,
                            reason=f"Payment {new_status.value} for order {order_id}",
                        )
                    except Exception:
                        logger.exception(
                            "Failed to release stock for product %s (order %s)",
                            item.product_id,
                            order_id,
                        )

        await db.commit()

        # Send payment success email only on actual transition to COMPLETED
        if new_status == PaymentStatus.COMPLETED and previous_status != PaymentStatus.COMPLETED:
            if background_tasks is not None:
                # Enqueue as a background task so the webhook response is returned
                # to Mercado Pago immediately, fully decoupled from the DB session.
                background_tasks.add_task(
                    self._send_payment_success_email,
                    order_id=order_id,
                )
            else:
                # Fallback: send inline (e.g. when called from tests or other
                # contexts that do not provide a BackgroundTasks instance).
                try:
                    from app.services.email_service import EmailService, build_order_email_data

                    email_svc = EmailService(self.settings)
                    email_data = await build_order_email_data(db, order_id)
                    if email_data:
                        await email_svc.send_payment_success(email_data)
                except Exception:
                    logger.exception(
                        "Failed to send payment success email for order %s", order_id
                    )

        logger.info(
            "Webhook processed: order=%s, mp_payment=%s, status=%s",
            order_id,
            payment_id,
            new_status.value,
        )

        return {
            "payment_id": payment.id,
            "order_id": order_id,
            "status": new_status.value,
            "mp_payment_id": payment_id,
        }

    async def _send_payment_success_email(self, order_id: int) -> None:
        """
        Send the payment-success email for an order.

        Opens its own DB session so it is safe to call from a FastAPI
        BackgroundTask (the original request session may already be closed).
        Failures are caught and logged — they must never propagate to the
        background-task runner and trigger an unhandled exception.
        """
        try:
            from app.db.database import AsyncSessionLocal
            from app.services.email_service import EmailService, build_order_email_data

            async with AsyncSessionLocal() as db:
                email_svc = EmailService(self.settings)
                email_data = await build_order_email_data(db, order_id)
                if email_data:
                    await email_svc.send_payment_success(email_data)
                    logger.info(
                        "Payment success email sent for order %s", order_id
                    )
                else:
                    logger.warning(
                        "Could not build email data for order %s — email skipped", order_id
                    )
        except Exception:
            logger.exception(
                "Failed to send payment success email for order %s", order_id
            )

    def _validate_x_signature(
        self, x_signature: str, data_id: str, request_id: Optional[str] = None
    ) -> bool:
        """
        Validate Mercado Pago x-signature header.

        MP sends: x-signature: ts=<timestamp>,v1=<hash>
        Hash is HMAC-SHA256(secret, "id:<data_id>;request-id:<request_id>;ts:<timestamp>;")
        When x-request-id header is absent, request-id is omitted from the manifest.

        Args:
            x_signature: Full x-signature header value
            data_id: The payment/resource ID from the notification
            request_id: Optional x-request-id header value from MP

        Returns:
            True if signature is valid
        """
        if not self.webhook_secret:
            return True  # Skip validation if no secret configured

        try:
            # Parse x-signature: "ts=12345,v1=abcdef..."
            parts = {}
            for part in x_signature.split(","):
                key, _, value = part.strip().partition("=")
                parts[key] = value

            ts = parts.get("ts", "")
            v1 = parts.get("v1", "")

            if not ts or not v1:
                return False

            # Build the manifest string per MP docs — include request-id when present
            if request_id:
                manifest = f"id:{data_id};request-id:{request_id};ts:{ts};"
            else:
                manifest = f"id:{data_id};ts:{ts};"

            expected = hmac.new(
                self.webhook_secret.encode(),
                manifest.encode(),
                hashlib.sha256,
            ).hexdigest()

            return hmac.compare_digest(expected, v1)

        except Exception:
            logger.exception("Error validating webhook signature")
            return False

    async def refund_payment(
        self, db: AsyncSession, payment_id: int, amount: Optional[Decimal] = None
    ) -> Dict:
        """
        Refund a Mercado Pago payment

        Args:
            db: Database session
            payment_id: Internal payment ID
            amount: Optional partial refund amount (None = full refund)

        Returns:
            Dict with refund info

        Raises:
            PaymentError: If refund fails
        """
        # Get payment
        result = await db.execute(select(Payment).where(Payment.id == payment_id))
        payment = result.scalar_one_or_none()

        if not payment:
            raise PaymentError(f"Payment {payment_id} not found")

        if payment.status != PaymentStatus.COMPLETED:
            raise PaymentError("Can only refund completed payments")

        if not payment.provider_payment_id:
            raise PaymentError("No Mercado Pago payment ID found")

        # Build refund payload
        refund_data = {}
        if amount:
            refund_data["amount"] = float(amount)

        # Call MP refund API
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.api_base_url}/v1/payments/{payment.provider_payment_id}/refunds",
                    json=refund_data if refund_data else None,
                    headers={
                        "Authorization": f"Bearer {self.access_token}",
                        "Content-Type": "application/json",
                    },
                    timeout=30.0,
                )

                if response.status_code not in (200, 201):
                    error = response.json() if response.text else {}
                    logger.error("Refund failed: %s - %s", response.status_code, error)
                    raise PaymentError(f"Refund failed: {response.status_code} - {error}")

                refund_info = response.json()

                # Update payment status
                payment.status = PaymentStatus.REFUNDED
                payment.updated_at = datetime.now(UTC)

                # Release stock and cancel order on full refund
                if not amount:
                    order_result = await db.execute(
                        select(Order)
                        .where(Order.id == payment.order_id)
                        .options(selectinload(Order.items))
                    )
                    order = order_result.scalar_one_or_none()
                    if order and order.status != "cancelled":
                        order.status = "cancelled"
                        for item in order.items:
                            try:
                                await StockService.release_stock(
                                    db=db,
                                    product_id=item.product_id,
                                    quantity=item.quantity,
                                    reason=f"Refund for order {payment.order_id}",
                                )
                            except Exception:
                                logger.exception(
                                    "Failed to release stock for product %s (refund order %s)",
                                    item.product_id,
                                    payment.order_id,
                                )

                await db.commit()

                logger.info("Payment %s refunded successfully", payment.id)

                return {
                    "payment_id": payment.id,
                    "refund_id": refund_info.get("id"),
                    "amount": refund_info.get("amount"),
                    "status": "refunded",
                }

        except httpx.RequestError as e:
            logger.error("Network error during refund: %s", e)
            raise PaymentError(f"Network error during refund: {str(e)}")
