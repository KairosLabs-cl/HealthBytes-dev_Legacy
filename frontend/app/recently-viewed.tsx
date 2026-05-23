import { AuthGate } from "@/components/AuthGate";
import { FlashList } from "@shopify/flash-list";
import { useCallback } from "react";
import { View, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { useBreakpointValue } from "@/components/ui/utils/use-break-point-value";
import { useRecentlyViewed } from "@/store/recentlyViewedStore";
import ProductListItem from "@/components/ProductListItem";
import type { Product } from "@/types/product";
import { Clock } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export default function RecentlyViewedScreen() {
  const history = useRecentlyViewed((state) => state.items);
  const router = useRouter();

  const numColumns = useBreakpointValue({
    default: 2,
    sm: 3,
    xl: 4,
  }) as number;

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductListItem product={item} />,
    []
  );

  return (
    <AuthGate message="Inicia sesión para ver tus productos visitados.">
      <View className="flex-1 bg-[#fafafa]">
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />

        <ScreenHeader
          title="Recién Vistos"
          icon={Clock}
          showBackButton={true}
        />

        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ fontSize: 14, color: "#52525b", marginBottom: 16 }}>
            Tu historial de navegación reciente.
          </Text>
        </View>

        <View key={numColumns} className="flex-1">
          <FlashList<Product>
            data={history}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            contentContainerStyle={{
              paddingHorizontal: 12,
              paddingBottom: 128,
            }}
            showsVerticalScrollIndicator={false}
            estimatedItemSize={280}
            ListEmptyComponent={
              <View className="px-6 py-28">
                <View className="items-start rounded-[28px] border border-slate-200/70 bg-white p-6">
                <View className="mb-5 h-14 w-14 items-center justify-center rounded-[22px] bg-slate-100">
                  <Clock size={28} color="#09090b" />
                </View>
                <Text className="text-base leading-6 text-zinc-600">
                  Aún no has visto ningún producto. Empieza a explorar.
                </Text>
                <Pressable
                  onPress={() => router.push("/")}
                  className="mt-6 rounded-2xl bg-[#09090b] px-8 py-3"
                  style={{ minHeight: 48 }}
                  accessibilityRole="button"
                  accessibilityLabel="Explorar productos"
                >
                  <Text className="text-white font-bold">Explorar ahora</Text>
                </Pressable>
                </View>
              </View>
            }
          />
        </View>
      </View>
    </AuthGate>
  );
}
