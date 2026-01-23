import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "@/components/ui/text";

type Props = { icon?: keyof typeof Ionicons.glyphMap; title: string; };

export default function SectionHeader({ icon = "star", title }: Props) {
  return (
    <View className="flex-row items-center mb-2 px-3">
      <Ionicons name={icon} size={18} />
      <Text className="text-lg font-bold ml-2">{title}</Text>
    </View>
  );
}
// Puedes usar este componente así:
// <SectionHeader icon="heart" title="Mis Favoritos" />
// <SectionHeader title="Vistos Recientemente" />