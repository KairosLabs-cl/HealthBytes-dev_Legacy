import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useCart, selectCartItemCount } from "@/store/cartStore";
import { Home, ShoppingCart, User } from "lucide-react-native";
import React, { useCallback, useEffect } from "react";
import { Platform, Pressable, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

// Try to import haptics - gracefully degrade if not installed
type HapticsModule = typeof import("expo-haptics");
let Haptics: HapticsModule | null = null;
try {
  Haptics = require("expo-haptics") as HapticsModule;
} catch {
  // expo-haptics not installed, haptic feedback disabled
}

// Detect platform once at module level
const isMobile = Platform.OS !== "web";

// Only create AnimatedPressable on native (avoids web CSS transform issues)
const AnimatedPressable = isMobile
  ? Animated.createAnimatedComponent(Pressable)
  : null;

const TAB_CONFIG = [
  { name: "index", label: "Inicio", icon: Home, hasBadge: false },
  { name: "cart", label: "Carrito", icon: ShoppingCart, hasBadge: true },
  { name: "profile", label: "Perfil", icon: User, hasBadge: false },
] as const;

// --- Animated Badge Component ---
const AnimatedBadge = React.memo(({ count }: { count: number }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (count > 0 && isMobile) {
      scale.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      );
    }
  }, [count, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!count) return null;

  const badgeContent = (
    <Text className="text-white text-[11px] font-bold">{count}</Text>
  );

  if (isMobile) {
    return (
      <Animated.View
        style={animatedStyle}
        className="absolute -top-2 -right-3 bg-red-500 rounded-full min-w-[18px] px-1.5 h-[18px] items-center justify-center"
      >
        {badgeContent}
      </Animated.View>
    );
  }

  return (
    <View className="absolute -top-2 -right-3 bg-red-500 rounded-full min-w-[18px] px-1.5 h-[18px] items-center justify-center">
      {badgeContent}
    </View>
  );
});

AnimatedBadge.displayName = "AnimatedBadge";

// --- Tab Item Component ---
interface TabItemProps {
  label: string;
  icon: typeof Home;
  isActive: boolean;
  badge?: number;
  onPress: () => void;
  onLongPress: () => void;
}

const TabItem = React.memo(
  ({ label, icon, isActive, badge, onPress, onLongPress }: TabItemProps) => {
    const scale = useSharedValue(1);

    const handlePressIn = useCallback(() => {
      if (isMobile) {
        scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
      }
    }, [scale]);

    const handlePressOut = useCallback(() => {
      if (isMobile) {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      }
    }, [scale]);

    const handlePress = useCallback(() => {
      if (Haptics && isMobile) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle?.Light);
      }
      onPress();
    }, [onPress]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const innerContent = (
      <View
        className={`w-full items-center justify-center gap-1 rounded-full ${
          isMobile ? "px-3 py-2" : "px-3 py-1.5"
        }`}
        style={{
          backgroundColor: isActive ? "#ffffff" : "#303030",
          minHeight: 44,
        }}
      >
        <View className="relative">
          <Icon
            as={icon}
            color={isActive ? "#000" : "#cbd5e1"}
            size={isMobile ? "lg" : "md"}
          />
          {badge !== undefined && <AnimatedBadge count={badge} />}
        </View>
        <Text
          className={`${isMobile ? "text-xs" : "text-[10px]"} font-bold`}
          style={{ color: isActive ? "#000" : "#cbd5e1" }}
        >
          {label}
        </Text>
      </View>
    );

    if (isMobile && AnimatedPressable) {
      return (
        <AnimatedPressable
          style={[{ minHeight: 48 }, { width: "100%", flex: 1 }]}
          className="items-center justify-center"
          accessibilityRole="button"
          accessibilityState={isActive ? { selected: true } : {}}
          accessibilityLabel={label}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          onLongPress={onLongPress}
        >
          <Animated.View style={[animatedStyle, { width: "100%" }]}>
            {innerContent}
          </Animated.View>
        </AnimatedPressable>
      );
    }

    // On web: use plain Pressable (no Reanimated transforms)
    return (
      <Pressable
        style={{ minHeight: 48, flex: 1 }}
        className="items-center justify-center"
        accessibilityRole="button"
        accessibilityState={isActive ? { selected: true } : {}}
        accessibilityLabel={label}
        onPress={handlePress}
        onLongPress={onLongPress}
      >
        {innerContent}
      </Pressable>
    );
  }
);

TabItem.displayName = "TabItem";

// --- Main BottomNavBar ---
function BottomNavBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const cartCount = useCart(selectCartItemCount);
  const insets = useSafeAreaInsets();

  // Calculate bottom position respecting safe area
  const bottomPosition = Math.max(insets.bottom, 8);

  const navContent = (
    <View
      className={`bg-black rounded-full flex-row justify-between items-center ${
        isMobile ? "px-4 py-2" : "px-3 py-1.5"
      } ${isMobile ? "gap-3" : "gap-2"}`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
      }}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const config = TAB_CONFIG.find((t) => t.name === route.name);
        if (!config) return null;

        return (
          <TabItem
            key={route.key}
            label={options.title !== undefined ? options.title : config.label}
            icon={config.icon}
            isActive={isFocused}
            badge={config.hasBadge ? cartCount : undefined}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        );
      })}
    </View>
  );

  const positionStyle = {
    position: "absolute" as const,
    bottom: bottomPosition,
    left: 12,
    right: 12,
    zIndex: 50,
  };

  return <View style={positionStyle}>{navContent}</View>;
}

export default React.memo(BottomNavBar);
