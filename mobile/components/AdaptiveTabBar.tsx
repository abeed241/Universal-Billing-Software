import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontSize, layout, shadows, spacing } from '@/constants/theme';
import { useStore } from '@/context/StoreContext';
import { useIsDesktop } from '@/hooks/useIsDesktop';

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  'products/index': 'Products',
  'bill/new': 'New Bill',
  'history/index': 'History',
  settings: 'Settings',
};

interface TabBarProps {
  state: {
    index: number;
    routes: Array<{ key: string; name: string; params?: object }>;
  };
  descriptors: Record<
    string,
    {
      options: {
        href?: string | null;
        tabBarLabel?: string;
        title?: string;
        tabBarButton?: (() => null) | null;
      };
    }
  >;
  navigation: {
    emit: (event: { type: string; target: string; canPreventDefault?: boolean }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string, params?: object) => void;
  };
}

export function AdaptiveTabBar({ state, descriptors, navigation }: TabBarProps) {
  const isDesktop = useIsDesktop();
  const insets = useSafeAreaInsets();
  const { store } = useStore();

  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return options.href !== null && options.tabBarButton !== null;
  });

  const tabs = visibleRoutes.map((route) => {
    const { options } = descriptors[route.key];
    const label =
      options.tabBarLabel !== undefined
        ? String(options.tabBarLabel)
        : options.title ?? TAB_LABELS[route.name] ?? route.name;
    const isFocused = state.index === state.routes.indexOf(route);

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    return (
      <Pressable
        key={route.key}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        onPress={onPress}
        style={({ hovered }) => [
          styles.tab,
          isDesktop && styles.tabDesktop,
          isFocused && styles.tabActive,
          Platform.OS === 'web' && hovered && !isFocused && styles.tabHover,
        ]}>
        <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
      </Pressable>
    );
  });

  if (isDesktop) {
    return (
      <View style={[styles.desktopBar, shadows.sm]}>
        <View style={styles.desktopBarInner}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandTitle}>Universal Billing</Text>
            {store?.name ? (
              <Text style={styles.brandStore} numberOfLines={1}>
                {store.name}
              </Text>
            ) : null}
          </View>
          <View style={styles.desktopTabs}>{tabs}</View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.mobileBar,
        shadows.sm,
        { paddingBottom: Math.max(insets.bottom, spacing.sm) },
      ]}>
      {tabs}
    </View>
  );
}

const styles = StyleSheet.create({
  desktopBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...(Platform.OS === 'web' ? { position: 'sticky' as const, top: 0, zIndex: 100 } : {}),
  },
  desktopBarInner: {
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  brandBlock: {
    minWidth: 180,
  },
  brandTitle: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.primary,
  },
  brandStore: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  desktopTabs: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  mobileBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    marginHorizontal: spacing.xs,
  },
  tabDesktop: {
    flex: 0,
    minWidth: 100,
    paddingHorizontal: spacing.md,
  },
  tabActive: {
    backgroundColor: colors.primaryLight,
  },
  tabHover: {
    backgroundColor: '#F8FAFC',
  },
  tabLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primaryDark,
  },
});
