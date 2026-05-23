import { AuthGate } from "@/components/AuthGate";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { useCart } from "@/store/cartStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircleIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function PaymentSuccessScreen() {
  const router = useRouter();
  // ⚡ Bolt: Use granular selectors for Zustand stores to prevent unnecessary full-screen re-renders
  const resetCart = useCart((state) => state.resetCart);
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
    <AuthGate message="Inicia sesion para ver el resultado de tu pago.">
      <View className="flex-1 items-center justify-center bg-[#fafafa] p-6">
        <View className="mb-6 rounded-[28px] bg-emerald-50 p-6">
          <CheckCircleIcon size={64} color="#16a34a" />
        </View>

        <Text className="mb-2 text-center text-3xl font-black tracking-[-0.5px] text-[#09090b]">
          Pago exitoso
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
          <View className="mb-6 flex-row gap-2">
            <View className="h-3 w-3 rounded-full bg-[#22c55e]" />
            <View className="h-3 w-3 rounded-full bg-slate-300" />
            <View className="h-3 w-3 rounded-full bg-slate-400" />
          </View>
        )}

        <VStack space="md" className="w-full">
          <Button
            size="lg"
            className="rounded-2xl bg-[#09090b]"
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
            className="rounded-2xl border-gray-300"
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
    </AuthGate>
  );
}
