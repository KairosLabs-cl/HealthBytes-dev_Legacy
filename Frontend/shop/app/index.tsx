import { ActivityIndicator, FlatList } from 'react-native';
import ProductListItem from '../components/ProductListItem';
import { useBreakpointValue } from '@/components/ui/utils/use-break-point-value';
import { listProducts } from '@/api/products';
import { useQuery } from '@tanstack/react-query';
// import { err } from 'react-native-svg/lib/typescript/xml';
import { Text } from '@/components/ui/text';
import RecentlyViewedBar from '@/components/RecentlyViewedBar';
import { Header } from '@/components/Header';
import { Stack } from 'expo-router';

export default function HomeScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: listProducts,
  });

  const numColumns = useBreakpointValue({
    default: 2,
    sm: 3,
    xl: 4,
  }) as number;

  if (isLoading) {
    return <ActivityIndicator />;
  }

  if (error) {
    return <Text>Error loading products</Text>;
  }

  
  return (
    <>
      <Stack.Screen options={{ headerShown: false}} />
      <Header userName='Guillermo' />
      
      <RecentlyViewedBar />
      <FlatList
        key={numColumns}
        data={data}
        numColumns={numColumns}
        contentContainerClassName="gap-2 max-w-[960px] mx-auto w-full"
        columnWrapperClassName="gap-2"
        renderItem={({ item }) => <ProductListItem product={item} />}
      />
    </>
  );
}