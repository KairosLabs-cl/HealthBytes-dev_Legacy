import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Lock } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
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
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#000000" />
        <Text className="mt-4 text-gray-500">Cargando...</Text>
      </SafeAreaView>
    );
  }

  if (!isSignedIn) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
        <View className="w-20 h-20 rounded-full bg-gray-100 items-center justify-center mb-6">
          <Lock size={36} color="#6B7280" />
        </View>

        <Text className="text-2xl font-extrabold text-gray-900 mb-3 text-center">
          Inicia sesion para continuar
        </Text>

        <Text className="text-base text-gray-500 text-center mb-8 leading-6">
          {message}
        </Text>

        <Pressable
          onPress={() => router.push("/(auth)/login")}
          className="w-full h-14 bg-black rounded-full items-center justify-center active:opacity-80 mb-6"
          style={{ minHeight: 52 }}
        >
          <Text className="text-white font-bold text-base">Inicia sesión</Text>
        </Pressable>

        <Pressable
          onPress={() => router.replace("/")}
          className="py-2 active:opacity-60"
          style={{ minHeight: 44 }}
        >
          <Text className="text-gray-400 font-medium text-sm">
            Volver al catalogo
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}
