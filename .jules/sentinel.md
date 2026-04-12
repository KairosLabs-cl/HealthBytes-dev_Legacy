## 2026-04-12 - Timing Attack in Registration
**Vulnerability:** User enumeration via timing attack in registration endpoints (returning early if user exists).
**Learning:** Returning an immediate error for an existing email, while taking hundreds of milliseconds to hash the password for a new email, allows attackers to enumerate registered users by measuring response times.
**Prevention:** Always simulate the hashing operation using a mock/dummy hash verification function before returning an error to normalize the endpoint's response time, regardless of whether the user exists or not.
