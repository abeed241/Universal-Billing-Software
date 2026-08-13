import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthShell } from '@/components/AuthShell';
import { Button } from '@/components/Button';
import { FormMessage } from '@/components/FormMessage';
import { Input } from '@/components/Input';
import { fontSize, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.setup}>
        <Text style={styles.setupTitle}>Setup Required</Text>
        <Text style={styles.setupText}>
          Add your Supabase credentials to mobile/.env before signing in.
        </Text>
        <Link href="/(auth)/setup" asChild>
          <Button title="View Setup Instructions" />
        </Link>
      </View>
    );
  }

  const handleLogin = async () => {
    setError(null);

    if (!email.trim() || !password) {
      setError('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await signIn(email.trim(), password);
      if (signInError) {
        setError(signInError);
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
    <AuthShell title="Sign In" subtitle="Sign in to manage your store">
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
        autoComplete="password"
        placeholder="Your password"
      />

      <FormMessage error={error} />

      <Button title="Sign In" onPress={handleLogin} loading={loading} />

      <Link href="/(auth)/register" asChild>
        <Button title="Create Account" variant="outline" style={styles.linkBtn} />
      </Link>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  setup: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  setupTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    marginBottom: spacing.sm,
  },
  setupText: {
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  linkBtn: {
    marginTop: spacing.md,
  },
});
