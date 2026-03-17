# Sentinel's Journal

## 2024-03-15 - Mass Assignment Vulnerability in Address Deletion Flow
**Vulnerability:** The `AddressUpdate` schema exposed the `is_active` field. Since `is_active` is used for soft deletion, exposing it in the PUT payload allowed users to bypass the application's strict deletion validation logic (which prevents users from deleting their only address or their default address).
**Learning:** In a pattern where updates are applied via `model_dump(exclude_unset=True)`, any field present in the Pydantic schema can be overwritten if the database model attributes share the same names. Exposing sensitive state fields like `is_active`, `user_id`, or `role` in update schemas creates an immediate privilege escalation or validation bypass risk.
**Prevention:**
1. Never expose sensitive or internal state fields (e.g., `is_active`, `id`, `user_id`) in input validation schemas (like `*Update` schemas).
2. Implement defense-in-depth in service logic by explicitly dropping known protected fields before updating model attributes via `setattr`.
