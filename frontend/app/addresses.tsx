/// <reference types="nativewind/types" />
import { AuthGate } from "@/components/AuthGate";
import { Pressable, ScrollView, View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Text } from "@/components/ui/text";
import { Input, InputField } from "@/components/ui/input";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  Map,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Home,
  Briefcase,
  Pencil,
  X,
} from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { useAddress } from "@/store/addressStore";
import Animated, { FadeInUp, FadeIn, Layout } from "react-native-reanimated";

export default function AddressesScreen() {
  const { getToken } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  // Store state (using selectors to prevent unnecessary re-renders)
  const addresses = useAddress((state) => state.addresses);
  const fetchAddresses = useAddress((state) => state.fetchAddresses);
  const createAddress = useAddress((state) => state.createAddress);
  const updateAddress = useAddress((state) => state.updateAddress);
  const deleteAddress = useAddress((state) => state.deleteAddress);
  const isStoreLoading = useAddress((state) => state.isLoading);
  const clearError = useAddress((state) => state.clearError);

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
      } catch {
        setLocalError("No se pudieron cargar las direcciones.");
      }
    };
    loadAddresses();
  }, [fetchAddresses, getToken]);

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

  const filteredComunas = useMemo(
    () =>
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

  const handleStartEdit = (addr: (typeof addresses)[0]) => {
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
        await createAddress(
          { ...data, is_default: addresses.length === 0 },
          token
        );
        setSuccess("¡Dirección guardada con éxito!");
      }

      resetForm();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setLocalError(
        err instanceof Error ? err.message : "Error al guardar la dirección"
      );
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
    } catch {
      setLocalError("No se pudo eliminar la direccion.");
    }
  };

  const getLabelIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes("casa") || l.includes("hogar"))
      return <Home size={18} color="#16A34A" />;
    if (l.includes("trabajo") || l.includes("oficina"))
      return <Briefcase size={18} color="#16A34A" />;
    return <MapPin size={18} color="#16A34A" />;
  };

  return (
    <AuthGate message="Inicia sesión para gestionar tus direcciones.">
      <View className="flex-1 bg-[#fafafa]">
        <StatusBar style="dark" />
        <Stack.Screen options={{ headerShown: false }} />

        <ScreenHeader
          title="Mis Direcciones"
          icon={MapPin}
          showBackButton={true}
        />

        <ScrollView
          ref={scrollRef}
          className="flex-1"
          contentContainerClassName="pb-32"
          showsVerticalScrollIndicator={false}
        >
          <View className="max-w-[800px] mx-auto w-full">
            {/* Hero Section */}
            <View className="px-5 mt-4">
              <View className="relative overflow-hidden rounded-[28px] bg-[#09090b] px-6 py-8">
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
                  {editingId !== null
                    ? "Editar dirección"
                    : "Agregar nueva ubicación"}
                </Text>
                {editingId !== null && (
                  <Pressable
                    onPress={handleCancelEdit}
                    style={{ minHeight: 48 }}
                    className="flex-row items-center justify-center gap-1.5 rounded-2xl bg-slate-100 px-4 active:bg-slate-200"
                    accessibilityLabel="Cancelar edición"
                    accessibilityRole="button"
                  >
                    <X size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-500 font-medium">
                      Cancelar
                    </Text>
                  </Pressable>
                )}
              </View>

              <View
                className="rounded-[28px] border border-slate-200/70 bg-white p-6"
              >
                {/* Label */}
                <View className="mb-4">
                  <Text className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">
                    Contexto (ej: Casa, Oficina)
                  </Text>
                  <Input
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-2xl border-slate-200 bg-white"
                  >
                    <InputField
                      placeholder="Nombre de esta dirección"
                      value={addressLabel}
                      onChangeText={setAddressLabel}
                      accessibilityLabel="Etiqueta de dirección"
                    />
                  </Input>
                </View>

                {/* Street */}
                <View className="mb-4">
                  <Text className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">
                    Dirección exacta
                  </Text>
                  <Input
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-2xl border-slate-200 bg-white"
                  >
                    <InputField
                      placeholder="Calle, número, depto..."
                      value={addressLine}
                      onChangeText={setAddressLine}
                      accessibilityLabel="Dirección"
                    />
                  </Input>
                </View>

                {/* Postal Code */}
                <View className="mb-4">
                  <Text className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">
                    Código postal
                  </Text>
                  <Input
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-2xl border-slate-200 bg-white"
                  >
                    <InputField
                      placeholder="Ej: 7500000"
                      value={addressPostalCode}
                      onChangeText={setAddressPostalCode}
                      keyboardType="numeric"
                      maxLength={7}
                      accessibilityLabel="Código postal"
                    />
                  </Input>
                </View>

                {/* Comuna */}
                <View className="mb-6">
                  <Text className="text-xs font-bold text-gray-500 uppercase mb-2 ml-1">
                    Comuna
                  </Text>
                  <Input
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-2xl border-slate-200 bg-white"
                  >
                    <InputField
                      placeholder="Escribe tu comuna..."
                      value={addressComuna}
                      onChangeText={(text) => {
                        setAddressComuna(text);
                        setShowComunaSuggestions(true);
                      }}
                      onFocus={() => setShowComunaSuggestions(true)}
                      accessibilityLabel="Comuna"
                    />
                    <View className="pr-4 justify-center">
                      <ChevronDown size={20} color="#9CA3AF" />
                    </View>
                  </Input>

                  {showComunaSuggestions && filteredComunas.length > 0 && (
                    <Animated.View entering={FadeIn} className="mt-2">
                      <View className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <ScrollView
                          nestedScrollEnabled
                          style={{ maxHeight: 220 }}
                        >
                          {filteredComunas.map((comuna) => (
                            <Pressable
                              key={comuna}
                              className="border-b border-slate-100 p-4 active:bg-slate-50"
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
                    <Text className="text-red-600 text-xs font-medium ml-2 flex-1">
                      {localError}
                    </Text>
                  </View>
                )}

                {success && (
                  <View className="flex-row items-center bg-green-50 p-4 rounded-2xl mb-4 border border-green-100">
                    <CheckCircle2 size={18} color="#16A34A" />
                    <Text className="text-green-700 text-xs font-medium ml-2 flex-1">
                      {success}
                    </Text>
                  </View>
                )}

                {/* Submit Button */}
                <Pressable
                  onPress={handleSubmit}
                  disabled={isActionLoading}
                  className={`h-14 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-90 ${isActionLoading ? "bg-slate-300" : "bg-[#09090b]"}`}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isActionLoading }}
                >
                  {isActionLoading ? (
                    <>
                      <View className="h-2 w-2 rounded-full bg-[#4ade80]" />
                      <View className="h-2 w-2 rounded-full bg-zinc-400" />
                      <View className="h-2 w-2 rounded-full bg-zinc-500" />
                    </>
                  ) : editingId !== null ? (
                    <>
                      <Pencil size={18} color="white" />
                      <Text className="text-white font-bold text-base">
                        Actualizar dirección
                      </Text>
                    </>
                  ) : (
                    <>
                      <Plus size={20} color="white" />
                      <Text className="text-white font-bold text-base">
                        Guardar dirección
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>

            {/* List Section */}
            <View className="px-5 mt-10">
              <Text className="mb-5 text-lg font-black tracking-[-0.2px] text-[#09090b]">
                Tus direcciones guardadas
              </Text>

              {isStoreLoading && addresses.length === 0 ? (
                <View className="my-10 flex-row justify-center gap-2">
                  <View className="h-3 w-3 rounded-full bg-[#22c55e]" />
                  <View className="h-3 w-3 rounded-full bg-slate-300" />
                  <View className="h-3 w-3 rounded-full bg-slate-400" />
                </View>
              ) : addresses.length > 0 ? (
                <View className="gap-4">
                  {addresses.map((addr, index) => (
                    <Animated.View
                      key={addr.id}
                      entering={FadeInUp.delay(index * 100)}
                      layout={Layout.springify()}
                    >
                      <View
                        className="flex-row items-center rounded-[24px] border bg-white p-5"
                        style={{
                          borderColor:
                            editingId === addr.id
                              ? "#22c55e"
                              : "rgba(226,232,240,0.9)",
                        }}
                      >
                          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                          {getLabelIcon(addr.label || "")}
                        </View>

                        <View className="flex-1 ml-4">
                          <View className="flex-row items-center gap-2">
                            <Text className="text-sm font-bold text-gray-900">
                              {addr.label}
                            </Text>
                            {addr.is_default && (
                              <View className="rounded-md bg-emerald-100 px-2 py-0.5">
                                <Text className="text-[9px] font-bold text-emerald-700">
                                  Principal
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text className="text-xs text-gray-500 mt-0.5">
                            {addr.street}
                          </Text>
                          <Text className="text-[11px] text-gray-400 mt-0.5">
                            {addr.city}, {addr.region}
                          </Text>
                        </View>

                        <View className="flex-row gap-2">
                          <Pressable
                            onPress={() => handleStartEdit(addr)}
                            style={{
                              minHeight: 48,
                              minWidth: 48,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            className="bg-gray-50 rounded-xl active:bg-gray-100 border border-gray-100"
                            accessibilityLabel={`Editar dirección ${addr.label}`}
                            accessibilityRole="button"
                          >
                            <Pencil size={18} color="#6B7280" />
                          </Pressable>
                          <Pressable
                            onPress={() => handleDelete(addr.id)}
                            style={{
                              minHeight: 48,
                              minWidth: 48,
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                            className="bg-red-50 rounded-xl active:bg-red-100 border border-red-100"
                            accessibilityLabel={`Eliminar dirección ${addr.label}`}
                            accessibilityRole="button"
                          >
                            <Trash2 size={18} color="#DC2626" />
                          </Pressable>
                        </View>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              ) : (
                <View className="items-start rounded-[28px] border border-dashed border-slate-200 bg-white p-6">
                  <View className="mb-5 h-14 w-14 items-center justify-center rounded-[22px] bg-slate-100">
                    <MapPin size={28} color="#09090b" />
                  </View>
                  <Text className="mb-2 text-xl font-black tracking-[-0.3px] text-[#09090b]">
                    No hay direcciones guardadas
                  </Text>
                  <Text className="text-sm leading-5 text-zinc-600">
                    Guarda una dirección para acelerar tus próximos pedidos.
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </AuthGate>
  );
}
