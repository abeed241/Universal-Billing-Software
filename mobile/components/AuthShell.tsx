import { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors, fontSize, layout, shadows, spacing } from '@/constants/theme';
import { useIsDesktop } from '@/hooks/useIsDesktop';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <View style={styles.desktopRoot}>
        <View style={styles.brandPanel}>
          <Text style={styles.brandLogo}>Universal Billing</Text>
          <Text style={styles.brandTagline}>
            Add products, create bills, and generate receipts — all in one place.
          </Text>
          <View style={styles.featureList}>
            <Text style={styles.featureItem}>• Product & inventory management</Text>
            <Text style={styles.featureItem}>• Fast POS billing with tax & discount</Text>
            <Text style={styles.featureItem}>• PDF receipts you can print or share</Text>
          </View>
        </View>

        <View style={styles.formPanel}>
          <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            {children}
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.mobileContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  desktopRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
    minHeight: '100%',
  },
  brandPanel: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.xl * 2,
    justifyContent: 'center',
  },
  brandLogo: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    marginBottom: spacing.md,
  },
  brandTagline: {
    fontSize: fontSize.lg,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 28,
    maxWidth: 420,
    marginBottom: spacing.xl,
  },
  featureList: {
    gap: spacing.sm,
  },
  featureItem: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 24,
  },
  formPanel: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: layout.authCardWidth,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  mobileContainer: {
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
