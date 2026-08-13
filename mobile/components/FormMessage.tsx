import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, spacing } from '@/constants/theme';

interface FormMessageProps {
  error?: string | null;
  info?: string | null;
}

export function FormMessage({ error, info }: FormMessageProps) {
  if (!error && !info) return null;

  return (
    <View style={[styles.box, error ? styles.errorBox : styles.infoBox]}>
      <Text style={[styles.text, error ? styles.errorText : styles.infoText]}>
        {error ?? info}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  infoBox: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  text: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  errorText: {
    color: colors.danger,
  },
  infoText: {
    color: colors.primaryDark,
  },
});
