## 2024-03-11 - Optimize multiple dietary tags filtering with a unified IN subquery
**Learning:** Using chained `.any()` calls in SQLAlchemy generates multiple `EXISTS` subqueries, which creates an inefficient N+1 clauses problem for relational division.
**Action:** Replace multiple `EXISTS` queries with a single, highly-optimized subquery using an `IN` clause, grouped by the main entity ID, and validated via `HAVING count(...) = N`. Always ensure the target tags list is deduplicated first to prevent logical bugs.

## 2024-03-12 - Prevent full-screen re-renders by avoiding top-level Zustand destructuring
**Learning:** Destructuring Zustand stores at the top level of screen components (e.g., `const { favoriteIds } = useFavoritesStore()`) subscribes the component to the entire store. This causes massive full-screen re-renders whenever ANY property in the store changes (e.g. `isLoading`), which is extremely detrimental to performance in `FlatList` components. Moving an O(N) derivation into an unmemoized Zustand selector is also a de-optimization.
**Action:** Always use granular selectors (e.g., `const favoriteIds = useFavoritesStore((s) => s.favoriteIds)`) for Zustand stores. When mocking these stores in Jest tests, use `.mockImplementation((selector) => typeof selector === 'function' ? selector(mockStore) : mockStore)` to properly support these component selectors.

## 2024-03-18 - Prevent N+1 queries during order cancellation with batch stock release
**Learning:** Cancelling or refunding an order involves releasing stock for each product in the order. Iterating over order items and calling `release_stock` for each product sequentially creates an N+1 query pattern and acquires multiple consecutive database locks, hurting performance.
**Action:** Use a single `release_stock_batch` method that fetches and locks all affected products in one query using an `IN` clause, ordered by `product_id` to prevent deadlocks, before updating their stock.
