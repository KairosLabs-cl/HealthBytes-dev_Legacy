import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Text } from "@/components/ui/text";
import { View, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useOAuth } from "@clerk/clerk-expo";
import { useState } from "react";
import { ChevronLeft, Leaf, ShieldCheck } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useAppTheme } from "@/hooks/useAppTheme";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { palette, statusBarStyle } = useAppTheme();

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

        // Navigation occurs instantly as session activation is completed.
        // The root layout (_layout.tsx) reactively listens to isSignedIn and performs user data sync.
        router.replace("/");
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
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: palette.colors.surface.warm }}
      edges={["top", "bottom"]}
    >
      <StatusBar style={statusBarStyle} />
      <Stack.Screen options={{ headerShown: false }} />

      <Pressable
        onPress={() => router.back()}
        className="mt-4 ml-4 h-11 w-11 items-center justify-center rounded-2xl border active:opacity-60"
        style={{
          backgroundColor: palette.colors.surface.card,
          borderColor: palette.colors.border.subtle,
        }}
        hitSlop={10}
        accessibilityLabel="Volver"
        accessibilityRole="button"
      >
        <ChevronLeft size={22} color={palette.colors.icon.primary} />
      </Pressable>

      <View className="flex-1 justify-between px-6 pb-8 pt-8">
        <View className="gap-8">
          <View
            className="self-start rounded-[28px] border p-5 shadow-[0_20px_40px_-24px_rgba(15,23,42,0.20)]"
            style={{
              backgroundColor: palette.colors.surface.card,
              borderColor: palette.colors.border.subtle,
            }}
          >
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: palette.colors.accent.light }}
            >
              <Leaf
                size={25}
                color={palette.colors.icon.accent}
                strokeWidth={2.3}
              />
            </View>
            <View className="mt-8 max-w-[280px] gap-2">
              <Text
                className="text-[13px] font-black uppercase tracking-[1.5px]"
                style={{ color: palette.colors.accent.primary }}
              >
                HealthBytes
              </Text>
              <Text
                className="text-[32px] font-black leading-[36px] tracking-[-0.5px]"
                style={{ color: palette.colors.ink.primary }}
              >
                Compra con señales claras para tus restricciones.
              </Text>
            </View>
          </View>

          <View className="max-w-[320px] gap-3">
            <Text
              className="text-2xl font-black tracking-[-0.4px]"
              style={{ color: palette.colors.ink.primary }}
            >
              Inicia sesión
            </Text>
            <Text
              className="text-base leading-6"
              style={{ color: palette.colors.ink.muted }}
            >
              Entra con Google para guardar favoritos, direcciones y pedidos. Si
              no tienes cuenta, se crea automáticamente.
            </Text>
          </View>
        </View>

        {error && (
          <View
            className="mb-4 rounded-2xl border px-4 py-3"
            style={{
              backgroundColor: palette.colors.surface.elevated,
              borderColor: palette.colors.state.error,
            }}
            accessibilityRole="alert"
          >
            <Text
              className="text-sm font-semibold leading-5"
              style={{ color: palette.colors.state.error }}
            >
              {error}
            </Text>
          </View>
        )}

        <View className="gap-4">
          <View className="flex-row items-center gap-2">
            <ShieldCheck
              size={16}
              color={palette.colors.icon.accent}
              strokeWidth={2.4}
            />
            <Text
              className="text-[13px] font-semibold"
              style={{ color: palette.colors.ink.muted }}
            >
              Autenticación protegida por Clerk
            </Text>
          </View>

          <Pressable
            onPress={handleGoogleLogin}
            disabled={isLoading}
            className="h-[56px] flex-row items-center justify-center rounded-2xl px-5 active:opacity-90 disabled:opacity-70"
            style={{
              alignSelf: "stretch",
              backgroundColor: palette.colors.accent.primary,
            }}
            accessibilityLabel={
              isLoading ? "Iniciando sesión con Google" : "Continuar con Google"
            }
            accessibilityRole="button"
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
          >
            {isLoading ? (
              <View className="flex-row items-center gap-2">
                <View
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: palette.colors.icon.accent }}
                />
                <View
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: palette.colors.ink.subtle }}
                />
                <View
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: palette.colors.ink.muted }}
                />
                <Text
                  className="ml-2 text-base font-bold"
                  style={{ color: palette.colors.ink.inverse }}
                >
                  Iniciando
                </Text>
              </View>
            ) : (
              <>
                <View
                  className="mr-3 h-7 w-7 items-center justify-center rounded-xl"
                  style={{ backgroundColor: palette.colors.surface.card }}
                >
                  <Text
                    className="text-base font-black"
                    style={{ color: palette.colors.ink.primary }}
                  >
                    G
                  </Text>
                </View>
                <Text
                  className="text-base font-bold"
                  style={{ color: palette.colors.ink.inverse }}
                >
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
