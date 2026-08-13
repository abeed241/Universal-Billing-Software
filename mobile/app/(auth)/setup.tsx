import { Link } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { colors, fontSize, spacing } from '@/constants/theme';

export default function SetupInstructionsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Setup Required</Text>
      <Text style={styles.subtitle}>
        Configure Supabase before using the app.
      </Text>

      <View style={styles.card}>
        <Text style={styles.step}>1. Create a Supabase project at supabase.com</Text>
        <Text style={styles.step}>
          2. Run the SQL migration from supabase/migrations/001_initial_schema.sql
        </Text>
        <Text style={styles.step}>
          3. Copy mobile/.env.example to mobile/.env and add your URL and anon key
        </Text>
        <Text style={styles.step}>4. Restart the Expo dev server</Text>
      </View>

      <Link href="/(auth)/login" asChild>
        <Button title="Go to Login" />
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
    justifyContent: 'center',
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  step: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
});
