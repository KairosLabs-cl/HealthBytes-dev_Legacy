import { AuthGate } from "@/components/AuthGate";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { useCart } from "@/store/cartStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircleIcon } from "lucide-react-native";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function PaymentFailureScreen() {
  const router = useRouter();
  // ⚡ Bolt: Use granular selectors for Zustand stores to prevent unnecessary full-screen re-renders
  const resetCart = useCart((state) => state.resetCart);
  const { orderId } = useLocalSearchParams();

  useEffect(() => {
    // Clear cart after some time
    const timer = setTimeout(() => {
      resetCart();
    }, 5000);

    return () => clearTimeout(timer);
  }, [resetCart]);

  return (
    <AuthGate message="Inicia sesion para ver el resultado de tu pago.">
    <View className="flex-1 bg-white justify-center items-center p-6">
      <View className="bg-red-100 p-6 rounded-full mb-6">
        <AlertCircleIcon size={64} color="#dc2626" />
      </View>

      <Text className="text-3xl font-bold text-center mb-2 text-black">
        Pago Rechazado
      </Text>

      <Text className="text-gray-600 text-center mb-4 text-lg">
        Lo sentimos, tu pago no pudo procesarse.
      </Text>

      {orderId && (
        <Text className="text-sm text-gray-400 text-center mb-6">
          Orden ID: {orderId}
        </Text>
      )}

      <Text className="text-sm text-gray-600 text-center mb-8">
        Por favor, intenta con otro método de pago o verifica tu información.
      </Text>

      <VStack space="md" className="w-full">
        <Button
          size="lg"
          className="bg-orange-600"
          onPress={() => {
            router.replace("/checkout-v2");
          }}
        >
          <ButtonText className="text-white font-bold">
            Intentar de nuevo
          </ButtonText>
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="border-gray-300"
          onPress={() => {
            resetCart();
            router.replace("/");
          }}
        >
          <ButtonText className="text-gray-700 font-bold">
            Volver al inicio
          </ButtonText>
        </Button>
      </VStack>
    </View>
    </AuthGate>
  );
}
