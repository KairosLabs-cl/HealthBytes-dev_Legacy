import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Lock } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";

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

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#fafafa]">
        <View className="flex-row gap-2">
          <View className="h-3 w-3 rounded-full bg-[#22c55e]" />
          <View className="h-3 w-3 rounded-full bg-slate-300" />
          <View className="h-3 w-3 rounded-full bg-slate-400" />
        </View>
        <Text className="mt-4 text-ink-subtle">Cargando...</Text>
      </SafeAreaView>
    );
  }

  if (!isSignedIn) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center bg-[#fafafa]"
        style={{ paddingHorizontal: 32 }}
      >
        <View style={{ width: "100%", maxWidth: 260, alignItems: "center" }}>
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-[28px] bg-slate-100">
            <Lock size={36} color="#09090b" />
          </View>

          <Text className="mb-3 text-center text-2xl font-black text-[#09090b]">
            Inicia sesión
          </Text>

          <Text className="mb-8 text-center text-base leading-6 text-zinc-500">
            {message}
          </Text>

          <Pressable
            onPress={() => router.push("/(auth)/login")}
            className="mb-6 h-14 items-center justify-center rounded-2xl bg-[#09090b] active:opacity-80"
            style={{ minHeight: 52, alignSelf: "stretch" }}
            accessibilityRole="button"
            accessibilityLabel="Iniciar sesión"
          >
            <Text className="text-white font-bold text-base">
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
            <Text className="text-sm font-medium text-zinc-500">
              Volver al catalogo
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}
