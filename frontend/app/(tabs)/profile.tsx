import { AuthGate } from "@/components/AuthGate";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useClerk, useUser } from "@clerk/clerk-expo";
import Constants from "expo-constants";
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
import { useAppTheme } from "@/hooks/useAppTheme";

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
  // { label: "Mensajes del vendedor", icon: MessageSquare, href: "/messages" },
  {
    label: "Preferencias alimentarias",
    icon: Salad,
    href: "/dietary-preferences",
  },
  // { label: "Direcciones", icon: MapPin, href: "/addresses" },
  { label: "Lista de deseos", icon: Heart, href: "/wishlist" },
  { label: "Contactate con soporte", icon: Phone, href: "/support" },
];

/**
 * ProfileScreen component that displays user information, orders summary,
 * and general settings options.
 *
 * @returns {JSX.Element} The rendered ProfileScreen component.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { palette, statusBarStyle } = useAppTheme();

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
      <View
        className="flex-1"
        style={{ backgroundColor: palette.colors.surface.warm }}
      >
        <StatusBar style={statusBarStyle} />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Perfil" icon={UserIcon} />

        <ScrollView
          className="flex-1"
          style={{ backgroundColor: palette.colors.surface.warm }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Perfil del usuario */}
          <View
            className="mb-4 flex-row items-center rounded-[28px] border p-4"
            style={{
              backgroundColor: palette.colors.surface.card,
              borderColor: palette.colors.border.subtle,
            }}
          >
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                style={{ width: 80, height: 80, borderRadius: 24 }}
                alt="Foto de perfil"
                cachePolicy="disk"
              />
            ) : (
              <View
                className="h-20 w-20 items-center justify-center rounded-[24px]"
                style={{ backgroundColor: palette.colors.accent.primary }}
              >
                <Text
                  className="text-2xl font-black"
                  style={{ color: palette.colors.ink.inverse }}
                >
                  {initials || "HB"}
                </Text>
              </View>
            )}
            <View className="ml-4 flex-1">
              <Text
                className="text-xl font-black tracking-[-0.3px]"
                style={{ color: palette.colors.ink.primary }}
              >
                {displayName}
              </Text>
              <Text
                className="text-sm"
                style={{ color: palette.colors.ink.muted }}
              >
                {user?.primaryEmailAddress?.emailAddress || "Sin email"}
              </Text>
            </View>
            <Pressable
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: palette.colors.accent.primary }}
              onPress={() => router.push("/profile-settings")}
              accessibilityRole="button"
              accessibilityLabel="Abrir configuración de perfil"
            >
              <Icon
                as={Settings}
                color={palette.colors.ink.inverse}
                size="lg"
              />
            </Pressable>
          </View>

          <Pressable
            className="mb-4 rounded-[28px] p-4 flex-row items-center justify-between"
            style={{ backgroundColor: palette.colors.accent.primary }}
            onPress={() => router.push("/orders")}
            accessibilityRole="button"
            accessibilityLabel="Ver mi historial de búsqueda"
          >
            <View>
              <View className="flex-row items-center mb-1">
                <Icon
                  as={PackageOpen}
                  color={palette.colors.ink.inverse}
                  size="lg"
                />
                <Text
                  className="text-lg font-semibold ml-2"
                  style={{ color: palette.colors.ink.inverse }}
                >
                  Mi historial
                </Text>
              </View>
              <Text
                className="text-xs"
                style={{ color: palette.colors.ink.inverse }}
              >
                ¡Revisa los productos que has buscado!
              </Text>
            </View>
          </Pressable>

          <View className="mb-3 flex-row items-center">
            <Icon
              as={Settings}
              color={palette.colors.icon.primary}
              size="lg"
              className="mr-2"
            />
            <Text
              className="text-xl font-black tracking-[-0.2px]"
              style={{ color: palette.colors.ink.primary }}
            >
              General
            </Text>
          </View>

          <View
            className="mb-3 overflow-hidden rounded-[24px] border"
            style={{
              backgroundColor: palette.colors.surface.card,
              borderColor: palette.colors.border.subtle,
            }}
          >
            {options.map((item, index) => (
              <Pressable
                key={item.label}
                className="flex-row items-center px-4 py-4"
                style={{
                  minHeight: 64,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: palette.colors.border.subtle,
                }}
                onPress={() => router.push(item.href)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <View
                  className="mr-3 h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: palette.colors.surface.muted }}
                >
                  <Icon
                    as={item.icon}
                    color={palette.colors.icon.primary}
                    size="lg"
                  />
                </View>
                <Text
                  className="text-base font-bold"
                  style={{ color: palette.colors.ink.primary }}
                >
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
            <View
              className="flex-row items-center px-4 py-4"
              style={{ backgroundColor: palette.colors.state.error }}
            >
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                style={{ backgroundColor: palette.colors.surface.card }}
              >
                <Icon
                  as={LogOut}
                  color={palette.colors.state.error}
                  size="lg"
                />
              </View>
              <Text
                className="text-lg font-bold"
                style={{ color: palette.colors.ink.inverse }}
              >
                Salir de la cuenta
              </Text>
            </View>
          </Pressable>

          {/* Footer simple y limpio */}
          <View className="mt-16 mb-8 items-center">
            <Text
              className="text-xs mb-2"
              style={{ color: palette.colors.ink.subtle }}
            >
              Versión {Constants.expoConfig?.version ?? "0.4.0"}
            </Text>
            <Text
              className="text-xs"
              style={{ color: palette.colors.ink.muted }}
            >
              Hecho por el equipo de HealthBytes
            </Text>
          </View>
        </ScrollView>
      </View>
    </AuthGate>
  );
}
