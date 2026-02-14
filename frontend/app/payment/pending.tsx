import { getMercadoPagoPaymentStatus } from "@/api/mercadopago";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { useCart } from "@/store/cartStore";
import { useAuth } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ClockIcon } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

const POLL_INTERVAL_MS = 5000;
const MAX_POLLS = 10;

export default function PaymentPendingScreen() {
  const router = useRouter();
  const { resetCart } = useCart();
  const { getToken } = useAuth();
  const { orderId, paymentId } = useLocalSearchParams();
  const [isChecking, setIsChecking] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [maxRetriesReached, setMaxRetriesReached] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkPaymentStatus = useCallback(async () => {
    if (!paymentId && !orderId) return;

    setIsChecking(true);
    try {
      const id = String(paymentId || orderId);
      const status = await getMercadoPagoPaymentStatus(id, getToken);

      if (status.status === "approved") {
        resetCart();
        router.replace({
          pathname: "/payment/success",
          params: { orderId: String(orderId) },
        });
        return;
      }

      if (status.status === "rejected" || status.status === "cancelled") {
        router.replace({
          pathname: "/payment/failure",
          params: { orderId: String(orderId) },
        });
        return;
      }
    } catch (error) {
      if (__DEV__) {
        console.error("Error checking payment status:", error);
      }
    } finally {
      setIsChecking(false);
    }
  }, [paymentId, orderId, getToken, resetCart, router]);

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
        checkPaymentStatus();
        return next;
      });
    }, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [checkPaymentStatus, maxRetriesReached]);

  return (
    <View className="flex-1 bg-white justify-center items-center p-6">
      <View className="bg-yellow-100 p-6 rounded-full mb-6">
        <ClockIcon size={64} color="#eab308" />
      </View>

      <Text className="text-3xl font-bold text-center mb-2 text-black">
        Pago Pendiente
      </Text>

      <Text className="text-gray-600 text-center mb-4 text-lg">
        Tu pago aun esta siendo procesado.
      </Text>

      {orderId && (
        <Text className="text-sm text-gray-400 text-center mb-6">
          Orden ID: {orderId}
        </Text>
      )}

      {!maxRetriesReached ? (
        <>
          <View className="mb-8">
            <ActivityIndicator size="large" color="#000" />
          </View>
          <Text className="text-sm text-gray-600 text-center mb-8">
            Verificando estado del pago... ({pollCount}/{MAX_POLLS})
          </Text>
        </>
      ) : (
        <Text className="text-sm text-orange-600 text-center mb-8">
          No pudimos confirmar tu pago automaticamente. Puedes verificar el
          estado en tus ordenes o intentar nuevamente.
        </Text>
      )}

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
            Ir a mis ordenes
          </ButtonText>
        </Button>
      </VStack>
    </View>
  );
}
