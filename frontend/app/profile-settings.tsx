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
  ShieldCheck,
  Shield,
  Download,
  Lock,
} from "lucide-react-native";


export default function ProfileSettingsScreen() {
  const { user, isLoaded } = useUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const handleChangePassword = async () => {
    setError(null);
    setSuccess(null);

    if (!currentPassword.trim()) {
      setError("Ingresa tu contraseña actual");
      return;
    }
    if (!newPassword.trim()) {
      setError("Ingresa tu nueva contraseña");
      return;
    }
    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsSaving(true);

    try {
      Alert.alert(
        "Cambio de Contraseña",
        "El cambio de contraseña debe realizarse a través de los ajustes de seguridad de tu cuenta en Clerk. Por tu seguridad, se te redirigirá a la página de seguridad."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Dirígete a los ajustes de seguridad de tu cuenta.");
    } catch (changeError) {
      setError("❌ No se pudo cambiar la contraseña. Intenta nuevamente.");
    } finally {
      setIsSaving(false);
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

        {/* === SECCIÓN SEGURIDAD === */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-2">
            <Icon as={ShieldCheck} size="lg" color="#000000" />
            <Text className="text-2xl font-bold text-black">
              Seguridad
            </Text>
          </View>
          <Text className="text-gray-600 text-sm mb-6">
            Cambia tu contraseña y revisa tus opciones de seguridad.
          </Text>

          {/* Contraseña actual */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-800 mb-2">
              Contraseña Actual
            </Text>
            <Input className="bg-white border-gray-200">
              <InputField
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Ingresa tu contraseña actual"
                placeholderTextColor="#9CA3AF"
                className="text-black"
                secureTextEntry={!showPassword}
              />
            </Input>
          </View>

          {/* Nueva contraseña */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-800 mb-2">
              Nueva Contraseña
            </Text>
            <Input className="bg-white border-gray-200">
              <InputField
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor="#9CA3AF"
                className="text-black"
                secureTextEntry={!showPassword}
              />
            </Input>
            <Text className="text-xs text-gray-500 mt-2">
              Usa mayúsculas, minúsculas, números y símbolos para mayor seguridad.
            </Text>
          </View>

          {/* Confirmar contraseña */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-800 mb-2">
              Confirmar Contraseña
            </Text>
            <Input className="bg-white border-gray-200">
              <InputField
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Repite tu nueva contraseña"
                placeholderTextColor="#9CA3AF"
                className="text-black"
                secureTextEntry={!showPassword}
              />
            </Input>
          </View>

          {/* Cambiar contraseña */}
          <Button
            onPress={handleChangePassword}
            className="bg-black rounded-full min-h-[52px] flex-row items-center justify-center"
            disabled={isSaving}
          >
            <Icon as={Lock} color="#ffffff" size="md" />
            <ButtonText className="text-white font-semibold ml-2 text-base text-center leading-5">
              {isSaving ? "Procesando..." : "Cambiar Contraseña"}
            </ButtonText>
          </Button>
        </View>

        {/* === SECCIÓN PRIVACIDAD === */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-2">
            <Icon as={Shield} size="lg" color="#000000" />
            <Text className="text-2xl font-bold text-black">
              Privacidad
            </Text>
          </View>
          <Text className="text-gray-600 text-sm mb-6">
            Controla cómo se usan tus datos.
          </Text>

          <View className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-semibold text-black flex-1">
                Comunicaciones
              </Text>
              <Pressable className="bg-black rounded-full px-3 py-2">
                <Text className="text-white text-xs font-semibold">
                  Editar
                </Text>
              </Pressable>
            </View>
            <Text className="text-sm text-gray-600">
              Recibe notificaciones sobre pedidos, promociones y actualizaciones de tu cuenta.
            </Text>
          </View>

          <View className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mt-3">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-base font-semibold text-black flex-1">
                Datos y Rastreo
              </Text>
              <Pressable className="bg-black rounded-full px-3 py-2">
                <Text className="text-white text-xs font-semibold">
                  Editar
                </Text>
              </Pressable>
            </View>
            <Text className="text-sm text-gray-600">
              Controla el uso de cookies y rastreo de navegación.
            </Text>
          </View>
        </View>

        {/* === SECCIÓN DESCARGAR DATOS === */}
        <View className="mb-8">
          <View className="flex-row items-center gap-2 mb-2">
            <Icon as={Download} size="lg" color="#000000" />
            <Text className="text-2xl font-bold text-black">
              Tus Datos
            </Text>
          </View>
          <Text className="text-gray-600 text-sm mb-6">
            Descarga una copia de tus datos personales.
          </Text>

          <Button className="bg-gray-100 rounded-full min-h-[52px] border border-gray-300 flex-row items-center justify-center">
            <ButtonText className="text-black font-semibold text-base text-center leading-5">
              Descargar mis datos
            </ButtonText>
          </Button>
          <Text className="text-xs text-gray-500 mt-2">
            Recibirás un archivo con toda tu información personal, pedidos e historial.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
