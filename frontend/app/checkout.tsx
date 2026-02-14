import { View, Text, ActivityIndicator, Linking, Platform } from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "@/store/cartStore";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";
import { createOrder } from "@/api/orders";
import { createMercadoPagoPreference } from "@/api/mercadopago";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { useState } from "react";
import { CheckCircleIcon, AlertCircleIcon } from "lucide-react-native";
import { formatPrice } from "@/lib/formatPrice";

export default function CheckoutScreen() {
    const router = useRouter();
    const { items, resetCart } = useCart();
    const { isSignedIn, getToken } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    const handlePay = async () => {
        setErrorMsg(null);

        if (!isSignedIn) {
            alert("Necesitas haber iniciado una sesión para realizar una compra.");
            router.push("/(auth)/login");
            return;
        }

        let token = await getToken();

        if (!token) {
            for (let attempt = 1; attempt <= 3; attempt++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                token = await getToken();
                if (token) break;
            }
        }

        if (!token) {
            alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
            router.push("/(auth)/login");
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Create the order in the backend
            const order = await createOrder(
                items.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price,
                })),
                getToken
            );

            console.log("Order created:", order.id);

            // 2. Create Mercado Pago preference
            const preference = await createMercadoPagoPreference(
                { order_id: order.id },
                getToken
            );

            console.log("MP preference created:", preference.preference_id);

            // 3. Open Mercado Pago checkout
            const checkoutUrl = preference.sandbox_init_point || preference.init_point;

            if (Platform.OS === "web") {
                window.open(checkoutUrl, "_blank");
            } else {
                await Linking.openURL(checkoutUrl);
            }

            // 4. Clear cart (order is already created)
            resetCart();
            setIsProcessing(false);
            setIsSuccess(true);

        } catch (error: any) {
            console.error("Checkout error:", error);
            setIsProcessing(false);
            setErrorMsg(error.message || "Hubo un error al procesar la orden.");
        }
    };

    if (isSuccess) {
        return (
            <View className="flex-1 bg-white justify-center items-center p-6">
                <View className="bg-green-100 p-6 rounded-full mb-6">
                    <CheckCircleIcon size={64} color="#16a34a" />
                </View>
                <Text className="text-2xl font-bold text-center mb-2 text-black">¡Orden Creada!</Text>
                <Text className="text-gray-500 text-center mb-4">
                    Completa tu pago en la ventana de Mercado Pago.
                </Text>
                <Button
                    size="lg"
                    onPress={() => router.replace("/")}
                    className="bg-black rounded-full px-8"
                >
                    <ButtonText className="text-white font-semibold">Volver al Inicio</ButtonText>
                </Button>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white p-6 justify-between">
            <VStack space="xl">
                <View>
                    <Text className="text-3xl font-bold mb-6 text-black">Checkout</Text>

                    <View className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <Text className="text-gray-500 mb-4 uppercase text-xs font-bold tracking-wider">Resumen</Text>

                        <HStack className="justify-between mb-2">
                            <Text className="text-gray-600">Total Productos</Text>
                            <Text className="font-medium text-black">{items.length} items</Text>
                        </HStack>

                        <HStack className="justify-between mb-4">
                            <Text className="text-gray-600">Envío</Text>
                            <Text className="font-medium text-green-600">Gratis</Text>
                        </HStack>

                        <View className="h-[1px] bg-gray-200 my-4" />

                        <HStack className="justify-between items-end">
                            <Text className="text-xl font-bold text-black">Total a Pagar</Text>
                            <Text className="text-3xl font-bold text-blue-600">{formatPrice(subtotal)}</Text>
                        </HStack>
                    </View>
                </View>

                <View className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <Text className="text-blue-800 font-medium text-center">
                        Serás redirigido a Mercado Pago para completar el pago
                    </Text>
                </View>

                {errorMsg && (
                    <View className="bg-red-50 p-4 rounded-xl border border-red-200">
                        <HStack space="sm" className="items-center">
                            <AlertCircleIcon size={20} color="#dc2626" />
                            <Text className="text-red-700 flex-1">{errorMsg}</Text>
                        </HStack>
                    </View>
                )}
            </VStack>

            <View className="absolute bottom-24 left-6 right-6">
                <Button
                    size="xl"
                    onPress={handlePay}
                    disabled={isProcessing}
                    className="w-full bg-black h-16 rounded-full shadow-xl"
                >
                    {isProcessing ? (
                        <HStack space="md" className="items-center">
                            <ActivityIndicator color="white" />
                            <ButtonText className="text-white font-semibold text-lg">Procesando...</ButtonText>
                        </HStack>
                    ) : (
                        <ButtonText className="text-white font-bold text-xl">Pagar con Mercado Pago</ButtonText>
                    )}
                </Button>
            </View>
        </View>
    );
}
