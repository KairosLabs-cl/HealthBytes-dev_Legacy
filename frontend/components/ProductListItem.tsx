import { memo } from "react";
import type { Product } from "@/types/product";
import Animated, { FadeInDown } from "react-native-reanimated";
import ProductCard from "@/components/ProductCard";

// Only animate the first 6 items (above-the-fold in a 2-col grid).
// Animating every item on scroll saturates the worklet thread and causes jank.
const ANIMATION_THRESHOLD = 6;

function ProductListItem({ product, index = 0 }: { product: Product; index?: number }) {
  const shouldAnimate = index < ANIMATION_THRESHOLD;

  return (
    <Animated.View
      style={{ flex: 1, padding: 6 }}
      entering={
        shouldAnimate
          ? FadeInDown.delay(index * 50).duration(280)
          : undefined
      }
    >
      <ProductCard product={product} width="full" />
    </Animated.View>
  );
}

export default memo(ProductListItem);
