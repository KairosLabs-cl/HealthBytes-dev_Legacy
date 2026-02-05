/// <reference types="nativewind/types" />
import { Image, Pressable, ScrollView, View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { useUser } from "@clerk/clerk-expo";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { MapPin, Package, Plus, Trash2 } from "lucide-react-native";

export default function AddressesScreen() {
  const { user, isLoaded } = useUser();
  const [addressLabel, setAddressLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [addressComuna, setAddressComuna] = useState("");
  const [addresses, setAddresses] = useState<
    {
      id: string;
      label: string;
      line: string;
      region: string;
      comuna: string;
    }[]
  >([]);
  const addressRegion = "Metropolitana";
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const comunaSuggestions = useMemo(
    () => [
      "Santiago",
      "Providencia",
      "Las Condes",
      "Ñuñoa",
      "La Florida",
      "Maipú",
      "Puente Alto",
      "San Bernardo",
      "Peñalolén",
      "La Reina",
      "Vitacura",
      "Lo Barnechea",
      "Recoleta",
      "Independencia",
      "Quinta Normal",
      "Estación Central",
      "Cerrillos",
      "Renca",
      "Pudahuel",
      "El Bosque",
      "La Cisterna",
      "San Ramón",
      "San Miguel",
      "La Granja",
      "Macul",
      "La Pintana",
      "Pirque",
      "San José de Maipo",
      "Buin",
      "Calera de Tango",
      "Paine",
      "Melipilla",
      "Talagante",
      "Isla de Maipo",
    ],
    []
  );

  const filteredComunas = comunaSuggestions.filter((comuna) =>
    comuna.toLowerCase().includes(addressComuna.toLowerCase())
  );

  const handleAddAddress = () => {
    if (!addressLabel.trim()) {
      setError("El label de la dirección es requerido");
      return;
    }
    if (!addressLine.trim()) {
      setError("La dirección es requerida");
      return;
    }
    if (!addressComuna.trim()) {
      setError("La comuna es requerida");
      return;
    }

    const newAddress = {
      id: Date.now().toString(),
      label: addressLabel,
      line: addressLine,
      region: addressRegion,
      comuna: addressComuna,
    };

    setAddresses([newAddress, ...addresses]);
    setAddressLabel("");
    setAddressLine("");
    setAddressComuna("");
    setSuccess("Dirección agregada exitosamente ✓");
    setError(null);

    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter((addr) => addr.id !== id));
    setSuccess("Dirección eliminada ✓");
    setTimeout(() => setSuccess(null), 3000);
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
      <Stack.Screen options={{ title: "Mis Direcciones" }} />

      <ScrollView
        className="flex-1 bg-white px-4 pt-6"
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Sección de formulario para agregar dirección */}
        <View className="mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Icon as={MapPin} size="lg" color="#000000" />
            <Text className="text-lg font-bold text-black">
              Agregar Nueva Dirección
            </Text>
          </View>

          {/* Label */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-800 mb-2">
              Nombre de la dirección
            </Text>
            <Input
              variant="outline"
              size="lg"
              className="bg-gray-50 border-gray-300"
            >
              <InputField
                placeholder="ej: Casa, Oficina, Apartamento"
                value={addressLabel}
                onChangeText={setAddressLabel}
                maxLength={50}
              />
            </Input>
          </View>

          {/* Dirección */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-800 mb-2">
              Dirección
            </Text>
            <Input
              variant="outline"
              size="lg"
              className="bg-gray-50 border-gray-300"
            >
              <InputField
                placeholder="ej: Calle Principal 123, Apto 4B"
                value={addressLine}
                onChangeText={setAddressLine}
                maxLength={100}
              />
            </Input>
          </View>

          {/* Región (fija) */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-800 mb-2">
              Región
            </Text>
            <View className="bg-gray-100 rounded-lg p-3 border border-gray-300">
              <Text className="text-gray-700">{addressRegion}</Text>
            </View>
          </View>

          {/* Comuna con sugerencias */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-800 mb-2">
              Comuna
            </Text>
            <Input
              variant="outline"
              size="lg"
              className="bg-gray-50 border-gray-300"
            >
              <InputField
                placeholder="Buscar comuna..."
                value={addressComuna}
                onChangeText={setAddressComuna}
              />
            </Input>

            {/* Dropdown de sugerencias */}
            {addressComuna && filteredComunas.length > 0 && (
              <View className="bg-gray-50 rounded-lg mt-2 max-h-40 border border-gray-300">
                <ScrollView nestedScrollEnabled={true}>
                  {filteredComunas.map((comuna) => (
                    <Pressable
                      key={comuna}
                      className="p-3 border-b border-gray-200"
                      onPress={() => {
                        setAddressComuna(comuna);
                      }}
                    >
                      <Text className="text-gray-800 text-sm">{comuna}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Error y Success Messages */}
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

          {/* Botón Agregar */}
          <Button
            className="bg-black rounded-full min-h-[52px] flex-row items-center justify-center"
            onPress={handleAddAddress}
            disabled={isSaving}
          >
            <Icon as={Plus} color="#ffffff" size="md" />
            <ButtonText className="text-white font-semibold ml-2 text-base text-center leading-5">
              Agregar Dirección
            </ButtonText>
          </Button>
        </View>

        {/* Sección de direcciones guardadas */}
        {addresses.length > 0 && (
          <View className="mb-6">
            <View className="flex-row items-center gap-2 mb-4">
              <Icon as={Package} size="lg" color="#000000" />
              <Text className="text-lg font-bold text-black">
                Direcciones Guardadas ({addresses.length})
              </Text>
            </View>

            {addresses.map((address) => (
              <View
                key={address.id}
                className="bg-gray-50 rounded-2xl p-4 mb-3 border border-gray-200"
              >
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-base font-bold text-black flex-1">
                    {address.label}
                  </Text>
                  <Pressable
                    onPress={() => handleDeleteAddress(address.id)}
                    className="p-2"
                  >
                    <Icon as={Trash2} color="#d12d2d" size="md" />
                  </Pressable>
                </View>

                <Text className="text-sm text-gray-700 mb-1">
                  {address.line}
                </Text>
                <Text className="text-xs text-gray-600">
                  {address.comuna} · {address.region}
                </Text>
              </View>
            ))}
          </View>
        )}

        {addresses.length === 0 && (
          <View className="bg-gray-50 rounded-2xl p-6 items-center justify-center">
            <Text className="text-gray-600 text-center">
              No tienes direcciones guardadas. ¡Agrega una para comenzar!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
