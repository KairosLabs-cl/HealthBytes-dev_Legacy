import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";

function Chip({ icon, label, className = "" }: { icon: keyof typeof Ionicons.glyphMap; label: string; className?: string }) {
  return (
    <Pressable className={`flex-row items-center px-3 py-2 rounded-full border ${className}`}>
      <Ionicons name={icon} size={14} />
      <Text className="ml-2 text-[12px]">{label}</Text>
    </Pressable>
  );
}

export default function QuickFilters() {
  return (
    <View className="flex-row gap-2 px-3 mt-2 mb-1">
      <Chip icon="star" label="Recomendado para ti" className="border-green-300" />
      <Chip icon="heart-outline" label="Favoritos" className="border-orange-300" />
      <Chip icon="leaf-outline" label="Sin gluten" className="border-blue-300" />
    </View>
  );
}
