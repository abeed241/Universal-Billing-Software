export type PaymentMethod = 'cash' | 'upi' | 'card';

export interface Store {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  tax_rate: number;
  currency: string;
  logo_url: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  store_id: string;
  name: string;
  price: number;
  sku: string | null;
  barcode: string | null;
  category: string | null;
  unit: string;
  stock: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Bill {
  id: string;
  store_id: string;
  invoice_number: string;
  subtotal: number;
  tax_amount: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  created_by: string;
  created_at: string;
}

export interface BillItem {
  id: string;
  bill_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface BillWithItems extends Bill {
  bill_items: BillItem[];
}
