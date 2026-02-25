import { Redirect } from "expo-router";

// Checkout v1 deprecated - redirects to the full multi-step checkout flow
export default function CheckoutScreen() {
  return <Redirect href="/checkout-v2" />;
}
