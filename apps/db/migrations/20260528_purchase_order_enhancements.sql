-- PoultryPulse AI - Purchase Order Enhancements for TASK-047
-- Migration: 20260528_purchase_order_enhancements.sql
-- Description: Adds GRN tracking, Tally integration, and Zoho webhook fields
-- Requirements: REQ-017 §17.2, §17.5, TASK-047

-- Add GRN tracking fields to purchase_orders
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS grn_date DATE,
ADD COLUMN IF NOT EXISTS grn_notes TEXT,
ADD COLUMN IF NOT EXISTS invoice_number TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS invoice_date DATE,
ADD COLUMN IF NOT EXISTS payment_date DATE;

-- Add Zoho integration fields to purchase_orders
ALTER TABLE purchase_orders
ADD COLUMN IF NOT EXISTS zoho_invoice_id TEXT,
ADD COLUMN IF NOT EXISTS zoho_sync_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS zoho_sync_error TEXT,
ADD COLUMN IF NOT EXISTS zoho_last_sync_at TIMESTAMPTZ;

-- Add variance tracking to purchase_order_items
ALTER TABLE purchase_order_items
ADD COLUMN IF NOT EXISTS variance_percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS variance_flagged BOOLEAN DEFAULT FALSE;

-- Create index on invoice_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_purchase_orders_invoice_number ON purchase_orders(invoice_number);

-- Create index on zoho_sync_status for filtering
CREATE INDEX IF NOT EXISTS idx_purchase_orders_zoho_sync_status ON purchase_orders(zoho_sync_status);

-- Function to calculate variance on received quantity update
CREATE OR REPLACE FUNCTION calculate_item_variance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.received_quantity > 0 AND OLD.quantity > 0 THEN
    NEW.variance_percentage = ((NEW.received_quantity - OLD.quantity) / OLD.quantity) * 100;
    NEW.variance_flagged = ABS(NEW.variance_percentage) > 5;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_item_variance
  BEFORE UPDATE OF received_quantity ON purchase_order_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_item_variance();

-- Function to set GRN date when status changes to delivered
CREATE OR REPLACE FUNCTION set_grn_date_on_delivery()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
    NEW.grn_date = CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_grn_date_on_delivery
  BEFORE UPDATE OF status ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_grn_date_on_delivery();

-- Function to set payment date when status changes to paid
CREATE OR REPLACE FUNCTION set_payment_date_on_paid()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    NEW.payment_date = CURRENT_DATE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_payment_date_on_paid
  BEFORE UPDATE OF status ON purchase_orders
  FOR EACH ROW
  EXECUTE FUNCTION set_payment_date_on_paid();

-- Updated_at trigger for new columns
CREATE TRIGGER update_purchase_orders_grn_updated_at BEFORE UPDATE ON purchase_orders
  FOR EACH ROW
  WHEN (OLD.grn_date IS DISTINCT FROM NEW.grn_date OR 
        OLD.grn_notes IS DISTINCT FROM NEW.grn_notes OR
        OLD.invoice_number IS DISTINCT FROM NEW.invoice_number OR
        OLD.invoice_date IS DISTINCT FROM NEW.invoice_date OR
        OLD.payment_date IS DISTINCT FROM NEW.payment_date OR
        OLD.zoho_invoice_id IS DISTINCT FROM NEW.zoho_invoice_id OR
        OLD.zoho_sync_status IS DISTINCT FROM NEW.zoho_sync_status OR
        OLD.zoho_sync_error IS DISTINCT FROM NEW.zoho_sync_error OR
        OLD.zoho_last_sync_at IS DISTINCT FROM NEW.zoho_last_sync_at)
  EXECUTE FUNCTION update_updated_at_column();
