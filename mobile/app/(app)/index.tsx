import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fontSize, shadows, spacing } from '@/constants/theme';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/format';
import { supabase } from '@/lib/supabase';

export default function DashboardScreen() {
  const { store } = useStore();
  const isDesktop = useIsDesktop();
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
    <ScreenContainer
      scroll
      scrollProps={{
        refreshControl: <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />,
      }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back</Text>
          <Text style={styles.storeName}>{store?.name ?? 'Your Store'}</Text>
        </View>
        {isDesktop ? (
          <Link href="/(app)/bill/new" asChild>
            <Button title="+ New Bill" style={styles.headerBtn} />
          </Link>
        ) : null}
      </View>

      <View style={[styles.statsRow, isDesktop && styles.statsRowDesktop]}>
        <View style={[styles.statCard, shadows.sm]}>
          <Text style={styles.statLabel}>Today&apos;s Sales</Text>
          <Text style={styles.statValue}>
            {formatCurrency(todaySales, store?.currency ?? 'INR')}
          </Text>
        </View>
        <View style={[styles.statCard, shadows.sm]}>
          <Text style={styles.statLabel}>Bills Today</Text>
          <Text style={styles.statValue}>{todayBills}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={[styles.actions, isDesktop && styles.actionsDesktop]}>
        <Link href="/(app)/bill/new" asChild>
          <Button title="New Bill" style={styles.actionBtn} />
        </Link>
        <Link href="/(app)/products/add" asChild>
          <Button title="Add Product" variant="outline" style={styles.actionBtn} />
        </Link>
        <Link href="/(app)/history" asChild>
          <Button title="View Sales History" variant="outline" style={styles.actionBtn} />
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerBtn: {
    minWidth: 140,
  },
  greeting: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  storeName: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statsRowDesktop: {
    gap: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
  actionsDesktop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
    minWidth: 180,
  },
});
