import logging

from exponent_server_sdk import (
    DeviceNotRegisteredError,
    PushClient,
    PushMessage,
    PushServerError,
    PushTicketError,
)

logger = logging.getLogger(__name__)


class NotificationService:
    @staticmethod
    def send_order_status_update(expo_token: str, order_id: int, new_status: str) -> None:
        if not expo_token:
            return
        try:
            deep_link_url = (
                f"healthbytes://orders/{order_id}/tracking"
                if new_status == "shipped"
                else f"healthbytes://orders/{order_id}"
            )
            PushClient().publish(
                PushMessage(
                    to=expo_token,
                    title="Actualización de tu orden 📦",
                    body=f"Tu orden #{order_id} ahora está en el estado: {new_status}.",
                    data={"orderId": order_id, "status": new_status, "url": deep_link_url},
                )
            )
        except PushServerError as exc:
            logger.error("Push notification server error: %s", str(exc))
        except (DeviceNotRegisteredError, PushTicketError) as exc:
            logger.error("Push notification logic error: %s", str(exc))
        except Exception as exc:
            logger.error("Unexpected error sending push notification: %s", str(exc))

    @staticmethod
    def send_price_drop_notification(
        expo_token: str, product_id: int, product_name: str, new_price: float
    ) -> None:
        if not expo_token:
            return
        try:
            PushClient().publish(
                PushMessage(
                    to=expo_token,
                    title="¡Bajó de precio! 🎉",
                    body=f"{product_name} ahora cuesta ${new_price:.0f}",
                    data={"productId": product_id, "url": f"healthbytes://product/{product_id}"},
                )
            )
        except PushServerError as exc:
            logger.error("Push notification server error: %s", str(exc))
        except (DeviceNotRegisteredError, PushTicketError) as exc:
            logger.error("Push notification logic error: %s", str(exc))
        except Exception as exc:
            logger.error("Unexpected error sending push notification: %s", str(exc))
