/// <reference types="nativewind/types" />
import { AuthGate } from "@/components/AuthGate";
import { Pressable, ScrollView, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect, useState } from "react";
import { Check, Salad } from "lucide-react-native";
import { usePreferencesStore } from "@/store/preferencesStore";
import { updateDietaryPreferences } from "@/api/preferences";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { DIETARY_OPTIONS } from "@/lib/dietaryOptions";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function DietaryPreferencesScreen() {
  const { getToken } = useAuth();
  const { palette, statusBarStyle } = useAppTheme();
  // ⚡ Bolt: Use granular selectors to avoid re-renders when other preferences change
  const dietaryPreferences = usePreferencesStore(
    (state) => state.dietaryPreferences
  );
  const setDietaryPreferences = usePreferencesStore(
    (state) => state.setDietaryPreferences
  );
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
      setSuccess("Preferencias guardadas");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("No se pudieron guardar las preferencias. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthGate message="Inicia sesión para configurar tus preferencias dietéticas.">
      <View
        className="flex-1"
        style={{ backgroundColor: palette.colors.surface.warm }}
      >
        <StatusBar style={statusBarStyle} />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Preferencias alimentarias"
          icon={Salad}
          showBackButton={true}
        />

        <ScrollView
          className="flex-1 px-6 pt-6"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            className="text-sm mb-6"
            style={{ color: palette.colors.ink.muted }}
          >
            Selecciona tus restricciones para filtrar automáticamente los
            productos.
          </Text>

          <View className="flex-row flex-wrap gap-3 mb-4">
            {DIETARY_OPTIONS.map(({ slug, label, icon: DietaryIcon }) => {
              const isActive = selectedTags.includes(slug);
              return (
                <Pressable
                  key={slug}
                  onPress={() => toggleTag(slug)}
                  style={{
                    minHeight: 48,
                    backgroundColor: isActive
                      ? palette.colors.accent.primary
                      : palette.colors.surface.card,
                    borderColor: isActive
                      ? palette.colors.accent.primary
                      : palette.colors.border.subtle,
                  }}
                  className="flex-row items-center gap-2 rounded-2xl border px-4 py-3"
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isActive }}
                >
                  <View
                    className="h-5 w-5 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: isActive
                        ? palette.colors.brand.green
                        : palette.colors.surface.muted,
                    }}
                  >
                    {isActive && (
                      <Check
                        size={13}
                        color={palette.colors.ink.inverse}
                        strokeWidth={2.8}
                      />
                    )}
                    {!isActive && (
                      <DietaryIcon
                        size={13}
                        color={palette.colors.icon.primary}
                        strokeWidth={2.2}
                      />
                    )}
                  </View>
                  <Text
                    className="text-sm font-semibold"
                    style={{
                      color: isActive
                        ? palette.colors.ink.inverse
                        : palette.colors.ink.primary,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {error && (
            <View
              className="mb-4 rounded-2xl border p-3"
              style={{
                backgroundColor: palette.colors.surface.elevated,
                borderColor: palette.colors.state.error,
              }}
            >
              <Text
                className="text-sm"
                style={{ color: palette.colors.state.error }}
              >
                {error}
              </Text>
            </View>
          )}
          {success && (
            <View
              className="mb-4 rounded-2xl border p-3"
              style={{
                backgroundColor: palette.colors.surface.elevated,
                borderColor: palette.colors.state.success,
              }}
            >
              <Text
                className="text-sm"
                style={{ color: palette.colors.state.success }}
              >
                {success}
              </Text>
            </View>
          )}

          <Button
            onPress={handleSave}
            className="min-h-[52px] flex-row items-center justify-center rounded-2xl"
            style={{ backgroundColor: palette.colors.accent.primary }}
            disabled={isSaving}
          >
            <ButtonText
              className="font-semibold text-base text-center leading-5"
              style={{ color: palette.colors.ink.inverse }}
            >
              {isSaving ? "Guardando..." : "Guardar preferencias"}
            </ButtonText>
          </Button>
        </ScrollView>
      </View>
    </AuthGate>
  );
}
