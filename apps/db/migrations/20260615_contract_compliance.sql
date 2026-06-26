-- PoultryPulse AI - Contract Compliance Schema
-- Migration: 20260615_contract_compliance.sql
-- Description: Adds tables for contract compliance tracking
-- ISSUE-021: Missing Metrics Implementation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Contract details
  contract_number TEXT NOT NULL,
  contract_name TEXT NOT NULL,
  contract_type TEXT NOT NULL, -- broiler_integration, feed_supply, DOC_supply, etc.
  counterparty_name TEXT NOT NULL, -- Integrator company, buyer, supplier, etc.
  counterparty_contact TEXT,
  
  -- Contract period
  start_date DATE NOT NULL,
  end_date DATE,
  
  -- Contract terms
  target_weight_kg DECIMAL(5,2),
  target_fcr DECIMAL(5,3),
  target_mortality_pct DECIMAL(5,2),
  target_age_days INTEGER,
  
  -- Pricing terms
  base_price_per_kg DECIMAL(8,2),
  price_adjustment_formula TEXT,
  payment_terms TEXT DEFAULT 'NET 30',
  
  -- Quality standards
  minimum_dressing_yield_pct DECIMAL(5,2),
  maximum_condemnation_rate_pct DECIMAL(5,2),
  minimum_uniformity_pct DECIMAL(5,2),
  
  -- Contract status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'expired', 'terminated', 'completed')),
  
  -- Related documents
  contract_document_url TEXT,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT customer_contract_unique UNIQUE (customer_id, contract_number)
);

-- Indexes for contracts
CREATE INDEX idx_contracts_customer_id ON contracts(customer_id);
CREATE INDEX idx_contracts_contract_type ON contracts(contract_type);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_start_date ON contracts(start_date);
CREATE INDEX idx_contracts_end_date ON contracts(end_date);

-- Contract compliance tracking table
CREATE TABLE IF NOT EXISTS contract_compliance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  
  -- Evaluation period
  evaluation_start_date DATE NOT NULL,
  evaluation_end_date DATE NOT NULL,
  
  -- Actual performance metrics
  actual_weight_kg DECIMAL(5,2),
  actual_fcr DECIMAL(5,3),
  actual_mortality_pct DECIMAL(5,2),
  actual_age_days INTEGER,
  actual_dressing_yield_pct DECIMAL(5,2),
  actual_condemnation_rate_pct DECIMAL(5,2),
  actual_uniformity_pct DECIMAL(5,2),
  
  -- Compliance calculations
  weight_compliance_pct DECIMAL(5,2),
  fcr_compliance_pct DECIMAL(5,2),
  mortality_compliance_pct DECIMAL(5,2),
  dressing_yield_compliance_pct DECIMAL(5,2),
  condemnation_compliance_pct DECIMAL(5,2),
  uniformity_compliance_pct DECIMAL(5,2),
  
  -- Overall compliance score (weighted average)
  overall_compliance_score DECIMAL(5,2),
  
  -- Compliance status
  compliance_status TEXT NOT NULL DEFAULT 'pending' CHECK (compliance_status IN ('pending', 'compliant', 'non_compliant', 'partially_compliant')),
  
  -- Penalties and bonuses
  penalty_amount DECIMAL(12,2) DEFAULT 0,
  bonus_amount DECIMAL(12,2) DEFAULT 0,
  net_adjustment DECIMAL(12,2) GENERATED ALWAYS AS (bonus_amount - penalty_amount) STORED,
  
  -- Evaluation notes
  evaluation_notes TEXT,
  evaluator_name TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for contract_compliance
CREATE INDEX idx_contract_compliance_contract_id ON contract_compliance(contract_id);
CREATE INDEX idx_contract_compliance_customer_id ON contract_compliance(customer_id);
CREATE INDEX idx_contract_compliance_batch_id ON contract_compliance(batch_id);
CREATE INDEX idx_contract_compliance_evaluation_period ON contract_compliance(evaluation_start_date, evaluation_end_date);
CREATE INDEX idx_contract_compliance_compliance_status ON contract_compliance(compliance_status);

-- Row Level Security (RLS) Policies
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_compliance ENABLE ROW LEVEL SECURITY;

-- Contracts RLS
CREATE POLICY "Users can view own contracts"
ON contracts FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own contracts"
ON contracts FOR INSERT
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own contracts"
ON contracts FOR UPDATE
USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own contracts"
ON contracts FOR DELETE
USING (customer_id = auth.uid());

-- Contract Compliance RLS
CREATE POLICY "Users can view own contract_compliance"
ON contract_compliance FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own contract_compliance"
ON contract_compliance FOR INSERT
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own contract_compliance"
ON contract_compliance FOR UPDATE
USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own contract_compliance"
ON contract_compliance FOR DELETE
USING (customer_id = auth.uid());

-- Apply updated_at trigger
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contract_compliance_updated_at BEFORE UPDATE ON contract_compliance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment on tables
COMMENT ON TABLE contracts IS 'Stores contract details for integration companies, buyers, and suppliers';
COMMENT ON TABLE contract_compliance IS 'Tracks compliance with contract terms and calculates compliance scores';
