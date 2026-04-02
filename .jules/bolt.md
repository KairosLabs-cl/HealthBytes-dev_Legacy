## 2024-03-11 - Optimize multiple dietary tags filtering with a unified IN subquery
**Learning:** Using chained `.any()` calls in SQLAlchemy generates multiple `EXISTS` subqueries, which creates an inefficient N+1 clauses problem for relational division.
**Action:** Replace multiple `EXISTS` queries with a single, highly-optimized subquery using an `IN` clause, grouped by the main entity ID, and validated via `HAVING count(...) = N`. Always ensure the target tags list is deduplicated first to prevent logical bugs.

## 2024-03-12 - Prevent full-screen re-renders by avoiding top-level Zustand destructuring
**Learning:** Destructuring Zustand stores at the top level of screen components (e.g., `const { favoriteIds } = useFavoritesStore()`) subscribes the component to the entire store. This causes massive full-screen re-renders whenever ANY property in the store changes (e.g. `isLoading`), which is extremely detrimental to performance in `FlatList` components. Moving an O(N) derivation into an unmemoized Zustand selector is also a de-optimization.
**Action:** Always use granular selectors (e.g., `const favoriteIds = useFavoritesStore((s) => s.favoriteIds)`) for Zustand stores. When mocking these stores in Jest tests, use `.mockImplementation((selector) => typeof selector === 'function' ? selector(mockStore) : mockStore)` to properly support these component selectors.

## 2024-03-18 - Prevent N+1 queries during order cancellation with batch stock release
**Learning:** Cancelling or refunding an order involves releasing stock for each product in the order. Iterating over order items and calling `release_stock` for each product sequentially creates an N+1 query pattern and acquires multiple consecutive database locks, hurting performance.
**Action:** Use a single `release_stock_batch` method that fetches and locks all affected products in one query using an `IN` clause, ordered by `product_id` to prevent deadlocks, before updating their stock.

## 2024-03-24 - Optimize Zustand set selectors to prevent CartItem re-renders
**Learning:** Subscribing to an entire Set in Zustand (e.g. `useCart(state => state.updatingProducts)`) causes the component to re-render whenever the Set reference changes, even if the change doesn't affect the specific item the component cares about. In a list of CartItems, updating one item's quantity causes all CartItems to re-render.
**Action:** Always use highly specific selectors that return primitive values. For Sets, select the boolean result of the `.has()` check for the specific item (e.g. `useCart(state => state.updatingProducts.has(itemId))`).

## 2024-03-25 - Prevent redundant DB fetches after session commit
**Learning:** In SQLAlchemy, when `expire_on_commit=False` is set on the session, ORM objects and their loaded relationships remain accessible after a `db.commit()`. Re-querying the database to fetch the exact same object and relationships immediately after a commit is a redundant network hop and performance de-optimization.
**Action:** Instead of re-fetching objects after a commit, manually attach pre-fetched related entities to newly created objects (e.g., `new_item.product = pre_fetched_product`) and rely on the session keeping the data accessible. Use eager loading (`selectinload`) during the initial fetch.
