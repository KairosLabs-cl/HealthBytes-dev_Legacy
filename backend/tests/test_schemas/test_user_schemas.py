"""Tests for user Pydantic schemas."""

import pytest
from pydantic import ValidationError

from app.schemas.user import PushTokenUpdate


class TestPushTokenUpdate:
    """Tests for Expo push token validation."""

    @pytest.mark.parametrize(
        "token",
        [
            "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
            "ExpoPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
        ],
    )
    def test_accepts_expo_push_tokens(self, token):
        update = PushTokenUpdate(token=token)
        assert update.token == token

    @pytest.mark.parametrize(
        "token",
        [
            "not-a-token",
            "ExponentPushToken[]",
            "ExpoPushToken[missing-close",
            "https://example.com/token",
        ],
    )
    def test_rejects_invalid_push_tokens(self, token):
        with pytest.raises(ValidationError, match="Invalid Expo push token"):
            PushTokenUpdate(token=token)
