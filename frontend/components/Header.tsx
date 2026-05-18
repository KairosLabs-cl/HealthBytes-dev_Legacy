import { View, TextInput, Pressable } from "react-native";
import { Text } from "./ui/text";
import { Search, ArrowLeft, X } from "lucide-react-native";
import React, { useState, useEffect } from "react";
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

  const [greeting, setGreeting] = useState<string>("");

  useEffect(() => {
    const templates = [
      "👋 Hola, {name}!",
      "✨ ¡Qué lindo volverte a ver, {name}!",
      "🎉 ¡Volviste, {name}!",
      "🙌 ¡Bienvenido de nuevo, {name}!",
      "🥗 ¿Listo para comer sano, {name}?",
      "💚 ¡Hola de nuevo, {name}!",
    ];
    setGreeting(templates[Math.floor(Math.random() * templates.length)]);
  }, []);

  // Sync internal state if prop changes (e.g. navigation back/forward)
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  const handleSearchSubmit = () => {
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
  };

  const handleClear = () => {
    setSearchTerm("");
    if (onSearchChange) {
      onSearchChange("");
    }
    // For a smoother UX, clear should probably not force navigate unless submitted,
    // but user requested "Que vuelva al home al limpiar".
    // We can interpret this as "when X is pressed" or "when submitted empty".
    // Let's make X clear text, and if on search page possibly navigate?
    // Actually simplicity: Clear text -> Focus -> Wait for user.
    // BUT user said: "Que vuelva al home al limpiar". Let's do that for the X button.
    router.push("/");
  };

  return (
    <View className="px-4 pt-6 pb-4 bg-surface-card">
      {showBackButton ? (
        <View className="flex-row items-center mb-1">
          <Pressable
            onPress={() => router.push("/")}
            className="mr-2 p-1"
            accessibilityLabel="Volver"
            accessibilityRole="button"
          >
            <ArrowLeft size={24} color={colors.ink.primary} />
          </Pressable>
          <Text className="text-lg font-bold">Volver</Text>
        </View>
      ) : (
        isLoggedIn &&
        greeting && (
          <Text className="text-lg font-bold">
            {greeting.replace("{name}", userName)}
          </Text>
        )
      )}

      <View className="flex-row items-center mt-3 rounded-full border border-border-subtle px-3 py-2 bg-surface-muted">
        <Pressable
          onPress={handleSearchSubmit}
          accessibilityLabel="Buscar"
          accessibilityRole="button"
        >
          <Search size={20} color={colors.ink.muted} />
        </Pressable>
        <TextInput
          placeholder="¿Qué podemos encontrar por ti?"
          className="flex-1 ml-2 text-base"
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
            className="ml-2"
            accessibilityLabel="Limpiar búsqueda"
            accessibilityRole="button"
          >
            <X size={20} color={colors.ink.muted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
