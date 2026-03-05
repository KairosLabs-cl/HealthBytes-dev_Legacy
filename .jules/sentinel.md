## 2025-03-05 - DoS vulnerability in hashing via excessive password length
**Vulnerability:** Missing `max_length` parameter on the `password` field in Pydantic `UserCreate` and `UserUpdate` schemas.
**Learning:** Bcrypt is computationally expensive. Attackers can intentionally send very long string payloads up to several MBs as the password. This will drastically increase processing time and easily cause Denial of Service (DoS) by starving server CPU resources.
**Prevention:** Always bound all user inputs via length limits (e.g., `max_length=128` in Pydantic).
