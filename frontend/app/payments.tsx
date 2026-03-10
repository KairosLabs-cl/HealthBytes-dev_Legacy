import { AuthGate } from "@/components/AuthGate";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";

export default function PaymentsScreen() {
  const router = useRouter();

  return (
    <AuthGate message="Inicia sesión para ver tu historial de pagos.">
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <StatusBar style="dark" />
        <Stack.Screen options={{ title: "Métodos de pago" }} />

        <View className="flex-1 px-6 pt-6">
          <Text className="text-2xl font-bold text-black mb-2">
            Métodos de pago
          </Text>
          <Text className="text-gray-600 mb-6">
            Administra tus tarjetas y métodos preferidos.
          </Text>

          <View className="bg-gray-100 rounded-2xl p-4 mb-6">
            <Text className="text-gray-700">
              Próximamente: tarjetas guardadas y pago rápido.
            </Text>
          </View>

          <Button
            onPress={() => router.back()}
            className="bg-black rounded-full"
          >
            <ButtonText className="text-white">Volver</ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    </AuthGate>
  );
}
