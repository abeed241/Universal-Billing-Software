import { Tabs } from 'expo-router';

import { AdaptiveTabBar } from '@/components/AdaptiveTabBar';
import { colors } from '@/constants/theme';
import { useIsDesktop } from '@/hooks/useIsDesktop';

export default function AppLayout() {
  const isDesktop = useIsDesktop();

  return (
    <Tabs
      tabBar={(props) => <AdaptiveTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: !isDesktop,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        tabBarStyle: { display: 'none' },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
        }}
      />
      <Tabs.Screen
        name="products/index"
        options={{
          title: 'Products',
          href: '/products',
        }}
      />
      <Tabs.Screen
        name="bill/new"
        options={{
          title: 'New Bill',
          tabBarLabel: 'Bill',
        }}
      />
      <Tabs.Screen
        name="history/index"
        options={{
          title: 'History',
          href: '/history',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
      <Tabs.Screen
        name="products/add"
        options={{
          href: null,
          title: 'Add Product',
        }}
      />
      <Tabs.Screen
        name="products/[id]"
        options={{
          href: null,
          title: 'Edit Product',
        }}
      />
      <Tabs.Screen
        name="bill/[id]"
        options={{
          href: null,
          title: 'Receipt',
        }}
      />
    </Tabs>
  );
}
