import { View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";

const STATUS_LABELS: Record<string, string> = {
  packed: "Empacado",
  in_transit: "En tránsito",
  delivered: "Entregado",
};

export default function OrdersScreen() {
  const router = useRouter();
  const { status } = useLocalSearchParams<{ status?: string }>();
  const statusLabel = status ? STATUS_LABELS[status] : undefined;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ title: "Mis órdenes" }} />

      <View className="flex-1 px-6 pt-6">
        <Text className="text-2xl font-bold text-black mb-2">Mis órdenes</Text>
        <Text className="text-gray-600 mb-6">
          {statusLabel
            ? `No hay órdenes en estado ${statusLabel}.`
            : "Todavía no tienes órdenes."}
        </Text>

        <View className="bg-gray-100 rounded-2xl p-4 mb-6">
          <Text className="text-gray-700">
            Próximamente: historial de compras, tracking y facturas.
          </Text>
        </View>

        <Button onPress={() => router.back()} className="bg-black rounded-full">
          <ButtonText className="text-white">Volver</ButtonText>
        </Button>
      </View>
    </SafeAreaView>
  );
}
