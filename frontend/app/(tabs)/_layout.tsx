import { Tabs } from "expo-router";
import BottomNavBar from "@/components/ui/NavBar/BottomNavBar";
import { useAppTheme } from "@/hooks/useAppTheme";

/**
 * Main layout for the tab-based navigation.
 * Renders the bottom tabs and manages screen options including the app theme.
 *
 * @returns {JSX.Element} The rendered Tabs layout component.
 */
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
          title: "Mi lista",
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
