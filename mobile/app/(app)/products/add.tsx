import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { colors, fontSize, spacing } from '@/constants/theme';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import type { Product } from '@/lib/types';

const UNITS = ['pcs', 'kg', 'ltr', 'box', 'pack'];

interface ProductFormScreenProps {
  productId?: string;
}

export default function ProductFormScreen({ productId }: ProductFormScreenProps) {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = productId ?? params.id;
  const isEdit = Boolean(id);
  const { store } = useStore();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [stock, setStock] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const loadProduct = useCallback(async () => {
    if (!id) return;

    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();

    if (error || !data) {
      Alert.alert('Error', 'Product not found');
      router.back();
      return;
    }

    const product = data as Product;
    setName(product.name);
    setPrice(String(product.price));
    setCategory(product.category ?? '');
    setSku(product.sku ?? '');
    setBarcode(product.barcode ?? '');
    setUnit(product.unit);
    setStock(product.stock != null ? String(product.stock) : '');
    setInitialLoading(false);
  }, [id]);

  useEffect(() => {
    if (isEdit) {
      loadProduct();
    }
  }, [isEdit, loadProduct]);

  const handleSave = async () => {
    if (!store) return;
    if (!name.trim()) {
      Alert.alert('Error', 'Product name is required');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      Alert.alert('Error', 'Enter a valid price');
      return;
    }

    const payload = {
      store_id: store.id,
      name: name.trim(),
      price: priceNum,
      category: category.trim() || null,
      sku: sku.trim() || null,
      barcode: barcode.trim() || null,
      unit,
      stock: stock ? parseFloat(stock) : null,
      updated_at: new Date().toISOString(),
    };

    setLoading(true);

    if (isEdit && id) {
      const { error } = await supabase.from('products').update(payload).eq('id', id);
      setLoading(false);
      if (error) {
        Alert.alert('Error', error.message);
        return;
      }
    } else {
      const { error } = await supabase.from('products').insert(payload);
      setLoading(false);
      if (error) {
        Alert.alert('Error', error.message);
        return;
      }
    }

    router.back();
  };

  const handleDelete = () => {
    if (!id) return;

    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('products').delete().eq('id', id);
          if (error) {
            Alert.alert('Error', error.message);
            return;
          }
          router.back();
        },
      },
    ]);
  };

  if (initialLoading) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Input label="Product Name *" value={name} onChangeText={setName} placeholder="Item name" />
        <Input
          label="Price *"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
        <Input
          label="Category"
          value={category}
          onChangeText={setCategory}
          placeholder="Groceries, Electronics..."
        />
        <Input label="SKU" value={sku} onChangeText={setSku} placeholder="SKU-001" />
        <Input label="Barcode" value={barcode} onChangeText={setBarcode} placeholder="Optional" />

        <Text style={styles.label}>Unit</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitRow}>
          {UNITS.map((u) => (
            <Button
              key={u}
              title={u}
              variant={unit === u ? 'primary' : 'outline'}
              onPress={() => setUnit(u)}
              style={styles.unitBtn}
              textStyle={styles.unitBtnText}
            />
          ))}
        </ScrollView>

        <Input
          label="Stock (optional)"
          value={stock}
          onChangeText={setStock}
          keyboardType="decimal-pad"
          placeholder="Leave empty if not tracked"
        />

        <Button title={isEdit ? 'Save Changes' : 'Add Product'} onPress={handleSave} loading={loading} />

        {isEdit ? (
          <Button title="Delete Product" variant="danger" onPress={handleDelete} style={styles.deleteBtn} />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  unitRow: {
    marginBottom: spacing.md,
  },
  unitBtn: {
    marginRight: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 40,
  },
  unitBtnText: {
    fontSize: fontSize.sm,
  },
  deleteBtn: {
    marginTop: spacing.md,
  },
});
