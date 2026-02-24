"""
Standard Error Response Schema - RFC 7807 Problem Details
Used across all API endpoints for consistent error handling
"""

from datetime import UTC, datetime
from typing import Any, Optional

from pydantic import BaseModel, Field


class ErrorDetail(BaseModel):
    """Individual error detail for validation failures"""

    field: Optional[str] = Field(
        default=None, description="Field name that caused error (for validation errors)"
    )
    code: str = Field(..., description="Error code: REQUIRED, INVALID_VALUE, DUPLICATE, etc")
    message: str = Field(..., description="User-friendly error message")
    suggestion: Optional[str] = Field(
        default=None, description="Suggestion on how to fix the error"
    )


class ErrorResponse(BaseModel):
    """
    Standard error response for all API endpoints
    Follows RFC 7807 Problem Details pattern
    """

    error: str = Field(
        ...,
        description="Error type: ValidationError, NotFound, Unauthorized, Conflict, ServerError",
    )
    status_code: int = Field(..., description="HTTP status code (for client convenience)")
    message: str = Field(..., description="Main error message")
    timestamp: str = Field(
        ...,
        description="ISO 8601 timestamp when error occurred",
    )
    path: str = Field(..., description="API endpoint path where error occurred")
    details: Optional[list[ErrorDetail]] = Field(
        default=None, description="Array of specific error details (for validation errors)"
    )
    request_id: Optional[str] = Field(
        default=None, description="Request ID for logging/debugging correlation"
    )

    @classmethod
    def validation_error(
        cls,
        message: str,
        path: str,
        details: list[ErrorDetail],
        request_id: Optional[str] = None,
    ) -> "ErrorResponse":
        """Helper for validation errors (422)"""
        return cls(
            error="ValidationError",
            status_code=422,
            message=message,
            timestamp=datetime.now(UTC).isoformat(),
            path=path,
            details=details,
            request_id=request_id,
        )

    @classmethod
    def not_found(
        cls,
        message: str,
        path: str,
        request_id: Optional[str] = None,
    ) -> "ErrorResponse":
        """Helper for not found errors (404)"""
        return cls(
            error="NotFound",
            status_code=404,
            message=message,
            timestamp=datetime.now(UTC).isoformat(),
            path=path,
            request_id=request_id,
        )

    @classmethod
    def unauthorized(
        cls,
        message: str,
        path: str,
        request_id: Optional[str] = None,
    ) -> "ErrorResponse":
        """Helper for unauthorized errors (401)"""
        return cls(
            error="Unauthorized",
            status_code=401,
            message=message,
            timestamp=datetime.now(UTC).isoformat(),
            path=path,
            request_id=request_id,
        )

    @classmethod
    def forbidden(
        cls,
        message: str,
        path: str,
        request_id: Optional[str] = None,
    ) -> "ErrorResponse":
        """Helper for forbidden/authorization errors (403)"""
        return cls(
            error="Forbidden",
            status_code=403,
            message=message,
            timestamp=datetime.now(UTC).isoformat(),
            path=path,
            request_id=request_id,
        )

    @classmethod
    def conflict(
        cls,
        message: str,
        path: str,
        details: Optional[list[ErrorDetail]] = None,
        request_id: Optional[str] = None,
    ) -> "ErrorResponse":
        """Helper for conflict errors (409) - duplicate, state conflict, etc"""
        return cls(
            error="Conflict",
            status_code=409,
            message=message,
            timestamp=datetime.now(UTC).isoformat(),
            path=path,
            details=details,
            request_id=request_id,
        )

    @classmethod
    def server_error(
        cls,
        message: str,
        path: str,
        request_id: Optional[str] = None,
    ) -> "ErrorResponse":
        """Helper for internal server errors (500)"""
        return cls(
            error="InternalServerError",
            status_code=500,
            message=message,
            timestamp=datetime.now(UTC).isoformat(),
            path=path,
            request_id=request_id,
        )
