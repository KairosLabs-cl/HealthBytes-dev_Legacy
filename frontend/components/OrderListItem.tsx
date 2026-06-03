import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { formatPrice } from "@/lib/formatPrice";
import { Order, STATUS_LABELS, normalizeStatus } from "@/types/order";
import { ChevronRight } from "lucide-react-native";
import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";

interface OrderListItemProps {
  order: Order;
  onPress: (orderId: string | number) => void;
}

export function OrderListItem({ order, onPress }: OrderListItemProps) {
  const orderId = String(order.id);
  const normalizedStatus = normalizeStatus(order.status as unknown as string);
  const statusLabel = STATUS_LABELS[normalizedStatus];
  const { palette } = useAppTheme();
  const statusMap: Record<string, string> = {
    unpaid: palette.colors.state.warning,
    processing: palette.colors.state.info,
    shipped: palette.colors.icon.accent,
    delivered: palette.colors.state.success,
    returns: palette.colors.state.warning,
    cancelled: palette.colors.state.error,
  };
  const statusColor = statusMap[normalizedStatus] || palette.colors.ink.muted;

  const formattedDate = useMemo(() => {
    const date = new Date(order.created_at);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [order.created_at]);

  const totalItems = useMemo(() => {
    return order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }, [order.items]);

  const totalPrice = useMemo(() => {
    return (
      order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
      0
    );
  }, [order.items]);

  return (
    <Pressable
      onPress={() => onPress(order.id)}
      accessibilityRole="button"
      accessibilityLabel={`Ver orden ${orderId}, ${statusLabel}, ${totalItems} producto${totalItems !== 1 ? "s" : ""}, total ${formatPrice(totalPrice)}`}
      accessibilityHint="Abre el detalle de la orden"
    >
      <View
        className="mb-3 flex-row items-center justify-between rounded-[24px] border p-4"
        style={{
          backgroundColor: palette.colors.surface.card,
          borderColor: palette.colors.border.subtle,
        }}
      >
        <View className="flex-1">
          {/* Order ID and Date */}
          <View className="flex-row items-center justify-between mb-2">
            <Text
              className="font-black"
              style={{ color: palette.colors.ink.primary }}
            >
              Orden #{orderId}
            </Text>
            <Text
              className="text-xs"
              style={{ color: palette.colors.ink.subtle }}
            >
              {formattedDate}
            </Text>
          </View>

          {/* Status Badge */}
          <View
            className="mb-2 self-start rounded-2xl border px-3 py-1"
            style={{
              backgroundColor: `${statusColor}1F`,
              borderColor: `${statusColor}66`,
            }}
          >
            <Text className="text-xs font-bold" style={{ color: statusColor }}>
              {statusLabel}
            </Text>
          </View>

          {/* Items and Total */}
          <View className="flex-row items-center justify-between">
            <Text
              className="text-sm"
              style={{ color: palette.colors.ink.muted }}
            >
              {totalItems} producto{totalItems !== 1 ? "s" : ""}
            </Text>
            <Text
              className="font-black"
              style={{ color: palette.colors.ink.primary }}
            >
              {formatPrice(totalPrice)}
            </Text>
          </View>
        </View>

        {/* Chevron */}
        <Icon
          as={ChevronRight}
          size="md"
          className="ml-3"
          style={{ color: palette.colors.icon.muted }}
        />
      </View>
    </Pressable>
  );
}
