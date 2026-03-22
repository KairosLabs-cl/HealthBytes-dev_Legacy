# Sentinel's Journal

## 2024-03-15 - Mass Assignment Vulnerability in Address Deletion Flow
**Vulnerability:** The `AddressUpdate` schema exposed the `is_active` field. Since `is_active` is used for soft deletion, exposing it in the PUT payload allowed users to bypass the application's strict deletion validation logic (which prevents users from deleting their only address or their default address).
**Learning:** In a pattern where updates are applied via `model_dump(exclude_unset=True)`, any field present in the Pydantic schema can be overwritten if the database model attributes share the same names. Exposing sensitive state fields like `is_active`, `user_id`, or `role` in update schemas creates an immediate privilege escalation or validation bypass risk.
**Prevention:**
1. Never expose sensitive or internal state fields (e.g., `is_active`, `id`, `user_id`) in input validation schemas (like `*Update` schemas).
2. Implement defense-in-depth in service logic by explicitly dropping known protected fields before updating model attributes via `setattr`.

## 2026-03-16 - Prevent Mass Assignment in Product and User Services
**Vulnerability:** The application used `update_data = user_in.model_dump(exclude_unset=True)` and set all attributes using `setattr()` directly. Although the current input validation schemas protected certain fields (e.g. `role`), an attacker could theoretically inject values for attributes like `id`, `clerk_id`, or `search_vector` if schemas were later modified or partially bypassed. This represents a missing defense-in-depth layer against mass assignment.
**Learning:** Depending entirely on outer API layers (e.g., Pydantic request models) to prevent mass assignment creates a single point of failure. The service layer must explicitly exclude protected model fields prior to iterating and setting attributes.
**Prevention:** In functions performing partial model updates with `setattr(db_obj, field, value)`, explicitly filter the unpacked payload against a known list of sensitive or internal model fields (e.g., `id`, `user_id`, `role`, `is_active`, `search_vector`).

## 2026-03-16 - Prevent User Enumeration via OAuth User 500 Errors
**Vulnerability:** The login endpoint assumed that if a user exists, their password string is not `None`. However, users created via OAuth (e.g., Clerk) have a `None` password. When attempting to log in with an OAuth email and an arbitrary password, the backend threw an `AttributeError` during password hashing (trying to encode `None`). This resulted in a 500 Server Error, bypassing the `verify_password_mock` timing attack protection and leaking the fact that the user exists (user enumeration).
**Learning:** In authentication flows supporting both local passwords and OAuth, the password field in the database may legitimately be `None`. Failing to explicitly check for `not user.password` alongside `not user` can break cryptographic library calls that expect a string, leading to unhandled exceptions that bypass standard security flow paths.
**Prevention:** Always validate that a `password` property exists and is a valid string before passing it to cryptographic functions like `bcrypt.checkpw()`. Treat a user with no password identically to a user that does not exist in the authentication logic to prevent distinct error states.
