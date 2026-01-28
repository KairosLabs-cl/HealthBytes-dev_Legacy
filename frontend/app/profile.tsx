import { ScrollView, View, Image, Pressable, ActivityIndicator } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import {
  Settings,
  Package,
  Truck,
  CheckCircle2,
  MessageSquare,
  Heart,
  CreditCard,
  Shield,
  Phone,
  LogOut,
} from "lucide-react-native";
import { useClerk, useAuth, useUser } from "@clerk/clerk-expo";
import { useEffect } from "react";

const orderStatuses = [
  { label: "Empacado", icon: Package },
  { label: "En transito", icon: Truck },
  { label: "Entregado", icon: CheckCircle2 },
];

const options = [
  { label: "Mensaje del vendedor", icon: MessageSquare },
  { label: "Lista de deseos", icon: Heart },
  { label: "Metodos de pago", icon: CreditCard },
  { label: "Seguridad", icon: Shield },
  { label: "Contactate con soporte", icon: Phone },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/(auth)/login");
    }
  }, [isLoaded, isSignedIn]);

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  // Mostrar loading mientras verifica autenticación
  if (!isLoaded || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-4 text-gray-500">Cargando...</Text>
      </View>
    );
  }

  // Si no está logeado, no renderizar nada (el useEffect redirigirá)
  if (!isSignedIn) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView className="flex-1 bg-white px-4 pt-6 pb-28">
        <View className="mb-4">
          <Text className="text-2xl font-bold text-black">👤 Perfil</Text>
        </View>

        <View className="bg-gray-200 rounded-3xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-3">
              <Image source={{ uri: user.imageUrl }} className="w-20 h-20 rounded-full" />
              <View>
                <Text className="text-xl font-bold text-black">{user.fullName}</Text>
                <Text className="text-sm text-gray-700">{user.primaryEmailAddress?.emailAddress}</Text>
              </View>
            </View>
            <View className="w-12 h-12 bg-black rounded-2xl items-center justify-center">
              <Icon as={Settings} color="#ffffff" size={24} />
            </View>
          </View>

          <View className="bg-[#303030] rounded-3xl p-4">
            <Text className="text-white text-lg font-semibold mb-3">🚚 Mis ordenes</Text>
            <View className="flex-row justify-between">
              {orderStatuses.map((item) => (
                <View
                  key={item.label}
                  className="bg-white rounded-2xl px-3 py-2 items-center justify-center w-[30%]"
                >
                  <Icon as={item.icon} color="#1f2937" size={20} />
                  <Text className="text-xs text-black mt-1">{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="mb-3">
          <Text className="text-xl font-bold text-black">⚙️ General</Text>
        </View>

        {options.map((item) => (
          <View
            key={item.label}
            className="bg-black rounded-3xl flex-row items-center px-4 py-4 mb-3"
          >
            <View className="w-12 h-12 bg-[#1f1f1f] rounded-2xl items-center justify-center mr-3">
              <Icon as={item.icon} color="#e5e7eb" size={24} />
            </View>
            <Text className="text-white text-lg font-bold">{item.label}</Text>
          </View>
        ))}

        <Pressable className="rounded-3xl overflow-hidden" onPress={handleLogout}>
          <View className="bg-red-600 flex-row items-center px-4 py-4">
            <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-3">
              <Icon as={LogOut} color="#d12d2d" size={24} />
            </View>
            <Text className="text-white text-lg font-bold">
              Salir de la cuenta
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </>
  );
}
