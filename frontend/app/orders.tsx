import { AuthGate } from "@/components/AuthGate";
import { OrderListItem } from "@/components/OrderListItem";
import { Button, ButtonText } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ListEmptyState } from "@/components/ui/ListEmptyState";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { Text } from "@/components/ui/text";
import { useOrders } from "@/store/orderStore";
import { useShallow } from "zustand/react/shallow";
import { OrderStatus } from "@/types/order";
import type { Order } from "@/types/order";
import { useAuth } from "@clerk/clerk-expo";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AlertCircle, Package } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── OrdersListHeader ────────────────────────────────────────────────────────
// Memoized to prevent FlatList from remounting the header on every filter/state
// change. Previously it was an inline JSX literal, causing full remounts.
type Filter = { id: string; label: string };
type OrdersListHeaderProps = {
  filters: readonly Filter[];
  selectedFilter: string;
  onFilterPress: (id: "all" | OrderStatus) => void;
  filteredOrderCount: number;
  error: string | null;
  isLoading: boolean;
  showEmptyFilter: boolean;
  onClearError: () => void;
  onShowAll: () => void;
};
const OrdersListHeader = React.memo(function OrdersListHeader({
  filters,
  selectedFilter,
  onFilterPress,
  filteredOrderCount,
  error,
  isLoading,
  showEmptyFilter,
  onClearError,
  onShowAll,
}: OrdersListHeaderProps) {
  return (
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
            onPress={() => onFilterPress(f.id as "all" | OrderStatus)}
            style={{ minHeight: 44, justifyContent: "center" }}
            accessibilityRole="button"
            accessibilityLabel={`Filtrar órdenes: ${f.label}`}
            accessibilityState={{ selected: selectedFilter === f.id }}
            className={`rounded-2xl border px-4 transition-colors duration-200 ${
              selectedFilter === f.id
                ? "border-[#09090b] bg-[#09090b]"
                : "border-slate-200 bg-white"
            }`}
          >
            <Text
              className={`font-semibold transition-colors duration-200 ${
                selectedFilter === f.id ? "text-white" : "text-gray-700"
              }`}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Result count */}
      <View className="mb-4 mt-3">
        <Text className="text-gray-600">
          {filteredOrderCount} orden{filteredOrderCount !== 1 ? "es" : ""}
          {selectedFilter !== "all" && " encontradas"}
        </Text>
      </View>

      {/* Error */}
      {error && (
        <View className="mb-4 flex-row items-start rounded-2xl border border-red-200 bg-red-50 p-4">
          <Icon as={AlertCircle} size="md" className="text-red-600 mr-3 mt-0.5" />
          <View className="flex-1">
            <Text className="text-red-800 font-semibold mb-1">Error</Text>
            <Text className="text-red-700 text-sm">{error}</Text>
            <Pressable
              onPress={onClearError}
              className="mt-2"
              style={{ minHeight: 44, justifyContent: "center" }}
              accessibilityRole="button"
              accessibilityLabel="Descartar error"
            >
              <Text className="text-red-600 font-semibold text-sm">Descartar</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Loading */}
      {isLoading && (
        <View className="flex-1 items-center justify-center py-12">
          <LoadingDots color="#22c55e" size={12} />
          <Text className="text-gray-500 mt-4">Cargando órdenes...</Text>
        </View>
      )}

      {/* Empty filter */}
      {showEmptyFilter && (
        <ListEmptyState
          icon={Package}
          title="No se encontraron órdenes"
          description="No hay órdenes con este estado"
          actionLabel="Ver todas"
          onActionPress={onShowAll}
          style={{ padding: 16 }}
        />
      )}
    </View>
  );
});
OrdersListHeader.displayName = "OrdersListHeader";

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
          <ListEmptyState
            icon={Package}
            title="No hay órdenes todavía"
            description="Cuando hagas tu primera compra, aparecerá aquí el historial de todos tus pedidos."
            actionLabel="Ver productos"
            onActionPress={() => router.replace("/")}
            style={{ padding: 0 }}
          />
        </View>
      </View>
    );
  }

  const showEmptyFilter =
    !isLoading && orders.length === 0 && selectedFilter !== "all";

  // Memoized renderItem — prevents FlatList from re-creating the row wrapper on
  // every state update. The inline version was creating a new function reference
  // on every render, defeating FlatList's row recycling.
  const renderOrderItem = useCallback(
    ({ item }: { item: Order }) => (
      <View className="px-4">
        <OrderListItem order={item} onPress={() => handleOrderPress(item.id)} />
      </View>
    ),
    [handleOrderPress]
  );

  // ─── Memoized list header ─────────────────────────────────────────────────
  // Previously a JSX literal that remounted on every state change — now a stable
  // memo component to prevent the FlatList from unmounting the header.
  const listHeader = (
    <OrdersListHeader
      filters={filters}
      selectedFilter={selectedFilter}
      onFilterPress={handleFilterPress}
      filteredOrderCount={filteredOrders.length}
      error={error}
      isLoading={isLoading}
      showEmptyFilter={showEmptyFilter}
      onClearError={clearError}
      onShowAll={() => handleFilterPress("all")}
    />
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
            <LoadingDots color="#09090b" size={8} />
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
          renderItem={renderOrderItem}
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
