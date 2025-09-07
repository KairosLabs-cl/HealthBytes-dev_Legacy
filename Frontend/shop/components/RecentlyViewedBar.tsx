import { ScrollView, Pressable, View } from "react-native";
import { useRecentlyViewed } from "@/store/recentlyViewedStore";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { Link } from "expo-router";

export default function RecentlyViewedBar() {
  const products = useRecentlyViewed((s) => s.products);

  if (!products.length) return null;

  return (
    <View
        style={{
            marginVertical: 15,
            alignItems: "center",
            width: "100%",
        }}    
    >
      <Text
        style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}
      >
        Vistos recientemente
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`} asChild>
            <Pressable 
                style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    padding: 5,
                    alignItems: "center",
                    width: 95,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                }}
                android_ripple={{ color: "#eee" }}
            
            >
              <Image
                source={{ uri: product.image }}
                style={{
                    width: 70,
                    height: 70,
                    borderRadius: 8,
                    marginBottom: 6,
                    backgroundColor: "#f5f5f5",
                        
                    
                    }}
                alt={product.name}
                resizeMode="contain"
              />
              <Text 
                numberOfLines={2} 
                style={{
                    width: 80,
                    fontSize: 12,
                    textAlign: "center",
                    color: "#333",
                }}
                
                
                >
                {product.name}
              </Text>
            </Pressable>
          </Link>
        ))}
      </ScrollView>
    </View>
  );
}