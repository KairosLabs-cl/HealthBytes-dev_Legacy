import HorizontalProductCard from "@/components/HorizontalProductCard";
import { Text } from "@/components/ui/text";
import type { Product } from "@/types/product";
import { listDiscountedProducts } from "@/api/products";
import { FlashList } from "@shopify/flash-list";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag } from "lucide-react-native";
import { useCallback } from "react";
import { Pressable, View } from "react-native";

type Props = { limit?: number; onSeeAll?: () => void };

const cardKeyExtractor = (item: Product) => String(item.id);

export default function DiscountsBar({ limit = 8, onSeeAll }: Props) {
  const { data: discounts } = useQuery({
    queryKey: ["products", "discounts"],
    queryFn: () => listDiscountedProducts(0, limit),
    staleTime: 5 * 60 * 1000,
  });

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <HorizontalProductCard product={item} />,
    []
  );

  if (!discounts?.length) {
    return null;
  }

  return (
    <View className="mx-4 mb-4 mt-4 rounded-[24px] border border-slate-200/70 bg-white px-4 pb-3 pt-4">
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50">
            <ShoppingBag size={18} color="#22c55e" strokeWidth={2.4} />
          </View>
          <Text className="text-[17px] font-black tracking-[-0.2px] text-[#09090b]">
            Ofertas
          </Text>
        </View>
        <Pressable
          onPress={onSeeAll}
          className="h-11 justify-center rounded-2xl px-3"
          accessibilityRole="button"
          accessibilityLabel="Ver todos los productos en oferta"
        >
          <Text className="text-sm font-bold text-zinc-600">Ver mas</Text>
        </Pressable>
      </View>

      <FlashList<Product>
        horizontal
        data={discounts}
        keyExtractor={cardKeyExtractor}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        renderItem={renderItem}
        estimatedItemSize={222}
      />
    </View>
  );
}
