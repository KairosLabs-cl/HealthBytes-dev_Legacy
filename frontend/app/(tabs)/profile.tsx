import { AuthGate } from "@/components/AuthGate";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useClerk, useUser } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  CreditCard,
  Heart,
  LogOut,
  MapPin,
  MessageSquare,
  PackageOpen,
  Phone,
  RotateCcw,
  Salad,
  Settings,
  Truck,
  User as UserIcon,
} from "lucide-react-native";
import { Pressable, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

const orderStatuses = [
  {
    label: "Sin pagar",
    icon: CreditCard,
    status: "unpaid",
  },
  {
    label: "En proceso",
    icon: PackageOpen,
    status: "processing",
  },
  {
    label: "Enviado",
    icon: Truck,
    status: "shipped",
  },
  {
    label: "Devolución",
    icon: RotateCcw,
    status: "returns",
  },
];

const options = [
  { label: "Mensajes del vendedor", icon: MessageSquare, href: "/messages" },
  {
    label: "Preferencias alimentarias",
    icon: Salad,
    href: "/dietary-preferences",
  },
  { label: "Direcciones", icon: MapPin, href: "/addresses" },
  { label: "Lista de deseos", icon: Heart, href: "/wishlist" },
  { label: "Contactate con soporte", icon: Phone, href: "/support" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();

  const { user } = useUser();
  const displayName = user?.fullName || user?.firstName || "Usuario";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <AuthGate message="Inicia sesion para ver tu perfil.">
      <View className="flex-1 bg-[#fafafa]">
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Perfil" icon={UserIcon} />

        <ScrollView
          className="flex-1 bg-[#fafafa]"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Perfil del usuario */}
          <View className="mb-4 flex-row items-center rounded-[28px] border border-slate-200/70 bg-white p-4">
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                style={{ width: 80, height: 80, borderRadius: 24 }}
                alt="Foto de perfil"
                cachePolicy="disk"
              />
            ) : (
              <View className="h-20 w-20 items-center justify-center rounded-[24px] bg-[#09090b]">
                <Text className="text-2xl font-black text-white">
                  {initials || "HB"}
                </Text>
              </View>
            )}
            <View className="ml-4 flex-1">
              <Text className="text-xl font-black tracking-[-0.3px] text-[#09090b]">
                {displayName}
              </Text>
              <Text className="text-sm text-zinc-600">
                {user?.primaryEmailAddress?.emailAddress || "Sin email"}
              </Text>
            </View>
            <Pressable
              className="h-12 w-12 items-center justify-center rounded-2xl bg-[#09090b]"
              onPress={() => router.push("/profile-settings")}
              accessibilityRole="button"
              accessibilityLabel="Abrir configuración de perfil"
            >
              <Icon as={Settings} color="#ffffff" size="lg" />
            </Pressable>
          </View>

          <View className="mb-4 rounded-[28px] bg-[#09090b] p-4">
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
                  className="items-center justify-center rounded-2xl bg-white px-3 py-2"
                  style={{ minHeight: 56, minWidth: 88 }}
                  onPress={() =>
                    router.push({
                      pathname: "/orders",
                      params: { status: item.status },
                    })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`Ver órdenes ${item.label.toLowerCase()}`}
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
            <Text className="text-xl font-black tracking-[-0.2px] text-[#09090b]">General</Text>
          </View>

          <View className="mb-3 overflow-hidden rounded-[24px] border border-slate-200/70 bg-white">
            {options.map((item, index) => (
              <Pressable
                key={item.label}
                className="flex-row items-center px-4 py-4"
                style={{
                  minHeight: 64,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: "rgba(226,232,240,0.8)",
                }}
                onPress={() => router.push(item.href)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <View className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                  <Icon as={item.icon} color="#09090b" size="lg" />
                </View>
                <Text className="text-base font-bold text-[#09090b]">
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            className="overflow-hidden rounded-[24px]"
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel="Salir de la cuenta"
          >
            <View className="flex-row items-center bg-red-600 px-4 py-4">
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
              Hecho por el equipo de HealthBytes
            </Text>
          </View>
        </ScrollView>
      </View>
    </AuthGate>
  );
}
