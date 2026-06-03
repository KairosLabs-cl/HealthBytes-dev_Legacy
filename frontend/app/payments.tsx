import { AuthGate } from "@/components/AuthGate";
import { View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { CreditCard } from "lucide-react-native";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function PaymentsScreen() {
  const router = useRouter();
  const { palette, statusBarStyle } = useAppTheme();

  return (
    <AuthGate message="Inicia sesión para ver tu historial de pagos.">
      <SafeAreaView className="flex-1 bg-surface-warm" edges={["top"]}>
        <StatusBar style={statusBarStyle} />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Métodos de pago"
          icon={CreditCard}
          showBackButton={true}
        />

        <View className="flex-1 px-6 pt-6">
          <Text className="mb-2 text-2xl font-black tracking-[-0.4px] text-ink">
            Métodos de pago
          </Text>
          <Text className="text-ink-muted mb-6">
            Administra tus tarjetas y métodos preferidos.
          </Text>

          <View
            className="mb-6 rounded-[24px] border border-border-subtle bg-surface-card p-4"
            style={{ borderColor: palette.colors.border.subtle }}
          >
            <Text className="text-ink-muted">
              Próximamente: tarjetas guardadas y pago rápido.
            </Text>
          </View>

          <Button
            onPress={() => router.back()}
            className="rounded-2xl bg-ink"
          >
            <ButtonText className="text-ink-inverse">Volver</ButtonText>
          </Button>
        </View>
      </SafeAreaView>
    </AuthGate>
  );
}
