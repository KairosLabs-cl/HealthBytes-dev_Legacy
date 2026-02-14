"""
Mercado Pago Payment Service
Handles payment initialization, verification, and webhook processing
"""

import hashlib
import hmac
from datetime import datetime
from typing import Dict, Optional, List
from decimal import Decimal

import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.db.models.payment import Payment, PaymentProvider, PaymentStatus, PaymentCurrency
from app.db.schemas import Order
from app.core.exceptions import PaymentError
from app.config import Settings


class MercadoPagoService:
    """Service for Mercado Pago payment integration"""

    def __init__(self, settings: Settings):
        self.settings = settings
        self.access_token = settings.***REDACTED_MERCADOPAGO_TOKEN***
        self.webhook_secret = settings.MERCADO_PAGO_WEBHOOK_SECRET
        self.api_base_url = "https://api.mercadopago.com"

    async def create_preference(
        self,
        db: AsyncSession,
        order_id: int,
        amount: Decimal,
        currency: PaymentCurrency = PaymentCurrency.CLP,
        description: str = "HealthBytes Order",
        payer_email: Optional[str] = None,
    ) -> Dict:
        """
        Create a Mercado Pago payment preference

        Args:
            db: Database session
            order_id: Order ID to associate payment with
            amount: Payment amount
            currency: Payment currency (default CLP)
            description: Payment description
            payer_email: Payer email for pre-fill

        Returns:
            Dict with preference_id, init_point (checkout URL), and sandbox_init_point

        Raises:
            PaymentError: If preference creation fails
        """
        # Verify order exists
        result = await db.execute(select(Order).where(Order.id == order_id))
        order = result.scalar_one_or_none()

        if not order:
            raise PaymentError(f"Order {order_id} not found")

        if order.status == "cancelled":
            raise PaymentError(f"Order {order_id} is cancelled")

        # Create payment record
        payment = Payment(
            order_id=order_id,
            amount=amount,
            currency=currency,
            provider=PaymentProvider.MERCADO_PAGO,
            status=PaymentStatus.PENDING,
        )
        db.add(payment)
        await db.commit()
        await db.refresh(payment)

        # Build preference payload
        preference_data = {
            "items": [
                {
                    "title": description,
                    "quantity": 1,
                    "currency_id": currency.value,
                    "unit_price": float(amount),
                }
            ],
            "back_urls": {
                "success": f"{self.settings.FRONTEND_URL}/payment/success?order_id={order_id}",
                "failure": f"{self.settings.FRONTEND_URL}/payment/failure?order_id={order_id}",
                "pending": f"{self.settings.FRONTEND_URL}/payment/pending?order_id={order_id}",
            },
            "auto_return": "approved",
            "external_reference": str(order_id),
            "notification_url": f"{self.settings.BACKEND_URL}/api/v1/payments/mercadopago/webhook",
            "statement_descriptor": "HEALTHBYTES",
            "metadata": {
                "order_id": order_id,
                "payment_id": payment.id,
            },
        }

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
        self, db: AsyncSession, payment_id: str, topic: str, webhook_signature: Optional[str] = None
    ) -> Dict:
        """
        Process Mercado Pago webhook notification

        Args:
            db: Database session
            payment_id: Mercado Pago payment ID
            topic: Notification topic (payment, merchant_order)
            webhook_signature: Optional signature for validation

        Returns:
            Dict with processing status

        Raises:
            PaymentError: If processing fails
        """
        # Validate signature if provided
        if webhook_signature and self.webhook_secret:
            # Implement signature validation
            # MP signature format: x-signature: ts={timestamp},v1={hash}
            pass

        # Get payment info from Mercado Pago
        payment_info = await self.get_payment_info(payment_id)

        # Extract data
        status = payment_info.get("status")
        external_reference = payment_info.get("external_reference")

        if not external_reference:
            raise PaymentError("No external_reference in payment info")

        order_id = int(external_reference)

        # Find our payment record by provider_payment_id
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
        payment.status = new_status
        payment.updated_at = datetime.utcnow()

        # Store full response in metadata (optional, requires JSON field in model)
        # payment.metadata = payment_info

        # Update order status if payment completed
        if new_status == PaymentStatus.COMPLETED:
            result = await db.execute(select(Order).where(Order.id == order_id))
            order = result.scalar_one_or_none()
            if order:
                order.status = "confirmed"
                order.updated_at = datetime.utcnow()

        await db.commit()

        return {
            "payment_id": payment.id,
            "order_id": order_id,
            "status": new_status.value,
            "mp_payment_id": payment_id,
        }

    def verify_webhook_signature(self, payload: str, signature: str, timestamp: str) -> bool:
        """
        Verify Mercado Pago webhook signature

        Args:
            payload: Raw webhook payload
            signature: Signature from x-signature header
            timestamp: Timestamp from x-signature header

        Returns:
            True if signature is valid
        """
        if not self.webhook_secret:
            return True  # Skip validation if no secret configured

        # Build expected signature
        # MP uses: HMAC-SHA256(secret, timestamp + payload)
        message = f"{timestamp}{payload}"
        expected = hmac.new(
            self.webhook_secret.encode(),
            message.encode(),
            hashlib.sha256,
        ).hexdigest()

        return hmac.compare_digest(expected, signature)

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
                    raise PaymentError(f"Refund failed: {response.status_code} - {error}")

                refund_info = response.json()

                # Update payment status
                payment.status = PaymentStatus.REFUNDED
                payment.updated_at = datetime.utcnow()
                await db.commit()

                return {
                    "payment_id": payment.id,
                    "refund_id": refund_info.get("id"),
                    "amount": refund_info.get("amount"),
                    "status": "refunded",
                }

        except httpx.RequestError as e:
            raise PaymentError(f"Network error during refund: {str(e)}")
