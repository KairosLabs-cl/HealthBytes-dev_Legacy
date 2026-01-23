## 2024-05-23 - Information Leakage via Error Messages
**Vulnerability:** API endpoints were catching generic `Exception` and re-raising `HTTPException(500, detail=str(e))`. This exposed internal stack traces, database query errors, and potentially sensitive data structure details to the client.
**Learning:** The pattern `detail=str(e)` is common for quick debugging but dangerous in production. It defeats the purpose of exception handling which should mask internal failure modes.
**Prevention:** Implement a global exception handler or ensure all `try/except` blocks in API routes log the full error securely (to stderr/logs) and return a generic "Internal Server Error" message to the client.

## 2025-01-23 - Hardcoded Secret in Configuration
**Vulnerability:** The `JWT_SECRET` configuration had a default value of `"your-secret"` in `backend/app/config.py`. This meant that if the environment variable was missing, the application would start with a known, insecure secret, allowing attackers to forge tokens.
**Learning:** Developers often add default values for convenience (e.g., local development), but these defaults can accidentally make it to production. "Backwards compatibility" comments indicated this was intentional to match legacy behavior.
**Prevention:** Remove default values for sensitive configuration. Use `pydantic-settings` (or similar) to enforce that secrets *must* be provided by the environment, causing the application to fail fast (fail secure) if they are missing.
