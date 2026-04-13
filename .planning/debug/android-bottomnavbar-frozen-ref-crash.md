---
status: resolved
trigger: "android-bottomnavbar-frozen-ref-crash"
created: 2026-04-13T00:00:00.000Z
updated: 2026-04-13T00:15:00.000Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: The crash is caused by `Link` (from expo-router) with `asChild` prop trying to forward/set a ref on `AnimatedPressable` (created via `Animated.createAnimatedComponent(Pressable)`). On Android, Reanimated freezes internal objects more strictly.

test: Read BottomNavBar.tsx and restructure to avoid ref forwarding conflict
expecting: Link wraps plain Pressable, animation moves to inner Animated.View
next_action: FIX APPLIED - awaiting user verification on Android device
---

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: App should load and display the bottom navigation bar on Android Expo Go
actual: Red screen crash immediately on load. The error repeats 3 times (3 tabs being rendered).
errors: "You attempted to set the key `current` with the value `undefined` on an object that is meant to be immutable and has been frozen." — occurs at BottomNavBar.tsx line 245 (TabItem render in .map()), and traces into TabItem at line 97.
reproduction: Run `npx expo start`, open on Android device with Expo Go. Crash happens immediately on app launch.
timeline: Unknown if it ever worked. The error is consistent.

---

## Eliminated
<!-- APPEND only - prevents re-investigating -->


---

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-04-13T00:05:00.000Z
  checked: BottomNavBar.tsx lines 150-166
  found: Link asChild wrapping AnimatedPressable - same pattern as hypothesis
  implication: Confirmed the root cause - ref forwarding to AnimatedPressable causes frozen object crash

---

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: "Link asChild wraps AnimatedPressable. On Android, Reanimated's internal objects are frozen. When expo-router's Link with asChild tries to forward a ref to AnimatedPressable, it hits the frozen object and throws 'Cannot set key current on frozen object'."

fix: "Restructured TabItem so Link wraps plain Pressable (handles ref from Link), and animation is applied to inner Animated.View wrapper. This avoids the ref-forwarding conflict with Reanimated's frozen objects."

verification: "TypeScript syntax check passed. User needs to verify on Android device with Expo Go."

files_changed: ["frontend/components/ui/NavBar/BottomNavBar.tsx"]