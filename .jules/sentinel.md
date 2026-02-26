## 2024-05-22 - [Timing Attack Mitigation in Authentication]
**Vulnerability:** User enumeration via timing attack in login endpoint. Invalid emails returned 401 immediately, while valid emails with wrong passwords took significantly longer due to bcrypt hashing.
**Learning:** `bcrypt` verification is computationally expensive by design. Simple early returns in authentication logic create measurable timing differences.
**Prevention:** Always perform a constant-time or simulated password verification even when the user is not found. Implemented `verify_password_mock` to simulate work.
