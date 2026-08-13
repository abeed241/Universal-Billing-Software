-- Universal Billing Software - Initial Schema

-- Stores
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  logo_url TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Store members (owner/staff)
CREATE TABLE store_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, user_id)
);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  sku TEXT,
  barcode TEXT,
  category TEXT,
  unit TEXT NOT NULL DEFAULT 'pcs',
  stock NUMERIC(12, 2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX products_store_id_idx ON products(store_id);
CREATE INDEX products_name_idx ON products(store_id, name);

-- Invoice number sequence per store (stored in bills via trigger)
CREATE TABLE invoice_counters (
  store_id UUID PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
  last_number INTEGER NOT NULL DEFAULT 0
);

-- Bills
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'card')),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (store_id, invoice_number)
);

CREATE INDEX bills_store_id_idx ON bills(store_id);
CREATE INDEX bills_created_at_idx ON bills(store_id, created_at DESC);

-- Bill items
CREATE TABLE bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
  line_total NUMERIC(12, 2) NOT NULL CHECK (line_total >= 0)
);

CREATE INDEX bill_items_bill_id_idx ON bill_items(bill_id);

-- Helper: check if user is member of store
CREATE OR REPLACE FUNCTION is_store_member(p_store_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM store_members
    WHERE store_id = p_store_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper: get user's store ids
CREATE OR REPLACE FUNCTION user_store_ids()
RETURNS SETOF UUID AS $$
  SELECT store_id FROM store_members WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Generate next invoice number for a store
CREATE OR REPLACE FUNCTION generate_invoice_number(p_store_id UUID)
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  INSERT INTO invoice_counters (store_id, last_number)
  VALUES (p_store_id, 1)
  ON CONFLICT (store_id) DO UPDATE
  SET last_number = invoice_counters.last_number + 1
  RETURNING last_number INTO next_num;

  RETURN 'INV-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create store + owner membership on store creation
CREATE OR REPLACE FUNCTION handle_new_store()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO store_members (store_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  INSERT INTO invoice_counters (store_id, last_number) VALUES (NEW.id, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_store_created
  AFTER INSERT ON stores
  FOR EACH ROW EXECUTE FUNCTION handle_new_store();

-- RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_counters ENABLE ROW LEVEL SECURITY;

-- Stores policies
CREATE POLICY stores_select ON stores FOR SELECT
  USING (id IN (SELECT user_store_ids()) OR owner_id = auth.uid());

CREATE POLICY stores_insert ON stores FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY stores_update ON stores FOR UPDATE
  USING (owner_id = auth.uid());

-- Store members policies
CREATE POLICY store_members_select ON store_members FOR SELECT
  USING (store_id IN (SELECT user_store_ids()));

CREATE POLICY store_members_insert ON store_members FOR INSERT
  WITH CHECK (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
    OR user_id = auth.uid()
  );

-- Products policies
CREATE POLICY products_select ON products FOR SELECT
  USING (store_id IN (SELECT user_store_ids()));

CREATE POLICY products_insert ON products FOR INSERT
  WITH CHECK (store_id IN (SELECT user_store_ids()));

CREATE POLICY products_update ON products FOR UPDATE
  USING (store_id IN (SELECT user_store_ids()));

CREATE POLICY products_delete ON products FOR DELETE
  USING (store_id IN (SELECT user_store_ids()));

-- Bills policies
CREATE POLICY bills_select ON bills FOR SELECT
  USING (store_id IN (SELECT user_store_ids()));

CREATE POLICY bills_insert ON bills FOR INSERT
  WITH CHECK (store_id IN (SELECT user_store_ids()) AND created_by = auth.uid());

-- Bill items policies (via bill access)
CREATE POLICY bill_items_select ON bill_items FOR SELECT
  USING (
    bill_id IN (
      SELECT id FROM bills WHERE store_id IN (SELECT user_store_ids())
    )
  );

CREATE POLICY bill_items_insert ON bill_items FOR INSERT
  WITH CHECK (
    bill_id IN (
      SELECT id FROM bills WHERE store_id IN (SELECT user_store_ids())
    )
  );

-- Invoice counters (internal, via SECURITY DEFINER function only)
CREATE POLICY invoice_counters_deny ON invoice_counters FOR ALL
  USING (false);

-- RPC: create bill with items atomically
CREATE OR REPLACE FUNCTION create_bill_with_items(
  p_store_id UUID,
  p_subtotal NUMERIC,
  p_tax_amount NUMERIC,
  p_discount NUMERIC,
  p_total NUMERIC,
  p_payment_method TEXT,
  p_items JSONB
)
RETURNS UUID AS $$
DECLARE
  v_bill_id UUID;
  v_invoice TEXT;
  v_item JSONB;
BEGIN
  IF NOT is_store_member(p_store_id) THEN
    RAISE EXCEPTION 'Not authorized for this store';
  END IF;

  v_invoice := generate_invoice_number(p_store_id);

  INSERT INTO bills (store_id, invoice_number, subtotal, tax_amount, discount, total, payment_method, created_by)
  VALUES (p_store_id, v_invoice, p_subtotal, p_tax_amount, p_discount, p_total, p_payment_method, auth.uid())
  RETURNING id INTO v_bill_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO bill_items (bill_id, product_id, product_name, quantity, unit_price, line_total)
    VALUES (
      v_bill_id,
      (v_item->>'product_id')::UUID,
      v_item->>'product_name',
      (v_item->>'quantity')::NUMERIC,
      (v_item->>'unit_price')::NUMERIC,
      (v_item->>'line_total')::NUMERIC
    );
  END LOOP;

  RETURN v_bill_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_bill_with_items TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invoice_number TO authenticated;

-- Table grants for Supabase API roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON stores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON store_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON bills TO authenticated;
GRANT SELECT, INSERT, UPDATE ON bill_items TO authenticated;

GRANT EXECUTE ON FUNCTION is_store_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION user_store_ids() TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT EXECUTE ON FUNCTIONS TO authenticated;
