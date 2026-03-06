"""Tests for JSONLogFormatter and configure_logging."""

import json
import logging
import sys
from unittest.mock import MagicMock

from app.main import JSONLogFormatter, configure_logging


def _make_record(
    msg="test message",
    level=logging.INFO,
    exc_info=None,
):
    """Helper to create a LogRecord."""
    return logging.LogRecord(
        name="test.logger",
        level=level,
        pathname="test.py",
        lineno=1,
        msg=msg,
        args=(),
        exc_info=exc_info,
    )


def _get_exc_info():
    """Generate real exc_info from a ValueError."""
    try:
        raise ValueError("test error for logging")
    except ValueError:
        return sys.exc_info()


class TestJSONLogFormatter:

    def setup_method(self):
        self.formatter = JSONLogFormatter()

    def test_format_produces_valid_json(self):
        """format() must return a parseable JSON string."""
        record = _make_record()
        output = self.formatter.format(record)
        parsed = json.loads(output)
        assert isinstance(parsed, dict)

    def test_format_contains_required_fields(self):
        """JSON output must have timestamp, level, name, message."""
        record = _make_record()
        parsed = json.loads(self.formatter.format(record))
        for field in ("timestamp", "level", "name", "message"):
            assert field in parsed, f"Missing required field: {field}"

    def test_format_timestamp_is_utc_iso8601(self):
        """timestamp must be ISO8601 with UTC timezone."""
        record = _make_record()
        parsed = json.loads(self.formatter.format(record))
        ts = parsed["timestamp"]
        assert "+00:00" in ts or ts.endswith("Z"), f"Timestamp not UTC: {ts}"

    def test_format_level_matches_record(self):
        """level must match the LogRecord level name."""
        record = _make_record(level=logging.WARNING)
        parsed = json.loads(self.formatter.format(record))
        assert parsed["level"] == "WARNING"

    def test_format_message_matches_record(self):
        """message must match the record message."""
        record = _make_record(msg="specific test message")
        parsed = json.loads(self.formatter.format(record))
        assert parsed["message"] == "specific test message"

    def test_format_no_traceback_field_when_no_exception(self):
        """Without exception, traceback field must not be present."""
        record = _make_record()
        parsed = json.loads(self.formatter.format(record))
        assert "traceback" not in parsed

    def test_format_traceback_is_string_not_list(self):
        """traceback must be a string, not a list (regression test for the fix)."""
        exc_info = _get_exc_info()
        record = _make_record(level=logging.ERROR, exc_info=exc_info)
        parsed = json.loads(self.formatter.format(record))
        assert "traceback" in parsed
        assert isinstance(
            parsed["traceback"], str
        ), f"traceback should be str, got {type(parsed['traceback']).__name__}"

    def test_format_traceback_contains_exception_info(self):
        """The traceback string must contain the exception type."""
        exc_info = _get_exc_info()
        record = _make_record(level=logging.ERROR, exc_info=exc_info)
        parsed = json.loads(self.formatter.format(record))
        assert "ValueError" in parsed["traceback"]
        assert "test error for logging" in parsed["traceback"]


class TestConfigureLogging:

    def test_configure_logging_sets_root_level_info(self):
        """configure_logging() must set root logger to INFO."""
        configure_logging()
        assert logging.getLogger().level == logging.INFO

    def test_configure_logging_dev_uses_plaintext(self, monkeypatch):
        """In dev environment, no handler should use JSONLogFormatter."""
        monkeypatch.setattr("app.main.settings", MagicMock(ENVIRONMENT="dev"))
        root_logger = logging.getLogger()
        original_handlers = root_logger.handlers[:]
        try:
            configure_logging()
            for handler in root_logger.handlers:
                assert not isinstance(
                    handler.formatter, JSONLogFormatter
                ), "Dev environment should not use JSONLogFormatter"
        finally:
            root_logger.handlers = original_handlers

    def test_configure_logging_prod_uses_json_formatter(self, monkeypatch):
        """In production, at least one handler must use JSONLogFormatter."""
        monkeypatch.setattr("app.main.settings", MagicMock(ENVIRONMENT="production"))
        root_logger = logging.getLogger()
        original_handlers = root_logger.handlers[:]
        try:
            configure_logging()
            json_handlers = [
                h for h in root_logger.handlers if isinstance(h.formatter, JSONLogFormatter)
            ]
            assert (
                len(json_handlers) >= 1
            ), "Production environment should have at least one JSONLogFormatter handler"
        finally:
            root_logger.handlers = original_handlers
