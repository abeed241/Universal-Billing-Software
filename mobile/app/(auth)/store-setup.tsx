import { router } from 'expo-router';
import { useState } from 'react';
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

export default function StoreSetupScreen() {
  const { createStore } = useStore();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Store name is required');
      return;
    }

    const tax = parseFloat(taxRate) || 0;
    if (tax < 0 || tax > 100) {
      Alert.alert('Error', 'Tax rate must be between 0 and 100');
      return;
    }

    setLoading(true);
    const { error } = await createStore({
      name: name.trim(),
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
      tax_rate: tax,
      currency: 'INR',
    });
    setLoading(false);

    if (error) {
      Alert.alert('Setup Failed', error);
      return;
    }

    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Set Up Your Store</Text>
        <Text style={styles.subtitle}>This info appears on your receipts</Text>

        <Input
          label="Store Name *"
          value={name}
          onChangeText={setName}
          placeholder="My Retail Store"
        />
        <Input
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="123 Main Street"
          multiline
        />
        <Input
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+91 98765 43210"
        />
        <Input
          label="Tax Rate (%)"
          value={taxRate}
          onChangeText={setTaxRate}
          keyboardType="decimal-pad"
          placeholder="18"
        />

        <Button title="Continue" onPress={handleSubmit} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
});
