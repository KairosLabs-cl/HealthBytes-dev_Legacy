## 2026-01-22 - N+1 Query in Order Creation
**Learning:** The order creation endpoint was performing a database query for *each* item in the order to validate price and existence. This scales linearly with order size (O(N)).
**Action:** Always fetch related entities in bulk using `IN` clause (e.g. `WHERE id IN (...)`) and map them in memory for O(1) lookups. This reduces database roundtrips to a constant number regardless of order size.
