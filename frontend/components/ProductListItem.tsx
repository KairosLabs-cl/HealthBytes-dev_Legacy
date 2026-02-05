import { Card } from "@/components/ui/card"
import { Image } from "@/components/ui/image"
import { Text } from "@/components/ui/text"
import { Heading } from "@/components/ui/heading"
import { Link } from "expo-router"
import { Pressable, View, Platform, GestureResponderEvent } from "react-native"
import { memo } from "react";
import type { Product } from "@/types/product"
import { formatPrice } from "@/lib/formatPrice"
import { ShoppingCart } from "lucide-react-native"
import { useCart } from "@/store/cartStore"

type Props = { product: Product };

function ProductListItem ({product} : Props) {
  const addProduct = useCart((state) => state.addProduct);

  const handleAddToCart = (e: GestureResponderEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addProduct(product);
  };

  return (
    <Link href={`/product/${product.id}`} asChild>
      <Pressable className="flex-1">
        <Card className="p-5 rounded-lg flex-1 relative">
          <Image
            source={{
              uri: product.image,
            }}
            className="mb-6 h-[240px] w-full rounded-md aspect-[4/3]"
            alt={`${product.name} image`}
            resizeMode="contain"
          />
          <Text className="text-sm font-normal mb-2 text-typography-700">
            {product.name}
          </Text>
          <View className="flex-row items-center justify-between">
            <Heading size="md" className="mb-4">
              {formatPrice(product.price)}
            </Heading>

            <Pressable
              onPress={handleAddToCart}
              className="w-10 h-10 rounded-full bg-black items-center justify-center active:opacity-80"
              style={Platform.select({
                web: {
                  boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
                },
                default: {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                },
              })}
            >
              <ShoppingCart size={18} color="white" />
            </Pressable>
          </View>
        </Card>
      </Pressable>
    </Link>
  );
}

export default memo(ProductListItem);
