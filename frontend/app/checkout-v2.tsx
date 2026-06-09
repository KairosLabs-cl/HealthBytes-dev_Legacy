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
import { FEATURES } from "@/lib/config";
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
import { useAppTheme } from "@/hooks/useAppTheme";

type CheckoutStep = "address" | "payment" | "summary";

export default function CheckoutV2Screen() {
  const router = useRouter();
  const { palette, statusBarStyle } = useAppTheme();

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
    if (!FEATURES.MARKETPLACE_ENABLED) {
      return;
    }

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
  const firstProductId = items[0]?.product.id ?? null;

  const handleFindStores = () => {
    if (firstProductId !== null) {
      router.replace(`/product/${firstProductId}/stores`);
      return;
    }

    router.replace("/all-products");
  };

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

  if (!FEATURES.MARKETPLACE_ENABLED) {
    return (
      <View className="flex-1 bg-surface-warm">
        <StatusBar style={statusBarStyle} />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Dónde conseguir"
          icon={MapPinIcon}
          showBackButton={true}
        />

        <View className="flex-1 justify-center px-6">
          <View className="rounded-[24px] border border-border-subtle bg-surface-card p-6">
            <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-surface-warm">
              <MapPinIcon size={24} color={palette.colors.icon.primary} />
            </View>
            <Text className="text-2xl font-black tracking-[-0.2px] text-ink">
              Encuentra dónde comprar
            </Text>
            <Text className="mt-3 text-base leading-6 text-ink-muted">
              Compra directa y pagos están pausados mientras validamos tiendas
              físicas. Te llevamos al mapa de tiendas para buscar disponibilidad.
            </Text>

            <Button
              size="lg"
              className="mt-6 h-14 rounded-2xl bg-ink"
              onPress={handleFindStores}
              accessibilityRole="button"
              accessibilityLabel="Ver tiendas del producto"
            >
              <ButtonText className="text-ink-inverse font-bold text-base">
                Ver tiendas del producto
              </ButtonText>
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <AuthGate message="Inicia sesion para completar tu compra.">
      <View className="flex-1 bg-surface-warm">
        <StatusBar style={statusBarStyle} />
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
              className="mb-5 rounded-2xl border bg-surface-card px-4 py-3"
              style={{ borderColor: palette.colors.state.error }}
              accessibilityRole="alert"
            >
              <Text
                className="text-sm font-semibold leading-5"
                style={{ color: palette.colors.state.error }}
              >
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
                    <MapPinIcon size={24} color={palette.colors.icon.primary} />
                    <Text className="ml-2 text-xl font-black tracking-[-0.2px] text-ink">
                      ¿A dónde lo llevamos?
                    </Text>
                  </HStack>
                  <Text className="text-ink-muted text-sm">
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
                              ? palette.colors.accent.light
                              : palette.colors.surface.card,
                          borderColor:
                            selectedAddress?.id === address.id
                              ? palette.colors.state.success
                              : palette.colors.border.subtle,
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
                            <Text className="text-sm text-ink-muted mb-1">
                              {address.city}, {address.region}
                            </Text>
                            <Text className="text-xs text-ink-muted">
                              CP: {address.postal_code}
                            </Text>
                            {address.street_number && (
                              <Text className="text-xs text-ink-muted mt-1">
                                {address.street_number}
                              </Text>
                            )}
                          </View>

                          <View
                            className="ml-3 h-7 w-7 items-center justify-center rounded-xl border"
                            style={{
                              backgroundColor:
                                selectedAddress?.id === address.id
                                  ? palette.colors.state.success
                                  : palette.colors.surface.card,
                              borderColor:
                                selectedAddress?.id === address.id
                                  ? palette.colors.state.success
                                  : palette.colors.border.subtle,
                            }}
                          >
                            {selectedAddress?.id === address.id && (
                              <View className="h-3 w-3 rounded bg-ink-inverse" />
                            )}
                          </View>
                        </HStack>
                      </Pressable>
                    ))}
                  </VStack>
                ) : (
                  <View className="items-center rounded-[24px] border border-border-subtle bg-surface-card p-6">
                    <Text className="text-ink-muted text-center mb-4">
                      No tienes direcciones guardadas aún
                    </Text>
                    <Button
                      size="sm"
                      className="bg-ink"
                      style={{ minHeight: 48 }}
                      onPress={() => router.push("/addresses")}
                      accessibilityLabel="Agregar nueva dirección"
                      accessibilityRole="button"
                    >
                      <ButtonText className="text-ink-inverse">
                        Añadir Dirección
                      </ButtonText>
                    </Button>
                  </View>
                )}

                {addresses.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border-default"
                    style={{ minHeight: 48 }}
                    onPress={() => router.push("/addresses")}
                    accessibilityLabel="Agregar nueva dirección"
                    accessibilityRole="button"
                  >
                    <ButtonText className="text-ink">
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
                  <View className="rounded-[24px] border border-border-subtle bg-surface-card p-4">
                    <HStack className="items-start">
                      <MapPinIcon size={20} color={palette.colors.icon.primary} />
                      <View className="flex-1 ml-3">
                        <Text className="font-bold text-ink text-sm mb-1">
                          Dirección de Envío
                        </Text>
                        <Text className="text-sm text-ink-muted">
                          {selectedAddress.street}
                        </Text>
                        <Text className="text-sm text-ink-muted">
                          {selectedAddress.city}, {selectedAddress.region}{" "}
                          {selectedAddress.postal_code}
                        </Text>
                        {selectedAddress.phone && (
                          <HStack className="items-center mt-2">
                            <PhoneIcon size={14} color={palette.colors.icon.muted} />
                            <Text className="text-xs text-ink-muted ml-1">
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
                  <Text className="text-sm text-ink-muted">
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
                        className="flex-row items-center justify-between rounded-2xl border border-border-subtle bg-surface-card p-3"
                      >
                        <View className="flex-1">
                          <Text className="font-semibold text-ink text-sm">
                            {item.product.name}
                          </Text>
                          <Text className="text-xs text-ink-muted">
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
                <View className="rounded-[24px] border border-border-subtle bg-surface-card p-4">
                  <HStack className="justify-between mb-2">
                    <Text className="text-ink-muted">Subtotal</Text>
                    <Text className="font-medium text-ink">
                      {formatPrice(subtotal)}
                    </Text>
                  </HStack>


                  <View className="h-[1px] bg-border-subtle my-3" />

                  <HStack className="justify-between items-end">
                    <Text className="text-lg font-black text-ink">Total</Text>
                    <Text className="text-2xl font-black tracking-[-0.3px] text-ink">
                      {formatPrice(total)}
                    </Text>
                  </HStack>
                </View>
              </VStack>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <View className="border-t border-border-subtle bg-surface-card p-6">
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
              className="h-16 rounded-2xl bg-ink"
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
                  <LoadingDots color={palette.colors.state.success} size={8} />
                  <ButtonText className="text-ink-inverse font-semibold text-lg">
                    {currentStep === "summary"
                      ? "Confirmando..."
                      : "Procesando..."}
                  </ButtonText>
                </HStack>
              ) : (
                <ButtonText className="text-ink-inverse font-bold text-lg">
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
              backgroundColor: palette.colors.surface.overlay,
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
            }}
          >
            <View className="items-center rounded-[24px] bg-surface-card px-8 py-6">
              <View className="mb-4 flex-row gap-2">
                <View className="h-3 w-3 rounded-full bg-state-success" />
                <View className="h-3 w-3 rounded-full bg-border-default" />
                <View className="h-3 w-3 rounded-full bg-ink-subtle" />
              </View>
              <Text className="text-base font-semibold text-ink">
                Confirmando tu orden...
              </Text>
            </View>
          </View>
        )}
      </View>
    </AuthGate>
  );
}
