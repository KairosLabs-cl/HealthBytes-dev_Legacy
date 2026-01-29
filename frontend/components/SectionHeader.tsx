import React from "react";
import { View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Star } from "lucide-react-native"; // Default icon
import { Text } from "@/components/ui/text";

type Props = { 
  icon?: any; 
  title: string;
  lightText?: boolean;
};

export default function SectionHeader({ icon = Star, title, lightText = false }: Props) {
  return (
    <View className="flex-row items-center mb-2 px-3">
      <Icon as={icon} size="md" className={lightText ? "text-white" : "text-black"} />
      <Text className={`text-lg font-bold ml-2 ${lightText ? "text-white" : "text-black"}`}>{title}</Text>
    </View>
  );
}
// Puedes usar este componente así:
// <SectionHeader icon="heart" title="Mis Favoritos" />
// <SectionHeader title="Vistos Recientemente" lightText /> // Para fondos oscuros
