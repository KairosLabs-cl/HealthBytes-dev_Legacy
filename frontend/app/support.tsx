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

export default function SupportScreen() {
  const handleEmailPress = () => {
    Linking.openURL("mailto:healthbytes@gmail.com");
  };

  return (
    <AuthGate message="Inicia sesión para contactar soporte.">
      <View className="flex-1 bg-[#fafafa]">
        <StatusBar style="dark" />
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
              <View className="relative overflow-hidden rounded-[28px] bg-[#09090b] px-6 py-8">
                <View className="z-10">
                  <Text className="text-[11px] uppercase text-gray-400 tracking-[1.5px] font-bold mb-1">
                    Centro de Ayuda
                  </Text>
                  <Text className="text-3xl font-extrabold text-white mb-2">
                    Estamos para{"\n"}asistirte
                  </Text>
                  <Text className="text-sm text-gray-300 max-w-[200px]">
                    Tu bienestar es nuestra prioridad. Contáctanos hoy mismo.
                  </Text>
                </View>

                <View className="absolute right-6 top-8">
                  <HelpCircle size={80} color="rgba(255,255,255,0.05)" />
                </View>
              </View>
            </View>

            {/* Contact Methods */}
            <View className="px-5 mt-8">
              <Text className="mb-4 px-1 text-lg font-black tracking-[-0.2px] text-[#09090b]">
                Canales de contacto
              </Text>

              {/* Email Card */}
              <Pressable
                onPress={handleEmailPress}
                className="mb-4 flex-row items-center rounded-[24px] border border-slate-200/70 bg-white p-5 active:bg-slate-50"
              >
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                  <Mail size={24} color="#16A34A" />
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-sm font-bold text-gray-900">
                    Escríbenos por correo
                  </Text>
                  <Text className="text-xs text-gray-500">
                    healthbytes@gmail.com
                  </Text>
                </View>
                <ChevronRight size={20} color="#D1D5DB" />
              </Pressable>

              {/* Chat Card (Coming Soon) */}
              <View className="flex-row items-center rounded-[24px] border border-slate-200/70 bg-white p-5 opacity-60">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                  <MessageCircle size={24} color="#6B7280" />
                </View>
                <View className="flex-1 ml-4">
                  <View className="flex-row items-center">
                    <Text className="text-sm font-bold text-gray-900">
                      Chat en vivo
                    </Text>
                    <View className="ml-2 rounded-md bg-slate-200 px-2 py-0.5">
                      <Text className="text-[9px] font-bold text-gray-500">
                        PRÓXIMAMENTE
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-gray-500">
                    Respuesta instantánea
                  </Text>
                </View>
              </View>
            </View>

            {/* Additional Info */}
            <View className="px-5 mt-10">
              <View className="rounded-[24px] border border-emerald-100 bg-emerald-50 p-6">
                <Text className="text-sm font-semibold text-green-800 mb-2">
                  ¿Tienes dudas sobre un producto?
                </Text>
                <Text className="text-xs text-green-700 leading-5">
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
