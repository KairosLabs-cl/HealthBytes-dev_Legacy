import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { useCart } from "@/store/cartStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ClockIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function PaymentPendingScreen() {
  const router = useRouter();
  const { resetCart } = useCart();
  const { orderId } = useLocalSearchParams();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Auto-check status after 5 seconds
    const timer = setTimeout(() => {
      checkPaymentStatus();
    }, 5000);

    return () => clearTimeout(timer);
  }, [orderId]);

  const checkPaymentStatus = async () => {
    setIsChecking(true);
    try {
      // In a real app, call the backend to check payment status
      // For now, we'll just redirect to orders
      setTimeout(() => {
        router.replace("/orders");
      }, 1500);
    } catch (error) {
      console.error("Error checking payment status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View className="flex-1 bg-white justify-center items-center p-6">
      <View className="bg-yellow-100 p-6 rounded-full mb-6">
        <ClockIcon size={64} color="#eab308" />
      </View>

      <Text className="text-3xl font-bold text-center mb-2 text-black">
        Pago Pendiente
      </Text>

      <Text className="text-gray-600 text-center mb-4 text-lg">
        Tu pago aún está siendo procesado.
      </Text>

      {orderId && (
        <Text className="text-sm text-gray-400 text-center mb-6">
          Orden ID: {orderId}
        </Text>
      )}

      <View className="mb-8">
        <ActivityIndicator size="large" color="#000" />
      </View>

      <Text className="text-sm text-gray-600 text-center mb-8">
        Por favor, no cierres esta pantalla. Verificaremos el estado de tu pago
        en unos momentos.
      </Text>

      <VStack space="md" className="w-full">
        <Button
          size="lg"
          className="bg-blue-600"
          onPress={checkPaymentStatus}
          disabled={isChecking}
        >
          <ButtonText className="text-white font-bold">
            {isChecking ? "Verificando..." : "Verificar estado"}
          </ButtonText>
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="border-gray-300"
          onPress={() => {
            resetCart();
            router.replace("/orders");
          }}
        >
          <ButtonText className="text-gray-700 font-bold">
            Ir a mis órdenes
          </ButtonText>
        </Button>
      </VStack>
    </View>
  );
}
