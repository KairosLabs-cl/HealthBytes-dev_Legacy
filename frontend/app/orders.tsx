import { AuthGate } from "@/components/AuthGate";
import { OrderListItem } from "@/components/OrderListItem";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useOrders } from "@/store/orderStore";
import { OrderStatus } from "@/types/order";
import { useAuth } from "@clerk/clerk-expo";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AlertCircle, Package } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function OrdersScreen() {
  const router = useRouter();
  const { filter, status } = useLocalSearchParams<{
    filter?: string;
    status?: string;
  }>();
  const { getToken, isSignedIn, isLoaded } = useAuth();

  // ⚡ Bolt: Use granular selectors for Zustand stores to prevent unnecessary full-screen re-renders
  const orders = useOrders((s) => s.orders);
  const isLoading = useOrders((s) => s.isLoading);
  const isLoadingMore = useOrders((s) => s.isLoadingMore);
  const hasMore = useOrders((s) => s.hasMore);
  const error = useOrders((s) => s.error);
  const fetchOrders = useOrders((s) => s.fetchOrders);
  const loadMoreOrders = useOrders((s) => s.loadMoreOrders);
  const clearError = useOrders((s) => s.clearError);

  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const initialParam = filter || status;
  const [selectedFilter, setSelectedFilter] = useState<"all" | OrderStatus>(
    () => {
      if (
        initialParam &&
        [
          "unpaid",
          "processing",
          "shipped",
          "delivered",
          "returns",
          "cancelled",
        ].includes(initialParam)
      ) {
        return initialParam as OrderStatus;
      }
      return "all";
    }
  );

  const filters = [
    { id: "all", label: "Todas" },
    { id: "unpaid", label: "Sin pagar" },
    { id: "processing", label: "En proceso" },
    { id: "shipped", label: "Enviado" },
    { id: "delivered", label: "Entregado" },
    { id: "returns", label: "Devolución" },
  ] as const;

  useEffect(() => {
    if (!isSignedIn || !isLoaded) return;
    const status = selectedFilter !== "all" ? selectedFilter : undefined;
    getToken().then((token) => {
      if (token) fetchOrders(token, 0, undefined, status);
    });
    // Re-fetch when auth state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn, isLoaded]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await getToken();
      const status = selectedFilter !== "all" ? selectedFilter : undefined;
      if (token) await fetchOrders(token, 0, undefined, status);
    } finally {
      setRefreshing(false);
    }
  }, [getToken, fetchOrders, selectedFilter]);

  const filteredOrders = orders;

  const handleFilterPress = useCallback(
    async (filterId: "all" | OrderStatus) => {
      setSelectedFilter(filterId);
      const token = await getToken();
      if (!token) return;
      const status = filterId !== "all" ? filterId : undefined;
      fetchOrders(token, 0, undefined, status);
    },
    [getToken, fetchOrders]
  );

  const handleOrderPress = useCallback(
    (orderId: string | number) => router.push(`/orders/${orderId}`),
    [router]
  );

  if (!isLoading && selectedFilter === "all" && orders.length === 0) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Mis órdenes" icon={Package} showBackButton={true} />
        <View className="flex-1 items-center justify-center px-6">
          <Icon as={Package} size="xl" className="text-gray-300 mb-4" />
          <Text className="text-xl font-semibold text-black mb-2">
            No hay órdenes todavía
          </Text>
          <Text className="text-center text-gray-600 mb-6">
            Cuando hagas tu primera compra, aparecerá aquí el historial de todos
            tus pedidos.
          </Text>
          <Button
            onPress={() => router.replace("/")}
            className="bg-black rounded-full"
          >
            <ButtonText className="text-white">Ver productos</ButtonText>
          </Button>
        </View>
      </View>
    );
  }

  const showEmptyFilter =
    !isLoading && orders.length === 0 && selectedFilter !== "all";

  // Defined outside render to avoid remounting the header on every state change
  const listHeader = (
    <View className="px-4 pt-4">
      {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row gap-2"
          contentContainerStyle={{ paddingRight: 16, gap: 8 }}
        >
          {filters.map((f) => (
            <Pressable
              key={f.id}
              onPress={() => handleFilterPress(f.id as OrderStatus)}
              style={{ minHeight: 44, justifyContent: "center" }}
              className={`px-4 rounded-full border ${
                selectedFilter === f.id
                  ? "bg-black border-black"
                  : "bg-white border-gray-300"
              }`}
            >
              <Text
                className={`font-semibold ${
                  selectedFilter === f.id ? "text-white" : "text-gray-700"
                }`}
              >
                {f.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

      {/* Result count */}
      <View className="mb-4">
        <Text className="text-gray-600">
          {filteredOrders.length} orden{filteredOrders.length !== 1 ? "es" : ""}
          {selectedFilter !== "all" && " encontradas"}
        </Text>
      </View>

      {/* Error */}
      {error && (
        <View className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex-row items-start">
          <Icon
            as={AlertCircle}
            size="md"
            className="text-red-600 mr-3 mt-0.5"
          />
          <View className="flex-1">
            <Text className="text-red-800 font-semibold mb-1">Error</Text>
            <Text className="text-red-700 text-sm">{error}</Text>
            <Pressable
              onPress={clearError}
              className="mt-2"
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <Text className="text-red-600 font-semibold text-sm">
                Descartar
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Loading */}
      {isLoading && (
        <View className="flex-1 items-center justify-center py-12">
          <ActivityIndicator size="large" color="#000000" />
          <Text className="text-gray-500 mt-4">Cargando órdenes...</Text>
        </View>
      )}

      {/* Empty filter */}
      {showEmptyFilter && (
        <View className="items-center justify-center py-12">
          <Icon as={Package} size="xl" className="text-gray-300 mb-4" />
          <Text className="text-lg font-semibold text-black mb-2">
            No se encontraron órdenes
          </Text>
          <Text className="text-center text-gray-600 mb-4">
            No hay órdenes con este estado
          </Text>
          <Pressable
            onPress={() => handleFilterPress("all")}
            className="bg-black px-4 rounded-full"
            style={{ minHeight: 44, justifyContent: "center" }}
          >
            <Text className="text-white font-semibold">Ver todas</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  const listFooter =
    !isLoading && hasMore ? (
      <View className="mx-4 mt-4 mb-2">
        {selectedFilter !== "all" && (
          <Text className="text-center text-gray-400 text-xs mb-3">
            Puede haber más órdenes sin cargar
          </Text>
        )}
        <Pressable
          onPress={async () => {
            const token = await getToken();
            if (token) await loadMoreOrders(token);
          }}
          disabled={isLoadingMore}
          className="rounded-full border border-gray-200 items-center justify-center flex-row gap-2 active:bg-gray-50"
          style={{ minHeight: 48 }}
        >
          {isLoadingMore ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Text className="text-sm font-semibold text-gray-700">
              Cargar más órdenes
            </Text>
          )}
        </Pressable>
      </View>
    ) : null;

  return (
    <AuthGate message="Inicia sesion para ver el historial de tus pedidos.">
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Mis órdenes" icon={Package} showBackButton={true} />

        <FlatList
          className="flex-1 bg-white"
          data={!isLoading ? filteredOrders : []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View className="px-4">
              <OrderListItem
                order={item}
                onPress={() => handleOrderPress(item.id)}
              />
            </View>
          )}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#000000"
            />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </AuthGate>
  );
}
