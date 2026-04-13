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
    ({ item }: { item: any }) => (
      <ProductListItem product={item} />
    ),
    []
  );

  return (
    <AuthGate message="Inicia sesión para ver tus productos visitados.">
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />

        <ScreenHeader title="Recién Vistos" icon={Clock} showBackButton={true} />

        <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text style={{ fontSize: 14, color: "#6B7280", marginBottom: 16 }}>
            Tu historial de navegación reciente.
          </Text>
        </View>

        <View key={numColumns} className="flex-1">
          <FlashList<any>
            data={history}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={numColumns}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 128 }}
            showsVerticalScrollIndicator={false}
            estimatedItemSize={280}
            ListEmptyComponent={
              <View className="items-center justify-center py-40 px-6">
                <Clock size={48} color="#D1D5DB" />
                <Text className="text-gray-400 mt-4 text-center">
                  Aún no has visto ningún producto. ¡Empieza a explorar!
                </Text>
                <Pressable
                  onPress={() => router.push("/")}
                  className="mt-6 bg-black px-8 py-3 rounded-full"
                >
                  <Text className="text-white font-bold">Explorar ahora</Text>
                </Pressable>
              </View>
            }
          />
        </View>
      </View>
    </AuthGate>
  );
}
