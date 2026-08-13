import { router, useLocalSearchParams } from 'expo-router';
import ProductFormScreen from './add';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProductFormScreen productId={id} />;
}
