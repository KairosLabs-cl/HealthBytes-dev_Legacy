// Puedes colocar este componente en un archivo como components/ui/BottomNavBar.tsx

import { View, Pressable, Platform } from "react-native";
import { Link, usePathname } from "expo-router";
import { Icon } from "@/components/ui/icon";
import { ShoppingCart, Home, User } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useCart } from "@/store/cartStore";
import React, { useMemo, useCallback } from "react";

function BottomNavBar() {
  const pathname = usePathname();
  const cartCount = useCart((state) => state.items.length);

  // Detect if we're on mobile (not web)
  const isMobile = Platform.OS !== 'web';

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

  // Responsive sizes based on platform
  const containerPadding = isMobile ? "px-4 py-3" : "px-3 py-2";
  const buttonPadding = isMobile ? "py-3" : "py-2";
  const innerPadding = isMobile ? "px-4 py-3" : "px-3 py-2";
  const gap = isMobile ? "gap-3" : "gap-2";
  const textSize = isMobile ? "text-sm" : "text-xs";
  const iconSize = isMobile ? "lg" : "md";

  return (
    <View className="absolute bottom-3 left-3 right-3 z-50">
      <View className={`bg-black rounded-3xl flex-row justify-between items-center shadow-lg ${containerPadding} ${gap}`}>
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link key={tab.href} href={tab.href} asChild>
              <Pressable className={`flex-1 items-center ${buttonPadding}`} accessibilityRole="button">
                <View
                  className={`w-full flex-row items-center justify-center gap-2 rounded-2xl ${innerPadding}`}
                  style={{ backgroundColor: active ? "#ffffff" : "#303030" }}
                >
                  <View className="relative">
                    <Icon as={tab.icon} color={active ? "#000" : "#fff"} size={iconSize} />
                    {tab.badge ? (
                      <View className="absolute -top-2 -right-3 bg-red-500 rounded-full min-w-[18px] px-1.5 h-[18px] items-center justify-center">
                        <Text className="text-white text-[11px] font-bold">{tab.badge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    className={`${textSize} font-bold ${active ? "text-black" : "text-white"}`}
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
