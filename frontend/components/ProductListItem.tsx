import { memo } from "react";
import type { Product } from "@/types/product";
import Animated, { FadeIn } from "react-native-reanimated";
import ProductCard from "@/components/ProductCard";

function ProductListItem({ product }: { product: Product }) {
  return (
    <Animated.View style={{ flex: 1, padding: 6 }} entering={FadeIn.duration(200)}>
      <ProductCard product={product} width="full" />
    </Animated.View>
  );
}

export default memo(ProductListItem);
