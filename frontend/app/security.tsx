import { AuthGate } from "@/components/AuthGate";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ShieldCheck } from "lucide-react-native";

export default function SecurityScreen() {
  const router = useRouter();

  return (
    <AuthGate message="Inicia sesión para gestionar la seguridad de tu cuenta.">
      <SafeAreaView className="flex-1 bg-[#fafafa]" edges={["top"]}>
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Seguridad"
          icon={ShieldCheck}
          showBackButton={true}
        />

        <View className="flex-1 px-6 pt-6">
          <Text className="mb-2 text-2xl font-black tracking-[-0.4px] text-[#09090b]">
            Seguridad
          </Text>
          <Text className="text-gray-600 mb-6">
            Gestiona tu contraseña y sesiones activas.
          </Text>

          <View className="mb-6 rounded-[24px] border border-slate-200/70 bg-white p-4">
            <Text className="text-gray-700">
              Próximamente: cambio de contraseña y dispositivos confiables.
            </Text>
          </View>

          <Button
            onPress={() => router.back()}
            className="rounded-2xl bg-[#09090b]"
          >
            <ButtonText className="text-white">Volver</ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    </AuthGate>
  );
}
