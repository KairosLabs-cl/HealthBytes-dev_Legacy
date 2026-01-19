// Puedes colocar este componente en un archivo como components/ui/BottomNavBar.tsx

import { View } from "react-native";
import { Link, usePathname } from "expo-router";
import { Icon } from "@/components/ui/icon";
import { ShoppingCart, Home, User } from "lucide-react-native";
import { Pressable } from "react-native";
import { Text } from "@/components/ui/text";

export default function BottomNavBar() {
  const pathname = usePathname();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderColor: "#eee",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
      }}
    >
      <Link href="/" asChild>
        <Pressable style={{ alignItems: "center" }}>
          <Icon as={Home} color={pathname === "/" ? "#007AFF" : "#888"} />
          <Text 
          style={{ color: pathname === "/" ? "#007AFF" : "#888", fontSize: 12, fontWeight: "bold", marginTop: 2  }}
          
          >Inicio</Text>
        </Pressable>
      </Link>
      <Link href="/cart" asChild>
        <Pressable style={{ alignItems: "center" }}>
          <Icon as={ShoppingCart} color={pathname === "/cart" ? "#007AFF" : "#888"} />
          <Text style={{ color: pathname === "/cart" ? "#007AFF" : "#888", fontSize: 12,  fontWeight: "bold", marginTop: 2 }}>Carrito</Text>
        </Pressable>
      </Link>
      <Link href="/login" asChild>
        <Pressable  style={{ alignItems: "center" }}>
          <Icon as={User} color={pathname === "/login" ? "#007AFF" : "#888"} />
          <Text style={{ color: pathname === "/login" ? "#007AFF" : "#888", fontSize: 12,  fontWeight: "bold", marginTop: 2  }}>Perfil</Text>
        </Pressable>
      </Link>
    </View>
  );
}