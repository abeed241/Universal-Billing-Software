import type { BillItem, BillWithItems, Store } from '@/lib/types';
import { formatCurrency, formatDate, formatPaymentMethod } from '@/lib/format';

export function buildReceiptHtml(bill: BillWithItems, store: Store): string {
  const itemsHtml = bill.bill_items
    .map(
      (item: BillItem) => `
      <tr>
        <td>${escapeHtml(item.product_name)}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">${formatCurrency(item.unit_price, store.currency)}</td>
        <td style="text-align:right">${formatCurrency(item.line_total, store.currency)}</td>
      </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 16px; }
    .header { text-align: center; margin-bottom: 16px; }
    .store-name { font-size: 18px; font-weight: bold; margin-bottom: 4px; }
    .meta { color: #555; font-size: 11px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { padding: 6px 4px; border-bottom: 1px solid #ddd; }
    th { text-align: left; font-size: 11px; color: #666; }
    .totals { margin-top: 12px; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .total-row { font-weight: bold; font-size: 14px; border-top: 2px solid #111; padding-top: 8px; margin-top: 8px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="store-name">${escapeHtml(store.name)}</div>
    ${store.address ? `<div>${escapeHtml(store.address)}</div>` : ''}
    ${store.phone ? `<div>Phone: ${escapeHtml(store.phone)}</div>` : ''}
  </div>

  <div class="meta">
    <div><strong>Invoice:</strong> ${escapeHtml(bill.invoice_number)}</div>
    <div><strong>Date:</strong> ${formatDate(bill.created_at)}</div>
    <div><strong>Payment:</strong> ${formatPaymentMethod(bill.payment_method)}</div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th style="text-align:center">Qty</th>
        <th style="text-align:right">Price</th>
        <th style="text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="totals">
    <div><span>Subtotal</span><span>${formatCurrency(bill.subtotal, store.currency)}</span></div>
    ${
      bill.discount > 0
        ? `<div><span>Discount</span><span>-${formatCurrency(bill.discount, store.currency)}</span></div>`
        : ''
    }
    ${
      bill.tax_amount > 0
        ? `<div><span>Tax (${store.tax_rate}%)</span><span>${formatCurrency(bill.tax_amount, store.currency)}</span></div>`
        : ''
    }
    <div class="total-row"><span>Total</span><span>${formatCurrency(bill.total, store.currency)}</span></div>
  </div>

  <div class="footer">Thank you for your purchase!</div>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
