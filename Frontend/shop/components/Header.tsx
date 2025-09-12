import { View, TextInput } from "react-native";
import { Text } from "./ui/text";
import { Search } from "lucide-react-native";

type HeaderProps = {
    userName: string;
}

export function Header({ userName }: HeaderProps) {
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
        />
      </View>
    </View>
  );
}