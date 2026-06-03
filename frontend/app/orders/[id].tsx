import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { AuthGate } from "@/components/AuthGate";
import { useQuery } from "@tanstack/react-query";
import { View, ScrollView, Pressable, FlatList } from "react-native";
import { Text } from "@/components/ui/text";
import { StatusBar } from "expo-status-bar";
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCcw,
} from "lucide-react-native";
import { formatPrice } from "@/lib/formatPrice";
import {
  OrderItem,
  OrderStatus,
  STATUS_LABELS,
  normalizeStatus,
} from "@/types/order";
import { getOrderById } from "@/api/orders";
import { useAuth } from "@clerk/clerk-expo";
import { useOrderProductDetails } from "@/hooks/useOrderProductDetails";
import { OrderItemRow } from "@/components/OrderItemRow";
import { useCallback } from "react";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAppTheme } from "@/hooks/useAppTheme";

/**
 * Status timeline configuration
 */
const STATUS_TIMELINE: {
  status: OrderStatus;
  label: string;
  icon: typeof Package;
}[] = [
  { status: "unpaid", label: "Sin pagar", icon: Clock },
  { status: "processing", label: "En proceso", icon: Package },
  { status: "shipped", label: "Enviado", icon: Truck },
  { status: "delivered", label: "Entregado", icon: CheckCircle2 },
];

/**
 * Get the index of current status in timeline
 */
function getStatusIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1;
  return STATUS_TIMELINE.findIndex((s) => s.status === status);
}

function OrderDetailScreenContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getToken } = useAuth();
  const { palette, statusBarStyle } = useAppTheme();

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No auth token");
      return getOrderById(Number(id), token);
    },
    enabled: !!id,
  });

  const { productMap } = useOrderProductDetails(order?.items);

  const renderOrderItem = useCallback(
    ({ item, index }: { item: OrderItem; index: number }) => (
      <OrderItemRow
        item={item}
        product={productMap.get(Number(item.product_id))}
        isLast={index === (order?.items.length ?? 0) - 1}
      />
    ),
    [productMap, order?.items.length]
  );

  const keyExtractor = useCallback((item: OrderItem) => String(item.id), []);

  if (isLoading) {
    return (
      <View
        className="flex-1"
        style={{ backgroundColor: palette.colors.surface.warm }}
      >
        <StatusBar style={statusBarStyle} />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title={`Orden #${id}`}
          icon={Package}
          showBackButton={true}
        />

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Timeline Skeleton */}
          <View
            className="mx-4 mt-4 rounded-[24px] border p-4"
            style={{
              backgroundColor: palette.colors.surface.card,
              borderColor: palette.colors.border.subtle,
            }}
          >
            <View
              className="h-4 w-32 rounded mb-4 animate-pulse"
              style={{ backgroundColor: palette.colors.surface.muted }}
            />
            <View className="pl-8">
              {[1, 2, 3, 4].map((i) => (
                <View key={i} className="flex-row items-center mb-6">
                  <View
                    className="absolute left-0 w-6 h-6 rounded-full animate-pulse"
                    style={{ backgroundColor: palette.colors.surface.muted }}
                  />
                  <View className="ml-4 flex-1">
                    <View
                      className="h-4 w-24 rounded animate-pulse"
                      style={{ backgroundColor: palette.colors.surface.muted }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Products Skeleton */}
          <View
            className="mx-4 mt-4 rounded-[24px] border p-4"
            style={{
              backgroundColor: palette.colors.surface.card,
              borderColor: palette.colors.border.subtle,
            }}
          >
            <View
              className="h-4 w-28 rounded mb-4 animate-pulse"
              style={{ backgroundColor: palette.colors.surface.muted }}
            />
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                className="flex-row items-center py-3 border-b"
                style={{ borderBottomColor: palette.colors.border.subtle }}
              >
                <View
                  className="w-12 h-12 rounded-lg animate-pulse mr-3"
                  style={{ backgroundColor: palette.colors.surface.muted }}
                />
                <View className="flex-1">
                  <View
                    className="h-4 w-32 rounded mb-2 animate-pulse"
                    style={{ backgroundColor: palette.colors.surface.muted }}
                  />
                  <View
                    className="h-3 w-20 rounded animate-pulse"
                    style={{ backgroundColor: palette.colors.surface.muted }}
                  />
                </View>
                <View
                  className="h-5 w-16 rounded animate-pulse"
                  style={{ backgroundColor: palette.colors.surface.muted }}
                />
              </View>
            ))}
            {/* Total Skeleton */}
            <View
              className="flex-row justify-between items-center pt-4 mt-2 border-t"
              style={{ borderTopColor: palette.colors.border.subtle }}
            >
              <View
                className="h-5 w-12 rounded animate-pulse"
                style={{ backgroundColor: palette.colors.surface.muted }}
              />
              <View
                className="h-6 w-24 rounded animate-pulse"
                style={{ backgroundColor: palette.colors.surface.muted }}
              />
            </View>
          </View>

          {/* Info Skeleton */}
          <View
            className="mx-4 mt-4 rounded-[24px] border p-4"
            style={{
              backgroundColor: palette.colors.surface.card,
              borderColor: palette.colors.border.subtle,
            }}
          >
            <View
              className="h-4 w-24 rounded mb-3 animate-pulse"
              style={{ backgroundColor: palette.colors.surface.muted }}
            />
            <View className="flex-row justify-between py-2">
              <View
                className="h-4 w-16 rounded animate-pulse"
                style={{ backgroundColor: palette.colors.surface.muted }}
              />
              <View
                className="h-4 w-28 rounded animate-pulse"
                style={{ backgroundColor: palette.colors.surface.muted }}
              />
            </View>
            <View className="flex-row justify-between py-2">
              <View
                className="h-4 w-12 rounded animate-pulse"
                style={{ backgroundColor: palette.colors.surface.muted }}
              />
              <View
                className="h-4 w-16 rounded animate-pulse"
                style={{ backgroundColor: palette.colors.surface.muted }}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View
        className="flex-1"
        style={{ backgroundColor: palette.colors.surface.warm }}
      >
        <StatusBar style={statusBarStyle} />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title={`Orden #${id}`}
          icon={Package}
          showBackButton={true}
        />
        <View className="flex-1 items-center justify-center p-6">
          <XCircle size={48} color={palette.colors.state.error} />
          <Text
            className="mt-4 text-lg"
            style={{ color: palette.colors.ink.primary }}
          >
            Orden no encontrada
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 rounded-2xl px-6 py-3"
            style={{ backgroundColor: palette.colors.ink.primary }}
          >
            <Text
              className="font-medium"
              style={{ color: palette.colors.ink.inverse }}
            >
              Volver
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const normalizedStatus = normalizeStatus(order.status);
  const currentStatusIndex = getStatusIndex(normalizedStatus);
  const isCancelled = normalizedStatus === "cancelled";
  const statusColor = {
    unpaid: palette.colors.state.warning,
    processing: palette.colors.state.info,
    shipped: palette.colors.icon.accent,
    delivered: palette.colors.state.success,
    returns: palette.colors.state.warning,
    cancelled: palette.colors.state.error,
  }[normalizedStatus];

  // Calculate total
  const total = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: palette.colors.surface.warm }}
    >
      <StatusBar style={statusBarStyle} />
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader
        title={`Orden #${order.id}`}
        icon={Package}
        showBackButton={true}
        rightElement={
          <View
            className="rounded-2xl border px-3 py-1"
            style={{
              backgroundColor: `${statusColor}1F`,
              borderColor: `${statusColor}66`,
            }}
          >
            <Text
              className="text-xs font-medium"
              style={{ color: statusColor }}
            >
              {STATUS_LABELS[normalizedStatus]}
            </Text>
          </View>
        }
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Timeline Section */}
        <View
          className="mx-4 mt-4 rounded-[24px] border p-4"
          style={{
            backgroundColor: palette.colors.surface.card,
            borderColor: palette.colors.border.subtle,
          }}
        >
          <Text
            className="mb-4 text-sm font-black"
            style={{ color: palette.colors.ink.primary }}
          >
            Estado del pedido
          </Text>

          {isCancelled ? (
            <View
              className="flex-row items-center gap-3 rounded-2xl p-4"
              style={{ backgroundColor: `${palette.colors.state.error}1F` }}
            >
              <XCircle size={24} color={palette.colors.state.error} />
              <Text
                className="font-medium"
                style={{ color: palette.colors.state.error }}
              >
                Orden cancelada
              </Text>
            </View>
          ) : (
            <View className="relative">
              {/* Timeline line - centered on the icons (icon w-7 = 28px, center = 14px, minus half line width) */}
              <View
                className="absolute w-0.5"
                style={{
                  left: 13,
                  top: 14,
                  bottom: 14,
                  backgroundColor: palette.colors.border.default,
                }}
              />

              {STATUS_TIMELINE.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const StepIcon = step.icon;

                return (
                  <View
                    key={step.status}
                    className="flex-row items-center mb-5 last:mb-0"
                  >
                    {/* Circle indicator */}
                    <View
                      className="w-7 h-7 rounded-full items-center justify-center z-10"
                      style={{
                        backgroundColor: isCompleted
                          ? palette.colors.state.success
                          : palette.colors.surface.muted,
                      }}
                    >
                      <StepIcon size={14} color={palette.colors.ink.inverse} />
                    </View>

                    {/* Label */}
                    <View className="ml-3 flex-1">
                      <Text
                        className="font-medium"
                        style={{
                          color: isCompleted
                            ? palette.colors.ink.primary
                            : palette.colors.ink.subtle,
                        }}
                      >
                        {step.label}
                      </Text>
                      {isCurrent && (
                        <Text
                          className="text-xs mt-0.5"
                          style={{ color: palette.colors.state.success }}
                        >
                          Estado actual
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Order Items */}
        <View
          className="mx-4 mt-4 rounded-[24px] border p-4"
          style={{
            backgroundColor: palette.colors.surface.card,
            borderColor: palette.colors.border.subtle,
          }}
        >
          <Text
            className="mb-2 text-sm font-black"
            style={{ color: palette.colors.ink.primary }}
          >
            Productos ({order.items.length})
          </Text>

          <FlatList
            data={order.items}
            renderItem={renderOrderItem}
            keyExtractor={keyExtractor}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />

          {/* Total */}
          <View
            className="flex-row justify-between items-center pt-4 mt-2 border-t"
            style={{ borderTopColor: palette.colors.border.subtle }}
          >
            <Text
              className="text-base font-bold"
              style={{ color: palette.colors.ink.muted }}
            >
              Total
            </Text>
            <Text
              className="text-xl font-black tracking-[-0.2px]"
              style={{ color: palette.colors.ink.primary }}
            >
              {formatPrice(total)}
            </Text>
          </View>
        </View>

        {/* Order Info */}
        <View
          className="mx-4 mt-4 rounded-[24px] border p-4"
          style={{
            backgroundColor: palette.colors.surface.card,
            borderColor: palette.colors.border.subtle,
          }}
        >
          <Text
            className="mb-3 text-sm font-black"
            style={{ color: palette.colors.ink.primary }}
          >
            Información
          </Text>
          <View className="flex-row justify-between py-2">
            <Text style={{ color: palette.colors.ink.muted }}>Fecha</Text>
            <Text style={{ color: palette.colors.ink.primary }}>
              {new Date(order.created_at).toLocaleDateString("es-CL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
          <View className="flex-row justify-between py-2">
            <Text style={{ color: palette.colors.ink.muted }}>Hora</Text>
            <Text style={{ color: palette.colors.ink.primary }}>
              {new Date(order.created_at).toLocaleTimeString("es-CL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        {/* Reorder Button */}
        {normalizedStatus === "delivered" && (
          <View className="px-4 mt-6">
            <Pressable
              className="flex-row items-center justify-center rounded-2xl py-4 active:opacity-85"
              style={{ backgroundColor: palette.colors.ink.primary }}
            >
              <RefreshCcw size={20} color={palette.colors.ink.inverse} />
              <Text
                className="font-semibold ml-2"
                style={{ color: palette.colors.ink.inverse }}
              >
                Volver a pedir
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

export default function OrderDetailScreen() {
  return (
    <AuthGate message="Inicia sesión para ver el detalle de tu pedido.">
      <OrderDetailScreenContent />
    </AuthGate>
  );
}
