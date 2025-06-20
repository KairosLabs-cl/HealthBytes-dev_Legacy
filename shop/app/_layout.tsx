import "@/global.css";
import { Tabs } from "expo-router";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { CartProvider } from "@/context/CartContext";

export default function RootLayout({ children } : { children: React.ReactNode}) {
    return (
        <GluestackUIProvider>
            <CartProvider>
                {children}
                <Tabs/>
            </CartProvider>
            
        </GluestackUIProvider>
    );
}