import React from "react";
import { View, Pressable, ViewStyle, StyleProp } from "react-native";
import { Text } from "@/components/ui/text";
import { useAppTheme } from "@/hooks/useAppTheme";

/**
 * Props for the ListEmptyState component.
 *
 * @property {React.ElementType} icon - Icon component to display.
 * @property {string} [iconColor] - Color for the icon (defaults to theme palette icon.primary).
 * @property {string} [iconBgColor] - Background color for the icon container (defaults to theme palette surface.muted).
 * @property {string} title - Main heading text.
 * @property {string} description - Description text below the title.
 * @property {string} [actionLabel] - Label for the action button (button only renders if both actionLabel and onActionPress provided).
 * @property {() => void} [onActionPress] - Callback when action button is pressed.
 * @property {StyleProp<ViewStyle>} [style] - Additional styles for the root container.
 */
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

/**
 * A reusable empty-list UI component with an optional action button.
 * Memoized via React.memo for performance.
 *
 * @param {ListEmptyStateProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered React element.
 */
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
