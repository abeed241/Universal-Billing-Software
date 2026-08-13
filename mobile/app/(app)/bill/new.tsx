import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/Button';
import { CartItemRow } from '@/components/CartItemRow';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/Input';
import { ProductCard } from '@/components/ProductCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { colors, fontSize, shadows, spacing } from '@/constants/theme';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { useStore } from '@/context/StoreContext';
import {
  calculateDiscountAmount,
  calculateLineTotal,
  calculateSubtotal,
  calculateTaxAmount,
  calculateTotal,
} from '@/lib/billing';
import { formatCurrency } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import type { CartItem, PaymentMethod, Product } from '@/lib/types';

function CartPanel({
  cart,
  currency,
  store,
  discount,
  setDiscount,
  discountType,
  setDiscountType,
  paymentMethod,
  setPaymentMethod,
  subtotal,
  discountAmount,
  taxAmount,
  total,
  submitting,
  onIncrease,
  onDecrease,
  onRemove,
  onCheckout,
  compact,
}: {
  cart: CartItem[];
  currency: string;
  store: { tax_rate: number } | null;
  discount: string;
  setDiscount: (v: string) => void;
  discountType: 'flat' | 'percent';
  setDiscountType: (v: 'flat' | 'percent') => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (v: PaymentMethod) => void;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  submitting: boolean;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  compact?: boolean;
}) {
  return (
    <View style={[styles.cartPanel, compact && styles.cartPanelCompact, shadows.md]}>
      <Text style={styles.cartTitle}>Cart ({cart.length})</Text>

      <ScrollView style={styles.cartScroll} nestedScrollEnabled>
        {cart.length === 0 ? (
          <Text style={styles.cartEmpty}>Tap products to add them here</Text>
        ) : (
          cart.map((item) => (
            <CartItemRow
              key={item.product.id}
              item={item}
              currency={currency}
              onIncrease={() => onIncrease(item.product.id)}
              onDecrease={() => onDecrease(item.product.id)}
              onRemove={() => onRemove(item.product.id)}
            />
          ))
        )}
      </ScrollView>

      <Text style={styles.sectionTitle}>Discount</Text>
      <View style={styles.row}>
        <Button
          title="Flat"
          variant={discountType === 'flat' ? 'primary' : 'outline'}
          onPress={() => setDiscountType('flat')}
          style={styles.chip}
          textStyle={styles.chipText}
        />
        <Button
          title="%"
          variant={discountType === 'percent' ? 'primary' : 'outline'}
          onPress={() => setDiscountType('percent')}
          style={styles.chip}
          textStyle={styles.chipText}
        />
      </View>
      <Input
        label={discountType === 'percent' ? 'Discount (%)' : 'Discount amount'}
        value={discount}
        onChangeText={setDiscount}
        keyboardType="decimal-pad"
        placeholder="0"
      />

      <Text style={styles.sectionTitle}>Payment</Text>
      <View style={styles.row}>
        {(['cash', 'upi', 'card'] as PaymentMethod[]).map((method) => (
          <Button
            key={method}
            title={method.toUpperCase()}
            variant={paymentMethod === method ? 'primary' : 'outline'}
            onPress={() => setPaymentMethod(method)}
            style={styles.chip}
            textStyle={styles.chipText}
          />
        ))}
      </View>

      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatCurrency(subtotal, currency)}</Text>
        </View>
        {discountAmount > 0 ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Discount</Text>
            <Text style={styles.totalValue}>−{formatCurrency(discountAmount, currency)}</Text>
          </View>
        ) : null}
        {(store?.tax_rate ?? 0) > 0 ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({store?.tax_rate}%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(taxAmount, currency)}</Text>
          </View>
        ) : null}
        <View style={[styles.totalRow, styles.grandTotal]}>
          <Text style={styles.grandLabel}>Total</Text>
          <Text style={styles.grandValue}>{formatCurrency(total, currency)}</Text>
        </View>
      </View>

      <Button
        title="Generate Bill"
        onPress={onCheckout}
        loading={submitting}
        disabled={cart.length === 0}
      />
    </View>
  );
}

