import { AuthGate } from "@/components/AuthGate";
import { OrderListItem } from "@/components/OrderListItem";
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
import React, { useCallback, useEffect, useState, useMemo } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppTheme } from "@/hooks/useAppTheme";

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
  const { palette } = useAppTheme();

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
            style={{
              minHeight: 44,
              justifyContent: "center",
              backgroundColor:
                selectedFilter === f.id
                  ? palette.colors.ink.primary
                  : palette.colors.surface.card,
              borderColor:
                selectedFilter === f.id
                  ? palette.colors.border.focus
                  : palette.colors.border.subtle,
            }}
            accessibilityRole="button"
            accessibilityLabel={`Filtrar órdenes: ${f.label}`}
            accessibilityState={{ selected: selectedFilter === f.id }}
            className="rounded-2xl border px-4 transition-colors duration-200"
          >
            <Text
              className="font-semibold transition-colors duration-200"
              style={{
                color:
                  selectedFilter === f.id
                    ? palette.colors.ink.inverse
                    : palette.colors.ink.primary,
              }}
            >
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Result count */}
      <View className="mb-4 mt-3">
        <Text style={{ color: palette.colors.ink.muted }}>
          {filteredOrderCount} orden{filteredOrderCount !== 1 ? "es" : ""}
          {selectedFilter !== "all" && " encontradas"}
        </Text>
      </View>

      {/* Error */}
      {error && (
        <View
          className="mb-4 flex-row items-start rounded-2xl border p-4"
          style={{
            backgroundColor: `${palette.colors.state.error}1F`,
            borderColor: `${palette.colors.state.error}3D`,
          }}
        >
          <Icon
            as={AlertCircle}
            size="md"
            className="mr-3 mt-0.5"
            style={{ color: palette.colors.state.error }}
          />
          <View className="flex-1">
            <Text
              className="font-semibold mb-1"
              style={{ color: palette.colors.state.error }}
            >
              Error
            </Text>
            <Text
              className="text-sm"
              style={{ color: palette.colors.state.error }}
            >
              {error}
            </Text>
            <Pressable
              onPress={onClearError}
              className="mt-2"
              style={{ minHeight: 44, justifyContent: "center" }}
              accessibilityRole="button"
              accessibilityLabel="Descartar error"
            >
              <Text
                className="font-semibold text-sm"
                style={{ color: palette.colors.state.error }}
              >
                Descartar
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Loading */}
      {isLoading && (
        <View className="flex-1 items-center justify-center py-12">
          <LoadingDots color={palette.colors.state.success} size={12} />
          <Text className="mt-4" style={{ color: palette.colors.ink.muted }}>
            Cargando órdenes...
          </Text>
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
const FILTERS = [
  { id: "all", label: "Todas" },
  { id: "unpaid", label: "Sin pagar" },
  { id: "processing", label: "En proceso" },
  { id: "shipped", label: "Enviado" },
  { id: "delivered", label: "Entregado" },
  { id: "returns", label: "Devolución" },
] as const;

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
  const { palette, statusBarStyle } = useAppTheme();

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

  // FILTERS is now defined statically outside the component to prevent recreation on every render

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
      filters={FILTERS}
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
          <Text
            className="text-center text-xs mb-3"
            style={{ color: palette.colors.ink.subtle }}
          >
            Puede haber más órdenes sin cargar
          </Text>
        )}
        <Pressable
          onPress={async () => {
            const token = await getToken();
            if (token) await loadMoreOrders(token);
          }}
          disabled={isLoadingMore}
          className="flex-row items-center justify-center gap-2 rounded-2xl border active:opacity-85"
          style={{
            minHeight: 48,
            backgroundColor: palette.colors.surface.card,
            borderColor: palette.colors.border.subtle,
          }}
          accessibilityRole="button"
          accessibilityLabel={
            isLoadingMore ? "Cargando más órdenes" : "Cargar más órdenes"
          }
          accessibilityState={{ disabled: isLoadingMore }}
        >
          {isLoadingMore ? (
            <LoadingDots color={palette.colors.icon.primary} size={8} />
          ) : (
            <Text
              className="text-sm font-semibold"
              style={{ color: palette.colors.ink.primary }}
            >
              Cargar más órdenes
            </Text>
          )}
        </Pressable>
      </View>
    ) : null;

  if (!isLoading && selectedFilter === "all" && orders.length === 0) {
    return (
      <View
        className="flex-1"
        style={{ backgroundColor: palette.colors.surface.warm }}
      >
        <StatusBar style={statusBarStyle} />
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

  return (
    <AuthGate message="Inicia sesion para ver el historial de tus pedidos.">
      <View
        className="flex-1"
        style={{ backgroundColor: palette.colors.surface.warm }}
      >
        <StatusBar style={statusBarStyle} />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Mis órdenes"
          icon={Package}
          showBackButton={true}
        />

        <FlatList
          className="flex-1"
          style={{ backgroundColor: palette.colors.surface.warm }}
          data={!isLoading ? filteredOrders : []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderOrderItem}
          ListHeaderComponent={listHeader}
          ListFooterComponent={listFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={palette.colors.icon.primary}
            />
          }
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </AuthGate>
  );
}
