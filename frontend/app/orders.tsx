import { AuthGate } from "@/components/AuthGate";
import { OrderListItem } from "@/components/OrderListItem";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useOrders } from "@/store/orderStore";
import { useShallow } from "zustand/react/shallow";
import { OrderStatus } from "@/types/order";
import { useAuth } from "@clerk/clerk-expo";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AlertCircle, Package } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function OrdersScreen() {
  const router = useRouter();
  const { filter, status } = useLocalSearchParams<{
    filter?: string;
    status?: string;
  }>();
  const { getToken, isSignedIn, isLoaded } = useAuth();

  // ⚡ Bolt: Use granular selectors for Zustand stores to prevent unnecessary full-screen re-renders
  const {
    orders,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    fetchOrders,
    loadMoreOrders,
    clearError,
  } = useOrders(
    useShallow((s) => ({
      orders: s.orders,
      isLoading: s.isLoading,
      isLoadingMore: s.isLoadingMore,
      hasMore: s.hasMore,
      error: s.error,
      fetchOrders: s.fetchOrders,
      loadMoreOrders: s.loadMoreOrders,
      clearError: s.clearError,
    }))
  );

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
      <View className="flex-1 bg-[#fafafa]">
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Mis órdenes"
          icon={Package}
          showBackButton={true}
        />
        <View className="flex-1 justify-center px-6">
          <View className="items-start rounded-[28px] border border-slate-200/70 bg-white p-6">
          <View className="mb-5 h-16 w-16 items-center justify-center rounded-[24px] bg-slate-100">
            <Icon as={Package} size="xl" className="text-[#09090b]" />
          </View>
          <Text className="mb-2 text-xl font-black tracking-[-0.3px] text-[#09090b]">
            No hay órdenes todavía
          </Text>
          <Text className="mb-6 text-base leading-6 text-zinc-600">
            Cuando hagas tu primera compra, aparecerá aquí el historial de todos
            tus pedidos.
          </Text>
          <Button
            onPress={() => router.replace("/")}
            className="rounded-2xl bg-[#09090b]"
            accessibilityRole="button"
            accessibilityLabel="Ver productos"
          >
            <ButtonText className="text-white">Ver productos</ButtonText>
          </Button>
          </View>
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
            accessibilityRole="button"
            accessibilityLabel={`Filtrar órdenes: ${f.label}`}
            accessibilityState={{ selected: selectedFilter === f.id }}
            className={`rounded-2xl border px-4 ${
              selectedFilter === f.id
                ? "border-[#09090b] bg-[#09090b]"
                : "border-slate-200 bg-white"
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
        <View className="mb-4 flex-row items-start rounded-2xl border border-red-200 bg-red-50 p-4">
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
              accessibilityRole="button"
              accessibilityLabel="Descartar error"
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
          <View className="flex-row gap-2">
            <View className="h-3 w-3 rounded-full bg-[#22c55e]" />
            <View className="h-3 w-3 rounded-full bg-slate-300" />
            <View className="h-3 w-3 rounded-full bg-slate-400" />
          </View>
          <Text className="text-gray-500 mt-4">Cargando órdenes...</Text>
        </View>
      )}

      {/* Empty filter */}
      {showEmptyFilter && (
        <View className="items-start rounded-[28px] border border-slate-200/70 bg-white p-6">
          <View className="mb-5 h-14 w-14 items-center justify-center rounded-[22px] bg-slate-100">
            <Icon as={Package} size="xl" className="text-[#09090b]" />
          </View>
          <Text className="mb-2 text-lg font-black text-[#09090b]">
            No se encontraron órdenes
          </Text>
          <Text className="mb-4 text-sm text-zinc-600">
            No hay órdenes con este estado
          </Text>
          <Pressable
            onPress={() => handleFilterPress("all")}
            className="rounded-2xl bg-[#09090b] px-4"
            style={{ minHeight: 48, justifyContent: "center" }}
            accessibilityRole="button"
            accessibilityLabel="Ver todas las órdenes"
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
          className="flex-row items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white active:bg-slate-50"
          style={{ minHeight: 48 }}
          accessibilityRole="button"
          accessibilityLabel={
            isLoadingMore ? "Cargando más órdenes" : "Cargar más órdenes"
          }
          accessibilityState={{ disabled: isLoadingMore }}
        >
          {isLoadingMore ? (
            <View className="flex-row gap-1">
              <View className="h-2 w-2 rounded-full bg-[#22c55e]" />
              <View className="h-2 w-2 rounded-full bg-slate-300" />
              <View className="h-2 w-2 rounded-full bg-slate-400" />
            </View>
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
      <View className="flex-1 bg-[#fafafa]">
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Mis órdenes"
          icon={Package}
          showBackButton={true}
        />

        <FlatList
          className="flex-1 bg-[#fafafa]"
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
