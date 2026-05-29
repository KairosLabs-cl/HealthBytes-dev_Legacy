import { createMercadoPagoPreference } from "@/api/mercadopago";
import { createOrder } from "@/api/orders";
import {
  PaymentMethod,
  PaymentMethodSelector,
} from "@/components/PaymentMethodSelector";
import { StepIndicator } from "@/components/StepIndicator";
import { Button, ButtonText } from "@/components/ui/button";
import { LoadingDots } from "@/components/ui/LoadingDots";
import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { formatPrice } from "@/lib/formatPrice";
import { useAddress } from "@/store/addressStore";
import { useCart, selectCartSubtotal } from "@/store/cartStore";
import { Address } from "@/types/address";
import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import { MapPinIcon, PhoneIcon } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { StatusBar } from "expo-status-bar";
import Animated from "react-native-reanimated";
import {
  View,
  ScrollView,
  Pressable,
  Linking,
  Text,
} from "react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { CreditCard } from "lucide-react-native";
import { AuthGate } from "@/components/AuthGate";

type CheckoutStep = "address" | "payment" | "summary";

export default function CheckoutV2Screen() {
  const router = useRouter();

  // Use specific selectors to prevent unnecessary re-renders when other store state changes
  const items = useCart((state) => state.items);
  const subtotal = useCart(selectCartSubtotal);

  const addresses = useAddress((state) => state.addresses);
  const defaultAddress = useAddress((state) => state.defaultAddress);
  const fetchAddresses = useAddress((state) => state.fetchAddresses);
  const { isSignedIn, getToken } = useAuth();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(
    defaultAddress || null
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const token = await getToken();
        if (token) {
          await fetchAddresses(token);
        }
      } catch {
        // Address list failure is surfaced by the address store.
      }
    };
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shipping = 0;
  const total = subtotal + shipping;

  const handleNext = async () => {
    if (currentStep === "address" && !selectedAddress) {
      setFormError("Selecciona una dirección de envío para continuar.");
      return;
    }

    if (currentStep === "payment" && !selectedPayment) {
      setFormError("Selecciona un método de pago para continuar.");
      return;
    }

    setFormError(null);

    if (currentStep === "address") {
      setCurrentStep("payment");
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else if (currentStep === "payment") {
      setCurrentStep("summary");
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else if (currentStep === "summary") {
      // Safety net: hard auth check before payment processing
      if (!isSignedIn) {
        setFormError("Debes iniciar sesión antes de confirmar tu compra.");
        return;
      }

      let token = await getToken();

      if (!token) {
        // Retry token retrieval - Clerk may need to re-authenticate
        token = await getToken();
      }

      if (!token) {
        setFormError("Tu sesión expiró. Inicia sesión nuevamente.");
        router.push("/(auth)/login");
        return;
      }

      setIsProcessing(true);

      try {
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

        const preference = await createMercadoPagoPreference(
          {
            order_id: Number(orderId),
            description: `HealthBytes Order #${orderId}`,
            payer_email: undefined,
          },
          getToken
        );

        const checkoutUrl = __DEV__
          ? preference.sandbox_init_point || preference.init_point
          : preference.init_point;

        const canOpen = await Linking.canOpenURL(checkoutUrl);
        if (canOpen) {
          await Linking.openURL(checkoutUrl);
        } else {
          setFormError(
            "No se pudo redirigir a Mercado Pago. Intenta nuevamente."
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
        setIsProcessing(false);
        setFormError(
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
    <AuthGate message="Inicia sesion para completar tu compra.">
      <View className="flex-1 bg-[#fafafa]">
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Checkout"
          icon={CreditCard}
          showBackButton={true}
        />

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ padding: 24, paddingBottom: 32 }}
        >
          {/* Step Indicator */}
          <StepIndicator
            currentStep={
              currentStep === "address" ? 1 : currentStep === "payment" ? 2 : 3
            }
            totalSteps={3}
            steps={["Dirección", "Pago", "Resumen"]}
          />

          {formError && (
            <View
              className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
              accessibilityRole="alert"
            >
              <Text className="text-sm font-semibold leading-5 text-red-700">
                {formError}
              </Text>
            </View>
          )}

          {/* Content */}
          <View className="mb-8">
            {/* Step 1: Address Selection */}
            <View style={{ display: currentStep === "address" ? "flex" : "none" }}>
              <VStack space="lg">
                <View>
                  <HStack className="items-center mb-3">
                    <MapPinIcon size={24} color="#2D2926" />
                    <Text className="ml-2 text-xl font-black tracking-[-0.2px] text-[#09090b]">
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
                        className="rounded-[24px] border p-4"
                        style={{
                          minHeight: 64,
                          backgroundColor:
                            selectedAddress?.id === address.id
                              ? "#f0fdf4"
                              : "#ffffff",
                          borderColor:
                            selectedAddress?.id === address.id
                              ? "#22c55e"
                              : "rgba(226,232,240,0.9)",
                        }}
                        accessibilityLabel={`Dirección: ${address.street}, ${address.city}`}
                        accessibilityHint="Selecciona esta dirección para el envío"
                        accessibilityRole="radio"
                        accessibilityState={{
                          checked: selectedAddress?.id === address.id,
                        }}
                      >
                        <HStack className="items-start justify-between">
                          <View className="flex-1">
                            <Text className="font-bold text-ink mb-1">
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

                          <View
                            className={`ml-3 h-7 w-7 items-center justify-center rounded-xl border ${
                              selectedAddress?.id === address.id
                                ? "border-[#22c55e] bg-[#22c55e]"
                                : "border-border-subtle"
                            }`}
                          >
                            {selectedAddress?.id === address.id && (
                              <View className="h-3 w-3 rounded bg-white" />
                            )}
                          </View>
                        </HStack>
                      </Pressable>
                    ))}
                  </VStack>
                ) : (
                  <View className="items-center rounded-[24px] border border-slate-200/70 bg-white p-6">
                    <Text className="text-gray-600 text-center mb-4">
                      No tienes direcciones guardadas aún
                    </Text>
                    <Button
                      size="sm"
                      className="bg-[#09090b]"
                      style={{ minHeight: 48 }}
                      onPress={() => router.push("/addresses")}
                      accessibilityLabel="Agregar nueva dirección"
                      accessibilityRole="button"
                    >
                      <ButtonText>Añadir Dirección</ButtonText>
                    </Button>
                  </View>
                )}

                {addresses.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-slate-300"
                    style={{ minHeight: 48 }}
                    onPress={() => router.push("/addresses")}
                    accessibilityLabel="Agregar nueva dirección"
                    accessibilityRole="button"
                  >
                    <ButtonText className="text-[#09090b]">
                      Añadir otra dirección
                    </ButtonText>
                  </Button>
                )}
              </VStack>
            </View>

            {/* Step 2: Payment Method */}
            <View style={{ display: currentStep === "payment" ? "flex" : "none" }}>
                <PaymentMethodSelector
                  selected={selectedPayment}
                  onSelect={setSelectedPayment}
                />
            </View>

            {/* Step 3: Order Summary */}
            <View style={{ display: currentStep === "summary" ? "flex" : "none" }}>
                <VStack space="lg">
                {/* Address Summary */}
                {selectedAddress && (
                  <View className="rounded-[24px] border border-slate-200/70 bg-white p-4">
                    <HStack className="items-start">
                      <MapPinIcon size={20} color="#2D2926" />
                      <View className="flex-1 ml-3">
                        <Text className="font-bold text-ink text-sm mb-1">
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
                <View className="p-4 bg-surface-card rounded-2xl border border-border-subtle shadow-soft-lift">
                  <Text className="font-bold text-ink text-sm mb-2">
                    Método de Pago
                  </Text>
                  <Text className="text-sm text-gray-700">
                    {selectedPayment === "venti"
                      ? "Venti - Transferencia bancaria"
                      : "Mercado Pago - Billetera digital"}
                  </Text>
                </View>

                {/* Items List */}
                <View>
                  <Text className="font-bold text-ink mb-3">Productos</Text>
                  <VStack space="md">
                    {items.map((item) => (
                      <View
                        key={item.product.id}
                        className="flex-row items-center justify-between rounded-2xl border border-slate-200/70 bg-white p-3"
                      >
                        <View className="flex-1">
                          <Text className="font-semibold text-ink text-sm">
                            {item.product.name}
                          </Text>
                          <Text className="text-xs text-gray-500">
                            x{item.quantity} @ {formatPrice(item.product.price)}
                          </Text>
                        </View>
                        <Text className="font-bold text-ink">
                          {formatPrice(item.product.price * item.quantity)}
                        </Text>
                      </View>
                    ))}
                  </VStack>
                </View>

                {/* Pricing Summary */}
                <View className="rounded-[24px] border border-slate-200/70 bg-white p-4">
                  <HStack className="justify-between mb-2">
                    <Text className="text-gray-600">Subtotal</Text>
                    <Text className="font-medium text-ink">
                      {formatPrice(subtotal)}
                    </Text>
                  </HStack>

                  <HStack className="justify-between mb-3">
                    <Text className="text-gray-600">Envío</Text>
                    <Text className="font-bold text-emerald-600">Gratis</Text>
                  </HStack>

                  <View className="h-[1px] bg-border-subtle my-3" />

                  <HStack className="justify-between items-end">
                    <Text className="text-lg font-black text-[#09090b]">Total</Text>
                    <Text className="text-2xl font-black tracking-[-0.3px] text-[#09090b]">
                      {formatPrice(total)}
                    </Text>
                  </HStack>
                </View>
              </VStack>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View className="border-t border-slate-200/70 bg-white p-6">
          <VStack space="md">
            {(currentStep === "payment" || currentStep === "summary") && (
              <Button
                size="lg"
                variant="outline"
                className="border-border-subtle"
                style={{ minHeight: 48 }}
                onPress={handleBack}
                disabled={isProcessing}
                accessibilityRole="button"
                accessibilityLabel="Volver al paso anterior del checkout"
              >
                <ButtonText className="text-ink font-semibold">
                  Atrás
                </ButtonText>
              </Button>
            )}

            <Button
              size="lg"
              className="h-16 rounded-2xl bg-[#09090b]"
              onPress={handleNext}
              disabled={isProcessing}
              accessibilityRole="button"
              accessibilityLabel={
                currentStep === "address"
                  ? "Continuar al método de pago"
                  : currentStep === "payment"
                    ? "Revisar orden"
                    : "Confirmar orden"
              }
              accessibilityState={{ disabled: isProcessing }}
            >
              {isProcessing ? (
                <HStack space="md" className="items-center">
                  <LoadingDots color="#4ade80" size={8} />
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
        {isProcessing && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.45)",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
            }}
          >
            <View className="items-center rounded-[24px] bg-white px-8 py-6">
              <View className="mb-4 flex-row gap-2">
                <View className="h-3 w-3 rounded-full bg-[#22c55e]" />
                <View className="h-3 w-3 rounded-full bg-slate-300" />
                <View className="h-3 w-3 rounded-full bg-slate-400" />
              </View>
              <Text className="text-base font-semibold text-gray-900">
                Confirmando tu orden...
              </Text>
            </View>
          </View>
        )}
      </View>
    </AuthGate>
  );
}
