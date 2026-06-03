import { AuthGate } from "@/components/AuthGate";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { ShieldCheck } from "lucide-react-native";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function SecurityScreen() {
  const router = useRouter();
  const { palette, statusBarStyle } = useAppTheme();

  return (
    <AuthGate message="Inicia sesión para gestionar la seguridad de tu cuenta.">
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: palette.colors.surface.warm }}
        edges={["top"]}
      >
        <StatusBar style={statusBarStyle} />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Seguridad"
          icon={ShieldCheck}
          showBackButton={true}
        />

        <View className="flex-1 px-6 pt-6">
          <Text
            className="mb-2 text-2xl font-black tracking-[-0.4px]"
            style={{ color: palette.colors.ink.primary }}
          >
            Seguridad
          </Text>
          <Text className="mb-6" style={{ color: palette.colors.ink.muted }}>
            Gestiona tu contraseña y sesiones activas.
          </Text>

          <View
            className="mb-6 rounded-[24px] border p-4"
            style={{
              backgroundColor: palette.colors.surface.card,
              borderColor: palette.colors.border.subtle,
            }}
          >
            <Text style={{ color: palette.colors.ink.primary }}>
              Próximamente: cambio de contraseña y dispositivos confiables.
            </Text>
          </View>

          <Button
            onPress={() => router.back()}
            className="rounded-2xl"
            style={{ backgroundColor: palette.colors.accent.primary }}
          >
            <ButtonText style={{ color: palette.colors.ink.inverse }}>
              Volver
            </ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    </AuthGate>
  );
}
