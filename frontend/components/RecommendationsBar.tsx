import { getRecommendedProducts } from "@/api/products";
import HorizontalProductCard from "@/components/HorizontalProductCard";
import { Text } from "@/components/ui/text";
import type { Product } from "@/types/product";
import { FlashList } from "@shopify/flash-list";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { Leaf } from "lucide-react-native";
import { useCallback } from "react";
import { View } from "react-native";

const cardKeyExtractor = (item: Product) => String(item.id);

export default function RecommendationsBar() {
  const { isSignedIn, getToken } = useAuth();

  const { data: recommended } = useQuery({
    queryKey: ["products", "recommended"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) return [];
      return getRecommendedProducts(token, 12);
    },
    enabled: !!isSignedIn,
    staleTime: 5 * 60 * 1000,
  });

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <HorizontalProductCard product={item} />,
    []
  );

  if (!recommended?.length) return null;

  return (
    <View className="mx-4 mb-2 mt-4 rounded-[24px] border border-border-subtle bg-surface-card px-4 pb-3 pt-4">
      <View className="mb-3 flex-row items-center gap-2">
        <View className="h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50">
          <Leaf size={18} color="#22c55e" strokeWidth={2.4} />
        </View>
        <Text className="text-[17px] font-black tracking-[-0.2px] text-ink">
          Para ti
        </Text>
      </View>
      <FlashList<Product>
        horizontal
        data={recommended}
        keyExtractor={cardKeyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        renderItem={renderItem}
        estimatedItemSize={222}
      />
    </View>
  );
}
