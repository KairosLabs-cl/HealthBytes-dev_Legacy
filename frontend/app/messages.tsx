import { AuthGate } from "@/components/AuthGate";
import { View, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { MessageSquare, Inbox, Bell } from "lucide-react-native";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function MessagesScreen() {
  const { palette, statusBarStyle } = useAppTheme();

  return (
    <AuthGate message="Inicia sesión para ver tus mensajes.">
      <View
        className="flex-1"
        style={{ backgroundColor: palette.colors.surface.warm }}
      >
        <StatusBar style={statusBarStyle} />
        <Stack.Screen options={{ headerShown: false }} />

        <ScreenHeader
          title="Mensajes"
          icon={MessageSquare}
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
                    Comunicaciones
                  </Text>
                  <Text
                    className="text-3xl font-extrabold mb-2"
                    style={{ color: palette.colors.ink.inverse }}
                  >
                    Mensajes del{"\n"}vendedor
                  </Text>
                  <Text
                    className="text-sm max-w-[220px]"
                    style={{ color: palette.colors.ink.subtle }}
                  >
                    Sigue el estado de tus consultas y novedades de tus compras.
                  </Text>
                </View>

                <View className="absolute right-6 top-8">
                  <MessageSquare
                    size={80}
                    color={`${palette.colors.ink.inverse}0D`}
                  />
                </View>
              </View>
            </View>

            {/* Inbox Empty State / Coming Soon */}
            <View className="mt-12 px-5">
              <View
                className="rounded-[28px] border p-6"
                style={{
                  backgroundColor: palette.colors.surface.card,
                  borderColor: palette.colors.border.subtle,
                }}
              >
                <View
                  className="mb-6 h-16 w-16 items-center justify-center rounded-[24px] border"
                  style={{
                    backgroundColor: palette.colors.surface.muted,
                    borderColor: palette.colors.border.subtle,
                  }}
                >
                  <Inbox size={32} color={palette.colors.icon.primary} />
                </View>

                <Text
                  className="mb-2 text-xl font-black tracking-[-0.3px]"
                  style={{ color: palette.colors.ink.primary }}
                >
                  Tu bandeja está vacía
                </Text>
                <Text
                  className="mb-8 max-w-[280px] text-sm leading-5"
                  style={{ color: palette.colors.ink.muted }}
                >
                  Próximamente: podrás chatear directamente con los vendedores y
                  recibir atención personalizada.
                </Text>

                {/* Feature preview cards */}
                <View className="w-full gap-4">
                  <View
                    className="flex-row items-center rounded-2xl border border-dashed p-4"
                    style={{
                      backgroundColor: palette.colors.surface.elevated,
                      borderColor: palette.colors.border.subtle,
                    }}
                  >
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: palette.colors.surface.card }}
                    >
                      <Bell size={20} color={palette.colors.icon.muted} />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text
                        className="text-sm font-bold"
                        style={{ color: palette.colors.ink.primary }}
                      >
                        Notificaciones en tiempo real
                      </Text>
                      <Text
                        className="text-xs"
                        style={{ color: palette.colors.ink.subtle }}
                      >
                        Recibe alertas al instante
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Visual Hint */}
            <View className="px-10 mt-12">
              <View
                className="h-[1px] w-full"
                style={{ backgroundColor: palette.colors.border.subtle }}
              />
              <Text
                className="text-[10px] text-center mt-4 uppercase tracking-widest font-bold"
                style={{ color: palette.colors.ink.subtle }}
              >
                HealthBytes Messaging v1.0
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </AuthGate>
  );
}
