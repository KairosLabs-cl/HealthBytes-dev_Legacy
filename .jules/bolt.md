## 2024-03-11 - Optimize multiple dietary tags filtering with a unified IN subquery
**Learning:** Using chained `.any()` calls in SQLAlchemy generates multiple `EXISTS` subqueries, which creates an inefficient N+1 clauses problem for relational division.
**Action:** Replace multiple `EXISTS` queries with a single, highly-optimized subquery using an `IN` clause, grouped by the main entity ID, and validated via `HAVING count(...) = N`. Always ensure the target tags list is deduplicated first to prevent logical bugs.
