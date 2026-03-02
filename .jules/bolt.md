## 2024-05-23 - Batch Processing for Stock Reservation
**Learning:** Sequential `SELECT ... FOR UPDATE` operations in a loop (N+1 queries) are not only inefficient but can also increase the risk of race conditions and deadlocks if not ordered consistently.
**Action:** Always implement batch methods (e.g., `reserve_stock_batch`) that sort items by ID (canonical ordering) and use a single query with `IN` clause and `with_for_update()` for critical resource locking.

## 2024-03-02 - Missing Indexes on Association Tables
**Learning:** In SQLAlchemy association tables with composite primary keys (e.g., `product_dietary_tags` with `(product_id, dietary_tag_id)`), only the first column in the composite key is typically indexed efficiently for standalone lookups in databases like PostgreSQL. Queries filtering by the second column (reverse lookups, e.g., finding all products for a specific dietary tag) will result in a full table scan without an explicit index.
**Action:** Always explicitly define `index=True` on the secondary foreign key column in a many-to-many association table (e.g., `dietary_tag_id`) to ensure reverse lookups are performant.