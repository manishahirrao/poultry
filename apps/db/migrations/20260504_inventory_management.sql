-- PoultryPulse AI - Inventory Management Schema
-- Migration: 20260504_inventory_management.sql
-- Description: Creates inventory management tables for feed, medicine, vaccine stock tracking
-- Requirements: REQ-017 §17.1, §17.4, Design Addendum §16.1
-- Task: TASK-046

-- Enum types for inventory
CREATE TYPE inventory_category AS ENUM ('feed', 'medicine', 'vaccine', 'consumable');
CREATE TYPE movement_type AS ENUM ('purchase', 'consumption', 'adjustment', 'wastage', 'theft');
CREATE TYPE po_status AS ENUM ('created', 'sent', 'delivered', 'invoiced', 'paid');

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category inventory_category NOT NULL,
  sku TEXT UNIQUE,
  description TEXT,
  unit TEXT NOT NULL DEFAULT 'kg',
  min_stock_alert_level DECIMAL(10,2) NOT NULL DEFAULT 0,
  current_stock DECIMAL(12,2) NOT NULL DEFAULT 0,
  avg_cost_per_unit DECIMAL(10,2),
  qr_code TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT customer_item_unique UNIQUE (customer_id, name)
);

CREATE INDEX idx_inventory_items_customer_id ON inventory_items(customer_id);
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_sku ON inventory_items(sku);

-- Inventory movements table (audit log for all stock changes)
CREATE TABLE IF NOT EXISTS inventory_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL, -- Link to batch if consumption
  movement_type movement_type NOT NULL,
  quantity DECIMAL(12,2) NOT NULL,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(12,2),
  reference_id TEXT, -- PO number, invoice number, etc.
  reason TEXT,
  performed_by UUID REFERENCES customers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_movements_item_id ON inventory_movements(inventory_item_id);
CREATE INDEX idx_inventory_movements_batch_id ON inventory_movements(batch_id);
CREATE INDEX idx_inventory_movements_movement_type ON inventory_movements(movement_type);
CREATE INDEX idx_inventory_movements_created_at ON inventory_movements(created_at DESC);

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  payment_terms TEXT,
  delivery_lead_days INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT customer_vendor_unique UNIQUE (customer_id, name)
);

CREATE INDEX idx_vendors_customer_id ON vendors(customer_id);
CREATE INDEX idx_vendors_is_active ON vendors(is_active);

-- Purchase orders table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  po_number TEXT NOT NULL UNIQUE,
  status po_status NOT NULL DEFAULT 'created',
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  subtotal DECIMAL(14,2) NOT NULL DEFAULT 0,
  tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES customers(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchase_orders_customer_id ON purchase_orders(customer_id);
CREATE INDEX idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_po_number ON purchase_orders(po_number);

-- Purchase order line items
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id),
  quantity DECIMAL(12,2) NOT NULL,
  negotiated_price DECIMAL(10,2) NOT NULL,
  line_total DECIMAL(14,2) GENERATED ALWAYS AS (quantity * negotiated_price) STORED,
  received_quantity DECIMAL(12,2) DEFAULT 0,
  notes TEXT
);

CREATE INDEX idx_purchase_order_items_po_id ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_purchase_order_items_item_id ON purchase_order_items(inventory_item_id);

-- Function to generate PO number
CREATE OR REPLACE FUNCTION generate_po_number(customer_id UUID)
RETURNS TEXT AS $$
DECLARE
  sequence_num INTEGER;
  po_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM '[0-9]{6}$') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM purchase_orders
  WHERE customer_id = $1;
  
  po_number := 'PO-' || TO_CHAR(CURRENT_DATE, 'YYYY') || LPAD(sequence_num::TEXT, 6, '0');
  
  RETURN po_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update inventory stock on movement
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.movement_type IN ('purchase', 'adjustment') THEN
    -- Add to stock
    UPDATE inventory_items
    SET current_stock = current_stock + NEW.quantity,
        avg_cost_per_unit = CASE 
          WHEN NEW.movement_type = 'purchase' AND NEW.unit_cost IS NOT NULL 
          THEN (current_stock * avg_cost_per_unit + NEW.quantity * NEW.unit_cost) / (current_stock + NEW.quantity)
          ELSE avg_cost_per_unit
        END
    WHERE id = NEW.inventory_item_id;
  ELSIF NEW.movement_type IN ('consumption', 'wastage', 'theft') THEN
    -- Subtract from stock
    UPDATE inventory_items
    SET current_stock = current_stock - NEW.quantity
    WHERE id = NEW.inventory_item_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_inventory_stock
  AFTER INSERT ON inventory_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_stock();

