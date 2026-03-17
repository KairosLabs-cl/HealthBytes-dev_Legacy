# Interactive Order Product Detail - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the static product list in `orders/[id].tsx` into an interactive experience that shows real product names/images and navigates to `product/[id]` on tap.

**Architecture:** Fetch product details in parallel using `useQueries` from `@tanstack/react-query` (already cached if user visited products). Create a memoized `OrderItemRow` component with `Pressable` navigation and image display. Replace `.map()` with `FlatList` + `useCallback` for performance. Fix auth inconsistency by using the centralized API module.

**Tech Stack:** React Native 0.81, Expo Router 6, @tanstack/react-query 5, NativeWind/TailwindCSS, lucide-react-native, @clerk/clerk-expo

---

## MFRI Assessment

| Dimension              | Score | Justification                                                     |
|------------------------|-------|-------------------------------------------------------------------|
| Platform Clarity       | 5     | Both iOS & Android via Expo, well-defined                         |
| Accessibility Readiness| 4     | Pressable has built-in a11y, adding accessibilityLabel            |
| Interaction Complexity | 2     | Simple tap navigation, no gestures                                |
| Performance Risk       | 2     | Small lists (orders rarely exceed 10 items), product data cached  |
| Offline Dependence     | 2     | Graceful fallback to placeholder when product fetch fails         |

**MFRI = (5 + 4) - (2 + 2 + 2) = 3** -> Moderate. Add performance + UX validation.

## Mobile Checkpoint

```
Platform:     iOS + Android (Expo)
Framework:    React Native 0.81 + Expo 54
Files Read:   orders/[id].tsx, types/order.ts, types/product.ts, api/products.ts, api/orders.ts, product/[id].tsx

3 Principles I Will Apply:
1. Touch targets >= 44px for all interactive product rows
2. Memoize list items with React.memo + useCallback renderItem
3. Immediate visual feedback on press (opacity/scale)

Anti-Patterns I Will Avoid:
1. ScrollView with .map() for list rendering -> FlatList
2. Inline renderItem causing re-renders -> useCallback
3. No loading/error states -> Skeleton + fallback for missing product data
```

---

### Task 1: Extend OrderItem type with optional product snapshot

**Files:**
- Modify: `frontend/types/order.ts:10-16`

**Step 1: Add optional product fields to OrderItem type**

Add `product_name` and `product_image` as optional fields so the UI can use them when available (from API enrichment or client-side fetching).

```typescript
export type OrderItem = {
  id: string | number;
  order_id: string | number;
  product_id: string | number;
  quantity: number;
  price: number;
  // Optional enriched fields (client-side populated)
  product_name?: string;
  product_image?: string;
};
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit` (from frontend/)
Expected: No new errors (fields are optional, backward compatible)

**Step 3: Commit**

```bash
git add frontend/types/order.ts
git commit -m "feat(types): add optional product snapshot fields to OrderItem"
```

---

### Task 2: Fix auth - Replace inline fetch with centralized API + Clerk token

**Files:**
- Modify: `frontend/app/orders/[id].tsx:1-42,66-78`

**Step 1: Replace inline fetchOrderById with the centralized API**

Remove the inline `fetchOrderById` function (lines 26-42) and the `API_URL` constant (line 26). Import and use `getOrderById` from `@/api/orders` with proper Clerk auth token.

```typescript
// Remove these lines:
// const API_URL = process.env.EXPO_PUBLIC_API_URL;
// async function fetchOrderById(id: number): Promise<Order> { ... }

// Add import:
import { getOrderById } from "@/api/orders";
import { useAuth } from "@clerk/clerk-expo";
```

**Step 2: Update the component to use Clerk token**

Inside `OrderDetailScreenContent`, add auth and update the query:

```typescript
function OrderDetailScreenContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getToken } = useAuth();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return getOrderById(Number(id), token);
    },
    enabled: !!id,
  });
  // ... rest unchanged
```

**Step 3: Verify app compiles**

Run: `npx tsc --noEmit` (from frontend/)
Expected: PASS

**Step 4: Commit**

