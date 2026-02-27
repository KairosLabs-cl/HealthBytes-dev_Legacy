## 2025-02-27 - User Enumeration via Timing Attack
**Vulnerability:** The login endpoint returned immediately if an email did not exist, but took ~300ms (bcrypt hashing time) if the email existed.
**Learning:** This allowed attackers to enumerate valid email addresses by measuring response times.
**Prevention:** Implemented `verify_password_mock()` to ensure consistent response times regardless of user existence. Always ensure constant-time operations for sensitive lookups.
