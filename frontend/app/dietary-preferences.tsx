/// <reference types="nativewind/types" />
import { AuthGate } from "@/components/AuthGate";
import { Pressable, ScrollView, View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { Salad } from "lucide-react-native";
import { usePreferencesStore } from "@/store/preferencesStore";
import { updateDietaryPreferences } from "@/api/preferences";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

const DIETARY_OPTIONS = [
  { slug: "sin-gluten", label: "Sin Gluten", emoji: "🌾" },
  { slug: "vegano", label: "Vegano", emoji: "🌱" },
  { slug: "sin-lactosa", label: "Sin Lactosa", emoji: "🥛" },
  { slug: "bajo-en-azucar", label: "Bajo en azúcar", emoji: "🍬" },
  { slug: "alto-en-proteina", label: "Alto en proteína", emoji: "💪" },
  { slug: "para-diabeticos", label: "Para diabéticos", emoji: "🩺" },
  { slug: "sin-nueces", label: "Sin Nueces", emoji: "🥜" },
  { slug: "sin-mariscos", label: "Sin Mariscos", emoji: "🦐" },
] as const;

export default function DietaryPreferencesScreen() {
  const { getToken } = useAuth();
  const { dietaryPreferences, setDietaryPreferences } = usePreferencesStore();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setSelectedTags(dietaryPreferences);
  }, [dietaryPreferences]);

  const toggleTag = (slug: string) => {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = await getToken();
      if (token) {
        await updateDietaryPreferences(selectedTags, token);
      }
      setDietaryPreferences(selectedTags);
      setSuccess("✓ Preferencias guardadas");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError(
        "❌ No se pudieron guardar las preferencias. Intenta nuevamente."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthGate message="Inicia sesión para configurar tus preferencias dietéticas.">
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader title="Preferencias alimentarias" icon={Salad} showBackButton={true} />

        <ScrollView
          className="flex-1 px-6 pt-6"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-gray-600 text-sm mb-6">
            Selecciona tus restricciones para filtrar automáticamente los
            productos.
          </Text>

          <View className="flex-row flex-wrap gap-3 mb-4">
            {DIETARY_OPTIONS.map(({ slug, label, emoji }) => {
              const isActive = selectedTags.includes(slug);
              return (
                <Pressable
                  key={slug}
                  onPress={() => toggleTag(slug)}
                  style={{ minHeight: 44 }}
                  className={`flex-row items-center gap-2 px-4 py-3 rounded-full border-2 ${
                    isActive
                      ? "bg-green-50 border-green-500"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <Text className="text-base">{emoji}</Text>
                  <Text
                    className={`text-sm font-semibold ${
                      isActive ? "text-green-700" : "text-gray-700"
                    }`}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {error && (
            <View className="bg-red-50 border border-red-300 rounded-lg p-3 mb-4">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          )}
          {success && (
            <View className="bg-green-50 border border-green-300 rounded-lg p-3 mb-4">
              <Text className="text-green-700 text-sm">{success}</Text>
            </View>
          )}

          <Button
            onPress={handleSave}
            className="bg-black rounded-full min-h-[52px] flex-row items-center justify-center"
            disabled={isSaving}
          >
            <ButtonText className="text-white font-semibold text-base text-center leading-5">
              {isSaving ? "Guardando..." : "Guardar preferencias"}
            </ButtonText>
          </Button>
        </ScrollView>
      </View>
    </AuthGate>
  );
}
