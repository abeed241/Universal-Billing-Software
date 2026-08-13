import { Tabs } from 'expo-router';

import { colors } from '@/constants/theme';

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.surface },
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
