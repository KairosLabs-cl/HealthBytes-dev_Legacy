from fastapi import APIRouter, Request, HTTPException
import stripe
from app.config import settings

router = APIRouter()

# Configure Stripe (if keys are available)
if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY


@router.get("/keys")
async def get_keys():
    """
    GET /stripe/keys
    Get Stripe publishable key
    Replica of getKeys from Node.js - Currently disabled
    """
    raise HTTPException(
        status_code=503,
        detail={"message": "Stripe desactivado temporalmente para pruebas de base de datos."}
    )


@router.post("/payment-intent")
async def create_payment_intent():
    """
    POST /stripe/payment-intent
    Create Stripe payment intent
    Replica of createPaymentIntent from Node.js - Currently disabled
    """
    raise HTTPException(
        status_code=503,
        detail={"message": "Stripe desactivado temporalmente para pruebas de base de datos."}
    )


@router.post("/webhook")
async def webhook(request: Request):
    """
    POST /stripe/webhook
    Handle Stripe webhook events
    Replica of webhook from Node.js - Currently disabled
    
    Note: FastAPI makes it easy to get raw body for Stripe signature verification
    raw_body = await request.body()
    signature = request.headers.get("stripe-signature")
    """
    raise HTTPException(
        status_code=503,
        detail={"message": "Stripe desactivado temporalmente para pruebas de base de datos."}
    )
