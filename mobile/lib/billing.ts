import type { CartItem } from './types';

export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + calculateLineTotal(item.quantity, item.product.price),
    0
  );
}

export function calculateDiscountAmount(
  subtotal: number,
  discount: number,
  discountType: 'flat' | 'percent'
): number {
  if (discount <= 0) return 0;
  if (discountType === 'percent') {
    return Math.round(subtotal * (discount / 100) * 100) / 100;
  }
  return Math.min(discount, subtotal);
}

export function calculateTaxAmount(
  subtotal: number,
  discountAmount: number,
  taxRate: number
): number {
  const taxable = Math.max(subtotal - discountAmount, 0);
  return Math.round(taxable * (taxRate / 100) * 100) / 100;
}

export function calculateTotal(
  subtotal: number,
  discountAmount: number,
  taxAmount: number
): number {
  return Math.round((subtotal - discountAmount + taxAmount) * 100) / 100;
}
