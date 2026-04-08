## 2026-04-08 - Timing Attack in Registration
**Vulnerability:** User enumeration timing attack possible in the `/register` endpoint due to returning early when an email already exists without simulating the password hash delay.
**Learning:** While the login endpoint correctly mitigates timing attacks by simulating verification, the registration endpoint was missed, exposing a user enumeration vector.
**Prevention:** Always apply timing attack mitigations (e.g., `verify_password_mock`) uniformly across all authentication-related endpoints that check user existence, including registration and password reset.
