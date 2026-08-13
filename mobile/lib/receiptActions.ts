import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { buildReceiptHtml } from '@/lib/receipt';
import { supabase } from '@/lib/supabase';
import type { BillWithItems, Store } from '@/lib/types';

export async function fetchBillWithItems(billId: string): Promise<BillWithItems | null> {
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

export async function shareReceiptPdf(bill: BillWithItems, store: Store): Promise<void> {
  const html = buildReceiptHtml(bill, store);
  const { uri } = await Print.printToFileAsync({ html });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Receipt ${bill.invoice_number}`,
      UTI: 'com.adobe.pdf',
    });
  }
}

export async function printReceipt(bill: BillWithItems, store: Store): Promise<void> {
  const html = buildReceiptHtml(bill, store);
  await Print.printAsync({ html });
}
