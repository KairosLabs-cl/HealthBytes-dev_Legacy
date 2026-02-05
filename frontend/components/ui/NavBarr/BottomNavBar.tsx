// Puedes colocar este componente en un archivo como components/ui/BottomNavBar.tsx

import { View, Pressable, Platform } from "react-native";
import { Link, usePathname } from "expo-router";
import { Icon } from "@/components/ui/icon";
import { ShoppingCart, Home, User } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useCart } from "@/store/cartStore";
import React, { useMemo, useCallback } from "react";

// Detect platform once at module level (Platform.OS never changes)
const isMobile = Platform.OS !== 'web';

// Responsive sizes based on platform - computed once at module level
const RESPONSIVE_STYLES = {
  containerPadding: isMobile ? "px-4 py-2" : "px-3 py-1.5",
  buttonPadding: isMobile ? "py-2" : "py-1.5",
  innerPadding: isMobile ? "px-3 py-2" : "px-3 py-1.5",
  gap: isMobile ? "gap-3" : "gap-2",
  textSize: isMobile ? "text-sm" : "text-xs",
  iconSize: isMobile ? "lg" as const : "md" as const,
};

function BottomNavBar() {
  const pathname = usePathname();
  const cartCount = useCart((state) => state.items.length);

  // Memoize tabs array to prevent recreation on every render
  const tabs = useMemo(
    () => [
      { href: "/", label: "Inicio", icon: Home },
      { href: "/cart", label: "Carrito", icon: ShoppingCart, badge: cartCount },
      { href: "/profile", label: "Perfil", icon: User },
    ],
    [cartCount]
  );

  // Memoize isActive function
  const isActive = useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname?.startsWith(href);
    },
    [pathname]
  );

  return (
    <View className="absolute bottom-6 left-3 right-3 z-50">
      <View
        className={`bg-black rounded-full flex-row justify-between items-center ${RESPONSIVE_STYLES.containerPadding} ${RESPONSIVE_STYLES.gap}`}
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.12,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link key={tab.href} href={tab.href} asChild>
              <Pressable className={`flex-1 items-center ${RESPONSIVE_STYLES.buttonPadding}`} accessibilityRole="button">
                <View
                  className={`w-full flex-row items-center justify-center gap-2 rounded-full ${RESPONSIVE_STYLES.innerPadding}`}
                  style={{ backgroundColor: active ? "#ffffff" : "#303030" }}
                >
                  <View className="relative">
                    <Icon as={tab.icon} color={active ? "#000" : "#fff"} size={RESPONSIVE_STYLES.iconSize} />
                    {tab.badge ? (
                      <View className="absolute -top-2 -right-3 bg-red-500 rounded-full min-w-[18px] px-1.5 h-[18px] items-center justify-center">
                        <Text className="text-white text-[11px] font-bold">{tab.badge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    className={`${RESPONSIVE_STYLES.textSize} font-bold ${active ? "text-black" : "text-white"}`}
                  >
                    {tab.label}
                  </Text>
                </View>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

// Wrap with React.memo to prevent unnecessary re-renders
export default React.memo(BottomNavBar);
