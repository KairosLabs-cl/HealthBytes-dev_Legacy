import { FormControl } from "@/components/ui/form-control";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "lucide-react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { useState, useCallback } from "react";
import { HStack } from "@/components/ui/hstack";
import { useSignIn, useSignUp, useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export const options = {
  title: "Mi cuenta",
};

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleState = () => {
    setShowPassword((showState) => !showState);
  };

  const onSignIn = useCallback(async () => {
    if (!isSignInLoaded || !signIn) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        router.replace("/");
      } else {
        console.log("Sign in requires additional steps:", result);
        setError("Se requieren pasos adicionales para iniciar sesión");
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.errors?.[0]?.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  }, [isSignInLoaded, signIn, email, password, setSignInActive, router]);

  const onSignUp = useCallback(async () => {
    if (!isSignUpLoaded || !signUp) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId });
        router.replace("/");
      } else {
        // Handle email verification or other steps
        console.log("Sign up requires additional steps:", result);
        setError("Por favor verifica tu email para completar el registro");
      }
    } catch (err: any) {
      console.error("Sign up error:", err);
      setError(err.errors?.[0]?.message || "Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  }, [isSignUpLoaded, signUp, email, password, setSignUpActive, router]);

  // If already signed in, redirect to home
  if (isSignedIn) {
    router.replace("/");
    return null;
  }

  return (
    <FormControl
      isInvalid={!!error}
      className="p-4 border rounded-lg max-w-[500px] border-outline-300 bg-white m-2"
    >
      <VStack space="xl">
        <Heading className="text-typography-900 leading-3 pt-3">
          Inicia Sesión en HealthBytes
        </Heading>

        {error && (
          <Text className="text-red-500 text-sm">{error}</Text>
        )}

        <VStack space="xs">
          <Text className="text-typography-500 leading-1">Email</Text>
          <Input>
            <InputField
              value={email}
              onChangeText={setEmail}
              type="text"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Input>
        </VStack>

        <VStack space="xs">
          <Text className="text-typography-500 leading-1">Password</Text>
          <Input className="text-center">
            <InputField
              value={password}
              onChangeText={setPassword}
              type={showPassword ? "text" : "password"}
            />
            <InputSlot className="pr-3" onPress={handleState}>
              <InputIcon
                as={showPassword ? EyeIcon : EyeOffIcon}
                className="text-darkBlue-500"
              />
            </InputSlot>
          </Input>
        </VStack>

        {isLoading ? (
          <View className="py-4 items-center">
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <HStack space="sm">
            <Button
              className="flex-1"
              variant="outline"
              onPress={onSignUp}
              isDisabled={!email || !password}
            >
              <ButtonText>Registrarse</ButtonText>
            </Button>
            <Button
              className="flex-1"
              onPress={onSignIn}
              isDisabled={!email || !password}
            >
              <ButtonText>Iniciar Sesión</ButtonText>
            </Button>
          </HStack>
        )}
      </VStack>
    </FormControl>
  );
}
