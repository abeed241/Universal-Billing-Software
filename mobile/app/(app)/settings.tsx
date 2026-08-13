import { router } from 'expo-router';
import { useEffect, useState } from 'react';
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
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';

export default function SettingsScreen() {
  const { signOut, user } = useAuth();
  const { store, updateStore } = useStore();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!store) return;
    setName(store.name);
    setAddress(store.address ?? '');
    setPhone(store.phone ?? '');
    setTaxRate(String(store.tax_rate));
  }, [store]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Store name is required');
      return;
    }

    const tax = parseFloat(taxRate);
    if (isNaN(tax) || tax < 0 || tax > 100) {
      Alert.alert('Error', 'Tax rate must be between 0 and 100');
      return;
    }

    setSaving(true);
    const { error } = await updateStore({
      name: name.trim(),
      address: address.trim() || null,
      phone: phone.trim() || null,
      tax_rate: tax,
    });
    setSaving(false);

    if (error) {
      Alert.alert('Save failed', error);
      return;
    }

    Alert.alert('Saved', 'Store settings updated');
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>Account</Text>
        <Text style={styles.email}>{user?.email ?? '—'}</Text>

        <Text style={styles.sectionTitle}>Store details</Text>
        <Input label="Store Name *" value={name} onChangeText={setName} />
        <Input
          label="Address"
          value={address}
          onChangeText={setAddress}
          multiline
          placeholder="Store address"
        />
        <Input
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />
        <Input
          label="Tax Rate (%)"
          value={taxRate}
          onChangeText={setTaxRate}
          keyboardType="decimal-pad"
        />

        <Text style={styles.hint}>
          Currency: {store?.currency ?? 'INR'} · Shown on receipts
        </Text>

        <Button title="Save Settings" onPress={handleSave} loading={saving} />
        <Button
          title="Sign Out"
          variant="danger"
          onPress={handleSignOut}
          style={styles.signOut}
        />
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
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  email: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  signOut: {
    marginTop: spacing.lg,
  },
});