-- Function to check low stock and create alert
CREATE OR REPLACE FUNCTION check_low_stock_alert()
RETURNS TRIGGER AS $$
DECLARE
  item_record RECORD;
  alert_exists BOOLEAN;
BEGIN
  -- Check if stock is below minimum alert level
  SELECT * INTO item_record
  FROM inventory_items
  WHERE id = NEW.inventory_item_id AND current_stock <= min_stock_alert_level;
  
  IF FOUND THEN
    -- Check if alert already exists for today
    SELECT EXISTS(
      SELECT 1 FROM alerts 
      WHERE type = 'low_stock'::alert_type 
      AND district = (SELECT mandi FROM customers WHERE id = item_record.customer_id)
      AND issued_at >= CURRENT_DATE
    ) INTO alert_exists;
    
    IF NOT alert_exists THEN
      INSERT INTO alerts (type, severity, title_hi, body_hi, district, issued_at)
      VALUES (
        'low_stock'::alert_type,
        'MEDIUM'::alert_severity,
        'कम स्टॉक · Low Stock',
        item_record.name || ' — current: ' || item_record.current_stock || ' ' || item_record.unit || 
        '. Minimum: ' || item_record.min_stock_alert_level || ' ' || item_record.unit,
        (SELECT mandi FROM customers WHERE id = item_record.customer_id),
        NOW()
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_low_stock_alert
  AFTER UPDATE ON inventory_items
  FOR EACH ROW
  WHEN (NEW.current_stock <= NEW.min_stock_alert_level)
  EXECUTE FUNCTION check_low_stock_alert();

-- Function to auto-decrement feed stock on feed log
CREATE OR REPLACE FUNCTION auto_decrement_feed_stock()
RETURNS TRIGGER AS $$
DECLARE
  feed_item_id UUID;
BEGIN
  -- Find feed inventory item matching the feed brand/type
  SELECT id INTO feed_item_id
  FROM inventory_items
  WHERE customer_id = (SELECT customer_id FROM batches WHERE id = NEW.batch_id)
    AND category = 'feed'
    AND (name ILIKE '%' || COALESCE(NEW.feed_brand, '') || '%' OR name ILIKE '%' || COALESCE(NEW.feed_type, '') || '%')
  LIMIT 1;
  
  IF feed_item_id IS NOT NULL THEN
    INSERT INTO inventory_movements (inventory_item_id, batch_id, movement_type, quantity, reason, performed_by)
    VALUES (feed_item_id, NEW.batch_id, 'consumption', NEW.total_feed_kg, 'Auto from feed log', NEW.logged_by);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_decrement_feed_stock
  AFTER INSERT ON feed_logs
  FOR EACH ROW
  EXECUTE FUNCTION auto_decrement_feed_stock();

-- Function to auto-decrement vaccine stock on vaccination log
CREATE OR REPLACE FUNCTION auto_decrement_vaccine_stock()
RETURNS TRIGGER AS $$
DECLARE
  vaccine_item_id UUID;
BEGIN
  -- Find vaccine inventory item matching the vaccine name
  SELECT id INTO vaccine_item_id
  FROM inventory_items
  WHERE customer_id = (SELECT customer_id FROM batches WHERE id = NEW.batch_id)
    AND category = 'vaccine'
    AND name ILIKE '%' || NEW.vaccine_name || '%'
  LIMIT 1;
  
  IF vaccine_item_id IS NOT NULL AND NEW.status = 'done' THEN
    -- Calculate quantity: dose_per_bird * birds_placed
    INSERT INTO inventory_movements (inventory_item_id, batch_id, movement_type, quantity, reason, performed_by)
    VALUES (
      vaccine_item_id, 
      NEW.batch_id, 
      'consumption', 
      (SELECT doc_count FROM batches WHERE id = NEW.batch_id), -- Simplified: 1 dose per bird
      'Auto from vaccination log: ' || NEW.vaccine_name,
      (SELECT customer_id FROM batches WHERE id = NEW.batch_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_decrement_vaccine_stock
  AFTER UPDATE ON vaccination_schedules
  FOR EACH ROW
  WHEN (NEW.status = 'done' AND OLD.status != 'done')
  EXECUTE FUNCTION auto_decrement_vaccine_stock();

-- Function to auto-decrement medicine stock on medication log
CREATE OR REPLACE FUNCTION auto_decrement_medicine_stock()
RETURNS TRIGGER AS $$
DECLARE
  medicine_item_id UUID;
BEGIN
  -- Find medicine inventory item matching the drug name
  SELECT id INTO medicine_item_id
  FROM inventory_items
  WHERE customer_id = (SELECT customer_id FROM batches WHERE id = NEW.batch_id)
    AND category = 'medicine'
    AND name ILIKE '%' || NEW.drug_name || '%'
  LIMIT 1;
  
  IF medicine_item_id IS NOT NULL THEN
    -- Calculate quantity based on duration and dose (simplified)
    INSERT INTO inventory_movements (inventory_item_id, batch_id, movement_type, quantity, reason, performed_by)
    VALUES (
      medicine_item_id, 
      NEW.batch_id, 
      'consumption', 
      NEW.duration_days, -- Simplified: 1 unit per day
      'Auto from medication log: ' || NEW.drug_name,
      (SELECT customer_id FROM batches WHERE id = NEW.batch_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_decrement_medicine_stock
  AFTER INSERT ON medication_logs
  FOR EACH ROW
  EXECUTE FUNCTION auto_decrement_medicine_stock();

-- Row Level Security (RLS) Policies
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Inventory Items RLS
CREATE POLICY "Users can view own inventory_items" 
ON inventory_items FOR SELECT 
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own inventory_items" 
ON inventory_items FOR INSERT 
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own inventory_items" 
ON inventory_items FOR UPDATE 
USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own inventory_items" 
ON inventory_items FOR DELETE 
USING (customer_id = auth.uid());

-- Inventory Movements RLS (via item ownership)
CREATE POLICY "Users can view own inventory_movements" 
ON inventory_movements FOR SELECT 
USING (inventory_item_id IN (SELECT id FROM inventory_items WHERE customer_id = auth.uid()));

CREATE POLICY "Users can insert own inventory_movements" 
ON inventory_movements FOR INSERT 
WITH CHECK (inventory_item_id IN (SELECT id FROM inventory_items WHERE customer_id = auth.uid()));

-- NOTE: No UPDATE policy on inventory_movements to ensure immutability (REQ-017 §17.6)
-- Corrections must be made via new entries with movement_type='adjustment'

-- Vendors RLS
CREATE POLICY "Users can view own vendors" 
ON vendors FOR SELECT 
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own vendors" 
ON vendors FOR INSERT 
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own vendors" 
ON vendors FOR UPDATE 
USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own vendors" 
ON vendors FOR DELETE 
USING (customer_id = auth.uid());

-- Purchase Orders RLS
CREATE POLICY "Users can view own purchase_orders" 
ON purchase_orders FOR SELECT 
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own purchase_orders" 
ON purchase_orders FOR INSERT 
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own purchase_orders" 
ON purchase_orders FOR UPDATE 
USING (customer_id = auth.uid());

-- Purchase Order Items RLS (via PO ownership)
CREATE POLICY "Users can view own purchase_order_items" 
ON purchase_order_items FOR SELECT 
USING (purchase_order_id IN (SELECT id FROM purchase_orders WHERE customer_id = auth.uid()));

CREATE POLICY "Users can insert own purchase_order_items" 
ON purchase_order_items FOR INSERT 
WITH CHECK (purchase_order_id IN (SELECT id FROM purchase_orders WHERE customer_id = auth.uid()));

CREATE POLICY "Users can update own purchase_order_items" 
ON purchase_order_items FOR UPDATE 
USING (purchase_order_id IN (SELECT id FROM purchase_orders WHERE customer_id = auth.uid()));

-- Updated_at trigger
CREATE TRIGGER update_inventory_items_updated_at BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
