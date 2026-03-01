import { View, ScrollView, Pressable, Linking } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Header } from "@/components/Header";
import { Mail, MessageCircle, ChevronRight, HelpCircle } from "lucide-react-native";

export default function SupportScreen() {
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL('mailto:healthbytes@gmail.com');
  };

  return (
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
                  Centro de Ayuda
                </Text>
                <Text className="text-3xl font-extrabold text-white mb-2">
                  Estamos para{"\n"}asistirte
                </Text>
                <Text className="text-sm text-gray-300 max-w-[200px]">
                  Tu bienestar es nuestra prioridad. Contáctanos hoy mismo.
                </Text>
              </View>

              {/* Abstract decoration */}
              <View
                className="absolute -right-10 -bottom-10 w-44 h-44 bg-green-500/20 rounded-full"
                style={{ transform: [{ scale: 1.5 }] }}
              />
              <View className="absolute right-6 top-8">
                <HelpCircle size={80} color="rgba(255,255,255,0.05)" />
              </View>
            </View>
          </View>

          {/* Contact Methods */}
          <View className="px-5 mt-8">
            <Text className="text-lg font-bold text-gray-900 mb-4 px-1">
              Canales de contacto
            </Text>

            {/* Email Card */}
            <Pressable
              onPress={handleEmailPress}
              className="bg-gray-50 rounded-2xl p-5 flex-row items-center border border-gray-100 mb-4 active:bg-gray-100"
            >
              <View className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-sm border border-gray-100">
                <Mail size={24} color="#16A34A" />
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-sm font-bold text-gray-900">Escríbenos por correo</Text>
                <Text className="text-xs text-gray-500">healthbytes@gmail.com</Text>
              </View>
              <ChevronRight size={20} color="#D1D5DB" />
            </Pressable>

            {/* Chat Card (Coming Soon) */}
            <View className="bg-gray-50 rounded-2xl p-5 flex-row items-center border border-gray-100 opacity-60">
              <View className="w-12 h-12 bg-white rounded-full items-center justify-center border border-gray-100">
                <MessageCircle size={24} color="#6B7280" />
              </View>
              <View className="flex-1 ml-4">
                <View className="flex-row items-center">
                  <Text className="text-sm font-bold text-gray-900">Chat en vivo</Text>
                  <View className="ml-2 bg-gray-200 px-2 py-0.5 rounded-md">
                    <Text className="text-[9px] font-bold text-gray-500">PRÓXIMAMENTE</Text>
                  </View>
                </View>
                <Text className="text-xs text-gray-500">Respuesta instantánea</Text>
              </View>
            </View>
          </View>

          {/* Additional Info */}
          <View className="px-5 mt-10">
            <View className="bg-green-50 rounded-3xl p-6 border border-green-100">
              <Text className="text-sm font-semibold text-green-800 mb-2">
                ¿Tienes dudas sobre un producto?
              </Text>
              <Text className="text-xs text-green-700 leading-5">
                Nuestro equipo de expertos revisa cada ingrediente para asegurar que cumpla con los estándares de salud requeridos para tu dieta específica.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
