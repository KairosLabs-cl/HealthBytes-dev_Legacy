import { View, Pressable, Platform } from "react-native";
import { Link, usePathname } from "expo-router";
import { Icon } from "@/components/ui/icon";
import { ShoppingCart, Home, User } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useCart } from "@/store/cartStore";
import React, { useMemo, useCallback, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";

// Try to import haptics - gracefully degrade if not installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Haptics: any = null;
try {
  Haptics = require("expo-haptics");
} catch {
  // expo-haptics not installed, haptic feedback disabled
}

// Detect platform once at module level
const isMobile = Platform.OS !== "web";

// Only create AnimatedPressable on native (avoids web CSS transform issues)
const AnimatedPressable = isMobile
  ? Animated.createAnimatedComponent(Pressable)
  : null;

// Screens where the nav bar should be hidden
const HIDDEN_ROUTES = ["/product/"];

const TAB_CONFIG = [
  { href: "/", label: "Inicio", icon: Home, hasBadge: false },
  { href: "/cart", label: "Carrito", icon: ShoppingCart, hasBadge: true },
  { href: "/profile", label: "Perfil", icon: User, hasBadge: false },
] as const;

// --- Animated Badge Component ---
const AnimatedBadge = React.memo(({ count }: { count: number }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (count > 0 && isMobile) {
      scale.value = withSpring(1.3, { damping: 8, stiffness: 200 }, () => {
        scale.value = withSpring(1, { damping: 12, stiffness: 150 });
      });
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
  href: string;
  label: string;
  icon: typeof Home;
  isActive: boolean;
  badge?: number;
}

const TabItem = React.memo(
  ({ href, label, icon, isActive, badge }: TabItemProps) => {
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
    }, []);

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
            color={isActive ? "#000" : "#fff"}
            size={isMobile ? "lg" : "md"}
          />
          {badge !== undefined && <AnimatedBadge count={badge} />}
        </View>
        <Text
          className={`${isMobile ? "text-xs" : "text-[10px]"} font-bold ${
            isActive ? "text-black" : "text-white"
          }`}
        >
          {label}
        </Text>
      </View>
    );

    // On native: use AnimatedPressable with spring animations
    if (isMobile && AnimatedPressable) {
      return (
        <Link href={href} asChild>
          <AnimatedPressable
            style={[animatedStyle, { minHeight: 48 }]}
            className="flex-1 items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel={label}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
          >
            {innerContent}
          </AnimatedPressable>
        </Link>
      );
    }

    // On web: use plain Pressable (no Reanimated transforms)
    return (
      <Link href={href} asChild>
        <Pressable
          style={{ minHeight: 48 }}
          className="flex-1 items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel={label}
          onPress={handlePress}
        >
          {innerContent}
        </Pressable>
      </Link>
    );
  }
);

TabItem.displayName = "TabItem";

// --- Main BottomNavBar ---
function BottomNavBar() {
  const pathname = usePathname();
  const cartCount = useCart((state) => state.items.length);
  const insets = useSafeAreaInsets();

  // Determine visibility based on current route
  const shouldHide = useMemo(
    () => HIDDEN_ROUTES.some((route) => pathname?.startsWith(route)),
    [pathname]
  );

  // Animated show/hide (native only)
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (isMobile) {
      translateY.value = withTiming(shouldHide ? 120 : 0, {
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [shouldHide, translateY]);

  const navAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Memoize isActive check
  const isActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname?.startsWith(href) ?? false;
    },
    [pathname]
  );

  // Calculate bottom position respecting safe area
  const bottomPosition = Math.max(insets.bottom, 8);

  // On web: hide instantly without animation
  if (!isMobile && shouldHide) return null;

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
      {TAB_CONFIG.map((tab) => (
        <TabItem
          key={tab.href}
          href={tab.href}
          label={tab.label}
          icon={tab.icon}
          isActive={isActive(tab.href)}
          badge={tab.hasBadge ? cartCount : undefined}
        />
      ))}
    </View>
  );

  const positionStyle = {
    position: "absolute" as const,
    bottom: bottomPosition,
    left: 12,
    right: 12,
    zIndex: 50,
  };

  // On native: use Animated.View for slide animation
  if (isMobile) {
    return (
      <Animated.View
        style={[navAnimatedStyle, positionStyle]}
        pointerEvents={shouldHide ? "none" : "auto"}
      >
        {navContent}
      </Animated.View>
    );
  }

  // On web: use plain View
  return <View style={positionStyle}>{navContent}</View>;
}

export default React.memo(BottomNavBar);
