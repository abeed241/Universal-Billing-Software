import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fontSize, shadows, spacing } from '@/constants/theme';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatDate, formatPaymentMethod } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import type { Bill } from '@/lib/types';

export default function HistoryScreen() {
  const { store } = useStore();
  const isDesktop = useIsDesktop();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBills = useCallback(async () => {
    if (!store) return;

    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setBills((data as Bill[]) ?? []);
    }
    setLoading(false);
  }, [store]);

  useFocusEffect(
    useCallback(() => {
      loadBills();
    }, [loadBills])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBills();
    setRefreshing(false);
  };

  if (loading) {
    return <EmptyState title="Loading sales..." loading />;
  }

  if (bills.length === 0) {
    return (
      <EmptyState
        title="No sales yet"
        message="Create your first bill from the Bill tab"
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={[styles.content, isDesktop && styles.contentDesktop]}
      data={bills}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => (
        <Link
          href={{ pathname: '/(app)/bill/[id]', params: { id: item.id } }}
          asChild>
          <Pressable style={({ pressed }) => [styles.card, shadows.sm, pressed && styles.pressed]}>
            <View style={styles.row}>
              <Text style={styles.invoice}>{item.invoice_number}</Text>
              <Text style={styles.total}>
                {formatCurrency(item.total, store?.currency ?? 'INR')}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.meta}>{formatDate(item.created_at)}</Text>
              <Text style={styles.meta}>{formatPaymentMethod(item.payment_method)}</Text>
            </View>
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  contentDesktop: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: {
    backgroundColor: '#F0FDFA',
    borderColor: colors.primary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoice: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  total: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.primary,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
