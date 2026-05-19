from unittest.mock import MagicMock, patch

from app.services.notification_service import NotificationService


def test_send_order_status_empty_token():
    NotificationService.send_order_status_update("", 1, "processing")


def test_send_order_status_none_token():
    NotificationService.send_order_status_update(None, 1, "shipped")


@patch("app.services.notification_service.PushClient")
def test_send_order_status_processing(mock_client_cls):
    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client
    NotificationService.send_order_status_update("ExponentPushToken[xxx]", 42, "processing")
    mock_client.publish.assert_called_once()
    call_args = mock_client.publish.call_args[0][0]
    assert "42" in call_args.body or "42" in str(call_args.data)


@patch("app.services.notification_service.PushClient")
def test_send_order_status_shipped_deep_link(mock_client_cls):
    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client
    NotificationService.send_order_status_update("ExponentPushToken[xxx]", 7, "shipped")
    call_args = mock_client.publish.call_args[0][0]
    assert "tracking" in call_args.data["url"]


@patch("app.services.notification_service.PushClient")
def test_send_order_status_server_error_no_raise(mock_client_cls):
    from exponent_server_sdk import PushServerError

    mock_client = MagicMock()
    mock_client.publish.side_effect = PushServerError("error", [])
    mock_client_cls.return_value = mock_client
    NotificationService.send_order_status_update("ExponentPushToken[xxx]", 1, "delivered")


@patch("app.services.notification_service.PushClient")
def test_send_price_drop_empty_token(mock_client_cls):
    NotificationService.send_price_drop_notification("", 1, "Galletas", 500.0)
    mock_client_cls.return_value.publish.assert_not_called()


@patch("app.services.notification_service.PushClient")
def test_send_price_drop_success(mock_client_cls):
    mock_client = MagicMock()
    mock_client_cls.return_value = mock_client
    NotificationService.send_price_drop_notification("ExponentPushToken[abc]", 5, "Avena", 299.0)
    mock_client.publish.assert_called_once()
    call_args = mock_client.publish.call_args[0][0]
    assert "Avena" in call_args.body
    assert call_args.data["productId"] == 5
    assert "product/5" in call_args.data["url"]
