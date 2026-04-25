## 2026-04-25 - Fix overly permissive CORS configuration
**Vulnerability:** Overly permissive CORS configuration allowing local origins in production.
**Learning:** The FastAPI backend unconditionally added 'localhost' and '127.0.0.1' origins to 'cors_origins', exposing the production API to cross-origin requests from any local application.
**Prevention:** In the FastAPI backend, CORS configuration must explicitly gate local development origins (e.g., 'localhost') behind 'if settings.ENVIRONMENT == "dev":' to prevent overly permissive access in production. The production baseline origin should rely on 'settings.FRONTEND_URL'.
