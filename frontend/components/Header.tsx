import { View, TextInput, Pressable } from "react-native";
import { Text } from "./ui/text";
import { Search, ArrowLeft, X } from "lucide-react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";

type HeaderProps = {
  userName: string;
  onSearchChange?: (searchTerm: string) => void;
  initialSearchTerm?: string;
  showBackButton?: boolean;
};

export function Header({
  userName,
  onSearchChange,
  initialSearchTerm = "",
  showBackButton = false,
}: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const router = useRouter();

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
    <View className="px-4 pt-6 pb-4 bg-white">
      {showBackButton ? (
        <View className="flex-row items-center mb-1">
          <Pressable onPress={() => router.push("/")} className="mr-2 p-1">
            <ArrowLeft size={24} color="#000" />
          </Pressable>
          <Text className="text-lg font-bold">Volver</Text>
        </View>
      ) : (
        <Text className="text-lg font-bold">👋 Hola, {userName}!</Text>
      )}

      <View className="flex-row items-center mt-3 rounded-full border border-gray-300 px-3 py-2 bg-gray-50">
        <Pressable onPress={handleSearchSubmit}>
          <Search size={20} color="#888" />
        </Pressable>
        <TextInput
          placeholder="¿Qué podemos encontrar por ti?"
          className="flex-1 ml-2 text-base"
          placeholderTextColor="#888"
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
        />
        {searchTerm.length > 0 && (
          <Pressable onPress={handleClear} className="ml-2">
            <X size={20} color="#888" />
          </Pressable>
        )}
      </View>
    </View>
  );
}
