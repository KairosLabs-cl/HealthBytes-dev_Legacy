## 2024-03-11 - Optimize multiple dietary tags filtering with a unified IN subquery
**Learning:** Using chained `.any()` calls in SQLAlchemy generates multiple `EXISTS` subqueries, which creates an inefficient N+1 clauses problem for relational division.
**Action:** Replace multiple `EXISTS` queries with a single, highly-optimized subquery using an `IN` clause, grouped by the main entity ID, and validated via `HAVING count(...) = N`. Always ensure the target tags list is deduplicated first to prevent logical bugs.

## 2024-03-11 - Optimize Zustand store subscriptions
**Learning:** Destructuring a Zustand store entirely (e.g., `const { favoriteIds } = useFavoritesStore()`) causes the component to subscribe to the entire store, triggering re-renders on any state change.
**Action:** Use granular selectors (e.g., `const favoriteIds = useFavoritesStore((state) => state.favoriteIds)`) to restrict re-renders strictly to changes of the selected property.
