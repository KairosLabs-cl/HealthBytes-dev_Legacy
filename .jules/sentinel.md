## 2024-05-23 - Information Leakage via Error Messages
**Vulnerability:** API endpoints were catching generic `Exception` and re-raising `HTTPException(500, detail=str(e))`. This exposed internal stack traces, database query errors, and potentially sensitive data structure details to the client.
**Learning:** The pattern `detail=str(e)` is common for quick debugging but dangerous in production. It defeats the purpose of exception handling which should mask internal failure modes.
**Prevention:** Implement a global exception handler or ensure all `try/except` blocks in API routes log the full error securely (to stderr/logs) and return a generic "Internal Server Error" message to the client.
