import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { useCart } from "@/store/cartStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircleIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { resetCart } = useCart();
  const { orderId } = useLocalSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Auto-redirect to orders after 3 seconds
    const timer = setTimeout(() => {
      setIsRedirecting(true);
      resetCart();
      router.replace("/orders");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, resetCart]);

  return (
    <View className="flex-1 bg-white justify-center items-center p-6">
      <View className="bg-green-100 p-6 rounded-full mb-6">
        <CheckCircleIcon size={64} color="#16a34a" />
      </View>

      <Text className="text-3xl font-bold text-center mb-2 text-black">
        ¡Pago Exitoso!
      </Text>

      <Text className="text-gray-600 text-center mb-4 text-lg">
        Tu orden ha sido procesada correctamente.
      </Text>

      {orderId && (
        <Text className="text-sm text-gray-400 text-center mb-8">
          Orden ID: {orderId}
        </Text>
      )}

      <Text className="text-sm text-gray-500 text-center mb-6">
        Redirigiendo a tus órdenes en 3 segundos...
      </Text>

      {isRedirecting && (
        <View className="mb-6">
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}

      <VStack space="md" className="w-full">
        <Button
          size="lg"
          className="bg-blue-600"
          onPress={() => {
            setIsRedirecting(true);
            resetCart();
            router.replace("/orders");
          }}
          disabled={isRedirecting}
        >
          <ButtonText className="text-white font-bold">
            {isRedirecting ? "Redirigiendo..." : "Ir a mis órdenes"}
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
          disabled={isRedirecting}
        >
          <ButtonText className="text-gray-700 font-bold">
            Volver al inicio
          </ButtonText>
        </Button>
      </VStack>
    </View>
  );
}
