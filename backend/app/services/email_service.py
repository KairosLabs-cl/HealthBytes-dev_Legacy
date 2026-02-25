"""
Email service for transactional emails using Resend.

Sends order confirmation, payment success, and shipping notification emails.
In dev mode (no RESEND_API_KEY), logs instead of sending.
"""

import logging
from dataclasses import dataclass
from decimal import Decimal
from typing import List, Optional

import resend
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.config import Settings

logger = logging.getLogger(__name__)


@dataclass
class OrderItemData:
    """Lightweight item data for email templates."""

    product_name: str
    quantity: int
    price: Decimal


@dataclass
class OrderEmailData:
    """All data needed to render an order email."""

    order_id: int
    customer_name: str
    customer_email: str
    items: List[OrderItemData]
    total: Decimal
    currency: str = "CLP"


class EmailService:
    """Transactional email service using Resend."""

    def __init__(self, settings: Settings):
        self.api_key = settings.RESEND_API_KEY
        self.from_address = settings.EMAIL_FROM_ADDRESS
        self.frontend_url = settings.FRONTEND_URL
        self._enabled = bool(self.api_key)

        if self._enabled:
            resend.api_key = self.api_key

    def _format_price(self, amount: Decimal, currency: str = "CLP") -> str:
        """Format price for display."""
        if currency == "CLP":
            return f"${int(amount):,}".replace(",", ".")
        return f"${amount:.2f} {currency}"

    def _base_style(self) -> str:
        """Common CSS styles for all email templates."""
        return """
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; overflow: hidden; }
            .header { background: #16a34a; color: #ffffff; padding: 24px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .header p { margin: 4px 0 0; opacity: 0.9; font-size: 14px; }
            .content { padding: 24px; }
            .order-info { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 20px; }
            .order-info h2 { margin: 0 0 8px; font-size: 18px; color: #15803d; }
            .items-table { width: 100%; border-collapse: collapse; margin: 16px 0; }
            .items-table th { text-align: left; padding: 8px; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 12px; text-transform: uppercase; }
            .items-table td { padding: 8px; border-bottom: 1px solid #f3f4f6; }
            .total-row td { border-top: 2px solid #e5e7eb; font-weight: bold; font-size: 16px; padding-top: 12px; }
            .footer { background: #f9fafb; padding: 16px 24px; text-align: center; color: #9ca3af; font-size: 12px; }
            .btn { display: inline-block; background: #16a34a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 16px; }
        """

    def _render_items_table(self, data: OrderEmailData) -> str:
        """Render the order items table HTML."""
        rows = ""
        for item in data.items:
            subtotal = item.price * item.quantity
            rows += f"""
                <tr>
                    <td>{item.product_name}</td>
                    <td style="text-align:center;">{item.quantity}</td>
                    <td style="text-align:right;">{self._format_price(item.price, data.currency)}</td>
                    <td style="text-align:right;">{self._format_price(subtotal, data.currency)}</td>
                </tr>
            """

        return f"""
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th style="text-align:center;">Cant.</th>
                        <th style="text-align:right;">Precio</th>
                        <th style="text-align:right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                    <tr class="total-row">
                        <td colspan="3">Total</td>
                        <td style="text-align:right;">{self._format_price(data.total, data.currency)}</td>
                    </tr>
                </tbody>
            </table>
        """

    def render_order_confirmation(self, data: OrderEmailData) -> str:
        """Render order confirmation email HTML."""
        return f"""
        <!DOCTYPE html>
        <html><head><style>{self._base_style()}</style></head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>HealthBytes</h1>
                    <p>Tu orden ha sido recibida</p>
                </div>
                <div class="content">
                    <p>Hola <strong>{data.customer_name or 'Cliente'}</strong>,</p>
                    <p>Hemos recibido tu orden y estamos procesandola.</p>

                    <div class="order-info">
                        <h2>Orden #{data.order_id}</h2>
                        <p style="margin:0; color:#6b7280;">Estado: Pendiente de pago</p>
                    </div>

                    {self._render_items_table(data)}

                    <p style="color:#6b7280; font-size:14px;">
                        Completa el pago a traves de Mercado Pago para confirmar tu orden.
                    </p>
                </div>
                <div class="footer">
                    <p>HealthBytes - Alimentos seguros para ti</p>
                </div>
            </div>
        </body></html>
        """

    def render_payment_success(self, data: OrderEmailData) -> str:
        """Render payment success email HTML."""
        return f"""
        <!DOCTYPE html>
        <html><head><style>{self._base_style()}</style></head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>HealthBytes</h1>
                    <p>Pago confirmado</p>
                </div>
                <div class="content">
                    <p>Hola <strong>{data.customer_name or 'Cliente'}</strong>,</p>
                    <p>Tu pago ha sido confirmado exitosamente. Estamos preparando tu pedido.</p>

                    <div class="order-info">
                        <h2>Orden #{data.order_id}</h2>
                        <p style="margin:0; color:#15803d; font-weight:600;">Pago confirmado</p>
                    </div>

                    {self._render_items_table(data)}

                    <p style="color:#6b7280; font-size:14px;">
                        Te notificaremos cuando tu pedido sea despachado.
                    </p>
                </div>
                <div class="footer">
                    <p>HealthBytes - Alimentos seguros para ti</p>
                </div>
            </div>
        </body></html>
        """

    def render_order_shipped(self, data: OrderEmailData) -> str:
        """Render order shipped email HTML."""
        return f"""
        <!DOCTYPE html>
        <html><head><style>{self._base_style()}</style></head>
        <body>
            <div class="container">
                <div class="header" style="background:#2563eb;">
                    <h1>HealthBytes</h1>
                    <p>Tu pedido esta en camino</p>
                </div>
                <div class="content">
                    <p>Hola <strong>{data.customer_name or 'Cliente'}</strong>,</p>
                    <p>Tu pedido ha sido despachado y esta en camino.</p>

                    <div class="order-info" style="background:#eff6ff; border-color:#bfdbfe;">
                        <h2 style="color:#1d4ed8;">Orden #{data.order_id}</h2>
                        <p style="margin:0; color:#1d4ed8; font-weight:600;">Enviado</p>
                    </div>

                    {self._render_items_table(data)}

                    <a href="{self.frontend_url}/orders/{data.order_id}" class="btn" style="background:#2563eb;">
                        Ver mi pedido
                    </a>
                </div>
                <div class="footer">
                    <p>HealthBytes - Alimentos seguros para ti</p>
                </div>
            </div>
        </body></html>
        """

    async def send_email(self, to: str, subject: str, html: str) -> Optional[dict]:
        """
        Send an email via Resend. Returns the response or None on failure.
        In dev mode (no API key), logs instead of sending.
        """
        if not self._enabled:
            logger.info(
                "Email not sent (no RESEND_API_KEY): to=%s subject='%s'",
                to,
                subject,
            )
            return None

        try:
            params = {
                "from": self.from_address,
                "to": [to],
                "subject": subject,
                "html": html,
            }
            response = resend.Emails.send(params)
            logger.info("Email sent: to=%s subject='%s' id=%s", to, subject, response.get("id"))
            return response
        except Exception:
            logger.exception("Failed to send email to %s", to)
            return None

    async def send_order_confirmation(self, data: OrderEmailData) -> Optional[dict]:
        """Send order confirmation email."""
        html = self.render_order_confirmation(data)
        return await self.send_email(
            to=data.customer_email,
            subject=f"Orden #{data.order_id} recibida - HealthBytes",
            html=html,
        )

    async def send_payment_success(self, data: OrderEmailData) -> Optional[dict]:
        """Send payment success email."""
        html = self.render_payment_success(data)
        return await self.send_email(
            to=data.customer_email,
            subject=f"Pago confirmado - Orden #{data.order_id} - HealthBytes",
            html=html,
        )

    async def send_order_shipped(self, data: OrderEmailData) -> Optional[dict]:
        """Send order shipped notification email."""
        html = self.render_order_shipped(data)
        return await self.send_email(
            to=data.customer_email,
            subject=f"Tu pedido #{data.order_id} esta en camino - HealthBytes",
            html=html,
        )


async def build_order_email_data(db: AsyncSession, order_id: int) -> Optional[OrderEmailData]:
    """
    Build OrderEmailData from database for a given order.
    Fetches order with items + user in minimal queries.
    Returns None if order or user not found.
    """
    from app.db.schemas import Order, Product, User

    # Fetch order with items
    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    order = result.scalar_one_or_none()
    if not order:
        return None

    # Fetch user
    result = await db.execute(select(User).where(User.id == order.user_id))
    user = result.scalar_one_or_none()
    if not user or not user.email:
        return None

    # Fetch product names for the items
    product_ids = [item.product_id for item in order.items]
    products_map = {}
    if product_ids:
        result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
        products_map = {p.id: p for p in result.scalars().all()}

    items = [
        OrderItemData(
            product_name=products_map.get(item.product_id, None)
            and products_map[item.product_id].name
            or f"Producto #{item.product_id}",
            quantity=item.quantity,
            price=Decimal(str(item.price)),
        )
        for item in order.items
    ]

    return OrderEmailData(
        order_id=order.id,
        customer_name=user.name or user.email.split("@")[0],
        customer_email=user.email,
        items=items,
        total=Decimal(str(order.total)),
    )
