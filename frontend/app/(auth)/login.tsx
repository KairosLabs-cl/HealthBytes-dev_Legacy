import { useClerk } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { Button, ButtonText } from "@/components/ui/button";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useOAuth, useSignIn, useSignUp, useAuth } from "@clerk/clerk-expo";
import { useState, useCallback } from "react";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, Mail } from "lucide-react-native";
import { ActivityIndicator } from "react-native";

// Para web browser
WebBrowser.maybeCompleteAuthSession();

export const options = {
  title: "Mi cuenta",
};

export default function LoginScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { isSignedIn, getToken } = useAuth();

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

      console.log(`🔐 Starting ${provider} OAuth...`);
      const { createdSessionId, setActive } = await oauthFn({
        redirectUrl: Linking.createURL("/(auth)/login", { scheme: "myapp" }),
      });

      console.log(`✅ ${provider} OAuth completed. Session ID:`, createdSessionId);

      if (createdSessionId && setActive) {
        console.log(`🔄 Setting active session...`);
        await setActive({ session: createdSessionId });
        console.log(`✅ Session is now active.`);
        
        // Esperar a que el token esté disponible (mitigar timing issue)
        console.log(`⏳ Waiting for token to be available in cache...`);
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          try {
            // Intentar obtener el token para verificar que está disponible
            const testToken = await getToken?.();
            if (testToken) {
              console.log(`✅ Token is now available in cache. Redirecting to home...`);
              router.replace("/");
              return;
            }
            // Si no está disponible, esperar y reintentar
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          } catch (e) {
            console.warn(`⚠️ Attempt ${attempts + 1}/${maxAttempts}: Token not yet available`);
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
          }
        }
        
        // Si después de varios intentos el token no está disponible, redirigir de todas formas
        console.warn(`⚠️ Token not available after ${maxAttempts} attempts, redirecting anyway...`);
        router.replace("/");
      } else {
        console.error(`❌ OAuth failed: Missing createdSessionId or setActive`);
        setError(`Error con ${provider}: No se pudo completar la autenticación`);
      }
    } catch (err: any) {
      console.error(`❌ OAuth ${provider} error:`, err);
      setError(`Error con ${provider}: ${err.errors?.[0]?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Handle Email Sign In
  const onEmailSignIn = useCallback(async () => {
    if (!isSignInLoaded || !signIn) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        router.replace("/");
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
        router.replace("/");
      } else {
        setError("Por favor verifica tu email");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  }, [isSignUpLoaded, signUp, email, password, setSignUpActive, router]);

  // If signed in, show profile
  if (isSignedIn) {
    return (
      <View style={styles.container}>
        <VStack space="lg" className="items-center p-6 bg-white rounded-xl max-w-md w-full">
          <Heading className="text-2xl">¡Bienvenido!</Heading>
          <Text className="text-gray-600">Has iniciado sesión correctamente.</Text>
          <Button onPress={() => router.replace("/")}>
            <ButtonText>Ir al inicio</ButtonText>
          </Button>
          <Button variant="outline" onPress={() => signOut()}>
            <ButtonText>Cerrar Sesión</ButtonText>
          </Button>
        </VStack>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <VStack space="lg" className="p-6 bg-gray-900 rounded-xl max-w-md w-full">
        <Heading className="text-white text-center text-xl">
          {isSignUpMode ? "Crea tu cuenta" : "Inicia Sesión"}
        </Heading>
        <Text className="text-gray-400 text-center text-sm">
          {isSignUpMode ? "¡Bienvenido! Completa los datos para comenzar." : "Ingresa a tu cuenta de HealthBytes"}
        </Text>

        {error && (
          <Text className="text-red-400 text-center text-sm bg-red-900/30 p-2 rounded">
            {error}
          </Text>
        )}

        {isLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        ) : !showEmailForm ? (
          <>
            {/* OAuth Buttons */}
            <HStack space="sm" className="justify-center">
              <Button
                variant="outline"
                className="flex-1 border-gray-700 bg-blue-600"
                onPress={() => handleOAuth(facebookOAuth, "Facebook")}
              >
                <ButtonText className="text-white">f</ButtonText>
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-700 bg-white"
                onPress={() => handleOAuth(googleOAuth, "Google")}
              >
                <ButtonText className="text-gray-800">G</ButtonText>
              </Button>
            </HStack>

            <HStack className="items-center my-2">
              <View className="flex-1 h-px bg-gray-700" />
              <Text className="text-gray-500 mx-4">o</Text>
              <View className="flex-1 h-px bg-gray-700" />
            </HStack>

            {/* Email button */}
            <Button
              variant="outline"
              className="border-gray-700 bg-gray-800"
              onPress={() => setShowEmailForm(true)}
            >
              <Mail size={18} color="#9CA3AF" />
              <ButtonText className="text-gray-300 ml-2">Continuar con Email</ButtonText>
            </Button>
          </>
        ) : (
          <>
            {/* Email Form */}
            <VStack space="md">
              <VStack space="xs">
                <Text className="text-gray-400 text-sm">Email</Text>
                <Input className="bg-gray-800 border-gray-700">
                  <InputField
                    value={email}
                    onChangeText={setEmail}
                    placeholder="tu@email.com"
                    placeholderTextColor="#6B7280"
                    className="text-white"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </Input>
              </VStack>

              <VStack space="xs">
                <Text className="text-gray-400 text-sm">Contraseña</Text>
                <Input className="bg-gray-800 border-gray-700">
                  <InputField
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#6B7280"
                    className="text-white"
                    type={showPassword ? "text" : "password"}
                  />
                  <InputSlot className="pr-3" onPress={() => setShowPassword(!showPassword)}>
                    <InputIcon
                      as={showPassword ? EyeIcon : EyeOffIcon}
                      color="#9CA3AF"
                    />
                  </InputSlot>
                </Input>
              </VStack>

              <Button
                className="bg-purple-600 mt-2"
                onPress={isSignUpMode ? onEmailSignUp : onEmailSignIn}
                isDisabled={!email || !password}
              >
                <ButtonText>{isSignUpMode ? "Registrarse" : "Iniciar Sesión"}</ButtonText>
              </Button>

              <Button
                variant="link"
                onPress={() => setShowEmailForm(false)}
              >
                <ButtonText className="text-gray-400">← Volver</ButtonText>
              </Button>
            </VStack>
          </>
        )}

        {/* Toggle Sign Up / Sign In */}
        <VStack className="items-center mt-6 space-y-2">
          <Text className="text-gray-500">
            {isSignUpMode ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}
          </Text>
          <Button variant="link" onPress={() => setIsSignUpMode(!isSignUpMode)} className="p-0 h-auto">
            <ButtonText className="text-purple-400 font-bold">
              {isSignUpMode ? "Inicia Sesión" : "Regístrate"}
            </ButtonText>
          </Button>
        </VStack>

        {/* Clerk branding */}
        <VStack className="items-center mt-4 pt-4 border-t border-gray-700">
          <Text className="text-gray-500 text-xs">Secured by Clerk</Text>
          <Text className="text-orange-400 text-xs">Development mode</Text>
        </VStack>
      </VStack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F2937",
    padding: 16,
  },
});
