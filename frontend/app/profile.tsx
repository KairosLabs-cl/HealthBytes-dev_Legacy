import { RecentOrders } from "@/components/RecentOrders";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useOrders } from "@/store/orderStore";
import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  CheckCircle2,
  CreditCard,
  Heart,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  PackageOpen,
  Phone,
  Settings,
  Truck,
} from "lucide-react-native";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const orderStatuses = [
  {
    label: "Preparando",
    icon: Package,
    status: "pending",
  },
  {
    label: "En tránsito",
    icon: Truck,
    status: "in_transit",
  },
  {
    label: "Entregado o por entregar",
    icon: CheckCircle2,
    status: "delivered",
  },
];

const options = [
  { label: "Direcciones", icon: MapPin, href: "/addresses" },
  { label: "Metodos de pago", icon: CreditCard, href: "/payments" },
  { label: "Lista de deseos", icon: Heart, href: "/wishlist" },
  { label: "Contactate con soporte", icon: Phone, href: "/support" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const { orders, isLoading, fetchOrders } = useOrders();

  useEffect(() => {
    // This just ensures the header is properly styled
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/(auth)/login");
    }
  }, [isLoaded, isSignedIn]);

  // Cargar órdenes cuando se autentica
  useEffect(() => {
    if (isSignedIn && isLoaded) {
      loadOrders();
    }
  }, [isSignedIn, isLoaded]);

  const loadOrders = async () => {
    try {
      const token = await getToken();
      if (token) {
        await fetchOrders(token);
      }
    } catch (err) {
      console.error("Error loading orders in profile:", err);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  // Mostrar loading mientras verifica autenticación
  if (!isLoaded) {
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
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ title: "Mi Perfil" }} />

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

        {/* Órdenes Recientes */}
        <RecentOrders
          orders={orders}
          isLoading={isLoading}
          onViewAll={() => router.push("/orders")}
        />

        <View className="bg-[#303030] rounded-3xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center">
              <Icon as={PackageOpen} color="#ffffff" size="lg" />
              <Text className="text-white text-lg font-semibold ml-2">
                Mis órdenes
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/orders")}
              className="bg-white/20 rounded-full p-2 active:bg-white/30"
            >
              <Icon as={Truck} color="#ffffff" size="sm" />
            </Pressable>
          </View>
          <Text className="text-gray-300 text-xs mb-3">
            Ve el estado de tus compras!
          </Text>
          <View className="flex-row justify-between">
            {orderStatuses.map((item) => (
              <Pressable
                key={item.label}
                className="bg-white rounded-2xl px-3 py-2 items-center justify-center w-[30%]"
                onPress={() => router.push(`/orders?filter=${item.status}`)}
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
          </View>
          <Pressable
            className="bg-white rounded-2xl px-3 py-2 mt-3 flex-row items-center justify-center"
            onPress={() => router.push("/messages")}
          >
            <Icon as={MessageSquare} color="#1f2937" size="lg" />
            <Text className="text-[12px] text-black font-semibold ml-2">
              Mensajes del vendedor
            </Text>
          </Pressable>
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
  );
}