```bash
git add frontend/app/orders/[id].tsx
git commit -m "fix(orders): use centralized API with Bearer auth instead of inline fetch"
```

---

### Task 3: Create useOrderProductDetails hook

**Files:**
- Create: `frontend/hooks/useOrderProductDetails.ts`

**Step 1: Implement the hook**

Uses `useQueries` to fetch product details for all items in the order in parallel. Returns a `Map<product_id, Product>` for O(1) lookups.

```typescript
import { useQueries } from "@tanstack/react-query";
import { fetchProductById } from "@/api/products";
import { Product } from "@/types/product";
import { OrderItem } from "@/types/order";
import { useMemo } from "react";

/**
 * Fetches product details for all items in an order.
 * Leverages react-query cache so previously viewed products resolve instantly.
 * Returns a Map for O(1) lookups by product_id.
 */
export function useOrderProductDetails(items: OrderItem[] | undefined) {
  const queries = useQueries({
    queries: (items ?? []).map((item) => ({
      queryKey: ["product", Number(item.product_id)],
      queryFn: () => fetchProductById(Number(item.product_id)),
      staleTime: 5 * 60 * 1000, // 5 minutes
      enabled: !!item.product_id,
    })),
  });

  const productMap = useMemo(() => {
    const map = new Map<number, Product>();
    (items ?? []).forEach((item, index) => {
      const query = queries[index];
      if (query?.data) {
        map.set(Number(item.product_id), query.data);
      }
    });
    return map;
  }, [items, queries]);

  const isLoading = queries.some((q) => q.isLoading);

  return { productMap, isLoading };
}
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit` (from frontend/)
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/hooks/useOrderProductDetails.ts
git commit -m "feat(hooks): add useOrderProductDetails for parallel product fetching"
```

---

### Task 4: Create memoized OrderItemRow component

**Files:**
- Create: `frontend/components/OrderItemRow.tsx`

**Step 1: Implement the memoized component**

Displays product image (or Package icon fallback), real product name (or "Producto #ID" fallback), quantity, and subtotal. Wraps in `Pressable` with navigation to `product/[id]`.

```typescript
import React from "react";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { Image } from "@/components/ui/image";
import { Package, ChevronRight } from "lucide-react-native";
import { formatPrice } from "@/lib/formatPrice";
import { OrderItem } from "@/types/order";
import { Product } from "@/types/product";
import { useRouter } from "expo-router";

type OrderItemRowProps = {
  item: OrderItem;
  product: Product | undefined;
  isLast: boolean;
};

function OrderItemRowInner({ item, product, isLast }: OrderItemRowProps) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/product/${item.product_id}`)}
      className={`flex-row items-center py-3 active:bg-gray-50 ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
      style={{ minHeight: 64 }} // >= 44px touch target
      accessibilityRole="button"
      accessibilityLabel={`Ver ${product?.name ?? `producto ${item.product_id}`}`}
    >
      {/* Product Image or Fallback */}
      {product?.image ? (
        <View className="w-12 h-12 rounded-lg overflow-hidden mr-3 bg-gray-100">
          <Image
            source={{ uri: product.image }}
            alt={product.name ?? "Producto"}
            className="w-12 h-12"
            resizeMode="cover"
          />
        </View>
      ) : (
        <View className="w-12 h-12 bg-gray-100 rounded-lg items-center justify-center mr-3">
          <Package size={20} color="#6B7280" />
        </View>
      )}

      {/* Product Info */}
      <View className="flex-1 mr-2">
        <Text className="text-gray-900 font-medium" numberOfLines={2}>
          {product?.name ?? `Producto #${item.product_id}`}
        </Text>
        <Text className="text-sm text-gray-500">
          Cantidad: {item.quantity}
        </Text>
      </View>

      {/* Price + Chevron */}
      <View className="flex-row items-center">
        <Text className="font-semibold text-gray-900 mr-1">
          {formatPrice(item.price * item.quantity)}
        </Text>
        <ChevronRight size={16} color="#9CA3AF" />
      </View>
    </Pressable>
  );
}