export default function NewBillScreen() {
  const { store } = useStore();
  const isDesktop = useIsDesktop();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountType, setDiscountType] = useState<'flat' | 'percent'>('flat');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'products' | 'cart'>('products');

  const loadProducts = useCallback(async () => {
    if (!store) return;

    setLoadingProducts(true);
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
    setLoadingProducts(false);
  }, [store]);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku?.toLowerCase().includes(q) ?? false) ||
        (p.barcode?.toLowerCase().includes(q) ?? false)
    );
  }, [products, search]);

  const subtotal = calculateSubtotal(cart);
  const discountValue = parseFloat(discount) || 0;
  const discountAmount = calculateDiscountAmount(subtotal, discountValue, discountType);
  const taxAmount = calculateTaxAmount(subtotal, discountAmount, store?.tax_rate ?? 0);
  const total = calculateTotal(subtotal, discountAmount, taxAmount);
  const currency = store?.currency ?? 'INR';

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleCheckout = async () => {
    if (!store) return;
    if (cart.length === 0) {
      Alert.alert('Empty cart', 'Add at least one product to create a bill');
      return;
    }

    setSubmitting(true);

    const items = cart.map((item) => ({
      product_id: item.product.id,
      product_name: item.product.name,
      quantity: item.quantity,
      unit_price: item.product.price,
      line_total: calculateLineTotal(item.quantity, item.product.price),
    }));

    const { data, error } = await supabase.rpc('create_bill_with_items', {
      p_store_id: store.id,
      p_subtotal: subtotal,
      p_tax_amount: taxAmount,
      p_discount: discountAmount,
      p_total: total,
      p_payment_method: paymentMethod,
      p_items: items,
    });

    setSubmitting(false);

    if (error) {
      Alert.alert('Billing failed', error.message);
      return;
    }

    setCart([]);
    setDiscount('');
    setStep('products');
    router.push({ pathname: '/(app)/bill/[id]', params: { id: String(data) } });
  };

  const cartPanelProps = {
    cart,
    currency,
    store,
    discount,
    setDiscount,
    discountType,
    setDiscountType,
    paymentMethod,
    setPaymentMethod,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    submitting,
    onIncrease: (id: string) => updateQty(id, 1),
    onDecrease: (id: string) => updateQty(id, -1),
    onRemove: removeFromCart,
    onCheckout: handleCheckout,
  };

  if (isDesktop) {
    return (
      <ScreenContainer contentStyle={styles.desktopContent}>
        <View style={styles.desktopLayout}>
          <View style={styles.productsPane}>
            <Text style={styles.pageTitle}>New Bill</Text>
            <Input placeholder="Search products..." value={search} onChangeText={setSearch} />

            {filtered.length === 0 ? (
              <EmptyState
                title={loadingProducts ? 'Loading products...' : 'No products found'}
                message={
                  loadingProducts ? undefined : 'Add products from the Products tab before billing'
                }
                loading={loadingProducts}
              />
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.productRow}
                contentContainerStyle={styles.productList}
                renderItem={({ item }) => (
                  <View style={styles.productCell}>
                    <ProductCard
                      product={item}
                      currency={currency}
                      onPress={() => addToCart(item)}
                    />
                  </View>
                )}
              />
            )}
          </View>

          <CartPanel {...cartPanelProps} compact />
        </View>
      </ScreenContainer>
    );
  }

  if (step === 'cart') {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.mobileCartContent}
          keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => setStep('products')}>
            <Text style={styles.backLink}>← Add more products</Text>
          </Pressable>
          <CartPanel {...cartPanelProps} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Input placeholder="Search products..." value={search} onChangeText={setSearch} />
        </View>

        {filtered.length === 0 ? (
          <EmptyState
            title={loadingProducts ? 'Loading products...' : 'No products found'}
            message={
              loadingProducts ? undefined : 'Add products from the Products tab before billing'
            }
            loading={loadingProducts}
          />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                currency={currency}
                onPress={() => addToCart(item)}
              />
            )}
          />
        )}
      </View>

      {cart.length > 0 ? (
        <View style={[styles.cartBar, shadows.md]}>
          <View>
            <Text style={styles.cartCount}>{cart.length} item(s)</Text>
            <Text style={styles.cartTotal}>{formatCurrency(total, currency)}</Text>
          </View>
          <Button title="View Cart" onPress={() => setStep('cart')} style={styles.cartBtn} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, backgroundColor: colors.background },
  desktopContent: { flex: 1, maxWidth: 1400 },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.lg,
    minHeight: 600,
  },
  productsPane: {
    flex: 2,
  },
  pageTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.md,
  },
  productList: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  productRow: {
    gap: spacing.md,
  },
  productCell: {
    flex: 1,
    minWidth: '45%',
  },
  cartPanel: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  cartPanelCompact: {
    flex: 1,
    maxWidth: 400,
    minWidth: 320,
    alignSelf: 'flex-start',
    ...(Platform.OS === 'web' ? { position: 'sticky' as const, top: 24 } : {}),
  },
  cartTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  cartScroll: {
    maxHeight: 280,
    marginBottom: spacing.md,
  },
  cartEmpty: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  mobileCartContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 120,
  },
  backLink: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },
  chipText: {
    fontSize: fontSize.sm,
  },
  totals: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.md,
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
  cartBar: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cartCount: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
  },
  cartTotal: {
    color: colors.text,
    fontSize: fontSize.lg,
    fontWeight: '800',
  },
  cartBtn: {
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
});
