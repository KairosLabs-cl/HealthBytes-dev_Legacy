import { FlashList } from "@shopify/flash-list";
import { Pressable, View } from "react-native";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";
import { useQuery } from "@tanstack/react-query";
import { Text } from "@/components/ui/text";
import { useBreakpointValue } from "@/components/ui/utils/use-break-point-value";
import { listProducts } from "@/api/products";
import ProductListItem from "@/components/ProductListItem";
import { Header } from "@/components/Header";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import { Product } from "@/types/product";
import { useCallback, useMemo } from "react";
import { RefreshCw, Search as SearchIcon } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

const keyExtractor = (item: Product) => item.id.toString();

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const searchTerm = q || "";
  const { user } = useUser();
  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["products", searchTerm],
    queryFn: () => listProducts({ search: searchTerm }),
    enabled: !!searchTerm,
  });

  const numColumns = useBreakpointValue({
    default: 2,
    sm: 3,
    xl: 4,
  }) as number;

  const userName = user?.firstName || user?.fullName || "Usuario";

  const renderItem = useCallback(
    ({ item }: { item: Product }) => <ProductListItem product={item} />,
    []
  );

  const renderHeader = useMemo(
    () => (
      <>
        <Header
          userName={userName}
          initialSearchTerm={searchTerm}
          showBackButton={true}
        />
        {searchTerm && (
          <View className="px-4 py-2">
            <Text className="text-gray-500 text-lg">
              Resultados para{" "}
              <Text className="font-bold text-black">"{searchTerm}"</Text>
            </Text>
          </View>
        )}
      </>
    ),
    [userName, searchTerm]
  );

  const renderEmpty = useMemo(
    () => (
      <View className="mt-10 flex-1 justify-center p-8">
        <View className="items-start rounded-[28px] border border-slate-200/70 bg-white p-6">
        <View className="mb-5 h-14 w-14 items-center justify-center rounded-[22px] bg-slate-100">
          <SearchIcon size={26} color="#09090b" />
        </View>
        <Text className="mb-6 text-base leading-6 text-zinc-600">
          {searchTerm
            ? `No se encontraron resultados para "${searchTerm}"`
            : "Ingresa un término para buscar productos."}
        </Text>

        <Pressable
          onPress={() => router.push("/")}
          className="rounded-2xl bg-[#09090b] px-6 py-3 active:opacity-80"
          style={{ minHeight: 48 }}
          accessibilityRole="button"
          accessibilityLabel="Volver al inicio"
        >
          <Text className="text-white font-bold text-base">
            Volver al inicio
          </Text>
        </Pressable>
        </View>
      </View>
    ),
    [searchTerm, router]
  );

  if (isLoading) {
    return (
    <View className="flex-1 bg-[#fafafa]">
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenHeader title="Búsqueda" icon={SearchIcon} showBackButton={true} />
      <Header
        userName={userName}
        initialSearchTerm={searchTerm}
        showBackButton={false}
      />
      <View className="px-3 mt-4">
        <View className="flex-row gap-2 mb-2">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </View>
        <View className="flex-row gap-2">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </View>
      </View>
    </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#fafafa]">
        <Stack.Screen options={{ headerShown: false }} />
        <ScreenHeader
          title="Búsqueda"
          icon={SearchIcon}
          showBackButton={true}
        />
        <Header
          userName={userName}
          initialSearchTerm={searchTerm}
          showBackButton={false}
        />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 text-base mb-4">
            Error cargando resultados
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="mb-3 flex-row items-center gap-2 rounded-2xl bg-[#09090b] px-6 py-3"
            style={{ minHeight: 48 }}
            accessibilityRole="button"
            accessibilityLabel="Reintentar búsqueda"
          >
            <RefreshCw size={18} color="white" />
            <Text className="text-white font-bold">Reintentar</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/")}
            className="rounded-2xl px-6 py-3"
            style={{ minHeight: 48 }}
            accessibilityRole="button"
            accessibilityLabel="Volver al inicio"
          >
            <Text className="text-gray-600 font-bold">Volver al inicio</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#fafafa]">
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      <View key={numColumns} className="flex-1">
        <FlashList<Product>
          className="flex-1 bg-[#fafafa]"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          keyExtractor={keyExtractor}
          data={data || []}
          numColumns={numColumns}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 128 }}
          renderItem={renderItem}
          estimatedItemSize={280}
        />
      </View>
    </View>
  );
}
