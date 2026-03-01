<<<<<<< fix/auth-timing-attack-15259610013706666787
## 2024-05-22 - [Timing Attack Mitigation in Authentication]
**Vulnerability:** User enumeration via timing attack in login endpoint. Invalid emails returned 401 immediately, while valid emails with wrong passwords took significantly longer due to bcrypt hashing.
**Learning:** `bcrypt` verification is computationally expensive by design. Simple early returns in authentication logic create measurable timing differences.
**Prevention:** Always perform a constant-time or simulated password verification even when the user is not found. Implemented `verify_password_mock` to simulate work.
=======
## 2025-02-27 - User Enumeration via Timing Attack
**Vulnerability:** The login endpoint returned immediately if an email did not exist, but took ~300ms (bcrypt hashing time) if the email existed.
**Learning:** This allowed attackers to enumerate valid email addresses by measuring response times.
**Prevention:** Implemented `verify_password_mock()` to ensure consistent response times regardless of user existence. Always ensure constant-time operations for sensitive lookups.
>>>>>>> master
## 2024-05-24 - [Fix HTML Injection in Email Templates]
**Vulnerability:** HTML Injection in transaction emails. Unescaped inputs like `customer_name`, `order_id`, `currency`, and `product_name` were directly injected into HTML templates using f-strings in `backend/app/services/email_service.py`.
**Learning:** Email templates dynamically rendered using f-strings in Python are susceptible to HTML injection (and potentially XSS in email clients) if the data comes from user input and is not properly escaped.
**Prevention:** Always use `html.escape()` on any dynamic data being interpolated into HTML templates when not using a dedicated templating engine like Jinja2 (which handles auto-escaping).
