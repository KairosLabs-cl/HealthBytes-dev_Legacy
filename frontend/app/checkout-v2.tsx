import { createMercadoPagoPreference } from "@/api/mercadopago";
import { createOrder } from "@/api/orders";
import {
  PaymentMethod,
  PaymentMethodSelector,
} from "@/components/PaymentMethodSelector";
import { StepIndicator } from "@/components/StepIndicator";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { formatPrice } from "@/lib/formatPrice";
import { useAddress } from "@/store/addressStore";
import { useCart } from "@/store/cartStore";
import { Address } from "@/types/address";
import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import { MapPinIcon, PhoneIcon } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CheckoutStep = "address" | "payment" | "summary";

export default function CheckoutV2Screen() {
  const router = useRouter();
  const { items, resetCart } = useCart();
  const { addresses, defaultAddress, fetchAddresses } = useAddress();
  const { isSignedIn, getToken } = useAuth();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    defaultAddress || null
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const token = await getToken();
        if (token) {
          await fetchAddresses(token);
        }
      } catch (error) {
        if (__DEV__) {
          console.error("Error cargando direcciones:", error);
        }
      }
    };
    loadAddresses();
  }, [getToken, fetchAddresses]);

  const subtotal = useMemo(
    () =>
      items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [items]
  );

  const shipping = 0;
  const total = subtotal + shipping;

  const handleNext = async () => {
    if (currentStep === "address" && !selectedAddress) {
      Alert.alert(
        "Dirección requerida",
        "Por favor selecciona una dirección de envío"
      );
      return;
    }

    if (currentStep === "payment" && !selectedPayment) {
      Alert.alert(
        "Método de pago requerido",
        "Por favor selecciona un método de pago"
      );
      return;
    }

    if (currentStep === "address") {
      setCurrentStep("payment");
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else if (currentStep === "payment") {
      setCurrentStep("summary");
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else if (currentStep === "summary") {
      if (!isSignedIn) {
        Alert.alert(
          "Sesión requerida",
          "Necesitas iniciar sesión para realizar una compra."
        );
        router.push("/(auth)/login");
        return;
      }

      let token = await getToken();

      if (!token) {
        // Retry token retrieval - Clerk may need to re-authenticate
        token = await getToken();
      }

      if (!token) {
        Alert.alert(
          "Sesión expirada",
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
        );
        router.push("/(auth)/login");
        return;
      }

      setIsProcessing(true);

      try {
        if (__DEV__) console.log("📋 Creando orden...");
        const orderResponse = await createOrder(
          items.map((item) => ({
            productId: Number(item.product.id),
            quantity: item.quantity,
            price: item.product.price,
          })),
          selectedAddress!.id,
          selectedPayment ?? undefined,
          () => Promise.resolve(token)
        );

        const orderId = orderResponse.id;
        if (__DEV__) console.log("✅ Orden creada:", orderId);

        if (__DEV__) console.log("💳 Creando preference de Mercado Pago...");
        const preference = await createMercadoPagoPreference(
          {
            order_id: orderId,
            description: `HealthBytes Order #${orderId}`,
            payer_email: undefined,
          },
          getToken
        );

        if (__DEV__)
          console.log("✅ Preference creada:", preference.preference_id);

        const checkoutUrl =
          preference.sandbox_init_point || preference.init_point;
        if (__DEV__) console.log("🔗 Redirigiendo a:", checkoutUrl);

        const canOpen = await Linking.canOpenURL(checkoutUrl);
        if (canOpen) {
          await Linking.openURL(checkoutUrl);
        } else {
          Alert.alert(
            "Error",
            "No se pudo redirigir a Mercado Pago. Por favor, intenta nuevamente."
          );
          setIsProcessing(false);
          return;
        }

        // Cart is reset by payment/success.tsx and payment/failure.tsx on confirmed outcome.
        // Do NOT reset here — if user cancels MP, they would lose their cart.
        router.replace({
          pathname: "/payment/pending",
          params: {
            orderId: String(orderId),
            paymentId: String(preference.payment_id),
            checkoutUrl,
          },
        });
      } catch (error) {
        if (__DEV__) console.error("❌ Error durante checkout:", error);
        setIsProcessing(false);
        Alert.alert(
          "Error",
          error instanceof Error
            ? error.message
            : "Hubo un error al procesar tu orden. Intenta nuevamente."
        );
      }
    }
  };

  const handleBack = () => {
    if (currentStep === "payment") {
      setCurrentStep("address");
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else if (currentStep === "summary") {
      setCurrentStep("payment");
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        className="flex-1 p-6"
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-black mb-2">Checkout</Text>
          <Text className="text-gray-500">
            Paso a paso hacia tu compra segura
          </Text>
        </View>

        {/* Step Indicator */}
        <StepIndicator
          currentStep={
            currentStep === "address" ? 1 : currentStep === "payment" ? 2 : 3
          }
          totalSteps={3}
          steps={["Dirección", "Pago", "Resumen"]}
        />

        {/* Content */}
        <View className="mb-8">
          {/* Step 1: Address Selection */}
          {currentStep === "address" && (
            <VStack space="lg">
              <View>
                <HStack className="items-center mb-3">
                  <MapPinIcon size={24} color="#000" />
                  <Text className="text-xl font-bold text-black ml-2">
                    ¿A dónde lo llevamos?
                  </Text>
                </HStack>
                <Text className="text-gray-500 text-sm">
                  Selecciona una dirección o añade una nueva
                </Text>
              </View>

              {addresses.length > 0 ? (
                <VStack space="md">
                  {addresses.map((address) => (
                    <Pressable
                      key={address.id}
                      onPress={() => setSelectedAddress(address)}
                      className={`p-4 rounded-2xl border-2 ${
                        selectedAddress?.id === address.id
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <HStack className="items-start justify-between">
                        <View className="flex-1">
                          <Text className="font-bold text-black mb-1">
                            {address.street}
                          </Text>
                          <Text className="text-sm text-gray-600 mb-1">
                            {address.city}, {address.region}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            CP: {address.postal_code}
                          </Text>
                          {address.street_number && (
                            <Text className="text-xs text-gray-500 mt-1">
                              {address.street_number}
                            </Text>
                          )}
                        </View>

                        {/* Checkbox */}
                        <View
                          className={`w-6 h-6 rounded-full border-2 items-center justify-center ml-3 ${
                            selectedAddress?.id === address.id
                              ? "border-blue-600 bg-blue-600"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedAddress?.id === address.id && (
                            <View className="w-3 h-3 rounded-full bg-white" />
                          )}
                        </View>
                      </HStack>
                    </Pressable>
                  ))}
                </VStack>
              ) : (
                <View className="p-6 bg-gray-50 rounded-2xl items-center">
                  <Text className="text-gray-600 text-center mb-4">
                    No tienes direcciones guardadas aún
                  </Text>
                  <Button
                    size="sm"
                    className="bg-blue-600"
                    onPress={() => router.push("/addresses")}
                  >
                    <ButtonText>+ Añadir Dirección</ButtonText>
                  </Button>
                </View>
              )}

              {addresses.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="border-blue-600"
                  onPress={() => router.push("/addresses")}
                >
                  <ButtonText className="text-blue-600">
                    + Añadir otra dirección
                  </ButtonText>
                </Button>
              )}
            </VStack>
          )}

          {/* Step 2: Payment Method */}
          {currentStep === "payment" && (
            <View>
              <PaymentMethodSelector
                selected={selectedPayment}
                onSelect={setSelectedPayment}
              />
            </View>
          )}

          {/* Step 3: Order Summary */}
          {currentStep === "summary" && (
            <VStack space="lg">
              {/* Address Summary */}
              {selectedAddress && (
                <View className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <HStack className="items-start">
                    <MapPinIcon size={20} color="#0066cc" />
                    <View className="flex-1 ml-3">
                      <Text className="font-bold text-black text-sm mb-1">
                        Dirección de Envío
                      </Text>
                      <Text className="text-sm text-gray-700">
                        {selectedAddress.street}
                      </Text>
                      <Text className="text-sm text-gray-700">
                        {selectedAddress.city}, {selectedAddress.region}{" "}
                        {selectedAddress.postal_code}
                      </Text>
                      {selectedAddress.phone && (
                        <HStack className="items-center mt-2">
                          <PhoneIcon size={14} color="#666" />
                          <Text className="text-xs text-gray-600 ml-1">
                            {selectedAddress.phone}
                          </Text>
                        </HStack>
                      )}
                    </View>
                  </HStack>
                </View>
              )}

              {/* Payment Method Summary */}
              <View className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
                <Text className="font-bold text-black text-sm mb-2">
                  Método de Pago
                </Text>
                <Text className="text-sm text-gray-700">
                  {selectedPayment === "venti"
                    ? "💳 Venti - Transferencia Bancaria"
                    : "🏦 Mercado Pago - Billetera Digital"}
                </Text>
              </View>

              {/* Items List */}
              <View>
                <Text className="font-bold text-black mb-3">Productos</Text>
                <VStack space="md">
                  {items.map((item) => (
                    <View
                      key={item.product.id}
                      className="flex-row justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <View className="flex-1">
                        <Text className="font-semibold text-black text-sm">
                          {item.product.name}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          x{item.quantity} @ {formatPrice(item.product.price)}
                        </Text>
                      </View>
                      <Text className="font-bold text-black">
                        {formatPrice(item.product.price * item.quantity)}
                      </Text>
                    </View>
                  ))}
                </VStack>
              </View>

              {/* Pricing Summary */}
              <View className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <HStack className="justify-between mb-2">
                  <Text className="text-gray-600">Subtotal</Text>
                  <Text className="font-medium text-black">
                    {formatPrice(subtotal)}
                  </Text>
                </HStack>

                <HStack className="justify-between mb-3">
                  <Text className="text-gray-600">Envío</Text>
                  <Text className="font-medium text-green-600">Gratis</Text>
                </HStack>

                <View className="h-[1px] bg-gray-200 my-3" />

                <HStack className="justify-between items-end">
                  <Text className="text-lg font-bold text-black">Total</Text>
                  <Text className="text-2xl font-bold text-blue-600">
                    {formatPrice(total)}
                  </Text>
                </HStack>
              </View>
            </VStack>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View className="p-6 bg-white border-t border-gray-100">
        <VStack space="md">
          {(currentStep === "payment" || currentStep === "summary") && (
            <Button
              size="lg"
              variant="outline"
              className="border-gray-300"
              onPress={handleBack}
              disabled={isProcessing}
            >
              <ButtonText className="text-gray-700 font-semibold">
                Atrás
              </ButtonText>
            </Button>
          )}

          <Button
            size="lg"
            className="bg-black h-16 rounded-full shadow-xl"
            onPress={handleNext}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <HStack space="md" className="items-center">
                <ActivityIndicator color="white" />
                <ButtonText className="text-white font-semibold text-lg">
                  {currentStep === "summary"
                    ? "Confirmando..."
                    : "Procesando..."}
                </ButtonText>
              </HStack>
            ) : (
              <ButtonText className="text-white font-bold text-lg">
                {currentStep === "address"
                  ? "Continuar"
                  : currentStep === "payment"
                    ? "Revisar Orden"
                    : "Confirmar Orden"}
              </ButtonText>
            )}
          </Button>
        </VStack>
      </View>
    </SafeAreaView>
  );
}
