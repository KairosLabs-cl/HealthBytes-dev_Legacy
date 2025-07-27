import { HStack } from "@/components/ui/hstack";
import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { useCart } from "@/store/cartStore";
import { View, FlatList, Alert } from "react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Redirect, useRouter } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createOrder } from "@/api/orders";
import { useEffect } from "react";

export default function CartScreen() {
  const items = useCart((state) => state.items);
  const resetCart = useCart((state) => state.resetCart);

  const createOrderMutation = useMutation({
    mutationFn: () =>
      createOrder(
        items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price, // Ver un parche para esta parte debido a que existe un peligro para entregar un precio diferente al correcto por lo que esto se debe manejar la base de datos
        }))
      ),
    onSuccess: (data) => {
      console.log(data);
      resetCart();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const onCheckout = () => {
    createOrderMutation.mutate();
  };

  if (items.length === 0) {
    return <Redirect href={"/"} />;
  }

  return (
    <FlatList
      data={items}
      contentContainerClassName="gap-2 max-w-[960px] w-full mx-auto p-2"
      renderItem={({ item }) => (
        <HStack className="bg-white p-3">
          <VStack space="sm">
            <Text bold>{item.product.name}</Text>
            <Text>{item.product.price}</Text>
          </VStack>
          <Text className="ml-auto">{item.quantity}</Text>
        </HStack>
      )}
      ListFooterComponent={() => (
        <Button onPress={onCheckout}>
          <ButtonText>Checkout</ButtonText>
        </Button>
      )}
    />
  );
}