export const OrderItemRow = React.memo(OrderItemRowInner);
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit` (from frontend/)
Expected: PASS

**Step 3: Commit**

```bash
git add frontend/components/OrderItemRow.tsx
git commit -m "feat(components): add memoized OrderItemRow with product image and navigation"
```

---

### Task 5: Integrate into orders/[id].tsx - Replace items list with FlatList

**Files:**
- Modify: `frontend/app/orders/[id].tsx` (items section, lines 271-308)

**Step 1: Add imports and hook usage**

```typescript
// Add to imports:
import { useOrderProductDetails } from "@/hooks/useOrderProductDetails";
import { OrderItemRow } from "@/components/OrderItemRow";
import { FlatList } from "react-native";
import { useCallback } from "react";
import { OrderItem } from "@/types/order";
```

Inside the component, after the `order` query:

```typescript
const { productMap } = useOrderProductDetails(order?.items);

const renderOrderItem = useCallback(
  ({ item, index }: { item: OrderItem; index: number }) => (
    <OrderItemRow
      item={item}
      product={productMap.get(Number(item.product_id))}
      isLast={index === (order?.items.length ?? 0) - 1}
    />
  ),
  [productMap, order?.items.length]
);

const keyExtractor = useCallback(
  (item: OrderItem) => String(item.id),
  []
);
```

**Step 2: Replace the items `.map()` block with FlatList**

Replace the order items section (the `.map()` block inside "Productos" card) with:

```tsx
{/* Order Items */}
<View className="bg-white mx-4 mt-4 rounded-2xl p-4">
  <Text className="text-sm font-semibold text-gray-700 mb-2">
    Productos ({order.items.length})
  </Text>

  <FlatList
    data={order.items}
    renderItem={renderOrderItem}
    keyExtractor={keyExtractor}
    scrollEnabled={false}
    showsVerticalScrollIndicator={false}
  />

  {/* Total */}
  <View className="flex-row justify-between items-center pt-4 mt-2 border-t border-gray-200">
    <Text className="text-base font-semibold text-gray-700">Total</Text>
    <Text className="text-xl font-bold text-gray-900">
      {formatPrice(total)}
    </Text>
  </View>
</View>
```

Note: `scrollEnabled={false}` because it's nested inside a `ScrollView`. This gives us `React.memo` benefits on items without scroll conflict.

**Step 3: Clean up unused imports**

Remove `Package` from the lucide import list in orders/[id].tsx (it's now used only in `OrderItemRow`).

**Step 4: Verify app compiles**

Run: `npx tsc --noEmit` (from frontend/)
Expected: PASS

**Step 5: Commit**

```bash
git add frontend/app/orders/[id].tsx
git commit -m "feat(orders): replace static item list with FlatList + memoized OrderItemRow"
```

---

### Task 6: Final integration verification and cleanup

**Files:**
- Review: All modified files

**Step 1: Run TypeScript check**

Run: `npx tsc --noEmit` (from frontend/)
Expected: PASS with zero errors

**Step 2: Verify no circular imports**

Ensure `OrderItemRow` -> `@/types/order` and `useOrderProductDetails` -> `@/api/products` don't create cycles.

**Step 3: Manual verification checklist**

- [ ] Product images load in order detail
- [ ] Product names display (fallback to "Producto #ID" if fetch fails)
- [ ] Tapping a product navigates to `/product/[id]`
- [ ] Touch target >= 44px (minHeight: 64 set)
- [ ] Visual press feedback (active:bg-gray-50)
- [ ] Back navigation works from product detail back to order
- [ ] Skeleton still displays correctly during loading
- [ ] Error state still works correctly

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore(orders): cleanup and verify interactive product detail integration"
```

---

## Summary of Changes

| File | Action | Purpose |
|------|--------|---------|
| `frontend/types/order.ts` | Modify | Add optional product fields to OrderItem |
| `frontend/api/orders.ts` | No change | Already has `getOrderById` with Bearer auth |
| `frontend/app/orders/[id].tsx` | Modify | Fix auth, integrate FlatList + hook + memoized rows |
| `frontend/hooks/useOrderProductDetails.ts` | Create | Parallel product fetching with useQueries |
| `frontend/components/OrderItemRow.tsx` | Create | Memoized interactive product row |
