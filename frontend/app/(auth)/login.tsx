import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Text } from "@/components/ui/text";
import { View, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useOAuth, useAuth } from "@clerk/clerk-expo";
import { useState } from "react";
import { ChevronLeft, Leaf, ShieldCheck } from "lucide-react-native";
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
    <SafeAreaView className="flex-1 bg-[#fafafa]" edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      <Pressable
        onPress={() => router.back()}
        className="mt-4 ml-4 h-11 w-11 items-center justify-center rounded-2xl border border-slate-200/70 bg-white active:opacity-60"
        hitSlop={10}
        accessibilityLabel="Volver"
        accessibilityRole="button"
      >
        <ChevronLeft size={22} color="#09090b" />
      </Pressable>

      <View className="flex-1 justify-between px-6 pb-8 pt-8">
        <View className="gap-8">
          <View className="self-start rounded-[28px] border border-slate-200/70 bg-white p-5 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.20)]">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
              <Leaf size={25} color="#22c55e" strokeWidth={2.3} />
            </View>
            <View className="mt-8 max-w-[280px] gap-2">
              <Text className="text-[13px] font-black uppercase tracking-[1.5px] text-emerald-600">
                HealthBytes
              </Text>
              <Text className="text-[32px] font-black leading-[36px] tracking-[-0.5px] text-[#09090b]">
                Compra segura para tus restricciones.
              </Text>
            </View>
          </View>

          <View className="max-w-[320px] gap-3">
            <Text className="text-2xl font-black tracking-[-0.4px] text-[#09090b]">
              Inicia sesión
            </Text>
            <Text className="text-base leading-6 text-zinc-600">
              Entra con Google para guardar favoritos, direcciones y pedidos.
              Si no tienes cuenta, se crea automáticamente.
            </Text>
          </View>
        </View>

        {error && (
          <View
            className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
            accessibilityRole="alert"
          >
            <Text className="text-sm font-semibold leading-5 text-red-700">
              {error}
            </Text>
          </View>
        )}

        <View className="gap-4">
          <View className="flex-row items-center gap-2">
            <ShieldCheck size={16} color="#22c55e" strokeWidth={2.4} />
            <Text className="text-[13px] font-semibold text-zinc-600">
              Tus datos se protegen con autenticación segura.
            </Text>
          </View>

          <Pressable
            onPress={handleGoogleLogin}
            disabled={isLoading}
            className="h-[56px] flex-row items-center justify-center rounded-2xl bg-[#09090b] px-5 active:opacity-90 disabled:opacity-70"
            style={{ alignSelf: "stretch" }}
            accessibilityLabel={
              isLoading
                ? "Iniciando sesión con Google"
                : "Continuar con Google"
            }
            accessibilityRole="button"
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
          >
            {isLoading ? (
              <View className="flex-row items-center gap-2">
                <View className="h-2 w-2 rounded-full bg-[#4ade80]" />
                <View className="h-2 w-2 rounded-full bg-zinc-400" />
                <View className="h-2 w-2 rounded-full bg-zinc-500" />
                <Text className="ml-2 text-base font-bold text-white">
                  Iniciando
                </Text>
              </View>
            ) : (
              <>
                <View className="mr-3 h-7 w-7 items-center justify-center rounded-xl bg-white">
                  <Text className="text-base font-black text-[#09090b]">G</Text>
                </View>
                <Text className="text-base font-bold text-white">
                  Continuar con Google
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
