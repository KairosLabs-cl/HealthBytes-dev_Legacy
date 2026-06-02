import { AuthGate } from "@/components/AuthGate";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useCart } from "@/store/cartStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircleIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
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
      <View className="flex-1 items-center justify-center bg-surface-warm p-6">
        <View className="mb-6 rounded-[28px] bg-accent-light p-6">
          <CheckCircleIcon size={64} color={palette.colors.state.success} />
        </View>

        <Text className="mb-2 text-center text-3xl font-black tracking-[-0.5px] text-ink">
          Pago exitoso
        </Text>

        <Text className="text-ink-muted text-center mb-4 text-lg">
          Tu orden ha sido procesada correctamente.
        </Text>

        {orderId && (
          <Text className="text-sm text-ink-subtle text-center mb-8">
            Orden ID: {orderId}
          </Text>
        )}

        <Text className="text-sm text-ink-muted text-center mb-6">
          Redirigiendo a tus órdenes en 3 segundos...
        </Text>

        {isRedirecting && (
          <View className="mb-6 flex-row gap-2">
            <View className="h-3 w-3 rounded-full bg-state-success" />
            <View className="h-3 w-3 rounded-full bg-border-default" />
            <View className="h-3 w-3 rounded-full bg-ink-subtle" />
          </View>
        )}

        <VStack space="md" className="w-full">
          <Button
            size="lg"
            className="rounded-2xl bg-ink"
            onPress={() => {
              setIsRedirecting(true);
              resetCart();
              router.replace("/orders");
            }}
            disabled={isRedirecting}
          >
            <ButtonText className="text-ink-inverse font-bold">
              {isRedirecting ? "Redirigiendo..." : "Ir a mis órdenes"}
            </ButtonText>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="rounded-2xl border-border-default"
            onPress={() => {
              resetCart();
              router.replace("/");
            }}
            disabled={isRedirecting}
          >
            <ButtonText className="text-ink font-bold">
              Volver al inicio
            </ButtonText>
          </Button>
        </VStack>
      </View>
    </AuthGate>
  );
}
