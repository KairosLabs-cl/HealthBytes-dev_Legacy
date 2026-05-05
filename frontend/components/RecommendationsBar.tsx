import HorizontalProductCard from "@/components/HorizontalProductCard";
import { Text } from "@/components/ui/text";
import type { Product } from "@/types/product";
import { FlashList } from "@shopify/flash-list";
import { useAuth } from "@clerk/clerk-expo";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { View } from "react-native";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const cardKeyExtractor = (item: Product) => String(item.id);

async function fetchRecommended(token: string): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products/recommended?limit=12`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export default function RecommendationsBar() {
  const { isSignedIn, getToken } = useAuth();

  const { data: recommended } = useQuery({
    queryKey: ["products", "recommended"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) return [];
      return fetchRecommended(token);
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
    <View className="mt-4 mb-2 px-4">
      <Text className="text-[17px] font-bold text-ink mb-3">🌿 Para ti</Text>
      <FlashList<Product>
        horizontal
        data={recommended}
        keyExtractor={cardKeyExtractor}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        estimatedItemSize={222}
      />
    </View>
  );
}
