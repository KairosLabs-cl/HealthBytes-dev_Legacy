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
import { useAppTheme } from "@/hooks/useAppTheme";

export default function AddressesScreen() {
  const { getToken } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const { palette, statusBarStyle } = useAppTheme();

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
  const isSubmittingRef = useRef(false);

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
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;

    setLocalError(null);
    clearError();
    if (!validateForm()) {
      isSubmittingRef.current = false;
      return;
    }

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
      isSubmittingRef.current = false;
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
      return <Home size={18} color={palette.colors.icon.accent} />;
    if (l.includes("trabajo") || l.includes("oficina"))
      return <Briefcase size={18} color={palette.colors.icon.accent} />;
    return <MapPin size={18} color={palette.colors.icon.accent} />;
  };

  return (
    <AuthGate message="Inicia sesión para gestionar tus direcciones.">
      <View
        className="flex-1"
        style={{ backgroundColor: palette.colors.surface.warm }}
      >
        <StatusBar style={statusBarStyle} />
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
              <View
                className="relative overflow-hidden rounded-[28px] px-6 py-8"
                style={{ backgroundColor: palette.colors.ink.primary }}
              >
                <View className="z-10">
                  <Text
                    className="text-[11px] uppercase tracking-[1.5px] font-bold mb-1"
                    style={{ color: palette.colors.ink.subtle }}
                  >
                    Configuración
                  </Text>
                  <Text
                    className="text-3xl font-extrabold mb-2"
                    style={{ color: palette.colors.ink.inverse }}
                  >
                    Mis{"\n"}Direcciones
                  </Text>
                  <Text
                    className="text-sm max-w-[200px]"
                    style={{ color: palette.colors.ink.subtle }}
                  >
                    Gestiona tus lugares de entrega para compras más rápidas.
                  </Text>
                </View>

                <View className="absolute right-6 top-8">
                  <Map size={80} color={`${palette.colors.ink.inverse}0D`} />
                </View>
              </View>
            </View>

            {/* Form Section */}
            <View className="px-5 mt-8">
              <View className="flex-row items-center justify-between mb-5">
                <Text
                  className="text-lg font-bold"
                  style={{ color: palette.colors.ink.primary }}
                >
                  {editingId !== null
                    ? "Editar dirección"
                    : "Agregar nueva ubicación"}
                </Text>
                {editingId !== null && (
                  <Pressable
                    onPress={handleCancelEdit}
                    style={{
                      minHeight: 48,
                      backgroundColor: palette.colors.surface.muted,
                    }}
                    className="flex-row items-center justify-center gap-1.5 rounded-2xl px-4 active:opacity-85"
                    accessibilityLabel="Cancelar edición"
                    accessibilityRole="button"
                  >
                    <X size={14} color={palette.colors.icon.muted} />
                    <Text
                      className="text-xs font-medium"
                      style={{ color: palette.colors.ink.muted }}
                    >
                      Cancelar
                    </Text>
                  </Pressable>
                )}
              </View>

              <View
                className="rounded-[28px] border p-6"
                style={{
                  backgroundColor: palette.colors.surface.card,
                  borderColor: palette.colors.border.subtle,
                }}
              >
                {/* Label */}
                <View className="mb-4">
                  <Text
                    className="text-xs font-bold uppercase mb-2 ml-1"
                    style={{ color: palette.colors.ink.muted }}
                  >
                    Contexto (ej: Casa, Oficina)
                  </Text>
                  <Input
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-2xl"
                    style={{
                      backgroundColor: palette.colors.surface.card,
                      borderColor: palette.colors.border.default,
                    }}
                  >
                    <InputField
                      placeholder="Nombre de esta dirección"
                      value={addressLabel}
                      onChangeText={setAddressLabel}
                      accessibilityLabel="Etiqueta de dirección"
                      style={{ color: palette.colors.ink.primary }}
                      placeholderTextColor={palette.colors.ink.subtle}
                    />
                  </Input>
                </View>

                {/* Street */}
                <View className="mb-4">
                  <Text
                    className="text-xs font-bold uppercase mb-2 ml-1"
                    style={{ color: palette.colors.ink.muted }}
                  >
                    Dirección exacta
                  </Text>
                  <Input
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-2xl"
                    style={{
                      backgroundColor: palette.colors.surface.card,
                      borderColor: palette.colors.border.default,
                    }}
                  >
                    <InputField
                      placeholder="Calle, número, depto..."
                      value={addressLine}
                      onChangeText={setAddressLine}
                      accessibilityLabel="Dirección"
                      style={{ color: palette.colors.ink.primary }}
                      placeholderTextColor={palette.colors.ink.subtle}
                    />
                  </Input>
                </View>

                {/* Postal Code */}
                <View className="mb-4">
                  <Text
                    className="text-xs font-bold uppercase mb-2 ml-1"
                    style={{ color: palette.colors.ink.muted }}
                  >
                    Código postal
                  </Text>
                  <Input
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-2xl"
                    style={{
                      backgroundColor: palette.colors.surface.card,
                      borderColor: palette.colors.border.default,
                    }}
                  >
                    <InputField
                      placeholder="Ej: 7500000"
                      value={addressPostalCode}
                      onChangeText={setAddressPostalCode}
                      keyboardType="numeric"
                      maxLength={7}
                      accessibilityLabel="Código postal"
                      style={{ color: palette.colors.ink.primary }}
                      placeholderTextColor={palette.colors.ink.subtle}
                    />
                  </Input>
                </View>

                {/* Comuna */}
                <View className="mb-6">
                  <Text
                    className="text-xs font-bold uppercase mb-2 ml-1"
                    style={{ color: palette.colors.ink.muted }}
                  >
                    Comuna
                  </Text>
                  <Input
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-2xl"
                    style={{
                      backgroundColor: palette.colors.surface.card,
                      borderColor: palette.colors.border.default,
                    }}
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
                      style={{ color: palette.colors.ink.primary }}
                      placeholderTextColor={palette.colors.ink.subtle}
                    />
                    <View className="pr-4 justify-center">
                      <ChevronDown
                        size={20}
                        color={palette.colors.icon.muted}
                      />
                    </View>
                  </Input>

                  {showComunaSuggestions && filteredComunas.length > 0 && (
                    <Animated.View entering={FadeIn} className="mt-2">
                      <View
                        className="overflow-hidden rounded-2xl border"
                        style={{
                          backgroundColor: palette.colors.surface.card,
                          borderColor: palette.colors.border.default,
                        }}
                      >
                        <ScrollView
                          nestedScrollEnabled
                          style={{ maxHeight: 220 }}
                        >
                          {filteredComunas.map((comuna) => (
                            <Pressable
                              key={comuna}
                              className="border-b p-4 active:opacity-85"
                              style={{
                                borderBottomColor: palette.colors.border.subtle,
                              }}
                              onPress={() => {
                                setAddressComuna(comuna);
                                setShowComunaSuggestions(false);
                              }}
                            >
                              <Text
                                style={{ color: palette.colors.ink.primary }}
                              >
                                {comuna}
                              </Text>
                            </Pressable>
                          ))}
                        </ScrollView>
                      </View>
                    </Animated.View>
                  )}
                </View>

                {/* Feedback Messages */}
                {localError && (
                  <View
                    className="flex-row items-center p-4 rounded-2xl mb-4 border"
                    style={{
                      backgroundColor: `${palette.colors.state.error}1F`,
                      borderColor: `${palette.colors.state.error}3D`,
                    }}
                  >
                    <AlertCircle size={18} color={palette.colors.state.error} />
                    <Text
                      className="text-xs font-medium ml-2 flex-1"
                      style={{ color: palette.colors.state.error }}
                    >
                      {localError}
                    </Text>
                  </View>
                )}

                {success && (
                  <View
                    className="flex-row items-center p-4 rounded-2xl mb-4 border"
                    style={{
                      backgroundColor: `${palette.colors.state.success}1F`,
                      borderColor: `${palette.colors.state.success}3D`,
                    }}
                  >
                    <CheckCircle2
                      size={18}
                      color={palette.colors.state.success}
                    />
                    <Text
                      className="text-xs font-medium ml-2 flex-1"
                      style={{ color: palette.colors.state.success }}
                    >
                      {success}
                    </Text>
                  </View>
                )}

                {/* Submit Button */}
                <Pressable
                  onPress={handleSubmit}
                  disabled={isActionLoading}
                  className="h-14 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-90"
                  style={{
                    backgroundColor: isActionLoading
                      ? palette.colors.surface.muted
                      : palette.colors.ink.primary,
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: isActionLoading }}
                >
                  {isActionLoading ? (
                    <>
                      <View
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: palette.colors.state.success,
                        }}
                      />
                      <View
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: palette.colors.ink.subtle }}
                      />
                      <View
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: palette.colors.ink.muted }}
                      />
                    </>
                  ) : editingId !== null ? (
                    <>
                      <Pencil size={18} color={palette.colors.ink.inverse} />
                      <Text
                        className="font-bold text-base"
                        style={{ color: palette.colors.ink.inverse }}
                      >
                        Actualizar dirección
                      </Text>
                    </>
                  ) : (
                    <>
                      <Plus size={20} color={palette.colors.ink.inverse} />
                      <Text
                        className="font-bold text-base"
                        style={{ color: palette.colors.ink.inverse }}
                      >
                        Guardar dirección
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </View>

            {/* List Section */}
            <View className="px-5 mt-10">
              <Text
                className="mb-5 text-lg font-black tracking-[-0.2px]"
                style={{ color: palette.colors.ink.primary }}
              >
                Tus direcciones guardadas
              </Text>

              {isStoreLoading && addresses.length === 0 ? (
                <View className="my-10 flex-row justify-center gap-2">
                  <View
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: palette.colors.state.success }}
                  />
                  <View
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: palette.colors.surface.muted }}
                  />
                  <View
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: palette.colors.ink.subtle }}
                  />
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
                        className="flex-row items-center rounded-[24px] border p-5"
                        style={{
                          backgroundColor: palette.colors.surface.card,
                          borderColor:
                            editingId === addr.id
                              ? palette.colors.state.success
                              : palette.colors.border.subtle,
                        }}
                      >
                        <View
                          className="h-12 w-12 items-center justify-center rounded-2xl"
                          style={{
                            backgroundColor: palette.colors.accent.light,
                          }}
                        >
                          {getLabelIcon(addr.label || "")}
                        </View>

                        <View className="flex-1 ml-4">
                          <View className="flex-row items-center gap-2">
                            <Text
                              className="text-sm font-bold"
                              style={{ color: palette.colors.ink.primary }}
                            >
                              {addr.label}
                            </Text>
                            {addr.is_default && (
                              <View
                                className="rounded-md px-2 py-0.5"
                                style={{
                                  backgroundColor: `${palette.colors.state.success}1F`,
                                }}
                              >
                                <Text
                                  className="text-[9px] font-bold"
                                  style={{
                                    color: palette.colors.state.success,
                                  }}
                                >
                                  Principal
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text
                            className="text-xs mt-0.5"
                            style={{ color: palette.colors.ink.muted }}
                          >
                            {addr.street}
                          </Text>
                          <Text
                            className="text-[11px] mt-0.5"
                            style={{ color: palette.colors.ink.subtle }}
                          >
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
                              backgroundColor: palette.colors.surface.elevated,
                              borderColor: palette.colors.border.subtle,
                            }}
                            className="rounded-xl active:opacity-85 border"
                            accessibilityLabel={`Editar dirección ${addr.label}`}
                            accessibilityRole="button"
                          >
                            <Pencil
                              size={18}
                              color={palette.colors.icon.muted}
                            />
                          </Pressable>
                          <Pressable
                            onPress={() => handleDelete(addr.id)}
                            style={{
                              minHeight: 48,
                              minWidth: 48,
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: `${palette.colors.state.error}1F`,
                              borderColor: `${palette.colors.state.error}3D`,
                            }}
                            className="rounded-xl active:opacity-85 border"
                            accessibilityLabel={`Eliminar dirección ${addr.label}`}
                            accessibilityRole="button"
                          >
                            <Trash2
                              size={18}
                              color={palette.colors.state.error}
                            />
                          </Pressable>
                        </View>
                      </View>
                    </Animated.View>
                  ))}
                </View>
              ) : (
                <View
                  className="items-start rounded-[28px] border border-dashed p-6"
                  style={{
                    backgroundColor: palette.colors.surface.card,
                    borderColor: palette.colors.border.subtle,
                  }}
                >
                  <View
                    className="mb-5 h-14 w-14 items-center justify-center rounded-[22px]"
                    style={{ backgroundColor: palette.colors.surface.muted }}
                  >
                    <MapPin size={28} color={palette.colors.icon.primary} />
                  </View>
                  <Text
                    className="mb-2 text-xl font-black tracking-[-0.3px]"
                    style={{ color: palette.colors.ink.primary }}
                  >
                    No hay direcciones guardadas
                  </Text>
                  <Text
                    className="text-sm leading-5"
                    style={{ color: palette.colors.ink.muted }}
                  >
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
