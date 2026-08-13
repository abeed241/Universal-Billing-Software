import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/Input';
import { ProductCard } from '@/components/ProductCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { spacing } from '@/constants/theme';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';

export default function ProductsScreen() {
  const { store } = useStore();
  const isDesktop = useIsDesktop();
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
    <ScreenContainer scroll contentStyle={styles.content}>
      <View style={styles.toolbar}>
        <View style={styles.searchWrap}>
          <Input
            placeholder="Search products..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Link href="/(app)/products/add" asChild>
          <Button title="+ Add Product" style={styles.addBtn} />
        </Link>
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          title={loading ? 'Loading products...' : 'No products yet'}
          message={loading ? undefined : 'Add your first product to start billing'}
          loading={loading}
        />
      ) : (
        <View style={[styles.grid, isDesktop && styles.gridDesktop]}>
          {filtered.map((product) => (
            <View
              key={product.id}
              style={[styles.gridItem, isDesktop && styles.gridItemDesktop]}>
              <Link
                href={{ pathname: '/(app)/products/[id]', params: { id: product.id } }}
                asChild>
                <ProductCard product={product} currency={store?.currency} />
              </Link>
            </View>
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  searchWrap: {
    flex: 1,
  },
  addBtn: {
    minWidth: 160,
    marginTop: 22,
  },
  grid: {
    gap: spacing.sm,
  },
  gridDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  gridItem: {
    width: '100%',
  },
  gridItemDesktop: {
    width: '48%',
    minWidth: 280,
    flexGrow: 1,
    maxWidth: '32%',
  },
});
