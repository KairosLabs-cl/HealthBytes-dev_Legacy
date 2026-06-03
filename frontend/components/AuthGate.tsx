import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Lock } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { useAppTheme } from "@/hooks/useAppTheme";

interface AuthGateProps {
  children: React.ReactNode;
  message?: string;
}

export function AuthGate({
  children,
  message = "Necesitas una cuenta para acceder a esta seccion.",
}: AuthGateProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const { palette } = useAppTheme();

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface-warm">
        <View className="flex-row gap-2">
          <View className="h-3 w-3 rounded-full bg-state-success" />
          <View className="h-3 w-3 rounded-full bg-surface-elevated" />
          <View className="h-3 w-3 rounded-full bg-border-default" />
        </View>
        <Text className="mt-4 text-ink-subtle">Cargando...</Text>
      </SafeAreaView>
    );
  }

  if (!isSignedIn) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-surface-warm"
        style={{ paddingHorizontal: 32 }}
      >
        <View style={{ width: "100%", maxWidth: 260, alignItems: "center" }}>
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-[28px] bg-surface-muted">
            <Lock size={36} color={palette.colors.icon.primary} />
          </View>

          <Text className="mb-3 text-center text-2xl font-black text-ink">
            Inicia sesión
          </Text>

          <Text className="mb-8 text-center text-base leading-6 text-ink-muted">
            {message}
          </Text>

          <Pressable
            onPress={() => router.push("/(auth)/login")}
            className="mb-6 h-14 items-center justify-center rounded-2xl bg-ink active:opacity-80"
            style={{ minHeight: 52, alignSelf: "stretch" }}
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
          >
            <Text className="text-ink-inverse font-bold text-base">
              Inicia sesión
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.replace("/")}
            className="py-2 active:opacity-60"
            style={{ minHeight: 44 }}
            accessibilityRole="button"
            accessibilityLabel="Volver al catálogo"
          >
            <Text className="text-sm font-medium text-ink-muted">
              Volver al catálogo
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}
