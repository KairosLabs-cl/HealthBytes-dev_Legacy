import React from "react";
import { View, Pressable, ViewStyle, StyleProp } from "react-native";
import { Text } from "@/components/ui/text";
import { useAppTheme } from "@/hooks/useAppTheme";

export type ListEmptyStateProps = {
  icon: React.ElementType;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export const ListEmptyState = React.memo(
  ({
    icon: Icon,
    iconColor,
    iconBgColor,
    title,
    description,
    actionLabel,
    onActionPress,
    style,
  }: ListEmptyStateProps) => {
    const { palette } = useAppTheme();

    return (
      <View className="flex-1 items-center justify-center p-8" style={style}>
        <View className="items-start rounded-[28px] border border-border-subtle bg-surface-card p-6 w-full">
          <View
            className="mb-6 h-16 w-16 items-center justify-center rounded-[24px]"
            style={{
              backgroundColor: iconBgColor ?? palette.colors.surface.muted,
            }}
          >
            <Icon size={32} color={iconColor ?? palette.colors.icon.primary} />
          </View>
          <Text className="mb-2 text-xl font-black tracking-[-0.3px] text-ink">
            {title}
          </Text>
          <Text className="mb-6 text-base leading-6 text-ink-muted">
            {description}
          </Text>
          {actionLabel && onActionPress && (
            <Pressable
              onPress={onActionPress}
              className="rounded-2xl bg-ink px-6 py-3 active:opacity-80"
              style={{ minHeight: 48 }}
              accessibilityRole="button"
              accessibilityLabel={actionLabel}
            >
              <Text className="text-base font-bold text-ink-inverse">
                {actionLabel}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  }
);

ListEmptyState.displayName = "ListEmptyState";
