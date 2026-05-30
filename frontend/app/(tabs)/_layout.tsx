import { Tabs } from "expo-router";
import BottomNavBar from "@/components/ui/NavBar/BottomNavBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNavBar {...props} />}
      screenOptions={{
        headerShown: false,
        headerTitleAlign: "center",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Carrito",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Mi Perfil",
        }}
      />
    </Tabs>
  );
}
