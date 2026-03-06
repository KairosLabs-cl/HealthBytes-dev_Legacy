# Sentinel Journal

## 2025-03-08 - Added Password Max Length to Prevent DoS
**Vulnerability:** The password fields in `UserCreate` and `UserUpdate` Pydantic schemas lacked a maximum length restriction, allowing users to send extremely long password strings.
**Learning:** `bcrypt` hash function limits to 72 bytes internally, but encoding arbitrary large password inputs or passing them entirely to Pydantic before truncating can consume massive memory and CPU, opening a Denial of Service (DoS) attack vector.
**Prevention:** Always enforce a strict and generous maximum length (e.g., `max_length=128`) on password fields using Pydantic's `Field` validation when processing authentication credentials.
