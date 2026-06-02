import { AuthGate } from "@/components/AuthGate";
import { View, ScrollView, Pressable, Linking } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import {
  Mail,
  MessageCircle,
  ChevronRight,
  HelpCircle,
} from "lucide-react-native";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function SupportScreen() {
  const { palette, statusBarStyle } = useAppTheme();

  const handleEmailPress = () => {
    Linking.openURL("mailto:healthbytes@gmail.com");
  };

  return (
    <AuthGate message="Inicia sesión para contactar soporte.">
      <View
        className="flex-1"
        style={{ backgroundColor: palette.colors.surface.warm }}
      >
        <StatusBar style={statusBarStyle} />
        <Stack.Screen options={{ headerShown: false }} />

        <ScreenHeader
          title="Centro de Ayuda"
          icon={HelpCircle}
          showBackButton={true}
        />

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-20"
        >
          <View className="max-w-[800px] mx-auto w-full">
            {/* Hero Section */}
            <View className="px-5 mt-4">
              <View
                className="relative overflow-hidden rounded-[28px] px-6 py-8"
                style={{ backgroundColor: palette.colors.ink.primary }}
              >
                <View className="z-10">
                  <Text
                    className="text-[11px] uppercase tracking-[1.5px] font-bold mb-1"
                    style={{ color: palette.colors.ink.subtle }}
                  >
                    Centro de Ayuda
                  </Text>
                  <Text
                    className="text-3xl font-extrabold mb-2"
                    style={{ color: palette.colors.ink.inverse }}
                  >
                    Estamos para{"\n"}asistirte
                  </Text>
                  <Text
                    className="text-sm max-w-[200px]"
                    style={{ color: palette.colors.ink.subtle }}
                  >
                    Tu bienestar es nuestra prioridad. Contáctanos hoy mismo.
                  </Text>
                </View>

                <View className="absolute right-6 top-8">
                  <HelpCircle
                    size={80}
                    color={`${palette.colors.ink.inverse}0D`}
                  />
                </View>
              </View>
            </View>

            {/* Contact Methods */}
            <View className="px-5 mt-8">
              <Text
                className="mb-4 px-1 text-lg font-black tracking-[-0.2px]"
                style={{ color: palette.colors.ink.primary }}
              >
                Canales de contacto
              </Text>

              {/* Email Card */}
              <Pressable
                onPress={handleEmailPress}
                className="mb-4 flex-row items-center rounded-[24px] border p-5 active:opacity-85"
                style={{
                  backgroundColor: palette.colors.surface.card,
                  borderColor: palette.colors.border.subtle,
                }}
              >
                <View
                  className="h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: palette.colors.accent.light }}
                >
                  <Mail size={24} color={palette.colors.icon.accent} />
                </View>
                <View className="flex-1 ml-4">
                  <Text
                    className="text-sm font-bold"
                    style={{ color: palette.colors.ink.primary }}
                  >
                    Escríbenos por correo
                  </Text>
                  <Text
                    className="text-xs"
                    style={{ color: palette.colors.ink.muted }}
                  >
                    healthbytes@gmail.com
                  </Text>
                </View>
                <ChevronRight size={20} color={palette.colors.icon.muted} />
              </Pressable>

              {/* Chat Card (Coming Soon) */}
              <View
                className="flex-row items-center rounded-[24px] border p-5 opacity-60"
                style={{
                  backgroundColor: palette.colors.surface.card,
                  borderColor: palette.colors.border.subtle,
                }}
              >
                <View
                  className="h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: palette.colors.surface.muted }}
                >
                  <MessageCircle size={24} color={palette.colors.icon.muted} />
                </View>
                <View className="flex-1 ml-4">
                  <View className="flex-row items-center">
                    <Text
                      className="text-sm font-bold"
                      style={{ color: palette.colors.ink.primary }}
                    >
                      Chat en vivo
                    </Text>
                    <View
                      className="ml-2 rounded-md px-2 py-0.5"
                      style={{ backgroundColor: palette.colors.surface.muted }}
                    >
                      <Text
                        className="text-[9px] font-bold"
                        style={{ color: palette.colors.ink.muted }}
                      >
                        PRÓXIMAMENTE
                      </Text>
                    </View>
                  </View>
                  <Text
                    className="text-xs"
                    style={{ color: palette.colors.ink.muted }}
                  >
                    Respuesta instantánea
                  </Text>
                </View>
              </View>
            </View>

            {/* Additional Info */}
            <View className="px-5 mt-10">
              <View
                className="rounded-[24px] border p-6"
                style={{
                  backgroundColor: `${palette.colors.state.success}1F`,
                  borderColor: `${palette.colors.state.success}3D`,
                }}
              >
                <Text
                  className="text-sm font-semibold mb-2"
                  style={{ color: palette.colors.state.success }}
                >
                  ¿Tienes dudas sobre un producto?
                </Text>
                <Text
                  className="text-xs leading-5"
                  style={{ color: palette.colors.state.success }}
                >
                  Nuestro equipo de expertos revisa cada ingrediente para
                  asegurar que cumpla con los estándares de salud requeridos
                  para tu dieta específica.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </AuthGate>
  );
}
