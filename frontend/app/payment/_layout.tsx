import { Stack } from "expo-router";

export default function PaymentLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="success" options={{ title: "Pago Exitoso" }} />
      <Stack.Screen name="failure" options={{ title: "Pago Rechazado" }} />
      <Stack.Screen name="pending" options={{ title: "Pago Pendiente" }} />
    </Stack>
  );
}
