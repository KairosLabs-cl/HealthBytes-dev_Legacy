import { AuthGate } from "@/components/AuthGate";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  CheckCircle2,
  Heart,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  PackageOpen,
  Phone,
  Salad,
  Settings,
  Truck,
} from "lucide-react-native";
import {
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const orderStatuses = [
  {
    label: "No confirmado",
    icon: Package,
    status: "pending",
  },
  {
    label: "Confirmado",
    icon: PackageOpen,
    status: "confirmed",
  },
  {
    label: "En tránsito",
    icon: Truck,
    status: "in_transit",
  },
  {
    label: "Despachado",
    icon: Truck,
    status: "shipped",
  },
  {
    label: "Enviado",
    icon: CheckCircle2,
    status: "delivered",
  },
];

const options = [
  { label: "Mensajes del vendedor", icon: MessageSquare, href: "/messages" },
  { label: "Preferencias alimentarias", icon: Salad, href: "/dietary-preferences" },
  { label: "Direcciones", icon: MapPin, href: "/addresses" },
  { label: "Lista de deseos", icon: Heart, href: "/wishlist" },
  { label: "Contactate con soporte", icon: Phone, href: "/support" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();

  const { user } = useUser();

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <AuthGate message="Inicia sesion para ver tu perfil.">
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        className="flex-1 bg-white px-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Perfil del usuario */}
        <View className="rounded-3xl bg-gray-100 flex-row items-center p-4 mb-4">
          <Image
            source={{ uri: user?.imageUrl || "https://via.placeholder.com/80" }}
            className="w-20 h-20 rounded-full"
          />
          <View className="ml-4 flex-1">
            <Text className="text-xl font-bold text-black">
              {user?.fullName || "Usuario"}
            </Text>
            <Text className="text-sm text-gray-700">
              {user?.primaryEmailAddress?.emailAddress || "Sin email"}
            </Text>
          </View>
          {/* Botón de Settings - para futuro uso */}
          <Pressable
            className="w-12 h-12 bg-black rounded-2xl items-center justify-center"
            onPress={() => router.push("/profile-settings")}
          >
            <Icon as={Settings} color="#ffffff" size="lg" />
          </Pressable>
        </View>

        <View className="bg-[#303030] rounded-3xl p-4 mb-4">
          <View className="flex-row items-center mb-1">
            <Icon as={PackageOpen} color="#ffffff" size="lg" />
            <Text className="text-white text-lg font-semibold ml-2">
              Mis órdenes
            </Text>
          </View>
          <Text className="text-gray-300 text-xs mb-3">
            Ve el estado de tus compras!
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingRight: 4 }}
          >
            {orderStatuses.map((item) => (
              <Pressable
                key={item.label}
                className="bg-white rounded-2xl px-3 py-2 items-center justify-center"
                style={{ minWidth: 88 }}
                onPress={() =>
                  router.push({
                    pathname: "/orders",
                    params: { status: item.status },
                  })
                }
              >
                <Icon
                  as={item.icon}
                  color="#1f2937"
                  size="lg"
                  className="mb-1"
                />
                <Text className="text-[11px] text-black font-semibold text-center">
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View className="mb-3 flex-row items-center">
          <Icon as={Settings} color="#000000" size="lg" className="mr-2" />
          <Text className="text-xl font-bold text-black">General</Text>
        </View>

        {options.map((item) => (
          <Pressable
            key={item.label}
            className="bg-black rounded-3xl flex-row items-center px-4 py-4 mb-3"
            onPress={() => router.push(item.href)}
          >
            <View className="w-12 h-12 bg-gray-200 rounded-2xl items-center justify-center mr-3">
              <Icon as={item.icon} color="#1f2937" size="lg" />
            </View>
            <Text className="text-white text-lg font-bold">{item.label}</Text>
          </Pressable>
        ))}

        <Pressable
          className="rounded-3xl overflow-hidden"
          onPress={handleLogout}
        >
          <View className="bg-red-600 flex-row items-center px-4 py-4">
            <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-3">
              <Icon as={LogOut} color="#d12d2d" size="lg" />
            </View>
            <Text className="text-white text-lg font-bold">
              Salir de la cuenta
            </Text>
          </View>
        </Pressable>

        {/* Footer simple y limpio */}
        <View className="mt-16 mb-8 items-center">
          <Text className="text-xs text-gray-400 mb-2">Versión 1.0.0</Text>
          <Text className="text-xs text-gray-500">
            Hecho con ❤️ por el equipo de HealthBytes
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
    </AuthGate>
  );
}
