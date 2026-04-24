## 2024-05-24 - Unused Global State Selectors in Root Layouts
**Learning:** Subscribing to global state (like a Zustand store selector) at the root layout level (e.g., `_layout.tsx`) causes the entire layout component and its children to re-render whenever that state changes, even if the selected value is never actually used in the render tree.
**Action:** Always audit layout components for unused store selectors and remove them to prevent cascading full-app re-renders on unrelated state changes.

## 2024-05-24 - Zustand store destructuring in Root Layout
**Learning:** Destructuring a Zustand store in a root layout component (e.g., `_layout.tsx` in Expo Router) causes the entire application tree to re-render whenever *any* unrelated state in that store changes. For example, destructuring `{ hasCompletedOnboarding } = usePreferencesStore()` would cause the layout to re-render even if only `dietaryPreferences` changed.
**Action:** Always use highly granular selectors when subscribing to Zustand stores in layout or top-level components (e.g., `const hasCompletedOnboarding = usePreferencesStore(s => s.hasCompletedOnboarding)`).

## 2026-04-24 - Zustand Array Selectors in Complex Screens
**Learning:** Subscribing to an entire array in a Zustand store (like `useCart((state) => state.items)`) causes unnecessary component re-renders whenever any item in that array changes. This is especially detrimental in complex screens like ProductDetailsScreen.
**Action:** Use inline selectors to access specific array elements or primitive properties (e.g., `useCart((state) => state.items.find(i => i.product.id === Number(id))?.quantity || 0)`) using stable route parameters rather than waiting for async data.
