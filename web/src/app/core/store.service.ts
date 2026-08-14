import { Injectable, signal } from '@angular/core';

import { AuthService } from './auth.service';
import type { Store } from './models';
import { isSupabaseConfigured, supabase } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class StoreService {
  readonly store = signal<Store | null>(null);
  readonly loading = signal(true);

  constructor(private readonly auth: AuthService) {}

  async ensureReady(): Promise<void> {
    await this.auth.ensureReady();
    await this.refreshStore();
  }

  async refreshStore(): Promise<void> {
    const user = this.auth.user();
    if (!user || !isSupabaseConfigured) {
      this.store.set(null);
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Failed to load store:', error.message);
      this.store.set(null);
    } else {
      this.store.set((data as Store | null) ?? null);
    }
    this.loading.set(false);
  }

  async createStore(data: {
    name: string;
    address?: string;
    phone?: string;
    tax_rate: number;
    currency: string;
  }): Promise<{ error: string | null }> {
    const user = this.auth.user();
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
    await this.refreshStore();
    return { error: null };
  }

  async updateStore(updates: Partial<Store>): Promise<{ error: string | null }> {
    const store = this.store();
    if (!store) return { error: 'No store found' };

    const { error } = await supabase
      .from('stores')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', store.id);

    if (error) return { error: error.message };
    await this.refreshStore();
    return { error: null };
  }
}
