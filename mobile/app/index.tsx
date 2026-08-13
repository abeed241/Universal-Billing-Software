import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function Index() {
  const { session, loading: authLoading } = useAuth();
  const { store, loading: storeLoading } = useStore();

  if (authLoading || storeLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isSupabaseConfigured) {
    return <Redirect href="/(auth)/setup" />;
  }

  if (!session) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!store) {
    return <Redirect href="/(auth)/store-setup" />;
  }

  return <Redirect href="/(app)" />;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
