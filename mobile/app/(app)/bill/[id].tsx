import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatDate, formatPaymentMethod } from '@/lib/format';
import {
  fetchBillWithItems,
  printReceipt,
  shareReceiptPdf,
} from '@/lib/receiptActions';
import type { BillWithItems } from '@/lib/types';

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { store } = useStore();
  const [bill, setBill] = useState<BillWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'print' | 'share' | null>(null);

  const loadBill = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const data = await fetchBillWithItems(id);
    setBill(data);
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadBill();
    }, [loadBill])
  );

  const handleShare = async () => {
    if (!bill || !store) return;
    try {
      setActionLoading('share');
      await shareReceiptPdf(bill, store);
    } catch (e) {
      Alert.alert('Share failed', e instanceof Error ? e.message : 'Could not share receipt');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePrint = async () => {
    if (!bill || !store) return;
    try {
      setActionLoading('print');
      await printReceipt(bill, store);
    } catch (e) {
      Alert.alert('Print failed', e instanceof Error ? e.message : 'Could not print receipt');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return <EmptyState title="Loading receipt..." loading />;
  }

  if (!bill || !store) {
    return <EmptyState title="Receipt not found" message="This bill may have been deleted" />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadBill} />}>
      <View style={styles.header}>
        <Text style={styles.storeName}>{store.name}</Text>
        {store.address ? <Text style={styles.meta}>{store.address}</Text> : null}
        {store.phone ? <Text style={styles.meta}>{store.phone}</Text> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.invoice}>{bill.invoice_number}</Text>
        <Text style={styles.meta}>{formatDate(bill.created_at)}</Text>
        <Text style={styles.meta}>Payment: {formatPaymentMethod(bill.payment_method)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Items</Text>
      {bill.bill_items.map((item) => (
        <View key={item.id} style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.product_name}</Text>
            <Text style={styles.itemMeta}>
              {item.quantity} × {formatCurrency(item.unit_price, store.currency)}
            </Text>
          </View>
          <Text style={styles.itemTotal}>
            {formatCurrency(item.line_total, store.currency)}
          </Text>
        </View>
      ))}

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(bill.subtotal, store.currency)}
          </Text>
        </View>
        {bill.discount > 0 ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount</Text>
            <Text style={styles.totalValue}>
              −{formatCurrency(bill.discount, store.currency)}
            </Text>
          </View>
        ) : null}
        {bill.tax_amount > 0 ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({store.tax_rate}%)</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(bill.tax_amount, store.currency)}
            </Text>
          </View>
        ) : null}
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.grandLabel}>Total</Text>
          <Text style={styles.grandValue}>
            {formatCurrency(bill.total, store.currency)}
          </Text>
        </View>
      </View>

      <Button
        title="Share PDF Receipt"
        onPress={handleShare}
        loading={actionLoading === 'share'}
        style={styles.action}
      />
      <Button
        title="Print Receipt"
        variant="outline"
        onPress={handlePrint}
        loading={actionLoading === 'print'}
        style={styles.action}
      />
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
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  storeName: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
  },
  meta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  invoice: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  itemName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  itemMeta: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  totals: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.lg,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  totalLabel: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  totalValue: {
    color: colors.text,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  grandTotal: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: 0,
  },
  grandLabel: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
  },
  grandValue: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  action: {
    marginBottom: spacing.sm,
  },
});
