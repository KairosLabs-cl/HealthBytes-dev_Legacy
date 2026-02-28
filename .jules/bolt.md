## 2024-05-23 - Batch Processing for Stock Reservation
**Learning:** Sequential `SELECT ... FOR UPDATE` operations in a loop (N+1 queries) are not only inefficient but can also increase the risk of race conditions and deadlocks if not ordered consistently.
**Action:** Always implement batch methods (e.g., `reserve_stock_batch`) that sort items by ID (canonical ordering) and use a single query with `IN` clause and `with_for_update()` for critical resource locking.

## 2024-05-25 - React Native Virtualization
**Learning:** Rendering dynamic or potentially long lists (like user orders or products) using `ScrollView` and `.map()` leads to severe performance degradation because all items are rendered synchronously, blocking the main thread and increasing memory consumption.
**Action:** Always use `FlatList` (or `SectionList`) for dynamic datasets. Utilize `data`, `renderItem`, and `keyExtractor` to ensure off-screen elements are unmounted, saving memory and ensuring smooth 60fps scrolling. Use `ListHeaderComponent` instead of wrapping a `FlatList` in a `ScrollView` to avoid nested scrolling issues.
