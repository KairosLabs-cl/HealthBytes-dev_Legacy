import { AuthGate } from "@/components/AuthGate";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useCart } from "@/store/cartStore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AlertCircleIcon } from "lucide-react-native";
import { useEffect } from "react";
import { Text, View } from "react-native";

export default function PaymentFailureScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
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
      <View className="flex-1 items-center justify-center bg-surface-warm p-6">
        <View
          className="mb-6 rounded-[28px] border bg-surface-card p-6"
          style={{ borderColor: palette.colors.state.error }}
        >
          <AlertCircleIcon size={64} color={palette.colors.state.error} />
        </View>

        <Text className="mb-2 text-center text-3xl font-black tracking-[-0.5px] text-ink">
          Pago rechazado
        </Text>

        <Text className="text-ink-muted text-center mb-4 text-lg">
          Lo sentimos, tu pago no pudo procesarse.
        </Text>

        {orderId && (
          <Text className="text-sm text-ink-subtle text-center mb-6">
            Orden ID: {orderId}
          </Text>
        )}

        <Text className="text-sm text-ink-muted text-center mb-8">
          Por favor, intenta con otro método de pago o verifica tu información.
        </Text>

        <VStack space="md" className="w-full">
          <Button
            size="lg"
            className="rounded-2xl bg-ink"
            onPress={() => {
              router.replace("/checkout-v2");
            }}
          >
            <ButtonText className="text-ink-inverse font-bold">
              Intentar de nuevo
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
