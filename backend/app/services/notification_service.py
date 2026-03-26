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
        """
        Send a push notification to a user regarding their order status update.
        """
        if not expo_token:
            return

        try:
            base_url = "healthbytes://"
            deep_link_url = ""

            if new_status == "COMPLETED":
                deep_link_url = f"{base_url}orders/{order_id}"
            elif new_status == "SHIPPED":
                deep_link_url = f"{base_url}orders/{order_id}/tracking"
            else:
                deep_link_url = f"{base_url}orders/{order_id}"

            data_payload = {"orderId": order_id, "status": new_status, "url": deep_link_url}

            response = PushClient().publish(
                PushMessage(
                    to=expo_token,
                    title="Actualización de tu orden 📦",
                    body=f"Tu orden #{order_id} ahora está en el estado: {new_status}.",
                    data=data_payload,  # Deep Link Payload
                )
            )
        except PushServerError as exc:
            # Encountered some likely formatting/validation error.
            logger.error("Push notification server error: %s", str(exc))
        except (DeviceNotRegisteredError, PushTicketError) as exc:
            # If the user has uninstalled the app or the token is no longer valid
            logger.error("Push notification logic error: %s", str(exc))
        except Exception as exc:
            logger.error("Unexpected error sending push notification: %s", str(exc))
