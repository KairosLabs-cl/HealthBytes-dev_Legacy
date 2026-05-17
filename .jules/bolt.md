## 2024-05-24 - Unused Global State Selectors in Root Layouts
**Learning:** Subscribing to global state (like a Zustand store selector) at the root layout level (e.g., `_layout.tsx`) causes the entire layout component and its children to re-render whenever that state changes, even if the selected value is never actually used in the render tree.
**Action:** Always audit layout components for unused store selectors and remove them to prevent cascading full-app re-renders on unrelated state changes.

## 2024-05-24 - Zustand store destructuring in Root Layout
**Learning:** Destructuring a Zustand store in a root layout component (e.g., `_layout.tsx` in Expo Router) causes the entire application tree to re-render whenever *any* unrelated state in that store changes. For example, destructuring `{ hasCompletedOnboarding } = usePreferencesStore()` would cause the layout to re-render even if only `dietaryPreferences` changed.
**Action:** Always use highly granular selectors when subscribing to Zustand stores in layout or top-level components (e.g., `const hasCompletedOnboarding = usePreferencesStore(s => s.hasCompletedOnboarding)`).

## 2026-04-27 - Zustand Array Selector Re-renders
**Learning:** Subscribing to an entire array in a Zustand store (like `useCart((state) => state.items)`) causes unnecessary component re-renders whenever any item in that array changes.
**Action:** Use inline selectors to access specific array elements or primitive properties (e.g., `useCart((state) => state.items.find(i => i.product.id === Number(id))?.quantity || 0)`).

## 2026-05-02 - Zustand Selectors with Route Params
**Learning:** When writing Zustand selectors that depend on external IDs in a component (like a product ID), using available route parameters (e.g., `id` from `useLocalSearchParams()`) directly rather than waiting for an asynchronously fetched variable (e.g., `product?.id`) ensures the selector is deterministic and doesn't return unstable results during loading states.
**Action:** Always use route parameters directly in inline selectors when the ID is available in the route.

## 2026-05-05 - Zustand getState for One-Time Reads
**Learning:** Subscribing to a Zustand store value (e.g., `usePreferencesStore((state) => state.value)`) when the value is only needed once on mount (e.g., inside an empty-dependency `useEffect`) causes the component to re-render unnecessarily on all future updates to that value.
**Action:** Use `store.getState().value` inside the `useEffect` instead of the hook for one-time reads to prevent unnecessary component re-renders.

## 2026-05-17 - Zustand useShallow in Root Layouts
**Learning:** Extracting multiple primitive fields from a Zustand store using separate selector calls creates multiple subscriptions, adding overhead. In a root layout, this overhead cascades.
**Action:** Group related selectors and wrap them in `useShallow` from `zustand/react/shallow` to batch renders and improve performance.
