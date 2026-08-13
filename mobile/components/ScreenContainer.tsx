import { ReactNode } from 'react';
import { ScrollView, ScrollViewProps, StyleSheet, View, ViewStyle } from 'react-native';

import { colors, layout, spacing } from '@/constants/theme';
import { useIsDesktop } from '@/hooks/useIsDesktop';

interface ScreenContainerProps {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  scrollProps?: ScrollViewProps;
}

export function ScreenContainer({
  children,
  scroll = false,
  style,
  contentStyle,
  scrollProps,
}: ScreenContainerProps) {
  const isDesktop = useIsDesktop();

  const inner = (
    <View style={[styles.inner, isDesktop && styles.innerDesktop, contentStyle]}>{children}</View>
  );

  if (scroll) {
    return (
      <ScrollView
        style={[styles.root, style]}
        contentContainerStyle={styles.scrollContent}
        {...scrollProps}>
        {inner}
      </ScrollView>
    );
  }

  return <View style={[styles.root, style]}>{inner}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    width: '100%',
    padding: spacing.lg,
  },
  innerDesktop: {
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
});
