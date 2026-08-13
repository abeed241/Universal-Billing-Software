import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, spacing } from '@/constants/theme';
import { formatCurrency } from '@/lib/format';
import type { CartItem } from '@/lib/types';

interface CartItemRowProps {
  item: CartItem;
  currency?: string;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}

export function CartItemRow({
  item,
  currency = 'INR',
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemRowProps) {
  const lineTotal = item.quantity * item.product.price;

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={styles.price}>
          {formatCurrency(item.product.price, currency)} × {item.quantity}
        </Text>
      </View>

      <View style={styles.actions}>
        <View style={styles.qtyControls}>
          <Pressable style={styles.qtyBtn} onPress={onDecrease}>
            <Text style={styles.qtyBtnText}>−</Text>
          </Pressable>
          <Text style={styles.qty}>{item.quantity}</Text>
          <Pressable style={styles.qtyBtn} onPress={onIncrease}>
            <Text style={styles.qtyBtnText}>+</Text>
          </Pressable>
        </View>
        <Text style={styles.lineTotal}>{formatCurrency(lineTotal, currency)}</Text>
        <Pressable onPress={onRemove} hitSlop={8}>
          <Text style={styles.remove}>Remove</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  info: {
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  price: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyBtnText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  qty: {
    fontSize: fontSize.md,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  lineTotal: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
  },
  remove: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
});
