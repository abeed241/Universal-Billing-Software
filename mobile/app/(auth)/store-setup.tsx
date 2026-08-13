import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { FormMessage } from '@/components/FormMessage';
import { Input } from '@/components/Input';
import { useStore } from '@/context/StoreContext';

export default function StoreSetupScreen() {
  const { createStore } = useStore();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [taxRate, setTaxRate] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (!name.trim()) {
      setError('Store name is required.');
      return;
    }

    const tax = parseFloat(taxRate) || 0;
    if (tax < 0 || tax > 100) {
      setError('Tax rate must be between 0 and 100.');
      return;
    }

    setLoading(true);
    try {
      const { error: createError } = await createStore({
        name: name.trim(),
        address: address.trim() || undefined,
        phone: phone.trim() || undefined,
        tax_rate: tax,
        currency: 'INR',
      });

      if (createError) {
        setError(createError);
        return;
      }

      router.replace('/');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Set Up Your Store" subtitle="This info appears on your receipts">
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

      <FormMessage error={error} />

      <Button title="Continue" onPress={handleSubmit} loading={loading} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({});
