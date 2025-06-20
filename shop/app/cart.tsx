import { View, Text, Button as RNButton } from "react-native";
import { useCart } from "@/context/CartContext";
import products from "@/assets/products.json";

export default function CartScreen() {
  const { cart, removeFromCart } = useCart();

  if (cart.length === 0) {
    return (
      <View style={{ padding: 16 }}>
        <Text>El carrito está vacío</Text>
      </View>
    );
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>
        Carrito:
      </Text>
      {cart.map((item) => {
        const product = products.find((p) => p.id === item.id);
        return (
          <View key={item.id} style={{ marginBottom: 8, flexDirection: "row", alignItems: "center" }}>
            <Text style={{ flex: 1}}>
              {product?.name ?? "Producto"} x {item.quantity}
            </Text>
            <RNButton
              title="Eliminar"
              color="red"
              onPress={() => removeFromCart(item.id)}
            />
          </View>
        );
      })}
    </View>
  );
}