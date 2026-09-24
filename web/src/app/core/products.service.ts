import { Injectable } from '@angular/core';

import type { Product } from './models';
import { supabase } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  async listActive(storeId: string): Promise<{ data: Product[]; error: string | null }> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .eq('is_active', true)
      .order('name');

    if (error) return { data: [], error: error.message };
    return { data: (data as Product[]) ?? [], error: null };
  }

  async getById(id: string): Promise<{ data: Product | null; error: string | null }> {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
    if (error || !data) return { data: null, error: error?.message ?? 'Product not found' };
    return { data: data as Product, error: null };
  }

  async create(payload: Record<string, unknown>): Promise<{ error: string | null }> {
    const { error } = await supabase.from('products').insert(payload);
    return { error: error?.message ?? null };
  }

  async update(id: string, payload: Record<string, unknown>): Promise<{ error: string | null }> {
    const { error } = await supabase.from('products').update(payload).eq('id', id);
    return { error: error?.message ?? null };
  }

  async delete(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    return { error: error?.message ?? null };
  }
}
