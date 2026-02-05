import { OrderListItem } from "@/components/OrderListItem";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useOrders } from "@/store/orderStore";
import { OrderStatus } from "@/types/order";
import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrdersScreen() {
  const router = useRouter();
  const { filter } = useLocalSearchParams<{ filter?: string }>();
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { orders, isLoading, error, fetchOrders, clearError } = useOrders();
  const [refreshing, setRefreshing] = useState(false);

  // Establecer filtro inicial desde parámetros de URL
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | OrderStatus | "messages"
  >(() => {
    if (filter && ["pending", "packed", "in_transit", "delivered", "cancelled"].includes(filter)) {
      return filter as OrderStatus;
    }
    return "all";
  });

  // Filtros disponibles
  const filters = [
    { id: "pending", label: "Preparando" },
    { id: "in_transit", label: "En tránsito" },
    { id: "delivered", label: "Entregado o por entregar" },
  ] as const;

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/(auth)/login");
    }
  }, [isLoaded, isSignedIn]);

  /**
   * Cargar órdenes al montar o cuando se autentica
   */
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      loadOrders();
    }
  }, [isSignedIn, isLoaded]);

  const loadOrders = async () => {
    try {
      const token = await getToken();
      if (token) {
        await fetchOrders(token);
      }
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = await getToken();
      if (token) {
        await fetchOrders(token);
      }
    } finally {
      setRefreshing(false);
    }
  }, [getToken, fetchOrders]);

  /**
   * Filtrar órdenes según el estado seleccionado
   */
  const filteredOrders = useMemo(() => {
    if (selectedFilter === "all") {
      return orders;
    }
    if (selectedFilter === "messages") {
      return orders; // Por ahora retorna todas, luego implementar mensajes
    }
    // Filtrar por status
    return orders.filter((order) => {
      const normalizedStatus = order.status.toLowerCase().replace(/_/g, "");
      const filterStatus = selectedFilter.toLowerCase().replace(/_/g, "");

      // Para "pending" también incluir "packed"
      if (selectedFilter === "pending" &&
          (normalizedStatus === "pending" || normalizedStatus === "packed")) {
        return true;
      }

      return normalizedStatus === filterStatus;
    });
  }, [orders, selectedFilter]);

  const handleOrderPress = (orderId: string | number) => {
    // Navigator a una pantalla de detalle de orden (crear después)
    console.log("Order pressed:", orderId);
    // Próximamente: router.push(`/(tabs)/orders/${orderId}`);
  };

  // Loading state
  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-gray-500">Cargando...</Text>
      </View>
    );
  }

  // Not signed in
  if (!isSignedIn) {
    return null;
  }

  // Empty state
  if (!isLoading && orders.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <Stack.Screen options={{ title: "Mis órdenes" }} />

        <ScrollView className="flex-1 px-4">
          <View className="flex-1 items-center justify-center py-16">
            <Icon as={Package} size="xl" className="text-gray-300 mb-4" />
            <Text className="text-xl font-semibold text-black mb-2">
              No hay órdenes todavía
            </Text>
            <Text className="text-center text-gray-600 mb-6">
              Cuando hagas tu primera compra, aparecerá aquí el historial de
              todos tus pedidos.
            </Text>
            <Button
              onPress={() => router.replace("/(tabs)")}
              className="bg-black rounded-full"
            >
              <ButtonText className="text-white">Ver productos</ButtonText>
            </Button>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Empty filtered results
  const showEmptyFilter = !isLoading && filteredOrders.length === 0 && orders.length > 0;

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
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Header */}
        <View className="mb-4">
          <View className="mb-4">
            <Text className="text-2xl font-bold text-black">Mis órdenes</Text>
            <Text className="text-gray-600 mt-1">
              Ve el estado de tus compras!
            </Text>
          </View>

          {/* Botones de filtro */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-2"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {filters.map((filter) => (
              <Pressable
                key={filter.id}
                onPress={() =>
                  setSelectedFilter(filter.id as OrderStatus)
                }
                className={`px-4 py-2 rounded-full border ${
                  selectedFilter === filter.id
                    ? "bg-black border-black"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    selectedFilter === filter.id
                      ? "text-white"
                      : "text-gray-700"
                  }`}
                >
                  {filter.label}
                </Text>
              </Pressable>
            ))}

            {/* Botón de mensajes */}
            <Pressable
              onPress={() => setSelectedFilter("messages")}
              className={`px-4 py-2 rounded-full border flex-row items-center gap-2 ${
                selectedFilter === "messages"
                  ? "bg-black border-black"
                  : "bg-white border-gray-300"
              }`}
            >
              <Icon
                as={Package}
                size="sm"
                className={selectedFilter === "messages" ? "text-white" : "text-gray-700"}
              />
              <Text
                className={`font-semibold ${
                  selectedFilter === "messages"
                    ? "text-white"
                    : "text-gray-700"
                }`}
              >
                Mensajes del vendedor
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Contador de resultados */}
        <View className="mb-4">
          <Text className="text-gray-600">
            {filteredOrders.length} orden{filteredOrders.length !== 1 ? "es" : ""}
            {selectedFilter !== "all" && " encontradas"}
          </Text>
        </View>

        {/* Error message */}
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
              <Pressable onPress={() => clearError()} className="mt-2">
                <Text className="text-red-600 font-semibold text-sm">
                  Descartar
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Loading state */}
        {isLoading && (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="large" color="#000000" />
            <Text className="text-gray-500 mt-4">Cargando órdenes...</Text>
          </View>
        )}

        {/* Empty filter results */}
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
              className="bg-black px-4 py-2 rounded-full"
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
      </ScrollView>
    </SafeAreaView>
  );
}
