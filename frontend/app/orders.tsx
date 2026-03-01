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
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function OrdersScreen() {
  const router = useRouter();
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { orders, isLoading, isLoadingMore, hasMore, error, fetchOrders, loadMoreOrders, clearError } = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const [selectedFilter, setSelectedFilter] = useState<"all" | OrderStatus>(
    () => {
      if (
        filter &&
        ["pending", "packed", "in_transit", "delivered", "cancelled"].includes(filter)
      ) {
        return filter as OrderStatus;
      }
      return "all";
    }
  );

  const filters = [
    { id: "pending", label: "Preparando" },
    { id: "in_transit", label: "En tránsito" },
    { id: "delivered", label: "Entregado o por entregar" },
  ] as const;

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/(auth)/login");
    }
  }, [isLoaded, isSignedIn, router]);

  const loadOrders = useCallback(async () => {
    const token = await getToken();
    if (token) await fetchOrders(token);
  }, [getToken, fetchOrders]);

  useEffect(() => {
    if (isSignedIn && isLoaded) {
      loadOrders();
    }
  }, [isSignedIn, isLoaded, loadOrders]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await getToken();
      if (token) await fetchOrders(token);
    } finally {
      setRefreshing(false);
    }
  }, [getToken, fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (selectedFilter === "all") return orders;
    return orders.filter((order) => {
      const normalizedStatus = order.status.toLowerCase().replace(/_/g, "");
      const filterStatus = selectedFilter.toLowerCase().replace(/_/g, "");
      if (
        selectedFilter === "pending" &&
        (normalizedStatus === "pending" ||
          normalizedStatus === "confirmed" ||
          normalizedStatus === "packed")
      ) {
        return true;
      }
      return normalizedStatus === filterStatus;
    });
  }, [orders, selectedFilter]);

  const handleOrderPress = useCallback(
    (orderId: string | number) => router.push(`/orders/${orderId}`),
    [router]
  );

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-gray-500">Cargando...</Text>
      </View>
    );
  }

  if (!isSignedIn) return null;

  if (!isLoading && orders.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <Stack.Screen options={{ title: "Mis órdenes" }} />
        <View className="flex-1 items-center justify-center px-6">
          <Icon as={Package} size="xl" className="text-gray-300 mb-4" />
          <Text className="text-xl font-semibold text-black mb-2">
            No hay órdenes todavía
          </Text>
          <Text className="text-center text-gray-600 mb-6">
            Cuando hagas tu primera compra, aparecerá aquí el historial de todos tus pedidos.
          </Text>
          <Button onPress={() => router.replace("/")} className="bg-black rounded-full">
            <ButtonText className="text-white">Ver productos</ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const showEmptyFilter =
    !isLoading && filteredOrders.length === 0 && orders.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ title: "Mis órdenes" }} />

      <ScrollView
        className="flex-1 bg-white px-4 pt-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#000000"
          />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {/* Header */}
        <View className="mb-4">
          <View className="mb-4">
            <Text className="text-2xl font-bold text-black">Mis órdenes</Text>
            <Text className="text-gray-600 mt-1">Ve el estado de tus compras</Text>
          </View>

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
                onPress={() => setSelectedFilter(f.id as OrderStatus)}
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
        </View>

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
            <Icon as={AlertCircle} size="md" className="text-red-600 mr-3 mt-0.5" />
            <View className="flex-1">
              <Text className="text-red-800 font-semibold mb-1">Error</Text>
              <Text className="text-red-700 text-sm">{error}</Text>
              <Pressable onPress={clearError} className="mt-2" style={{ minHeight: 44, justifyContent: "center" }}>
                <Text className="text-red-600 font-semibold text-sm">Descartar</Text>
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
              onPress={() => setSelectedFilter("all")}
              className="bg-black px-4 rounded-full"
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <Text className="text-white font-semibold">Ver todas</Text>
            </Pressable>
          </View>
        )}

        {/* Orders list */}
        {!isLoading &&
          filteredOrders.map((order) => (
            <OrderListItem
              key={order.id}
              order={order}
              onPress={() => handleOrderPress(order.id)}
            />
          ))}

        {/* Load more */}
        {!isLoading && hasMore && (
          <View className="mt-4 mb-2">
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
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
