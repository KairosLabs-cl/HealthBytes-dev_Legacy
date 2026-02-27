/// <reference types="nativewind/types" />
import { Pressable, ScrollView, View, Image, Alert } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { useUser } from "@clerk/clerk-expo";
import { useEffect, useMemo, useState } from "react";
import {
  User,
  Salad,
} from "lucide-react-native";


import { usePreferencesStore } from "@/store/preferencesStore";
import { useAuth } from "@clerk/clerk-expo";

const DIETARY_OPTIONS = [
  { id: "sin-gluten", label: "Sin Gluten" },
  { id: "vegano", label: "Vegano" },
  { id: "sin-lactosa", label: "Sin Lactosa" },
  { id: "bajo-en-azucar", label: "Bajo en Azúcar" },
  { id: "alto-en-proteina", label: "Alto en Proteína" },
  { id: "para-diabeticos", label: "Para Diabéticos" },
];

export default function ProfileSettingsScreen() {
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const { dietaryPreferences, togglePreference, updateDietaryPreferences } = usePreferencesStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dietary preferences state

  useEffect(() => {
    if (!isLoaded || !user) {
      return;
    }

    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
  }, [isLoaded, user]);

  const primaryEmail = useMemo(
    () => user?.primaryEmailAddress?.emailAddress || "Sin email",
    [user]
  );

  const displayName = useMemo(() => {
    if (user?.fullName) {
      return user.fullName;
    }
    return `${firstName} ${lastName}`.trim() || "Usuario";
  }, [firstName, lastName, user?.fullName]);

  const handleSaveProfile = async () => {
    if (!user) {
      return;
    }

    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      await user.update({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
      });
      setSuccess("✓ Cambios guardados exitosamente");
      setTimeout(() => setSuccess(null), 3000);
    } catch (saveError) {
      setError("❌ No se pudieron guardar los cambios. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await updateDietaryPreferences(dietaryPreferences);
      setSuccess("✓ Preferencias actualizadas correctamente");
      setTimeout(() => setSuccess(null), 3000);
    } catch (prefError) {
      setError("❌ Error guardando preferencias");
    }
  };

  if (!isLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ title: "Ajustes de Cuenta" }} />

      <ScrollView
        className="flex-1 px-6 pt-6"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* === SECCIÓN PERFIL === */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-2">
            <Icon as={User} size="lg" color="#000000" />
            <Text className="text-2xl font-bold text-black">
              Mi Perfil
            </Text>
          </View>
          <Text className="text-gray-600 text-sm mb-6">
            Actualiza tu nombre, email y foto de perfil.
          </Text>

          {/* Foto de perfil */}
          <View className="bg-gray-100 rounded-2xl p-4 mb-6 flex-row items-center">
            <Image
              source={{
                uri: user?.imageUrl || "https://via.placeholder.com/80",
              }}
              className="w-16 h-16 rounded-full mr-4"
            />
            <View className="flex-1">
              <Text className="text-base text-black font-semibold">
                {displayName}
              </Text>
              <Text className="text-xs text-gray-500 mt-1">Foto de perfil</Text>
            </View>
            <Button
              size="sm"
              className="bg-black rounded-full"
              onPress={() =>
                setError(
                  "Para cambiar la foto necesitamos habilitar selección de imágenes."
                )
              }
            >
              <ButtonText className="text-white text-xs">Cambiar</ButtonText>
            </Button>
          </View>

          {/* Email (solo lectura) */}
          <View className="bg-gray-50 rounded-2xl p-4 mb-6">
            <Text className="text-sm text-gray-500 mb-2">Email</Text>
            <Text className="text-base text-black font-semibold">
              {primaryEmail}
            </Text>
            <Text className="text-xs text-gray-500 mt-2">
              Tu email no puede ser modificado aquí. Contáctate con soporte si necesitas cambiar tu email.
            </Text>
          </View>

          {/* Nombre */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-800 mb-2">
              Nombre
            </Text>
            <Input className="bg-white border-gray-200">
              <InputField
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Tu nombre"
                placeholderTextColor="#9CA3AF"
                className="text-black"
              />
            </Input>
          </View>

          {/* Apellido */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-800 mb-2">
              Apellido
            </Text>
            <Input className="bg-white border-gray-200">
              <InputField
                value={lastName}
                onChangeText={setLastName}
                placeholder="Tu apellido"
                placeholderTextColor="#9CA3AF"
                className="text-black"
              />
            </Input>
          </View>

          {/* Mensajes */}
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

          {/* Guardar cambios */}
          <Button
            onPress={handleSaveProfile}
            className="bg-black rounded-full min-h-[52px] flex-row items-center justify-center"
            disabled={!isLoaded || isSaving}
          >
            <ButtonText className="text-white font-semibold text-base text-center leading-5">
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </ButtonText>
          </Button>
        </View>

        {/* === SECCIÓN PREFERENCIAS DIETÉTICAS === */}
        <View className="mt-8 mb-8">
          <View className="flex-row items-center gap-2 mb-2">
            <Icon as={Salad} size="lg" color="#000000" />
            <Text className="text-2xl font-bold text-black">
              Preferencias Alimenticias
            </Text>
          </View>
          <Text className="text-gray-600 text-sm mb-6">
            Selecciona tus restricciones para personalizar tu experiencia.
          </Text>

          <View className="flex-row flex-wrap gap-2 mb-8">
            {DIETARY_OPTIONS.map((option) => {
              const isActive = dietaryPreferences.includes(option.id);
              return (
                <Pressable
                  key={option.id}
                  onPress={() => togglePreference(option.id)}
                  className={`px-4 py-3 rounded-full border transition-all ${
                    isActive
                      ? "bg-green-500 border-green-600"
                      : "bg-white border-gray-200"
                  }`}
                  style={{ minHeight: 44 }}
                >
                  <Text
                    className={`text-sm font-medium ${
                      isActive ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Button
            onPress={handleSavePreferences}
            className="bg-green-600 rounded-full min-h-[52px] flex-row items-center justify-center"
            disabled={!isSignedIn}
          >
            <ButtonText className="text-white font-semibold text-base">
              Guardar Preferencias
            </ButtonText>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
