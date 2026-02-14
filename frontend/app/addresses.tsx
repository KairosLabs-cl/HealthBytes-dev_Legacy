/**
 * Addresses Screen
 * Manage user shipping addresses
 */

import AddressCard from "@/components/AddressCard";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAddress } from "@/store/addressStore";
import type { Address, AddressCreate } from "@/types/address";
import { CHILE_REGIONS } from "@/types/address";
import { useAuth } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import { ArrowLeft, MapPin, Plus, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddressesScreen() {
  const router = useRouter();
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const {
    addresses,
    isLoading,
    error,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    clearError,
  } = useAddress();

  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<AddressCreate>({
    street: "",
    street_number: "",
    city: "",
    region: "",
    postal_code: "",
    country: "CL",
    label: "",
    phone: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/(auth)/login");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const token = await getToken();
      if (token) {
        await fetchAddresses(token);
      }
    } catch (err) {
      console.error("Error loading addresses:", err);
    }
  };

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        street: address.street,
        street_number: address.street_number || "",
        city: address.city,
        region: address.region,
        postal_code: address.postal_code,
        country: address.country,
        label: address.label || "",
        phone: address.phone || "",
      });
    } else {
      setEditingAddress(null);
      setFormData({
        street: "",
        street_number: "",
        city: "",
        region: "",
        postal_code: "",
        country: "CL",
        label: "",
        phone: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAddress(null);
    clearError();
  };

  const handleSave = async () => {
    if (
      !formData.street ||
      !formData.city ||
      !formData.region ||
      !formData.postal_code
    ) {
      Alert.alert("Error", "Por favor completa todos los campos obligatorios");
      return;
    }

    setIsSaving(true);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "No autenticado");
        return;
      }

      if (editingAddress) {
        await updateAddress(editingAddress.id, formData, token);
        Alert.alert("Exito", "Direccion actualizada");
      } else {
        await createAddress(formData, token);
        Alert.alert("Exito", "Direccion agregada");
      }

      handleCloseModal();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error guardando direccion";
      Alert.alert("Error", message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (addressId: number) => {
    setDeletingId(addressId);
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "No autenticado");
        return;
      }

      await deleteAddress(addressId, token);
      Alert.alert("Exito", "Direccion eliminada");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error eliminando direccion";
      Alert.alert("Error", message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      const token = await getToken();
      if (!token) {
        Alert.alert("Error", "No autenticado");
        return;
      }

      await setDefaultAddress(addressId, token);
      Alert.alert("Exito", "Direccion principal actualizada");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error actualizando direccion";
      Alert.alert("Error", message);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Mis Direcciones",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} className="mr-4">
              <ArrowLeft size={24} color="#000" />
            </Pressable>
          ),
        }}
      />

      <ScrollView
        className="flex-1 px-4 py-4"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {addresses.length === 0 ? (
          <View className="items-center justify-center py-16">
            <MapPin size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-center mt-4 text-base">
              No tienes direcciones guardadas
            </Text>
            <Text className="text-gray-400 text-center mt-2 text-sm px-8">
              Agrega una direccion para facilitar tus compras
            </Text>
          </View>
        ) : (
          addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleOpenModal}
              onDelete={handleDelete}
              onSetDefault={handleSetDefault}
              isDeleting={deletingId === address.id}
            />
          ))
        )}

        <View className="mt-4">
          <Button
            onPress={() => handleOpenModal()}
            className="bg-blue-600 active:bg-blue-700 min-h-[48px]"
          >
            <Plus size={20} color="white" />
            <ButtonText className="ml-2">Agregar direccion</ButtonText>
          </Button>
        </View>
      </ScrollView>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <SafeAreaView className="flex-1 bg-white">
          <KeyboardAvoidingView
            className="flex-1"
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
              <Text className="text-lg font-semibold">
                {editingAddress ? "Editar direccion" : "Nueva direccion"}
              </Text>
              <Pressable
                onPress={handleCloseModal}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <X size={24} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView
              className="flex-1 px-4 py-4"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Etiqueta (opcional)
                </Text>
                <Input variant="outline" size="md">
                  <InputField
                    placeholder="Ej: Casa, Trabajo"
                    value={formData.label}
                    onChangeText={(text) =>
                      setFormData({ ...formData, label: text })
                    }
                  />
                </Input>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Calle *
                </Text>
                <Input variant="outline" size="md">
                  <InputField
                    placeholder="Ej: Av. Libertador 1234"
                    value={formData.street}
                    onChangeText={(text) =>
                      setFormData({ ...formData, street: text })
                    }
                  />
                </Input>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Depto / Oficina / Piso (opcional)
                </Text>
                <Input variant="outline" size="md">
                  <InputField
                    placeholder="Ej: Depto 4B, Piso 3"
                    value={formData.street_number}
                    onChangeText={(text) =>
                      setFormData({ ...formData, street_number: text })
                    }
                  />
                </Input>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </Text>
                <Input variant="outline" size="md">
                  <InputField
                    placeholder="Ej: Santiago"
                    value={formData.city}
                    onChangeText={(text) =>
                      setFormData({ ...formData, city: text })
                    }
                  />
                </Input>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Region *
                </Text>
                <Input variant="outline" size="md">
                  <InputField
                    placeholder="Ej: Metropolitana de Santiago"
                    value={formData.region}
                    onChangeText={(text) =>
                      setFormData({ ...formData, region: text })
                    }
                  />
                </Input>
                <Text className="text-xs text-gray-500 mt-1">
                  Regiones validas: {CHILE_REGIONS.slice(0, 3).join(", ")}, etc.
                </Text>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Codigo Postal *
                </Text>
                <Input variant="outline" size="md">
                  <InputField
                    placeholder="Ej: 7500000"
                    value={formData.postal_code}
                    onChangeText={(text) =>
                      setFormData({ ...formData, postal_code: text })
                    }
                    keyboardType="numeric"
                  />
                </Input>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Telefono (opcional)
                </Text>
                <Input variant="outline" size="md">
                  <InputField
                    placeholder="Ej: +56912345678"
                    value={formData.phone}
                    onChangeText={(text) =>
                      setFormData({ ...formData, phone: text })
                    }
                    keyboardType="phone-pad"
                  />
                </Input>
              </View>

              {error && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <Text className="text-red-700 text-sm">{error}</Text>
                </View>
              )}
            </ScrollView>

            <View className="px-4 pt-3 pb-4 bg-white border-t border-gray-200">
              <Button
                onPress={handleSave}
                disabled={isSaving}
                className="bg-blue-600 active:bg-blue-700 min-h-[48px]"
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <ButtonText>
                    {editingAddress ? "Actualizar" : "Guardar direccion"}
                  </ButtonText>
                )}
              </Button>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
