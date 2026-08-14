import { Injectable } from '@angular/core';

import type { Bill, BillWithItems, PaymentMethod } from './models';
import { supabase } from './supabase.client';

@Injectable({ providedIn: 'root' })
export class BillsService {
  async listRecent(storeId: string, limit = 100): Promise<{ data: Bill[]; error: string | null }> {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return { data: [], error: error.message };
    return { data: (data as Bill[]) ?? [], error: null };
  }

  async todayStats(storeId: string): Promise<{ sales: number; count: number; error: string | null }> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from('bills')
      .select('total')
      .eq('store_id', storeId)
      .gte('created_at', startOfDay.toISOString());

    if (error) return { sales: 0, count: 0, error: error.message };

    const rows = data ?? [];
    const sales = rows.reduce((sum, bill) => sum + Number(bill.total), 0);
    return { sales, count: rows.length, error: null };
  }

  async getWithItems(billId: string): Promise<BillWithItems | null> {
    const { data: bill, error: billError } = await supabase
      .from('bills')
      .select('*')
      .eq('id', billId)
      .single();

    if (billError || !bill) return null;

    const { data: items, error: itemsError } = await supabase
      .from('bill_items')
      .select('*')
      .eq('bill_id', billId);

    if (itemsError) return null;

    return {
      ...(bill as BillWithItems),
      bill_items: items ?? [],
    };
  }

  async create(params: {
    storeId: string;
    subtotal: number;
    taxAmount: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod;
    items: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }>;
  }): Promise<{ id: string | null; error: string | null }> {
    const { data, error } = await supabase.rpc('create_bill_with_items', {
      p_store_id: params.storeId,
      p_subtotal: params.subtotal,
      p_tax_amount: params.taxAmount,
      p_discount: params.discount,
      p_total: params.total,
      p_payment_method: params.paymentMethod,
      p_items: params.items,
    });

    if (error) return { id: null, error: error.message };
    return { id: String(data), error: null };
  }
}
