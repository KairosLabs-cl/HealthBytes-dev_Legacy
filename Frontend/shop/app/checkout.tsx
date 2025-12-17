import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useCart } from "@/store/cartStore";
import { useAuth } from "@/store/authStore";
import { useMutation } from "@tanstack/react-query";
import { createOrder } from "@/api/orders";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { useState } from "react";
import { CheckCircleIcon } from "lucide-react-native";

export default function CheckoutScreen() {
    const router = useRouter();
    const { items, resetCart } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    const createOrderMutation = useMutation({
        mutationFn: () =>
            createOrder(
                items.map((item) => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price,
                }))
            ),
        onSuccess: (data) => {
            console.log("Order Created:", data);
            setIsProcessing(false);
            setIsSuccess(true);
            resetCart();
            // Esperar un momento para mostrar el estado de éxito antes de redirigir
            setTimeout(() => {
                router.replace("/");
            }, 2000);
        },
        onError: (error) => {
            console.error("Order Failed:", error);
            setIsProcessing(false);
            alert(error.message || "Hubo un error al procesar la orden. Inténtalo de nuevo.");
        },
    });

    const handlePay = () => {
        const token = useAuth.getState().token;

        /* Validar Autenticación: Impedir checkout si no hay sesión */
        if (!token) {
            alert("Necesitas iniciar sesión para realizar una compra.");
            return;
        }

        setIsProcessing(true);

        /* Simular Pasarela de Pago (Stripe/PayPal) - Delay de 3s */
        setTimeout(() => {
            createOrderMutation.mutate();
        }, 3000);
    };

    if (isSuccess) {
        return (
            <View className="flex-1 bg-white justify-center items-center p-6">
                <View className="bg-green-100 p-6 rounded-full mb-6">
                    <CheckCircleIcon size={64} color="#16a34a" />
                </View>
                <Text className="text-2xl font-bold text-center mb-2 text-black">¡Pago Exitoso!</Text>
                <Text className="text-gray-500 text-center">Tu orden ha sido procesada correctamente.</Text>
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
                            <Text className="text-3xl font-bold text-blue-600">${subtotal.toFixed(2)}</Text>
                        </HStack>
                    </View>
                </View>

                <View className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <Text className="text-blue-800 font-medium text-center">
                        💳 Simulación de Pago Segura
                    </Text>
                </View>
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
                        <ButtonText className="text-white font-bold text-xl">Pagar Ahora</ButtonText>
                    )}
                </Button>
            </View>
        </View>
    );
}
