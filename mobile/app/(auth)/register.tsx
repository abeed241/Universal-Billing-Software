import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { FormMessage } from '@/components/FormMessage';
import { Input } from '@/components/Input';
import { spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { showAlert } from '@/lib/alert';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setError(null);

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Check mobile/.env and restart the app.');
      return;
    }

    if (!email.trim() || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const result = await signUp(email.trim(), password);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.needsEmailConfirmation) {
        showAlert(
          'Confirm your email',
          'We sent a confirmation link to your email. Click it, then come back and sign in.',
          () => router.replace('/(auth)/login')
        );
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
    <AuthShell title="Create Account" subtitle="Start billing for your store">
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="you@store.com"
      />
      <Input
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="At least 6 characters"
      />
      <Input
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        placeholder="Repeat password"
      />

      <FormMessage error={error} />

      <Button title="Create Account" onPress={handleRegister} loading={loading} />

      <Link href="/(auth)/login" asChild>
        <Button title="Back to Sign In" variant="outline" style={styles.linkBtn} />
      </Link>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  linkBtn: {
    marginTop: spacing.md,
  },
});
