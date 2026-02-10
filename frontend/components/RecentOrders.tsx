import { Text } from "@/components/ui/text";
import { formatPrice } from "@/lib/formatPrice";
import {
  Order,
  STATUS_BADGE_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
  normalizeStatus,
} from "@/types/order";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";

interface RecentOrdersProps {
  orders: Order[];
  isLoading?: boolean;
  onViewAll?: () => void;
}

export function RecentOrders({
  orders,
  isLoading,
  onViewAll,
}: RecentOrdersProps) {
  const router = useRouter();

  // Mostrar las 3 órdenes más recientes
  const recentOrders = useMemo(() => {
    return orders.slice(0, 3);
  }, [orders]);

  if (isLoading) {
    return (
      <View className="bg-white rounded-2xl p-4">
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (orders.length === 0) {
    return null;
  }

  return (
    <View className="bg-white rounded-2xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-lg font-semibold text-black">
          Órdenes recientes
        </Text>
        {orders.length > 3 && (
          <Pressable onPress={onViewAll}>
            <Text className="text-sm text-blue-600 font-medium">Ver todas</Text>
          </Pressable>
        )}
      </View>

      <View className="gap-3">
        {recentOrders.map((order) => {
          const normalizedStatus = normalizeStatus(
            order.status as unknown as string
          );
          return (
            <Pressable
              key={order.id}
              onPress={() => {
                // Próximamente: navegar a detalle de orden
                console.log("Order pressed:", order.id);
              }}
              className={`${STATUS_COLORS[normalizedStatus]} border border-gray-200 rounded-lg p-3 flex-row items-center justify-between`}
            >
              <View className="flex-1">
                <Text className="text-sm font-semibold text-black mb-1">
                  Orden #{String(order.id)}
                </Text>
                <View className="flex-row items-center gap-2">
                  <View
                    className={`${STATUS_BADGE_COLORS[normalizedStatus]} px-2 py-0.5 rounded`}
                  >
                    <Text className="text-xs font-medium">
                      {STATUS_LABELS[normalizedStatus]}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("es-ES")}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text className="text-sm font-bold text-black">
                  {formatPrice(
                    order.items?.reduce(
                      (sum, item) => sum + item.price * item.quantity,
                      0
                    ) || 0
                  )}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
