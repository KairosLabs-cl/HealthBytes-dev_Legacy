import { memo } from "react";
import { View } from "react-native";
import type { Product } from "@/types/product";
import ProductCard from "@/components/ProductCard";

function HorizontalProductCard({ product }: { product: Product }) {
  return (
    <View style={{ marginRight: 12 }}>
      <ProductCard product={product} width={210} />
    </View>
  );
}

export default memo(HorizontalProductCard);
