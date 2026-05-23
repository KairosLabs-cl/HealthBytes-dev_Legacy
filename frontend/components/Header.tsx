import { View, TextInput, Pressable } from "react-native";
import { Text } from "./ui/text";
import { Search, ArrowLeft, X } from "lucide-react-native";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { theme } from "@/lib/theme";

const { colors } = theme;

type HeaderProps = {
  userName: string;
  onSearchChange?: (searchTerm: string) => void;
  initialSearchTerm?: string;
  showBackButton?: boolean;
  isLoggedIn?: boolean;
};

export function Header({
  userName,
  onSearchChange,
  initialSearchTerm = "",
  showBackButton = false,
  isLoggedIn = false,
}: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const router = useRouter();

  const [salutation, setSalutation] = useState<string>("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setSalutation("Buenos días,");
    else if (hour < 19) setSalutation("Buenas tardes,");
    else setSalutation("Buenas noches,");
  }, []);

  // Sync internal state if prop changes (e.g. navigation back/forward)
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  const handleSearchSubmit = useCallback(() => {
    // Accessibility improvement: Only search on explicit submit
    const text = searchTerm;

    if (onSearchChange) {
      onSearchChange(text);
    }

    if (text.trim()) {
      router.push(`/search?q=${encodeURIComponent(text.trim())}`);
    } else {
      // If search is cleared and submitted, go back home
      router.push("/");
    }
  }, [searchTerm, onSearchChange, router]);

  const handleClear = useCallback(() => {
    setSearchTerm("");
    if (onSearchChange) {
      onSearchChange("");
    }
    router.push("/");
  }, [onSearchChange, router]);

  return (
    <View
      style={{
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
        backgroundColor: "#fafafa",
      }}
    >
      {showBackButton ? (
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
          <Pressable
            onPress={() => router.push("/")}
            style={{ marginRight: 8, padding: 4 }}
            accessibilityLabel="Volver"
            accessibilityRole="button"
            hitSlop={10}
          >
            <ArrowLeft size={24} color={colors.ink.primary} />
          </Pressable>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.ink.primary }}>
            Volver
          </Text>
        </View>
      ) : (
        isLoggedIn && salutation && (
          <View style={{ marginBottom: 14 }}>
            <Text
              style={{
                fontSize: 13,
                color: colors.ink.muted,
                fontWeight: "400",
                letterSpacing: 0.1,
                marginBottom: 2,
              }}
            >
              {salutation}
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "900",
                color: "#09090b",
                letterSpacing: -0.8,
                lineHeight: 28,
              }}
            >
              {userName}
            </Text>
          </View>
        )
      )}

      {/* Search bar */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 16,
          backgroundColor: "#f1f5f9",
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderWidth: 1,
          borderColor: "rgba(226,232,240,0.8)",
        }}
      >
        <Pressable
          onPress={handleSearchSubmit}
          accessibilityLabel="Buscar"
          accessibilityRole="button"
          hitSlop={12}
        >
          <Search size={18} color={colors.ink.muted} />
        </Pressable>
        <TextInput
          placeholder="¿Qué buscas hoy?"
          style={{
            flex: 1,
            marginLeft: 10,
            fontSize: 15,
            color: colors.ink.primary,
          }}
          placeholderTextColor={colors.ink.muted}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          accessibilityLabel="Buscar productos"
          accessibilityHint="Ingresa el nombre del producto que buscas"
        />
        {searchTerm.length > 0 && (
          <Pressable
            onPress={handleClear}
            style={{ marginLeft: 8 }}
            accessibilityLabel="Limpiar búsqueda"
            accessibilityRole="button"
            hitSlop={12}
          >
            <X size={18} color={colors.ink.muted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
