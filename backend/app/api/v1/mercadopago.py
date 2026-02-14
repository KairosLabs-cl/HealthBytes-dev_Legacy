"""
API Router for Mercado Pago Payment Integration
"""

from typing import Optional
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.services.mercadopago_service import MercadoPagoService
from app.core.exceptions import PaymentError
from app.config import settings
from app.middleware.auth import get_current_user
from app.schemas.payment import PaymentResponse
from pydantic import BaseModel


router = APIRouter(prefix="/payments/mercadopago", tags=["Mercado Pago"])


class CreatePreferenceRequest(BaseModel):
    """Request to create a Mercado Pago payment preference"""
    order_id: int
    description: Optional[str] = "HealthBytes Order"
    payer_email: Optional[str] = None


class CreatePreferenceResponse(BaseModel):
    """Response with Mercado Pago preference data"""
    payment_id: int
    preference_id: str
    init_point: str
    sandbox_init_point: Optional[str] = None


class RefundRequest(BaseModel):
    """Request to refund a payment"""
    payment_id: int
    amount: Optional[Decimal] = None


@router.post("/create-preference", response_model=CreatePreferenceResponse)
async def create_payment_preference(
    request: CreatePreferenceRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Create a Mercado Pago payment preference for an order
    
    This generates a checkout URL (init_point) that the frontend can redirect to.
    """
    mp_service = MercadoPagoService(settings)
    
    try:
        # Get order and verify ownership
        from app.services.order_service import get_order
        order = await get_order(db, request.order_id, current_user.id)

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Calculate total
        total = sum(item.price * item.quantity for item in order.items)
        
        # Create preference
        preference = await mp_service.create_preference(
            db=db,
            order_id=request.order_id,
            amount=Decimal(str(total)),
            description=request.description,
            payer_email=request.payer_email,
        )
        
        return CreatePreferenceResponse(**preference)
        
    except PaymentError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def mercadopago_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    x_signature: Optional[str] = Header(None),
):
    """
    Webhook endpoint for Mercado Pago payment notifications
    
    MP will POST here when payment status changes.
    """
    mp_service = MercadoPagoService(settings)
    
    try:
        # Get raw body for signature verification
        body = await request.body()
        
        # Parse notification
        data = await request.json()
        
        # MP sends different notification types
        # type can be: payment, merchant_order, etc.
        notification_type = data.get("type")
        
        if notification_type == "payment":
            # Extract payment ID
            payment_id = data.get("data", {}).get("id")
            
            if not payment_id:
                raise HTTPException(status_code=400, detail="No payment ID in webhook")
            
            # Process webhook
            result = await mp_service.process_webhook(
                db=db,
                payment_id=str(payment_id),
                topic="payment",
                webhook_signature=x_signature,
            )
            
            return {"status": "ok", "result": result}
        
        # For other notification types, just acknowledge
        return {"status": "ok", "message": f"Notification type {notification_type} acknowledged"}
        
    except PaymentError as e:
        # Don't raise HTTP error for MP, just log it
        print(f"Webhook processing error: {str(e)}")
        return {"status": "error", "message": str(e)}


@router.get("/payment/{payment_id}")
async def get_payment_status(
    payment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Get payment status from Mercado Pago
    
    Useful for polling payment status on the frontend.
    """
    mp_service = MercadoPagoService(settings)
    
    try:
        payment_info = await mp_service.get_payment_info(payment_id)
        
        return {
            "payment_id": payment_id,
            "status": payment_info.get("status"),
            "status_detail": payment_info.get("status_detail"),
            "external_reference": payment_info.get("external_reference"),
        }
        
    except PaymentError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/refund")
async def refund_payment(
    request: RefundRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Refund a Mercado Pago payment (admin only)
    
    TODO: Add admin role check
    """
    mp_service = MercadoPagoService(settings)
    
    try:
        result = await mp_service.refund_payment(
            db=db,
            payment_id=request.payment_id,
            amount=request.amount,
        )
        
        return result
        
    except PaymentError as e:
        raise HTTPException(status_code=400, detail=str(e))
