// Puedes colocar este componente en un archivo como components/ui/BottomNavBar.tsx

import { View, Pressable } from "react-native";
import { Link, usePathname } from "expo-router";
import { Icon } from "@/components/ui/icon";
import { ShoppingCart, Home, User } from "lucide-react-native";
import { Text } from "@/components/ui/text";
import { useCart } from "@/store/cartStore";

export default function BottomNavBar() {
  const pathname = usePathname();
  const cartCount = useCart((state) => state.items.length);

  const tabs = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/cart", label: "Carrito", icon: ShoppingCart, badge: cartCount },
    { href: "/profile", label: "Perfil", icon: User },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <View className="absolute bottom-3 left-3 right-3 z-50">
      <View className="bg-black rounded-3xl px-3 py-2 flex-row justify-between items-center shadow-lg gap-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link key={tab.href} href={tab.href} asChild>
              <Pressable className="flex-1 items-center py-2" accessibilityRole="button">
                <View
                  className={`w-full flex-row items-center justify-center gap-2 rounded-2xl px-3 py-2`}
                  style={{ backgroundColor: active ? "#ffffff" : "#303030" }}
                >
                  <View className="relative">
                    <Icon as={tab.icon} color={active ? "#000" : "#fff"} />
                    {tab.badge ? (
                      <View className="absolute -top-2 -right-3 bg-red-500 rounded-full min-w-[16px] px-1 h-4 items-center justify-center">
                        <Text className="text-white text-[10px] font-bold">{tab.badge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    className={`text-xs font-bold ${active ? "text-black" : "text-white"}`}
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