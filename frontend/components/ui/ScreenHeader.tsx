import React from "react";
import { View, Pressable } from "react-native";
import { Text } from "./text";
import { Icon } from "./icon";
import { ArrowLeft } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenHeaderProps {
  title: string;
  icon?: LucideIcon;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({
  title,
  icon,
  showBackButton = false,
  rightElement,
}: ScreenHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="px-6 py-4 bg-white"
      style={{ paddingTop: Math.max(insets.top, 16) }}
    >
      <View className="flex-row items-center gap-3">
        {showBackButton && (
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 active:bg-gray-200"
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
          >
            <ArrowLeft size={24} color="#000" />
          </Pressable>
        )}

        {icon && (
          <View className="w-10 h-10 items-center justify-center">
            <Icon as={icon} size="xl" color="#000" />
          </View>
        )}

        <Text className="text-2xl font-black text-black tracking-tight flex-1">
          {title}
        </Text>

        {rightElement}
      </View>
    </View>
  );
}
