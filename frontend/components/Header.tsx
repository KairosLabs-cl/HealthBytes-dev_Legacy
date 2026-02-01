import { View, TextInput } from "react-native";
import { Text } from "./ui/text";
import { Search } from "lucide-react-native";
import { useState, useEffect, useRef } from "react";

type HeaderProps = {
  userName: string;
  onSearchChange: (searchTerm: string) => void;
}

export function Header({ userName, onSearchChange }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  // se Cambio agregar debounce para evitar búsquedas en cada tecla ya que se renderizaba la pagina cada vez que se escribia una letra
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (text: string) => {
    setSearchTerm(text);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Si el texto está vacío, buscar inmediatamente para limpiar resultados
    if (text.length === 0) {
      onSearchChange("");
      return;
    }

    // Se aumentó el debounce a 1000ms y se requiere mínimo 3 caracteres
    if (text.length >= 3) {
      debounceTimer.current = setTimeout(() => {
        onSearchChange(text);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <View className="px-4 pt-6 pb-4 bg-white">
      <Text className="text-lg font-bold">
        👋 Hola, {userName}!
      </Text>

      <View className="flex-row items-center mt-3 rounded-full border border-gray-300 px-3 py-2 bg-gray-50">
        <Search size={20} color="#888" />
        <TextInput
          placeholder="¿Qué podemos encontrar por ti?"
          className="flex-1 ml-2 text-base"
          placeholderTextColor="#888"
          value={searchTerm}
          onChangeText={handleSearchChange}
        />
      </View>
    </View>
  );
}