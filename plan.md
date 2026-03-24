1. **Optimize Zustand Selectors in CartItem.tsx**
   - The `CartItem` component currently extracts entire `Set` objects from `useCart` store (`addingProducts`, `updatingProducts`, `removingProducts`), causing the entire list to re-render when any of these change.
   - Modify `frontend/components/CartItem.tsx` to use more granular selectors that return primitive boolean values, e.g.: `const isAdding = useCart((state) => state.addingProducts.has(item.product.id));`.

2. **Add Entry to `.jules/bolt.md`**
   - Document the performance impact of returning an entire `Set` from a Zustand selector in `.jules/bolt.md`.
   - Explain how returning a primitive `boolean` from the `.has()` method improves `FlatList` performance.

3. **Verify Implementation**
   - Run `cd frontend && pnpm list` after installing dependencies.
   - Run `cd frontend && pnpm lint`.
   - Run `cd frontend && pnpm test`.

4. **Complete Pre-Commit Steps**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

5. **Create Final Pull Request**
   - Commit and submit the code changes with a descriptive PR. Format the PR title to match `⚡ Bolt: [performance improvement]` and include What, Why, Impact, and Measurement in the description.
