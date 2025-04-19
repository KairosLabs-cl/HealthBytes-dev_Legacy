import { Text } from 'react-native';

export default function ProductListItem ({product})  {
    return <Text style={{ fontSize: 18 }}>{product.name}</Text>
}