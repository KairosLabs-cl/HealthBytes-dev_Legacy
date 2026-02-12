import { useClerk } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Text } from "@/components/ui/text";
import { View, Pressable, ActivityIndicator, TextInput, ScrollView } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useOAuth, useSignIn, useSignUp, useAuth } from "@clerk/clerk-expo";
import { useState, useCallback } from "react";
import { EyeIcon, EyeOffIcon, Mail, LogOut, ChevronLeft, User } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useUser } from "@clerk/clerk-expo";

// Para web browser
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  // OAuth providers
  const { startOAuthFlow: googleOAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: facebookOAuth } = useOAuth({ strategy: "oauth_facebook" });

  // Email/Password hooks
  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handle OAuth login
  const handleOAuth = useCallback(async (oauthFn: typeof googleOAuth, provider: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const { createdSessionId, setActive } = await oauthFn({
        redirectUrl: Linking.createURL("/(auth)/login", { scheme: "myapp" }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });

        let attempts = 0;
        const maxAttempts = 10;

        while (attempts < maxAttempts) {
          try {
            const testToken = await getToken?.();
            if (testToken) {
              router.replace("/profile");
              return;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          } catch {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
        }

        router.replace("/profile");
      } else {
        setError(`Error con ${provider}: No se pudo completar la autenticación`);
      }
    } catch (err: any) {
      setError(`Error con ${provider}: ${err.errors?.[0]?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [router, getToken]);

  // Handle Email Sign In
  const onEmailSignIn = useCallback(async () => {
    if (!isSignInLoaded || !signIn) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        router.replace("/profile");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  }, [isSignInLoaded, signIn, email, password, setSignInActive, router]);

  // Handle Email Sign Up
  const onEmailSignUp = useCallback(async () => {
    if (!isSignUpLoaded || !signUp) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp.create({ emailAddress: email, password });
      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId });
        router.replace("/profile");
      } else {
        setError("Por favor verifica tu email");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  }, [isSignUpLoaded, signUp, email, password, setSignUpActive, router]);

  // --- Profile view (signed in) ---
  if (isSignedIn) {
    const displayName = user?.firstName || user?.fullName || "Usuario";
    const displayEmail = user?.primaryEmailAddress?.emailAddress;

    return (
      <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />

        <ScrollView className="flex-1" contentContainerClassName="pb-32">
          {/* Header */}
          <View className="bg-white px-5 pt-4 pb-6">
            <Text className="text-2xl font-extrabold text-gray-900">Mi Perfil</Text>
          </View>

          {/* User info card */}
          <View className="mx-4 mt-3 bg-white rounded-2xl p-5">
            <View className="flex-row items-center gap-4">
              <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center">
                <User size={28} color="#6B7280" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">{displayName}</Text>
                {displayEmail && (
                  <Text className="text-sm text-gray-500 mt-0.5">{displayEmail}</Text>
                )}
              </View>
            </View>
          </View>

          {/* Actions */}
          <View className="mx-4 mt-3 bg-white rounded-2xl overflow-hidden">
            <Pressable
              onPress={() => router.replace("/")}
              className="flex-row items-center px-5 py-4 active:bg-gray-50"
              style={{ minHeight: 48 }}
            >
              <Text className="flex-1 text-base text-gray-900">Ir al inicio</Text>
              <ChevronLeft size={18} color="#9CA3AF" style={{ transform: [{ rotate: "180deg" }] }} />
            </Pressable>

            <View className="h-px bg-gray-100 mx-5" />

            <Pressable
              onPress={() => signOut()}
              className="flex-row items-center px-5 py-4 active:bg-gray-50"
              style={{ minHeight: 48 }}
            >
              <LogOut size={18} color="#EF4444" />
              <Text className="flex-1 text-base text-red-500 ml-3">Cerrar sesión</Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Login/Register view ---
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-32"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          className="mt-2 mb-4 self-start p-2 -ml-2 active:opacity-60"
          style={{ minHeight: 44 }}
        >
          <ChevronLeft size={24} color="#111827" />
        </Pressable>

        {/* Title */}
        <Text className="text-3xl font-extrabold text-gray-900 mb-1">
          {isSignUpMode ? "Crea tu cuenta" : "Inicia sesión"}
        </Text>
        <Text className="text-base text-gray-500 mb-8">
          {isSignUpMode
            ? "Completa los datos para comenzar."
            : "Ingresa a tu cuenta de HealthBytes"}
        </Text>

        {/* Error message */}
        {error && (
          <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            <Text className="text-red-600 text-sm">{error}</Text>
          </View>
        )}

        {isLoading ? (
          <View className="py-12 items-center">
            <ActivityIndicator size="large" color="#111827" />
            <Text className="text-gray-500 mt-3 text-sm">Procesando...</Text>
          </View>
        ) : !showEmailForm ? (
          <>
            {/* OAuth Buttons */}
            <Pressable
              onPress={() => handleOAuth(googleOAuth, "Google")}
              className="flex-row items-center justify-center bg-white border border-gray-200 rounded-xl px-5 py-4 mb-3 active:bg-gray-50"
              style={{ minHeight: 52 }}
            >
              <Text className="text-lg font-bold text-gray-600 mr-3">G</Text>
              <Text className="text-base font-medium text-gray-900">Continuar con Google</Text>
            </Pressable>

            <Pressable
              onPress={() => handleOAuth(facebookOAuth, "Facebook")}
              className="flex-row items-center justify-center bg-[#1877F2] rounded-xl px-5 py-4 mb-6 active:opacity-90"
              style={{ minHeight: 52 }}
            >
              <Text className="text-lg font-bold text-white mr-3">f</Text>
              <Text className="text-base font-medium text-white">Continuar con Facebook</Text>
            </Pressable>

            {/* Divider */}
            <View className="flex-row items-center mb-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="text-gray-400 mx-4 text-sm">o</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Email button */}
            <Pressable
              onPress={() => setShowEmailForm(true)}
              className="flex-row items-center justify-center bg-white border border-gray-200 rounded-xl px-5 py-4 active:bg-gray-50"
              style={{ minHeight: 52 }}
            >
              <Mail size={20} color="#6B7280" />
              <Text className="text-base font-medium text-gray-900 ml-3">Continuar con Email</Text>
            </Pressable>
          </>
        ) : (
          <>
            {/* Email Form */}
            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">Email</Text>
                <View className="bg-white border border-gray-200 rounded-xl px-4 h-[52px] justify-center">
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="tu@email.com"
                    placeholderTextColor="#9CA3AF"
                    className="text-base text-gray-900"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-1.5">Contraseña</Text>
                <View className="bg-white border border-gray-200 rounded-xl px-4 h-[52px] flex-row items-center">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#9CA3AF"
                    className="flex-1 text-base text-gray-900"
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    className="pl-3"
                    style={{ minHeight: 44, justifyContent: "center" }}
                    hitSlop={8}
                  >
                    {showPassword
                      ? <EyeIcon size={20} color="#9CA3AF" />
                      : <EyeOffIcon size={20} color="#9CA3AF" />
                    }
                  </Pressable>
                </View>
              </View>

              {/* Submit */}
              <Pressable
                onPress={isSignUpMode ? onEmailSignUp : onEmailSignIn}
                disabled={!email || !password}
                className={`items-center justify-center rounded-full mt-2 ${
                  !email || !password ? "bg-gray-200" : "bg-black active:opacity-80"
                }`}
                style={{ minHeight: 52 }}
              >
                <Text
                  className={`text-base font-bold ${
                    !email || !password ? "text-gray-400" : "text-white"
                  }`}
                >
                  {isSignUpMode ? "Registrarse" : "Iniciar sesión"}
                </Text>
              </Pressable>

              {/* Back to options */}
              <Pressable
                onPress={() => setShowEmailForm(false)}
                className="items-center py-3 active:opacity-60"
                style={{ minHeight: 44 }}
              >
                <Text className="text-gray-500 font-medium">Volver a opciones</Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Toggle Sign Up / Sign In */}
        <View className="items-center mt-10">
          <Text className="text-gray-500">
            {isSignUpMode ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
          </Text>
          <Pressable
            onPress={() => setIsSignUpMode(!isSignUpMode)}
            className="mt-1 py-2 active:opacity-60"
            style={{ minHeight: 44 }}
          >
            <Text className="text-black font-bold text-base">
              {isSignUpMode ? "Inicia sesión" : "Regístrate"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
