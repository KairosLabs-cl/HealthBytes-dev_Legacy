import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";

export default function ProfileSettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ title: "Ajustes" }} />

      <View className="flex-1 px-6 pt-6">
        <Text className="text-2xl font-bold text-black mb-2">Ajustes de perfil</Text>
        <Text className="text-gray-600 mb-6">
          Aquí podrás actualizar tus datos personales y preferencias.
        </Text>

        <View className="bg-gray-100 rounded-2xl p-4 mb-6">
          <Text className="text-gray-700">
            Próximamente: edición de nombre, foto, email y direcciones guardadas.
          </Text>
        </View>

        <Button onPress={() => router.back()} className="bg-black rounded-full">
          <ButtonText className="text-white">Volver</ButtonText>
        </Button>
      </View>
    </SafeAreaView>
  );
}
