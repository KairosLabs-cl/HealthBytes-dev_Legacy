/// <reference types="nativewind/types" />
import { AuthGate } from "@/components/AuthGate";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useEffect, useMemo, useState, useRef } from "react";
import { MapPin, Plus, Trash2, Map, ChevronDown, CheckCircle2, AlertCircle, Home, Briefcase, Pencil, X } from "lucide-react-native";
import { Header } from "@/components/Header";
import { useAddress } from "@/store/addressStore";
import Animated, { FadeInUp, FadeIn, Layout } from "react-native-reanimated";

export default function AddressesScreen() {
  const router = useRouter();
  const { user } = useUser();
  const { getToken } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  // Store state
  const {
    addresses,
    fetchAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    isLoading: isStoreLoading,
    error: storeError,
    clearError
  } = useAddress();

  // Form state
  const [addressLabel, setAddressLabel] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [addressPostalCode, setAddressPostalCode] = useState("");
  const [addressComuna, setAddressComuna] = useState("");
  const [showComunaSuggestions, setShowComunaSuggestions] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const addressRegion = "Metropolitana de Santiago";

  // Initial fetch
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const token = await getToken();
        if (token) {
          await fetchAddresses(token);
        }
      } catch (err) {
        if (__DEV__) console.error("Error loading addresses:", err);
      }
    };
    loadAddresses();
  }, []);

  const comunaSuggestions = useMemo(
    () => [
      "Santiago", "Providencia", "Las Condes", "Ñuñoa", "La Florida",
      "Maipú", "Puente Alto", "San Bernardo", "Peñalolén", "La Reina",
      "Vitacura", "Lo Barnechea", "Recoleta", "Independencia",
      "Quinta Normal", "Estación Central", "Cerrillos", "Renca",
      "Pudahuel", "El Bosque", "La Cisterna", "San Ramón", "San Miguel",
      "La Granja", "Macul", "La Pintana", "Pirque", "San José de Maipo",
      "Buin", "Calera de Tango", "Paine", "Melipilla", "Talagante", "Isla de Maipo"
    ],
    []
  );

  const filteredComunas = useMemo(() =>
    comunaSuggestions.filter((comuna) =>
      comuna.toLowerCase().includes(addressComuna.toLowerCase())
    ),
    [addressComuna, comunaSuggestions]
  );

  const resetForm = () => {
    setAddressLabel("");
    setAddressLine("");
    setAddressPostalCode("");
    setAddressComuna("");
    setShowComunaSuggestions(false);
    setLocalError(null);
    setEditingId(null);
  };

  const handleStartEdit = (addr: typeof addresses[0]) => {
    setEditingId(addr.id);
    setAddressLabel(addr.label || "");
    setAddressLine(addr.street);
    setAddressPostalCode(addr.postal_code);
    setAddressComuna(addr.city);
    setLocalError(null);
    setSuccess(null);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const validateForm = () => {
    if (!addressLabel.trim()) {
      setLocalError("El nombre (ej: Casa) es requerido");
      return false;
    }
    if (!addressLine.trim()) {
      setLocalError("La dirección es requerida");
      return false;
    }
    if (!addressPostalCode.trim()) {
      setLocalError("El código postal es requerido");
      return false;
    }
    if (!addressComuna.trim()) {
      setLocalError("La comuna es requerida");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setLocalError(null);
    clearError();
    if (!validateForm()) return;

    setIsActionLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("No se pudo obtener el token de acceso");

      const data = {
        label: addressLabel,
        street: addressLine,
        city: addressComuna,
        region: addressRegion,
        postal_code: addressPostalCode.trim(),
        country: "CL",
      };

      if (editingId !== null) {
        await updateAddress(editingId, data, token);
        setSuccess("¡Dirección actualizada con éxito!");
      } else {
        await createAddress({ ...data, is_default: addresses.length === 0 }, token);
        setSuccess("¡Dirección guardada con éxito!");
      }

      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setLocalError(err.message || "Error al guardar la dirección");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (editingId === id) resetForm();
    try {
      const token = await getToken();
      if (!token) return;
      await deleteAddress(id, token);
      setSuccess("Dirección eliminada");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      if (__DEV__) console.error("Delete error:", err);
    }
  };

  const getLabelIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('casa') || l.includes('hogar')) return <Home size={18} color="#16A34A" />;
    if (l.includes('trabajo') || l.includes('oficina')) return <Briefcase size={18} color="#16A34A" />;
    return <MapPin size={18} color="#16A34A" />;
  };

  return (
    <AuthGate message="Inicia sesión para gestionar tus direcciones.">
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      <Header userName={user?.firstName || "Usuario"} showBackButton={true} />

      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
      >
        <View className="max-w-[800px] mx-auto w-full">
          {/* Hero Section */}
          <View className="px-5 mt-4">
            <View className="rounded-3xl bg-black px-6 py-8 overflow-hidden relative">
              <View className="z-10">
                <Text className="text-[11px] uppercase text-gray-400 tracking-[1.5px] font-bold mb-1">
                  Configuración
                </Text>
                <Text className="text-3xl font-extrabold text-white mb-2">
                  Mis{"\n"}Direcciones
                </Text>
                <Text className="text-sm text-gray-300 max-w-[200px]">
                  Gestiona tus lugares de entrega para compras más rápidas.
                </Text>
              </View>

              <View className="absolute right-6 top-8">
                <Map size={80} color="rgba(255,255,255,0.05)" />
              </View>
            </View>
          </View>

          {/* Form Section */}
          <View className="px-5 mt-8">
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-lg font-bold text-gray-900">
                {editingId !== null ? "Editar dirección" : "Agregar nueva ubicación"}
              </Text>
              {editingId !== null && (
                <Pressable
                  onPress={handleCancelEdit}
                  className="flex-row items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full active:bg-gray-200"
                >
                  <X size={14} color="#6B7280" />
                  <Text className="text-xs text-gray-500 font-medium">Cancelar</Text>
                </Pressable>
              )}
            </View>

            <View className={`rounded-3xl p-6 border shadow-sm ${editingId !== null ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
              {/* Label */}
              <View className="mb-4">
                <Text className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Contexto (ej: Casa, Oficina)</Text>
                <Input variant="outline" size="lg" className="bg-white border-gray-100 rounded-2xl h-14">
                  <InputField
                    placeholder="Nombre de esta dirección"
                    value={addressLabel}
                    onChangeText={setAddressLabel}
                  />
                </Input>
              </View>

              {/* Street */}
              <View className="mb-4">
                <Text className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Dirección exacta</Text>
                <Input variant="outline" size="lg" className="bg-white border-gray-100 rounded-2xl h-14">
                  <InputField
                    placeholder="Calle, número, depto..."
                    value={addressLine}
                    onChangeText={setAddressLine}
                  />
                </Input>
              </View>

              {/* Postal Code */}
              <View className="mb-4">
                <Text className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Código postal</Text>
                <Input variant="outline" size="lg" className="bg-white border-gray-100 rounded-2xl h-14">
                  <InputField
                    placeholder="Ej: 7500000"
                    value={addressPostalCode}
                    onChangeText={setAddressPostalCode}
                    keyboardType="numeric"
                    maxLength={7}
                  />
                </Input>
              </View>

              {/* Comuna */}
              <View className="mb-6">
                <Text className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Comuna</Text>
                <Input variant="outline" size="lg" className="bg-white border-gray-100 rounded-2xl h-14">
                  <InputField
                    placeholder="Escribe tu comuna..."
                    value={addressComuna}
                    onChangeText={(text) => {
                      setAddressComuna(text);
                      setShowComunaSuggestions(true);
                    }}
                    onFocus={() => setShowComunaSuggestions(true)}
                  />
                  <View className="pr-4 justify-center">
                    <ChevronDown size={20} color="#9CA3AF" />
                  </View>
                </Input>

                {showComunaSuggestions && filteredComunas.length > 0 && (
                  <Animated.View entering={FadeIn} className="mt-2">
                    <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                      <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }}>
                        {filteredComunas.map((comuna) => (
                          <Pressable
                            key={comuna}
                            className="p-4 border-b border-gray-50 active:bg-gray-50"
                            onPress={() => {
                              setAddressComuna(comuna);
                              setShowComunaSuggestions(false);
                            }}
                          >
                            <Text className="text-gray-700">{comuna}</Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  </Animated.View>
                )}
              </View>

              {/* Feedback Messages */}
              {localError && (
                <View className="flex-row items-center bg-red-50 p-4 rounded-2xl mb-4 border border-red-100">
                  <AlertCircle size={18} color="#DC2626" />
                  <Text className="text-red-600 text-xs font-medium ml-2 flex-1">{localError}</Text>
                </View>
              )}

              {success && (
                <View className="flex-row items-center bg-green-50 p-4 rounded-2xl mb-4 border border-green-100">
                  <CheckCircle2 size={18} color="#16A34A" />
                  <Text className="text-green-700 text-xs font-medium ml-2 flex-1">{success}</Text>
                </View>
              )}

              {/* Submit Button */}
              <Pressable
                onPress={handleSubmit}
                disabled={isActionLoading}
                className={`h-14 rounded-full items-center justify-center flex-row gap-2 active:opacity-90 ${isActionLoading ? 'bg-gray-200' : 'bg-black'}`}
              >
                {isActionLoading ? (
                  <ActivityIndicator color="white" />
                ) : editingId !== null ? (
                  <>
                    <Pencil size={18} color="white" />
                    <Text className="text-white font-bold text-base">Actualizar dirección</Text>
                  </>
                ) : (
                  <>
                    <Plus size={20} color="white" />
                    <Text className="text-white font-bold text-base">Guardar dirección</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          {/* List Section */}
          <View className="px-5 mt-10">
            <Text className="text-lg font-bold text-gray-900 mb-5">
              Tus direcciones guardadas
            </Text>

            {isStoreLoading && addresses.length === 0 ? (
              <ActivityIndicator color="black" className="my-10" />
            ) : addresses.length > 0 ? (
              <View className="gap-4">
                {addresses.map((addr, index) => (
                  <Animated.View
                    key={addr.id}
                    entering={FadeInUp.delay(index * 100)}
                    layout={Layout.springify()}
                  >
                    <View className={`bg-white border rounded-3xl p-5 shadow-sm flex-row items-center ${editingId === addr.id ? 'border-blue-300' : 'border-gray-100'}`}>
                      <View className="w-12 h-12 bg-green-50 rounded-2xl items-center justify-center">
                        {getLabelIcon(addr.label || "")}
                      </View>

                      <View className="flex-1 ml-4">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-sm font-bold text-gray-900">{addr.label}</Text>
                          {addr.is_default && (
                            <View className="bg-green-100 px-2 py-0.5 rounded-md">
                              <Text className="text-[9px] font-bold text-green-700">DEFAULT</Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-xs text-gray-500 mt-0.5">{addr.street}</Text>
                        <Text className="text-[11px] text-gray-400 mt-0.5">{addr.city}, {addr.region}</Text>
                      </View>

                      <View className="flex-row gap-2">
                        <Pressable
                          onPress={() => handleStartEdit(addr)}
                          className="p-3 bg-gray-50 rounded-xl active:bg-gray-100 border border-gray-100"
                        >
                          <Pencil size={18} color="#6B7280" />
                        </Pressable>
                        <Pressable
                          onPress={() => handleDelete(addr.id)}
                          className="p-3 bg-red-50 rounded-xl active:bg-red-100 border border-red-100"
                        >
                          <Trash2 size={18} color="#DC2626" />
                        </Pressable>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <View className="items-center py-10 bg-gray-50 rounded-3xl border border-gray-100 border-dashed">
                <MapPin size={40} color="#D1D5DB" />
                <Text className="text-gray-400 text-sm mt-3">No hay direcciones guardadas</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
    </AuthGate>
  );
}
