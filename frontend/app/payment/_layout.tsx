import { useAppTheme } from "@/hooks/useAppTheme";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";

export default function PaymentLayout() {
  const { palette, statusBarStyle } = useAppTheme();

  return (
    <>
      <StatusBar style={statusBarStyle} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.colors.surface.warm },
        }}
      >
        <Stack.Screen name="success" options={{ title: "Pago Exitoso" }} />
        <Stack.Screen name="failure" options={{ title: "Pago Rechazado" }} />
        <Stack.Screen name="pending" options={{ title: "Pago Pendiente" }} />
      </Stack>
    </>
  );
}
