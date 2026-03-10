## 2025-02-28 - Prevent unnecessary re-renders in Zustand stores
**Learning:** Destructuring entire Zustand stores without selectors (e.g., `const { items } = useCart()`) causes components to re-render whenever *any* state in the store changes (like `isLoading` or `error`).
**Action:** Always use specific selectors (`const items = useCart(state => state.items)`) in React Native/Expo apps to optimize rendering, especially in screens with long lists or complex layouts like `checkout-v2.tsx` or `addresses.tsx`.
