import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Store } from '@/lib/types';

interface StoreContextValue {
  store: Store | null;
  loading: boolean;
  refreshStore: () => Promise<void>;
  updateStore: (updates: Partial<Store>) => Promise<{ error: string | null }>;
  createStore: (data: {
    name: string;
    address?: string;
    phone?: string;
    tax_rate: number;
    currency: string;
  }) => Promise<{ error: string | null }>;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStore = useCallback(async () => {
    if (!user || !isSupabaseConfigured) {
      setStore(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Failed to load store:', error.message);
      setStore(null);
    } else {
      setStore(data as Store | null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refreshStore();
  }, [refreshStore]);

  const createStore = useCallback(
    async (data: {
      name: string;
      address?: string;
      phone?: string;
      tax_rate: number;
      currency: string;
    }) => {
      if (!user) return { error: 'Not authenticated' };

      const { error } = await supabase.from('stores').insert({
        name: data.name,
        address: data.address ?? null,
        phone: data.phone ?? null,
        tax_rate: data.tax_rate,
        currency: data.currency,
        owner_id: user.id,
      });

      if (error) return { error: error.message };
      await refreshStore();
      return { error: null };
    },
    [user, refreshStore]
  );

  const updateStore = useCallback(
    async (updates: Partial<Store>) => {
      if (!store) return { error: 'No store found' };

      const { error } = await supabase
        .from('stores')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', store.id);

      if (error) return { error: error.message };
      await refreshStore();
      return { error: null };
    },
    [store, refreshStore]
  );

  const value = useMemo(
    () => ({
      store,
      loading,
      refreshStore,
      updateStore,
      createStore,
    }),
    [store, loading, refreshStore, updateStore, createStore]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
}
