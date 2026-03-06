import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { AuthGate } from "@/components/AuthGate";
import { useQuery } from "@tanstack/react-query";
import { ActivityIndicator, View, ScrollView, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  RefreshCcw,
} from "lucide-react-native";
import { formatPrice } from "@/lib/formatPrice";
import {
  Order,
  OrderStatus,
  STATUS_LABELS,
  STATUS_BADGE_COLORS,
  normalizeStatus,
} from "@/types/order";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Fetch order by ID
 */
async function fetchOrderById(id: number): Promise<Order> {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Error fetching order");
  }
  return res.json();
}

/**
 * Status timeline configuration
 */
const STATUS_TIMELINE: { status: OrderStatus; label: string; icon: typeof Package }[] = [
  { status: "unpaid",     label: "Sin pagar",   icon: Clock },
  { status: "processing", label: "En proceso",  icon: Package },
  { status: "shipped",    label: "Enviado",     icon: Truck },
  { status: "delivered",  label: "Entregado",   icon: CheckCircle2 },
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

  const {
    data: order,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["order", id],
    queryFn: () => fetchOrderById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />

        {/* Header Skeleton */}
        <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full"
          >
            <ChevronLeft size={24} color="#374151" />
          </Pressable>
          <View className="flex-1 ml-2 h-6 bg-gray-200 rounded-lg animate-pulse" />
          <View className="w-20 h-6 bg-gray-200 rounded-full animate-pulse ml-4" />
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Timeline Skeleton */}
          <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
            <View className="h-4 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
            <View className="pl-8">
              {[1, 2, 3, 4].map((i) => (
                <View key={i} className="flex-row items-center mb-6">
                  <View className="absolute left-0 w-6 h-6 rounded-full bg-gray-200 animate-pulse" />
                  <View className="ml-4 flex-1">
                    <View className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Products Skeleton */}
          <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
            <View className="h-4 w-28 bg-gray-200 rounded mb-4 animate-pulse" />
            {[1, 2, 3].map((i) => (
              <View key={i} className="flex-row items-center py-3 border-b border-gray-100">
                <View className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse mr-3" />
                <View className="flex-1">
                  <View className="h-4 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
                  <View className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                </View>
                <View className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
              </View>
            ))}
            {/* Total Skeleton */}
            <View className="flex-row justify-between items-center pt-4 mt-2 border-t border-gray-200">
              <View className="h-5 w-12 bg-gray-200 rounded animate-pulse" />
              <View className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
            </View>
          </View>

          {/* Info Skeleton */}
          <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
            <View className="h-4 w-24 bg-gray-200 rounded mb-3 animate-pulse" />
            <View className="flex-row justify-between py-2">
              <View className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
              <View className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
            </View>
            <View className="flex-row justify-between py-2">
              <View className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
              <View className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center p-6">
          <XCircle size={48} color="#EF4444" />
          <Text className="mt-4 text-lg text-gray-700">Orden no encontrada</Text>
          <Pressable
            onPress={() => router.back()}
            className="mt-6 bg-gray-900 rounded-full px-6 py-3"
          >
            <Text className="text-white font-medium">Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const normalizedStatus = normalizeStatus(order.status);
  const currentStatusIndex = getStatusIndex(normalizedStatus);
  const isCancelled = normalizedStatus === "cancelled";

  // Calculate total
  const total = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white border-b border-gray-200">
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full active:bg-gray-100"
        >
          <ChevronLeft size={24} color="#374151" />
        </Pressable>
        <Text className="flex-1 text-lg font-semibold text-gray-900 ml-2">
          Orden #{order.id}
        </Text>
        <View className={`px-3 py-1 rounded-full ${STATUS_BADGE_COLORS[normalizedStatus]}`}>
          <Text className="text-xs font-medium">
            {STATUS_LABELS[normalizedStatus]}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Timeline Section */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
          <Text className="text-sm font-semibold text-gray-700 mb-4">
            Estado del pedido
          </Text>

          {isCancelled ? (
            <View className="flex-row items-center gap-3 p-4 bg-red-50 rounded-xl">
              <XCircle size={24} color="#EF4444" />
              <Text className="text-red-700 font-medium">Orden cancelada</Text>
            </View>
          ) : (
            <View className="relative pl-8">
              {/* Timeline line */}
              <View className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200" />

              {STATUS_TIMELINE.map((step, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const StepIcon = step.icon;

                return (
                  <View key={step.status} className="flex-row items-center mb-6 last:mb-0">
                    {/* Circle indicator */}
                    <View
                      className={`absolute left-0 w-6 h-6 rounded-full items-center justify-center z-10 ${
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <StepIcon size={14} color="white" />
                    </View>

                    {/* Label */}
                    <View className="ml-4 flex-1">
                      <Text
                        className={`font-medium ${
                          isCompleted ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </Text>
                      {isCurrent && (
                        <Text className="text-xs text-green-600 mt-1">
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
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
          <Text className="text-sm font-semibold text-gray-700 mb-4">
            Productos ({order.items.length})
          </Text>

          {order.items.map((item, index) => (
            <View
              key={item.id}
              className={`flex-row items-center py-3 ${
                index < order.items.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              <View className="w-12 h-12 bg-gray-100 rounded-lg items-center justify-center mr-3">
                <Package size={20} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-medium">
                  Producto #{item.product_id}
                </Text>
                <Text className="text-sm text-gray-500">
                  Cantidad: {item.quantity}
                </Text>
              </View>
              <Text className="font-semibold text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
          ))}

          {/* Total */}
          <View className="flex-row justify-between items-center pt-4 mt-2 border-t border-gray-200">
            <Text className="text-base font-semibold text-gray-700">Total</Text>
            <Text className="text-xl font-bold text-gray-900">
              {formatPrice(total)}
            </Text>
          </View>
        </View>

        {/* Order Info */}
        <View className="bg-white mx-4 mt-4 rounded-2xl p-4">
          <Text className="text-sm font-semibold text-gray-700 mb-3">
            Información
          </Text>
          <View className="flex-row justify-between py-2">
            <Text className="text-gray-500">Fecha</Text>
            <Text className="text-gray-900">
              {new Date(order.created_at).toLocaleDateString("es-CL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Text>
          </View>
          <View className="flex-row justify-between py-2">
            <Text className="text-gray-500">Hora</Text>
            <Text className="text-gray-900">
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
              className="bg-green-600 rounded-2xl py-4 flex-row items-center justify-center active:bg-green-700"
            >
              <RefreshCcw size={20} color="white" />
              <Text className="text-white font-semibold ml-2">
                Volver a pedir
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function OrderDetailScreen() {
  return (
    <AuthGate message="Inicia sesión para ver el detalle de tu pedido.">
      <OrderDetailScreenContent />
    </AuthGate>
  );
}
