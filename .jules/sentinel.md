## 2026-04-23 - [CORS Exposure]
**Vulnerability:** Global CORS configuration explicitly allowed local development origins (localhost, 127.0.0.1) in the production environment.
**Learning:** Default configurations in the root level of FastAPI's main file were unintentionally applied globally, bypassing environment checks.
**Prevention:** Initialize empty or strict baseline configurations and exclusively append permissive rules within explicit environment-checking blocks (e.g., `if settings.ENVIRONMENT == 'dev':`).
