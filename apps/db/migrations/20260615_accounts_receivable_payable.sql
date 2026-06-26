-- PoultryPulse AI - Accounts Receivable and Payable Schema
-- Migration: 20260615_accounts_receivable_payable.sql
-- Description: Adds tables for accounts receivable and payable tracking
-- ISSUE-021: Missing Metrics Implementation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Accounts receivable table (money owed to the farmer)
CREATE TABLE IF NOT EXISTS accounts_receivable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  
  -- Invoice details
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- Customer details
  buyer_name TEXT NOT NULL,
  buyer_contact TEXT,
  buyer_address TEXT,
  
  -- Amount details
  total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  net_amount DECIMAL(12,2) GENERATED ALWAYS AS (total_amount - discount_amount + tax_amount) STORED,
  
  -- Payment details
  amount_paid DECIMAL(12,2) DEFAULT 0 CHECK (amount_paid >= 0),
  amount_outstanding DECIMAL(12,2) GENERATED ALWAYS AS (net_amount - amount_paid) STORED,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'written_off')),
  
  -- Payment terms
  payment_terms TEXT DEFAULT 'NET 30',
  payment_method TEXT, -- Bank transfer, cheque, cash, etc.
  
  -- Related documents
  notes TEXT,
  attachment_url TEXT,
  
  -- Offline sync support
  synced BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  
  CONSTRAINT customer_invoice_unique UNIQUE (customer_id, invoice_number)
);

-- Indexes for accounts_receivable
CREATE INDEX idx_accounts_receivable_customer_id ON accounts_receivable(customer_id);
CREATE INDEX idx_accounts_receivable_batch_id ON accounts_receivable(batch_id);
CREATE INDEX idx_accounts_receivable_invoice_date ON accounts_receivable(invoice_date);
CREATE INDEX idx_accounts_receivable_due_date ON accounts_receivable(due_date);
CREATE INDEX idx_accounts_receivable_payment_status ON accounts_receivable(payment_status);
CREATE INDEX idx_accounts_receivable_synced ON accounts_receivable(synced) WHERE synced = false;

-- Accounts payable table (money owed by the farmer)
CREATE TABLE IF NOT EXISTS accounts_payable (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  
  -- Bill details
  bill_number TEXT NOT NULL,
  bill_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- Supplier details
  supplier_name TEXT NOT NULL,
  supplier_contact TEXT,
  supplier_address TEXT,
  
  -- Category
  expense_category TEXT NOT NULL, -- Feed, DOC, Medicine, Vaccine, Labor, Utilities, etc.
  
  -- Amount details
  total_amount DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  net_amount DECIMAL(12,2) GENERATED ALWAYS AS (total_amount - discount_amount + tax_amount) STORED,
  
  -- Payment details
  amount_paid DECIMAL(12,2) DEFAULT 0 CHECK (amount_paid >= 0),
  amount_outstanding DECIMAL(12,2) GENERATED ALWAYS AS (net_amount - amount_paid) STORED,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'written_off')),
  
  -- Payment terms
  payment_terms TEXT DEFAULT 'NET 30',
  payment_method TEXT, -- Bank transfer, cheque, cash, etc.
  
  -- Related documents
  notes TEXT,
  attachment_url TEXT,
  
  -- Offline sync support
  synced BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  
  CONSTRAINT customer_bill_unique UNIQUE (customer_id, bill_number)
);

-- Indexes for accounts_payable
CREATE INDEX idx_accounts_payable_customer_id ON accounts_payable(customer_id);
CREATE INDEX idx_accounts_payable_batch_id ON accounts_payable(batch_id);
CREATE INDEX idx_accounts_payable_bill_date ON accounts_payable(bill_date);
CREATE INDEX idx_accounts_payable_due_date ON accounts_payable(due_date);
CREATE INDEX idx_accounts_payable_payment_status ON accounts_payable(payment_status);
CREATE INDEX idx_accounts_payable_expense_category ON accounts_payable(expense_category);
CREATE INDEX idx_accounts_payable_synced ON accounts_payable(synced) WHERE synced = false;

-- Row Level Security (RLS) Policies
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;

-- Accounts Receivable RLS
CREATE POLICY "Users can view own accounts_receivable"
ON accounts_receivable FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own accounts_receivable"
ON accounts_receivable FOR INSERT
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own accounts_receivable"
ON accounts_receivable FOR UPDATE
USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own accounts_receivable"
ON accounts_receivable FOR DELETE
USING (customer_id = auth.uid());

-- Accounts Payable RLS
CREATE POLICY "Users can view own accounts_payable"
ON accounts_payable FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own accounts_payable"
ON accounts_payable FOR INSERT
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own accounts_payable"
ON accounts_payable FOR UPDATE
USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own accounts_payable"
ON accounts_payable FOR DELETE
USING (customer_id = auth.uid());

-- Apply updated_at trigger to accounts tables
CREATE TRIGGER update_accounts_receivable_updated_at BEFORE UPDATE ON accounts_receivable
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_payable_updated_at BEFORE UPDATE ON accounts_payable
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment on tables
COMMENT ON TABLE accounts_receivable IS 'Tracks money owed to the farmer from buyers for bird sales and other receivables';
COMMENT ON TABLE accounts_payable IS 'Tracks money owed by the farmer to suppliers for feed, DOC, medicine, and other expenses';
