/// <reference types="nativewind/types" />
import { AuthGate } from "@/components/AuthGate";
import { ScrollView, View, Image, Pressable } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { useUser } from "@clerk/clerk-expo";
import { useEffect, useMemo, useState } from "react";
import { User } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { usePreferencesStore } from "@/store/preferencesStore";
import type { ThemePreference } from "@/lib/themePreference";
import { useAppTheme } from "@/hooks/useAppTheme";

const themeOptions: { label: string; value: ThemePreference }[] = [
  { label: "Automático", value: "system" },
  { label: "Claro", value: "light" },
  { label: "Oscuro", value: "dark" },
];

export default function ProfileSettingsScreen() {
  const { user, isLoaded } = useUser();
  const { palette, statusBarStyle } = useAppTheme();
  const themePreference = usePreferencesStore((state) => state.themePreference);
  const setThemePreference = usePreferencesStore(
    (state) => state.setThemePreference
  );

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
  }, [isLoaded, user]);

  const primaryEmail = useMemo(
    () => user?.primaryEmailAddress?.emailAddress || "Sin email",
    [user]
  );

  const displayName = useMemo(() => {
    if (user?.fullName) return user.fullName;
    return `${firstName} ${lastName}`.trim() || "Usuario";
  }, [firstName, lastName, user?.fullName]);
  const initials = useMemo(
    () =>
      displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "HB",
    [displayName]
  );

  const handleSaveProfile = async () => {
    if (!user) return;
    setError(null);
    setSuccess(null);
    setIsSaving(true);
    try {
      await user.update({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      setSuccess("Cambios guardados exitosamente");
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("No se pudieron guardar los cambios. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: palette.colors.surface.warm }}
      >
        <Text style={{ color: palette.colors.ink.primary }}>Cargando...</Text>
      </View>
    );
  }

  return (
    <AuthGate message="Inicia sesión para acceder a la configuración.">
      <View
        className="flex-1"
        style={{ backgroundColor: palette.colors.surface.warm }}
      >
        <StatusBar style={statusBarStyle} />
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Ajustes de Cuenta"
          icon={User}
          showBackButton={true}
        />

        <ScrollView
          className="flex-1 px-6 pt-6"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="mb-8">
            <Text
              className="text-sm mb-6"
              style={{ color: palette.colors.ink.muted }}
            >
              Actualiza tu nombre, email y foto de perfil.
            </Text>

            <View
              className="mb-6 flex-row items-center rounded-[24px] border p-4"
              style={{
                backgroundColor: palette.colors.surface.card,
                borderColor: palette.colors.border.subtle,
              }}
            >
              {user?.imageUrl ? (
                <Image
                  source={{ uri: user.imageUrl }}
                  className="mr-4 h-16 w-16 rounded-2xl"
                  alt="Foto de perfil"
                />
              ) : (
                <View
                  className="mr-4 h-16 w-16 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: palette.colors.accent.primary }}
                >
                  <Text
                    className="text-xl font-black"
                    style={{ color: palette.colors.ink.inverse }}
                  >
                    {initials}
                  </Text>
                </View>
              )}
              <View className="flex-1">
                <Text
                  className="text-base font-semibold"
                  style={{ color: palette.colors.ink.primary }}
                >
                  {displayName}
                </Text>
                <Text
                  className="text-xs mt-1"
                  style={{ color: palette.colors.ink.muted }}
                >
                  Foto de perfil
                </Text>
              </View>
              <Button
                size="sm"
                className="rounded-2xl"
                style={{ backgroundColor: palette.colors.accent.primary }}
                onPress={() =>
                  setError(
                    "Para cambiar la foto necesitamos habilitar selección de imágenes."
                  )
                }
                accessibilityLabel="Cambiar foto de perfil"
                accessibilityRole="button"
              >
                <ButtonText
                  className="text-xs"
                  style={{ color: palette.colors.ink.inverse }}
                >
                  Cambiar
                </ButtonText>
              </Button>
            </View>

            {/* Email (solo lectura) */}
            <View
              className="mb-6 rounded-[24px] border p-4"
              style={{
                backgroundColor: palette.colors.surface.card,
                borderColor: palette.colors.border.subtle,
              }}
            >
              <Text
                className="text-sm mb-2"
                style={{ color: palette.colors.ink.muted }}
              >
                Email
              </Text>
              <Text
                className="text-base font-semibold"
                style={{ color: palette.colors.ink.primary }}
              >
                {primaryEmail}
              </Text>
              <Text
                className="text-xs mt-2"
                style={{ color: palette.colors.ink.muted }}
              >
                Tu email no puede ser modificado aquí. Contáctate con soporte si
                necesitas cambiar tu email.
              </Text>
            </View>

            {/* Nombre */}
            <View className="mb-4">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: palette.colors.ink.primary }}
              >
                Nombre
              </Text>
              <Input
                className="rounded-2xl"
                style={{
                  backgroundColor: palette.colors.surface.card,
                  borderColor: palette.colors.border.subtle,
                }}
              >
                <InputField
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Tu nombre"
                  placeholderTextColor={palette.colors.ink.subtle}
                  style={{ color: palette.colors.ink.primary }}
                  accessibilityLabel="Nombre"
                />
              </Input>
            </View>

            {/* Apellido */}
            <View className="mb-6">
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: palette.colors.ink.primary }}
              >
                Apellido
              </Text>
              <Input
                className="rounded-2xl"
                style={{
                  backgroundColor: palette.colors.surface.card,
                  borderColor: palette.colors.border.subtle,
                }}
              >
                <InputField
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Tu apellido"
                  placeholderTextColor={palette.colors.ink.subtle}
                  style={{ color: palette.colors.ink.primary }}
                  accessibilityLabel="Apellido"
                />
              </Input>
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
              onPress={handleSaveProfile}
              className="min-h-[52px] flex-row items-center justify-center rounded-2xl"
              style={{ backgroundColor: palette.colors.accent.primary }}
              disabled={!isLoaded || isSaving}
            >
              <ButtonText
                className="font-semibold text-base text-center leading-5"
                style={{ color: palette.colors.ink.inverse }}
              >
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </ButtonText>
            </Button>
          </View>

          <View className="mb-8">
            <Text
              className="mb-2 text-lg font-black"
              style={{ color: palette.colors.ink.primary }}
            >
              Configuraciones de la aplicación
            </Text>
            <Text
              className="mb-4 text-sm"
              style={{ color: palette.colors.ink.muted }}
            >
              Elige cómo quieres ver HealthBytes.
            </Text>

            <View
              className="rounded-[24px] border p-2"
              style={{
                backgroundColor: palette.colors.surface.card,
                borderColor: palette.colors.border.subtle,
              }}
            >
              <View className="flex-row">
                {themeOptions.map((option) => {
                  const isActive = themePreference === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      className="min-h-12 flex-1 items-center justify-center rounded-2xl px-2"
                      style={{
                        backgroundColor: isActive
                          ? palette.colors.accent.primary
                          : "transparent",
                      }}
                      onPress={() => setThemePreference(option.value)}
                      accessibilityRole="button"
                      accessibilityLabel={`Usar modo ${option.label.toLowerCase()}`}
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text
                        className="text-sm font-bold"
                        style={{
                          color: isActive
                            ? palette.colors.ink.inverse
                            : palette.colors.ink.muted,
                        }}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </AuthGate>
  );
}
