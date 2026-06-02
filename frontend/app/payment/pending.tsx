import { getOrderById } from "@/api/orders";
import { AuthGate } from "@/components/AuthGate";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuth } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ClockIcon } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, Text, View } from "react-native";

const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 12;

export default function PaymentPendingScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { getToken } = useAuth();
  const { orderId, checkoutUrl } = useLocalSearchParams<{
    orderId: string;
    checkoutUrl?: string;
  }>();
  const [isChecking, setIsChecking] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [maxRetriesReached, setMaxRetriesReached] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkOrderStatus = useCallback(async () => {
    if (!orderId) return;

    setIsChecking(true);
    try {
      const token = await getToken();
      if (!token) return;

      const order = await getOrderById(String(orderId), token);

      if (order.status === "processing") {
        router.replace({
          pathname: "/payment/success",
          params: { orderId: String(orderId) },
        });
        return;
      }

      if (order.status === "cancelled") {
        router.replace({
          pathname: "/payment/failure",
          params: { orderId: String(orderId) },
        });
        return;
      }
    } catch {
      // Keep polling until the payment provider reports a final state.
    } finally {
      setIsChecking(false);
    }
  }, [orderId, getToken, router]);

  useEffect(() => {
    if (maxRetriesReached) return;

    timerRef.current = setInterval(() => {
      setPollCount((prev) => {
        const next = prev + 1;
        if (next >= MAX_POLLS) {
          if (timerRef.current) clearInterval(timerRef.current);
          setMaxRetriesReached(true);
          return next;
        }
        checkOrderStatus();
        return next;
      });
    }, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [checkOrderStatus, maxRetriesReached]);

  return (
    <AuthGate message="Inicia sesion para ver el estado de tu pago.">
      <View className="flex-1 items-center justify-center bg-surface-warm p-6">
        <View
          className="mb-6 rounded-[28px] border bg-surface-card p-6"
          style={{ borderColor: palette.colors.state.warning }}
        >
          <ClockIcon size={64} color={palette.colors.state.warning} />
        </View>

        <Text className="mb-2 text-center text-3xl font-black tracking-[-0.5px] text-ink">
          Pago pendiente
        </Text>

        <Text className="text-ink-muted text-center mb-4 text-lg">
          Tu pago aun esta siendo procesado.
        </Text>

        {orderId && (
          <Text className="text-sm text-ink-subtle text-center mb-6">
            Orden ID: {orderId}
          </Text>
        )}

        {!maxRetriesReached ? (
          <>
            <View className="mb-8">
              <View className="flex-row gap-2">
                <View className="h-3 w-3 rounded-full bg-state-success" />
                <View className="h-3 w-3 rounded-full bg-border-default" />
                <View className="h-3 w-3 rounded-full bg-ink-subtle" />
              </View>
            </View>
            <Text className="text-sm text-ink-muted text-center mb-8">
              Verificando estado del pago... ({pollCount}/{MAX_POLLS})
            </Text>
          </>
        ) : (
          <Text
            className="text-sm text-center mb-8"
            style={{ color: palette.colors.state.warning }}
          >
            No pudimos confirmar tu pago automaticamente. Puedes verificar el
            estado en tus ordenes o intentar nuevamente.
          </Text>
        )}

        <VStack space="md" className="w-full">
          {checkoutUrl && (
            <Button
              size="lg"
              className="rounded-2xl bg-ink"
              onPress={() => Linking.openURL(checkoutUrl)}
            >
              <ButtonText className="text-ink-inverse font-bold">
                Abrir Mercado Pago
              </ButtonText>
            </Button>
          )}

          <Button
            size="lg"
            className="rounded-2xl bg-ink"
            onPress={checkOrderStatus}
            disabled={isChecking}
          >
            <ButtonText className="text-ink-inverse font-bold">
              {isChecking ? "Verificando..." : "Verificar estado"}
            </ButtonText>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="rounded-2xl border-border-default"
            onPress={() => router.replace("/orders")}
          >
            <ButtonText className="text-ink font-bold">
              Ir a mis ordenes
            </ButtonText>
          </Button>
        </VStack>
      </View>
    </AuthGate>
  );
}
