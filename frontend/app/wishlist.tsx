import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";

export default function WishlistScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ title: "Lista de deseos" }} />

      <View className="flex-1 px-6 pt-6">
        <Text className="text-2xl font-bold text-black mb-2">Lista de deseos</Text>
        <Text className="text-gray-600 mb-6">
          Guarda productos para comprar más tarde.
        </Text>

        <View className="bg-gray-100 rounded-2xl p-4 mb-6">
          <Text className="text-gray-700">
            Próximamente: colección personalizada y alertas de precio.
          </Text>
        </View>

        <Button onPress={() => router.back()} className="bg-black rounded-full">
          <ButtonText className="text-white">Volver</ButtonText>
        </Button>
      </View>
    </SafeAreaView>
  );
}
