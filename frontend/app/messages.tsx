import { AuthGate } from "@/components/AuthGate";
import { View, ScrollView } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { MessageSquare, Inbox, Bell } from "lucide-react-native";

export default function MessagesScreen() {
  return (
    <AuthGate message="Inicia sesión para ver tus mensajes.">
      <View className="flex-1 bg-[#fafafa]">
        <StatusBar style="dark" />
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
              <View className="relative overflow-hidden rounded-[28px] bg-[#09090b] px-6 py-8">
                <View className="z-10">
                  <Text className="text-[11px] uppercase text-gray-400 tracking-[1.5px] font-bold mb-1">
                    Comunicaciones
                  </Text>
                  <Text className="text-3xl font-extrabold text-white mb-2">
                    Mensajes del{"\n"}vendedor
                  </Text>
                  <Text className="text-sm text-gray-300 max-w-[220px]">
                    Sigue el estado de tus consultas y novedades de tus compras.
                  </Text>
                </View>

                <View className="absolute right-6 top-8">
                  <MessageSquare size={80} color="rgba(255,255,255,0.05)" />
                </View>
              </View>
            </View>

            {/* Inbox Empty State / Coming Soon */}
            <View className="mt-12 px-5">
              <View className="rounded-[28px] border border-slate-200/70 bg-white p-6">
              <View className="mb-6 h-16 w-16 items-center justify-center rounded-[24px] border border-slate-200 bg-slate-100">
                <Inbox size={32} color="#09090b" />
              </View>

              <Text className="mb-2 text-xl font-black tracking-[-0.3px] text-[#09090b]">
                Tu bandeja está vacía
              </Text>
              <Text className="mb-8 max-w-[280px] text-sm leading-5 text-zinc-600">
                Próximamente: podrás chatear directamente con los vendedores y
                recibir atención personalizada.
              </Text>

              {/* Feature preview cards */}
              <View className="w-full gap-4">
                <View className="flex-row items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-white">
                    <Bell size={20} color="#6B7280" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-sm font-bold text-gray-700">
                      Notificaciones en tiempo real
                    </Text>
                    <Text className="text-xs text-gray-400">
                      Recibe alertas al instante
                    </Text>
                  </View>
                </View>
              </View>
              </View>
            </View>

            {/* Visual Hint */}
            <View className="px-10 mt-12">
              <View className="h-[1px] bg-gray-100 w-full" />
              <Text className="text-[10px] text-center text-gray-300 mt-4 uppercase tracking-widest font-bold">
                HealthBytes Messaging v1.0
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </AuthGate>
  );
}
