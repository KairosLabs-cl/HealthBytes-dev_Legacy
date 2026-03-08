## 2024-05-24 - Zustand store memoization
**Learning:** React components will re-render unnecessarily if Zustand derived state (like a reduce over an array) is calculated inline within the component, because it creates a new reference on every render.
**Action:** Use memoized selectors directly in Zustand using plain JS functions outside the components, and have `useStore` hook consume them.
