"""Payment service - Database operations for payment management

This service handles ONLY database operations for payments.
Payment provider integrations (Venti, Mercado Pago) will be in separate modules.
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.payment import Payment, PaymentProvider, PaymentStatus


class PaymentService:
    """Service for payment database operations"""

    @staticmethod
    async def create_payment(
        db: AsyncSession,
        order_id: int,
        amount: Decimal,
        provider: PaymentProvider,
        currency: str = "CLP",
        provider_reference: Optional[str] = None,
    ) -> Payment:
        """
        Create a new payment record in PENDING status.

        Args:
            db: Database session
            order_id: Order ID to link payment
            amount: Payment amount
            provider: Payment provider (MERCADO_PAGO)
            currency: Currency code (default CLP)
            provider_reference: Optional reference from provider

        Returns:
            Created Payment instance
        """
        payment = Payment(
            order_id=order_id,
            amount=amount,
            currency=currency,
            provider=provider,
            status=PaymentStatus.PENDING,
            provider_reference=provider_reference,
        )
        db.add(payment)
        await db.commit()
        await db.refresh(payment)
        return payment

    @staticmethod
    async def get_payment_by_id(
        db: AsyncSession,
        payment_id: int,
        include_order: bool = False,
    ) -> Optional[Payment]:
        """
        Retrieve payment by ID.

        Args:
            db: Database session
            payment_id: Payment ID
            include_order: Whether to eager load order relationship

        Returns:
            Payment instance or None
        """
        query = select(Payment).where(Payment.id == payment_id)

        if include_order:
            query = query.options(selectinload(Payment.order))

        result = await db.execute(query)
        return result.scalars().first()

    @staticmethod
    async def get_payments_by_order(
        db: AsyncSession,
        order_id: int,
    ) -> Sequence[Payment]:
        """
        Get all payments for an order (useful for retries/refunds).

        Args:
            db: Database session
            order_id: Order ID

        Returns:
            Sequence of Payment instances
        """
        result = await db.execute(
            select(Payment).where(Payment.order_id == order_id).order_by(Payment.created_at.desc())
        )
        return result.scalars().all()

    @staticmethod
    async def get_payment_by_provider_id(
        db: AsyncSession,
        provider_payment_id: str,
        provider: PaymentProvider,
    ) -> Optional[Payment]:
        """
        Find payment by provider's payment ID (for webhook lookups).

        Args:
            db: Database session
            provider_payment_id: Payment ID from provider
            provider: Payment provider

        Returns:
            Payment instance or None
        """
        result = await db.execute(
            select(Payment).where(
                Payment.provider_payment_id == provider_payment_id,
                Payment.provider == provider,
            )
        )
        return result.scalars().first()

    @staticmethod
    async def update_payment_status(
        db: AsyncSession,
        payment_id: int,
        status: PaymentStatus,
        provider_payment_id: Optional[str] = None,
        error_message: Optional[str] = None,
    ) -> Optional[Payment]:
        """
        Update payment status (called by webhooks or after provider responses).

        Args:
            db: Database session
            payment_id: Payment ID
            status: New payment status
            provider_payment_id: Provider's payment ID
            error_message: Error message if status is FAILED

        Returns:
            Updated Payment instance or None
        """
        payment = await PaymentService.get_payment_by_id(db, payment_id)
        if not payment:
            return None

        payment.status = status  # type: ignore
        payment.updated_at = datetime.utcnow()  # type: ignore

        if provider_payment_id:
            payment.provider_payment_id = provider_payment_id  # type: ignore

        if error_message:
            payment.error_message = error_message  # type: ignore

        if status == PaymentStatus.COMPLETED:
            payment.completed_at = datetime.utcnow()  # type: ignore

        await db.commit()
        await db.refresh(payment)
        return payment

    @staticmethod
    async def mark_payment_failed(
        db: AsyncSession,
        payment_id: int,
        error_message: str,
    ) -> Optional[Payment]:
        """
        Mark payment as failed with error message.

        Args:
            db: Database session
            payment_id: Payment ID
            error_message: Failure reason

        Returns:
            Updated Payment instance or None
        """
        return await PaymentService.update_payment_status(
            db=db,
            payment_id=payment_id,
            status=PaymentStatus.FAILED,
            error_message=error_message,
        )

    @staticmethod
    async def mark_payment_completed(
        db: AsyncSession,
        payment_id: int,
        provider_payment_id: str,
    ) -> Optional[Payment]:
        """
        Mark payment as completed.

        Args:
            db: Database session
            payment_id: Payment ID
            provider_payment_id: Provider's payment confirmation ID

        Returns:
            Updated Payment instance or None
        """
        return await PaymentService.update_payment_status(
            db=db,
            payment_id=payment_id,
            status=PaymentStatus.COMPLETED,
            provider_payment_id=provider_payment_id,
        )

    @staticmethod
    async def refund_payment(
        db: AsyncSession,
        payment_id: int,
    ) -> Optional[Payment]:
        """
        Mark payment as refunded.
        Note: Actual refund processing with the provider should be done separately.

        Args:
            db: Database session
            payment_id: Payment ID

        Returns:
            Updated Payment instance or None
        """
        payment = await PaymentService.get_payment_by_id(db, payment_id)
        if not payment:
            return None

        if payment.status != PaymentStatus.COMPLETED:  # type: ignore
            raise ValueError("Can only refund completed payments")

        payment.status = PaymentStatus.REFUNDED  # type: ignore
        payment.updated_at = datetime.utcnow()  # type: ignore

        await db.commit()
        await db.refresh(payment)
        return payment

    @staticmethod
    async def get_pending_payments(
        db: AsyncSession,
        older_than_minutes: int = 30,
    ) -> Sequence[Payment]:
        """
        Get pending payments older than X minutes (for timeout cleanup).

        Args:
            db: Database session
            older_than_minutes: Age threshold in minutes

        Returns:
            Sequence of stale Payment instances
        """
        from datetime import timedelta

        cutoff_time = datetime.utcnow() - timedelta(minutes=older_than_minutes)

        result = await db.execute(
            select(Payment).where(
                Payment.status == PaymentStatus.PENDING,
                Payment.created_at < cutoff_time,
            )
        )
        return result.scalars().all()
