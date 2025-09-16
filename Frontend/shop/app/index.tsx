import { ActivityIndicator, FlatList, ScrollView, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Text } from "@/components/ui/text";
import { useBreakpointValue } from "@/components/ui/utils/use-break-point-value";
import { listProducts } from "@/api/products";
import ProductListItem from "@/components/ProductListItem";
import FavoritesBar from "@/components/FavoritesBar";
import RecentlyViewedBar from "@/components/RecentlyViewedBar";
import { Header } from "@/components/Header";
import { Stack } from "expo-router";

export default function HomeScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: listProducts,
  });

  const numColumns = useBreakpointValue({
    default: 2,
    sm: 3,
    xl: 4,
  }) as number;

  if (isLoading) return <ActivityIndicator />;
  if (error) return <Text>Error cargando productos</Text>;

return (
  <>
    <Stack.Screen options={{ headerShown: false }} />

    <ScrollView className="flex-1 bg-white">
      <Header userName="Francisco" />

      <View className="px-3">
        <FavoritesBar products={data} />
      </View>

      <View className="px-3">
        <RecentlyViewedBar />
      </View>

      <FlatList
        key={numColumns}
        data={data}
        numColumns={numColumns}
        scrollEnabled={false}
        contentContainerClassName="gap-2 max-w-[960px] mx-auto w-full px-3 pb-8"
        columnWrapperClassName="gap-2"
        renderItem={({ item }) => <ProductListItem product={item} />}
      />
    </ScrollView>
  </>
);
}