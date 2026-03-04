## 2025-02-27 - User Enumeration via Timing Attack
**Vulnerability:** The login endpoint returned immediately if an email did not exist, but took ~300ms (bcrypt hashing time) if the email existed.
**Learning:** This allowed attackers to enumerate valid email addresses by measuring response times.
**Prevention:** Implemented `verify_password_mock()` to ensure consistent response times regardless of user existence. Always ensure constant-time operations for sensitive lookups.

## 2025-02-28 - HTML Injection / XSS in Email Templates
**Vulnerability:** `email_service.py` concatenated dynamic variables (`customer_name`, `product_name`, `order_id`, `currency`) directly into HTML strings without sanitization.
**Learning:** f-string interpolation into HTML is susceptible to injection if inputs come from user data and are not escaped.
**Prevention:** Always use `html.escape()` on any dynamic data interpolated into HTML templates when not using a dedicated templating engine (e.g. Jinja2) that handles auto-escaping.
