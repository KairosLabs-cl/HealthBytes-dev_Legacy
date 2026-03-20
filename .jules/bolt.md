## 2024-03-11 - Optimize multiple dietary tags filtering with a unified IN subquery
**Learning:** Using chained `.any()` calls in SQLAlchemy generates multiple `EXISTS` subqueries, which creates an inefficient N+1 clauses problem for relational division.
**Action:** Replace multiple `EXISTS` queries with a single, highly-optimized subquery using an `IN` clause, grouped by the main entity ID, and validated via `HAVING count(...) = N`. Always ensure the target tags list is deduplicated first to prevent logical bugs.

## 2024-03-12 - Prevent full-screen re-renders by avoiding top-level Zustand destructuring
**Learning:** Destructuring Zustand stores at the top level of screen components (e.g., `const { favoriteIds } = useFavoritesStore()`) subscribes the component to the entire store. This causes massive full-screen re-renders whenever ANY property in the store changes (e.g. `isLoading`), which is extremely detrimental to performance in `FlatList` components. Moving an O(N) derivation into an unmemoized Zustand selector is also a de-optimization.
**Action:** Always use granular selectors (e.g., `const favoriteIds = useFavoritesStore((s) => s.favoriteIds)`) for Zustand stores. When mocking these stores in Jest tests, use `.mockImplementation((selector) => typeof selector === 'function' ? selector(mockStore) : mockStore)` to properly support these component selectors.

## 2024-03-13 - Prevent unnecessary re-renders by avoiding destructuring Zustand stores
**Learning:** Destructuring Zustand stores (e.g., `const { items } = useRecentlyViewed();`) subscribes the component to the entire store, causing unnecessary re-renders whenever ANY property in the store changes.
**Action:** Always use granular selectors (e.g., `const items = useRecentlyViewed((state) => state.items);`) to subscribe only to the specific pieces of state the component needs.
