## 2026-04-11 - Prevent user enumeration via timing attack in registration
**Vulnerability:** User enumeration timing attack during registration because the password hashing delay is skipped when the email already exists.
**Learning:** The delay caused by hashing a password provides a detectable timing difference, allowing attackers to check if an email exists.
**Prevention:** Use a dummy hashing function (like `verify_password_mock`) when throwing an error for an existing email to match the processing time of a new registration.
