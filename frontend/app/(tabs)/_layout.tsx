import { Tabs } from "expo-router";
import BottomNavBar from "@/components/ui/NavBar/BottomNavBar";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function TabsLayout() {
  const { palette } = useAppTheme();

  return (
    <Tabs
      tabBar={(props) => <BottomNavBar {...props} />}
      screenOptions={{
        headerShown: false,
        headerTitleAlign: "center",
        sceneStyle: { backgroundColor: palette.colors.surface.warm },
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
