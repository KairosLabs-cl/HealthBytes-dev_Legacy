import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Text } from "@/components/ui/text";
import { useBreakpointValue } from "@/components/ui/utils/use-break-point-value";
import { listProducts } from "@/api/products";
import ProductListItem from "@/components/ProductListItem";
import { Header } from "@/components/Header";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Product } from "@/types/product";

const keyExtractor = (item: Product) => item.id.toString();

export default function SearchScreen() {
    const { q } = useLocalSearchParams<{ q: string }>();
    const searchTerm = q || "";
    const { user } = useUser();
    const router = useRouter();

    const { data, isLoading, error } = useQuery({
        queryKey: ["products", searchTerm],
        queryFn: () => listProducts(searchTerm),
        enabled: !!searchTerm,
    });

    const numColumns = useBreakpointValue({
        default: 2,
        sm: 3,
        xl: 4,
    }) as number;

    const renderHeader = () => (
        <>
            <Header
                userName={user?.firstName || user?.fullName || "Usuario"}
                initialSearchTerm={searchTerm}
                showBackButton={true}
            />
            {searchTerm && (
                <View className="px-4 py-2">
                    <Text className="text-gray-500 text-lg">
                        Resultados para <Text className="font-bold text-black">"{searchTerm}"</Text>
                    </Text>
                </View>
            )}
        </>
    );

    const renderEmpty = () => (
        <View className="flex-1 items-center justify-center p-8 mt-10">
            <Text className="text-center text-gray-500 text-lg mb-6">
                {searchTerm
                    ? `No se encontraron resultados para "${searchTerm}"`
                    : "Ingresa un término para buscar"}
            </Text>

            <Pressable
                onPress={() => router.push('/')}
                className="bg-black px-6 py-3 rounded-full active:opacity-80"
            >
                <Text className="text-white font-bold text-base">Volver al inicio</Text>
            </Pressable>
        </View>
    );

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <Stack.Screen options={{ headerShown: false }} />
                <Header userName={user?.firstName || user?.fullName || "Usuario"} initialSearchTerm={searchTerm} showBackButton={true} />
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" />
                </View>
            </SafeAreaView>
        )
    }

    if (error) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <Stack.Screen options={{ headerShown: false }} />
                <Header userName={user?.firstName || user?.fullName || "Usuario"} initialSearchTerm={searchTerm} showBackButton={true} />
                <View className="flex-1 items-center justify-center">
                    <Text className="text-red-500">Error cargando resultados</Text>
                    <Pressable
                        onPress={() => router.push('/')}
                        className="mt-4 bg-black px-6 py-3 rounded-full"
                    >
                        <Text className="text-white font-bold">Volver al inicio</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <StatusBar style="dark" />
            <Stack.Screen options={{ headerShown: false }} />

            <FlatList
                className="flex-1 bg-gray-50"
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                key={numColumns}
                keyExtractor={keyExtractor}
                data={data || []}
                numColumns={numColumns}
                contentContainerClassName="gap-2 max-w-[960px] mx-auto w-full px-3 pb-32"
                columnWrapperClassName="gap-2"
                renderItem={({ item }) => <ProductListItem product={item} />}
            />
        </SafeAreaView>
    );
}
