## 2024-05-24 - Unused Global State Selectors in Root Layouts
**Learning:** Subscribing to global state (like a Zustand store selector) at the root layout level (e.g., `_layout.tsx`) causes the entire layout component and its children to re-render whenever that state changes, even if the selected value is never actually used in the render tree.
**Action:** Always audit layout components for unused store selectors and remove them to prevent cascading full-app re-renders on unrelated state changes.
