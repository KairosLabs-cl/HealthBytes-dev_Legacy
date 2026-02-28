## 2025-02-28 - [Email XSS]
**Vulnerability:** HTML Injection / XSS in Email Templates
**Learning:** `email_service.py` concatenated dynamic variables (like `customer_name`, `product_name`) directly into HTML strings without sanitization. An attacker could potentially inject malicious HTML.
**Prevention:** Always use `html.escape()` when interpolating dynamic data into HTML templates in backend services.
