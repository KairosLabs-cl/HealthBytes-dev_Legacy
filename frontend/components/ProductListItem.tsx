import { Card } from "@/components/ui/card"
import { Image } from "@/components/ui/image"
import { Text } from "@/components/ui/text"
import { Heading } from "@/components/ui/heading"
import { Link } from "expo-router"
import { Pressable, View, Platform, GestureResponderEvent } from "react-native"
import { memo, useCallback, useMemo } from "react"
import type { Product } from "@/types/product"
import { formatPrice } from "@/lib/formatPrice"
import { ShoppingCart } from "lucide-react-native"
import { useCart } from "@/store/cartStore"

interface ProductListItemProps { 
  product: Product;
}

/**
 * ProductListItem Component
 * Displays a product card with image, name, price, and add to cart button
 * Optimized with memo to prevent unnecessary re-renders
 */
function ProductListItem({ product }: ProductListItemProps) {
  const addProduct = useCart((state) => state.addProduct);

  const handleAddToCart = useCallback((e: GestureResponderEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addProduct(product);
  }, [product, addProduct]);

  const formattedPrice = useMemo(() => formatPrice(product.price), [product.price]);
  const productLink = useMemo(() => `/product/${product.id}`, [product.id]);

  return (
    <Link href={productLink} asChild>
      <Pressable 
        className="flex-1"
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, ${formattedPrice}`}
        accessibilityHint="Toca para ver detalles del producto"
      >
        <Card className="p-5 rounded-lg flex-1 relative">
          <Image
            source={{ uri: product.image }}
            className="mb-6 h-[240px] w-full rounded-md aspect-[4/3]"
            alt={`Imagen de ${product.name}`}
            resizeMode="contain"
            accessible={true}
            accessibilityLabel={`Imagen de ${product.name}`}
          />
          <Text className="text-sm font-normal mb-2 text-typography-700">
            {product.name}
          </Text>
          <View className="flex-row items-center justify-between">
            <Heading size="md" className="mb-4">
              {formattedPrice}
            </Heading>
            
            <Pressable
              onPress={handleAddToCart}
              className="w-10 h-10 rounded-full bg-black items-center justify-center active:opacity-80"
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`Añadir ${product.name} al carrito`}
              accessibilityHint="Doble toca para añadir al carrito de compras"
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

// Memoize component to prevent unnecessary re-renders
export default memo(ProductListItem, (prevProps, nextProps) => {
  return (
    prevProps.product.id === nextProps.product.id &&
    prevProps.product.price === nextProps.product.price &&
    prevProps.product.name === nextProps.product.name
  );
});
