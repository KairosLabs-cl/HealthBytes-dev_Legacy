## 2024-05-23 - Batch Processing for Stock Reservation
**Learning:** Sequential `SELECT ... FOR UPDATE` operations in a loop (N+1 queries) are not only inefficient but can also increase the risk of race conditions and deadlocks if not ordered consistently.
**Action:** Always implement batch methods (e.g., `reserve_stock_batch`) that sort items by ID (canonical ordering) and use a single query with `IN` clause and `with_for_update()` for critical resource locking.
