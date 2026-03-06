import { AuthGate } from "@/components/AuthGate";
import { View, ScrollView } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Header } from "@/components/Header";
import { MessageSquare, Inbox, Bell } from "lucide-react-native";

export default function MessagesScreen() {
  const router = useRouter();

  return (
    <AuthGate message="Inicia sesión para ver tus mensajes.">
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      <Header userName="Usuario" showBackButton={true} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-20"
      >
        <View className="max-w-[800px] mx-auto w-full">
          {/* Hero Section */}
          <View className="px-5 mt-4">
            <View className="rounded-3xl bg-black px-6 py-8 overflow-hidden relative">
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

              {/* Abstract decoration */}
              <View
                className="absolute -right-8 -bottom-8 w-40 h-40 bg-blue-500/10 rounded-full"
                style={{ transform: [{ scale: 1.8 }] }}
              />
              <View className="absolute right-6 top-8">
                <MessageSquare size={80} color="rgba(255,255,255,0.05)" />
              </View>
            </View>
          </View>

          {/* Inbox Empty State / Coming Soon */}
          <View className="px-5 mt-12 items-center justify-center">
            <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-6 border border-gray-100">
              <Inbox size={40} color="#D1D5DB" />
            </View>

            <Text className="text-xl font-bold text-gray-900 mb-2 text-center">
              Tu bandeja está vacía
            </Text>
            <Text className="text-sm text-gray-500 text-center max-w-[280px] leading-5 mb-8">
              Próximamente: podrás chatear directamente con los vendedores y recibir atención personalizada.
            </Text>

            {/* Feature preview cards */}
            <View className="w-full gap-4">
              <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 border-dashed">
                <View className="w-10 h-10 bg-white rounded-xl items-center justify-center">
                  <Bell size={20} color="#6B7280" />
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-sm font-bold text-gray-700">Notificaciones en tiempo real</Text>
                  <Text className="text-xs text-gray-400">Recibe alertas al instante</Text>
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
    </SafeAreaView>
    </AuthGate>
  );
}
