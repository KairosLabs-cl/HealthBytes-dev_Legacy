import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { MapPinIcon, NavigationIcon, StoreIcon } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function StoresScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { palette, statusBarStyle } = useAppTheme();

  // Mock stores for demonstration
  const stores = [
    {
      id: "1",
      name: "Jumbo Alto Las Condes",
      address: "Av. Kennedy 9001",
      distance: "1.2 km",
      status: "Disponible",
    },
    {
      id: "2",
      name: "Líder Express Vitacura",
      address: "Vitacura 4500",
      distance: "2.5 km",
      status: "Pocas unidades",
    },
    {
      id: "3",
      name: "Farmacias Ahumada",
      address: "Av. Apoquindo 4000",
      distance: "3.1 km",
      status: "Disponible",
    },
  ];

  return (
    <View className="flex-1 bg-surface-warm">
      <StatusBar style={statusBarStyle} />
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader
        title="Dónde conseguir"
        icon={MapPinIcon}
        showBackButton={true}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        <View className="mb-6 rounded-[24px] border border-border-subtle bg-surface-card overflow-hidden">
          {/* Map Placeholder */}
          <View className="h-48 bg-surface-sunken items-center justify-center">
            <MapPinIcon size={48} color={palette.colors.icon.muted} />
            <Text className="mt-2 text-ink-muted font-medium">
              Mapa de tiendas cercanas
            </Text>
          </View>
        </View>

        <Text className="mb-4 text-xl font-black text-ink">
          Tiendas con stock
        </Text>

        <View className="gap-3">
          {stores.map((store) => (
            <View
              key={store.id}
              className="flex-row items-center justify-between rounded-2xl border border-border-subtle bg-surface-card p-4"
            >
              <View className="flex-1 mr-4">
                <View className="flex-row items-center mb-1">
                  <StoreIcon size={16} color={palette.colors.icon.primary} />
                  <Text className="ml-2 font-bold text-ink">{store.name}</Text>
                </View>
                <Text className="text-sm text-ink-muted">{store.address}</Text>
                <View className="mt-2 flex-row items-center">
                  <Text className="text-xs font-semibold text-ink">
                    {store.distance}
                  </Text>
                  <View className="mx-2 h-1 w-1 rounded-full bg-ink-subtle" />
                  <Text
                    className={`text-xs font-semibold ${
                      store.status === "Disponible"
                        ? "text-state-success"
                        : "text-state-warning"
                    }`}
                  >
                    {store.status}
                  </Text>
                </View>
              </View>

              <Button
                size="sm"
                className="h-10 w-10 rounded-full bg-surface-warm items-center justify-center"
                style={{ paddingHorizontal: 0 }}
                accessibilityRole="button"
                accessibilityLabel="Ir a la tienda"
              >
                <NavigationIcon size={16} color={palette.colors.icon.primary} />
              </Button>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
