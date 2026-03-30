import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Text } from "@/components/ui/text";
import { View, Pressable, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useOAuth, useAuth } from "@clerk/clerk-expo";
import { useState } from "react";
import { ChevronLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { createdSessionId, setActive } = await startOAuthFlow({
        redirectUrl: Linking.createURL("/(auth)/login", { scheme: "myapp" }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });

        const startTime = Date.now();
        const TIMEOUT_MS = 8000;

        while (Date.now() - startTime < TIMEOUT_MS) {
          try {
            const token = await getToken?.();
            if (token) {
              router.replace("/");
              return;
            }
          } catch {
            /* continuar */
          }
          await new Promise((r) => setTimeout(r, 150));
        }

        // Si llegamos aquí, el token nunca llegó
        setError("No se pudo verificar tu sesión. Por favor intenta de nuevo.");
        setIsLoading(false);
        return;
      } else {
        setError("No se pudo completar el inicio de sesión. Intenta de nuevo.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Back */}
      <Pressable
        onPress={() => router.back()}
        className="mt-4 ml-4 self-start p-2 active:opacity-60"
        hitSlop={8}
        accessibilityLabel="Volver"
        accessibilityRole="button"
      >
        <ChevronLeft size={24} color="#111827" />
      </Pressable>

      {/* Content centrado */}
      <View className="flex-1 justify-center px-8">
        <Text className="text-3xl font-extrabold text-gray-900 mb-2">
          Inicia sesión
        </Text>
        <Text className="text-base text-gray-500 mb-10">
          Ingresa a tu cuenta de HealthBytes. Si no tienes una, se crea
          automáticamente.
        </Text>

        {error && (
          <View 
            className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6"
            accessibilityRole="alert"
          >
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        <Pressable
          onPress={handleGoogleLogin}
          disabled={isLoading}
          className="flex-row items-center justify-center bg-white border border-gray-200 rounded-xl px-5 py-4 active:bg-gray-50"
          style={{ minHeight: 52 }}
          accessibilityLabel={isLoading ? "Iniciando sesión con Google" : "Continuar con Google"}
          accessibilityRole="button"
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#6B7280" />
          ) : (
            <>
              <Text className="text-lg font-bold text-gray-600 mr-3">G</Text>
              <Text className="text-base font-semibold text-gray-900">
                Continuar con Google
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
