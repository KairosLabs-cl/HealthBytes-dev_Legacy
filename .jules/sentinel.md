## 2024-05-18 - Prevent User Enumeration via Timing Attacks in Registration

**Vulnerability:**
The registration logic returned an immediate HTTP error when an email address already existed, but performed an expensive bcrypt hash operation (`get_password_hash`) if the email did not exist. This significant difference in response times allowed attackers to determine if an email is registered or not (user enumeration).

**Learning:**
Any endpoint handling authentication, registration, or password reset must execute its expensive cryptographic operations independently of the input validity to normalize response times and mitigate timing attacks.

**Prevention:**
Invoke `verify_password_mock()` (which internally hashes a dummy password using bcrypt with a valid salt) when an email collision is detected in registration, ensuring a constant-time response across both valid and invalid registration attempts.
