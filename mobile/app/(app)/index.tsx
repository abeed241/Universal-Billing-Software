import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/format';
import { supabase } from '@/lib/supabase';

export default function DashboardScreen() {
  const { store } = useStore();
  const [todaySales, setTodaySales] = useState(0);
  const [todayBills, setTodayBills] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    if (!store) return;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('bills')
      .select('total')
      .eq('store_id', store.id)
      .gte('created_at', startOfDay.toISOString());

    if (error) {
      console.error(error.message);
      return;
    }

    const total = (data ?? []).reduce((sum, bill) => sum + Number(bill.total), 0);
    setTodaySales(total);
    setTodayBills(data?.length ?? 0);
  }, [store]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.greeting}>Welcome back</Text>
      <Text style={styles.storeName}>{store?.name ?? 'Your Store'}</Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Today&apos;s Sales</Text>
          <Text style={styles.statValue}>
            {formatCurrency(todaySales, store?.currency ?? 'INR')}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Bills Today</Text>
          <Text style={styles.statValue}>{todayBills}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <Link href="/(app)/bill/new" asChild>
        <Button title="New Bill" style={styles.actionBtn} />
      </Link>
      <Link href="/(app)/products/add" asChild>
        <Button title="Add Product" variant="outline" style={styles.actionBtn} />
      </Link>
      <Link href="/(app)/history" asChild>
        <Button title="View Sales History" variant="outline" style={styles.actionBtn} />
      </Link>
    </ScrollView>
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
  greeting: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  storeName: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionBtn: {
    marginBottom: spacing.sm,
  },
});
