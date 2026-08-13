import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { Link, useFocusEffect } from 'expo-router';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/Input';
import { ProductCard } from '@/components/ProductCard';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';

export default function ProductsScreen() {
  const { store } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProducts = useCallback(async () => {
    if (!store) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .eq('is_active', true)
      .order('name');

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setProducts((data as Product[]) ?? []);
    }
    setLoading(false);
  }, [store]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Input
          placeholder="Search products..."
          value={search}
          onChangeText={setSearch}
        />

        {filtered.length === 0 ? (
          <EmptyState
            title={loading ? 'Loading products...' : 'No products yet'}
            message={loading ? undefined : 'Add your first product to start billing'}
            loading={loading}
          />
        ) : (
          filtered.map((product) => (
            <Link
              key={product.id}
              href={{ pathname: '/(app)/products/[id]', params: { id: product.id } }}
              asChild>
              <ProductCard product={product} currency={store?.currency} />
            </Link>
          ))
        )}
      </ScrollView>

      <Link href="/(app)/products/add" asChild>
        <Button title="+ Add Product" style={styles.fab} />
      </Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
});
