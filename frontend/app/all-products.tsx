import React, { useCallback, useMemo } from 'react';
import { View, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/ui/text';
import { useBreakpointValue } from '@/components/ui/utils/use-break-point-value';
import { useQuery } from '@tanstack/react-query';
import { listProducts } from '@/api/products';
import ProductListItem from '@/components/ProductListItem';
import { Header } from '@/components/Header';
import { RefreshCw, Package } from 'lucide-react-native';

export default function AllProductsScreen() {
  const router = useRouter();
  const { data: products, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: listProducts,
  });

  const numColumns = useBreakpointValue({
    default: 2,
    sm: 3,
    xl: 4,
  }) as number;

  const renderItem = useCallback(({ item }: { item: any }) => (
    <View style={{ width: numColumns === 2 ? '50%' : numColumns === 3 ? '33.33%' : '25%' }}>
      <ProductListItem product={item} />
    </View>
  ), [numColumns]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <StatusBar style="dark" />
      <Stack.Screen options={{ headerShown: false }} />

      <Header userName="Usuario" showBackButton={true} />

      <View style={{ paddingHorizontal: 16, paddingVertical: 8 }}>
        <Text style={{ fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 }}>
          Todos los Productos
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
          Explora nuestro catálogo completo de salud y bienestar.
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-500 mb-4">No se pudieron cargar los productos.</Text>
          <Pressable onPress={() => refetch()} className="bg-black px-6 py-3 rounded-full">
            <RefreshCw size={20} color="white" />
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          key={numColumns}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          contentContainerClassName="gap-2 max-w-[960px] mx-auto w-full px-3 pb-32"
          columnWrapperClassName="gap-2"
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Package size={48} color="#D1D5DB" />
              <Text className="text-gray-400 mt-4">No hay productos disponibles por ahora.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
