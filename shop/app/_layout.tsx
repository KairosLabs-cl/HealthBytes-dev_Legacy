import "@/global.css";
import { Link, Stack } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { Icon } from "@/components/ui/icon";
import { ShoppingCart } from "lucide-react-native";
import { Pressable } from "react-native";
import { useCart } from "@/store/cartStore";
import { Text } from "@/components/ui/text";

export default function RootLayout() {
    const cartItemsNum = useCart((state) => state.items.length);

    return (
        <GluestackUIProvider>
            <Stack 
                screenOptions={{ 
                    headerRight: () => 
                        cartItemsNum > 0 && (
                        <Link href={"/cart"} asChild> 
                            <Pressable className="flex-row gap-2">
                                <Icon as={ShoppingCart} />
                                <Text>{cartItemsNum}</Text>
                            </Pressable>
                        </Link>
                    ),
                }}
            >
                <Stack.Screen name="index" options={{title: "Shop"}}/>
                <Stack.Screen name="product/[id]" options={{title: "Product"}}/>
                
            </Stack>
            
        </GluestackUIProvider>
    );
}