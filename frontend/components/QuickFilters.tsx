import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Star, Heart, Apple } from "lucide-react-native";

function Chip({ icon, label, className = "" }: { icon: any; label: string; className?: string }) {
  return (
    <Pressable className={`flex-row items-center px-3 py-2 rounded-full border ${className}`}>
      <Icon as={icon} size="sm" />
      <Text className="ml-2 text-[12px]">{label}</Text>
    </Pressable>
  );
}

export default function QuickFilters() {
  return (
    <View className="flex-row gap-2 px-3 mt-2 mb-1">
      <Chip icon={Star} label="Recomendado para ti" className="border-green-300" />
      <Chip icon={Heart} label="Favoritos" className="border-orange-300" />
      <Chip icon={Apple} label="Sin gluten" className="border-blue-300" />
    </View>
  );
}
