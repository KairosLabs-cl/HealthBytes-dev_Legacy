## 2024-03-11 - Optimize multiple dietary tags filtering with a unified IN subquery
**Learning:** Using chained `.any()` calls in SQLAlchemy generates multiple `EXISTS` subqueries, which creates an inefficient N+1 clauses problem for relational division.
**Action:** Replace multiple `EXISTS` queries with a single, highly-optimized subquery using an `IN` clause, grouped by the main entity ID, and validated via `HAVING count(...) = N`. Always ensure the target tags list is deduplicated first to prevent logical bugs.

## 2025-02-09 - Avoid N+1 queries by batch-loading missing relationship objects
**Learning:** When iterating over a collection (e.g., order items) and encountering missing relationship objects (e.g., products) that weren't eager-loaded, querying the database individually inside the loop creates an N+1 query bottleneck.
**Action:** Always collect all missing IDs first, then use a single `IN` clause query to fetch all missing objects in a batch. Build a dictionary mapping IDs to objects, and then use this map inside the loop.
