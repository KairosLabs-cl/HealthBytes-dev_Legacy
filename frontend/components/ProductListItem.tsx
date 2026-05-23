import { memo } from "react";
import type { Product } from "@/types/product";
import Animated, { FadeInDown } from "react-native-reanimated";
import ProductCard from "@/components/ProductCard";

function ProductListItem({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <Animated.View
      style={{ flex: 1, padding: 6 }}
      entering={FadeInDown.delay(Math.min(index * 60, 400))
        .springify()
        .damping(18)
        .stiffness(120)}
    >
      <ProductCard product={product} width="full" />
    </Animated.View>
  );
}

export default memo(ProductListItem);
