import React, { useCallback } from 'react';
import { View, FlatList, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Text } from '@/components/ui/text';
import { useBreakpointValue } from '@/components/ui/utils/use-break-point-value';
import { useRecentlyViewed } from '@/store/recentlyViewedStore';
import ProductListItem from '@/components/ProductListItem';
import { Header } from '@/components/Header';
import { Clock } from 'lucide-react-native';

export default function RecentlyViewedScreen() {
  const history = useRecentlyViewed((state) => state.items);
  const router = useRouter();

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
          Recién Vistos
        </Text>
        <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 16 }}>
          Tu historial de navegación reciente.
        </Text>
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        key={numColumns}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        contentContainerClassName="gap-2 max-w-[960px] mx-auto w-full px-3 pb-32"
        columnWrapperClassName="gap-2"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-40 px-6">
            <Clock size={48} color="#D1D5DB" />
            <Text className="text-gray-400 mt-4 text-center">
              Aún no has visto ningún producto. ¡Empieza a explorar!
            </Text>
            <Pressable
              onPress={() => router.push('/')}
              className="mt-6 bg-black px-8 py-3 rounded-full"
            >
              <Text className="text-white font-bold">Explorar ahora</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}
