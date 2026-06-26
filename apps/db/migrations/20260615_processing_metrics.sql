-- PoultryPulse AI - Processing Metrics Schema
-- Migration: 20260615_processing_metrics.sql
-- Description: Adds tables for processing metrics (yield, condemnation, downgrade, parts yield)
-- ISSUE-021: Missing Metrics Implementation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Processing records table
CREATE TABLE IF NOT EXISTS processing_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Processing details
  processing_date DATE NOT NULL,
  processing_plant TEXT,
  plant_location TEXT,
  
  -- Bird counts
  birds_sent INTEGER NOT NULL CHECK (birds_sent > 0),
  birds_received INTEGER NOT NULL CHECK (birds_received > 0),
  birds_processed INTEGER NOT NULL CHECK (birds_processed > 0),
  
  -- Weight metrics
  live_weight_kg DECIMAL(10,2) NOT NULL,
  carcass_weight_kg DECIMAL(10,2) NOT NULL,
  
  -- Condemnation metrics
  total_condemned INTEGER NOT NULL DEFAULT 0,
  ante_mortem_condemned INTEGER DEFAULT 0,
  post_mortem_condemned INTEGER DEFAULT 0,
  condemnation_reasons TEXT[], -- Array of condemnation reasons
  
  -- Downgrade metrics
  total_downgraded INTEGER NOT NULL DEFAULT 0,
  downgrade_reasons TEXT[], -- Array of downgrade reasons
  
  -- Yield metrics
  dressing_yield_pct DECIMAL(5,2) GENERATED ALWAYS AS (carcass_weight_kg / live_weight_kg * 100) STORED,
  eviscerated_yield_pct DECIMAL(5,2),
  
  -- Parts yield metrics (kg)
  breast_meat_kg DECIMAL(10,2) DEFAULT 0,
  thigh_kg DECIMAL(10,2) DEFAULT 0,
  drumstick_kg DECIMAL(10,2) DEFAULT 0,
  wings_kg DECIMAL(10,2) DEFAULT 0,
  back_kg DECIMAL(10,2) DEFAULT 0,
  neck_kg DECIMAL(10,2) DEFAULT 0,
  feet_kg DECIMAL(10,2) DEFAULT 0,
  
  -- Quality grades
  grade_a_count INTEGER DEFAULT 0,
  grade_b_count INTEGER DEFAULT 0,
  grade_c_count INTEGER DEFAULT 0,
  
  -- Calculated condemnation rate
  condemnation_rate_pct DECIMAL(5,2) GENERATED ALWAYS AS (total_condemned::DECIMAL / birds_processed * 100) STORED,
  
  -- Calculated downgrade rate
  downgrade_rate_pct DECIMAL(5,2) GENERATED ALWAYS AS (total_downgraded::DECIMAL / birds_processed * 100) STORED,
  
  -- Calculated parts yield percentages
  breast_yield_pct DECIMAL(5,2) GENERATED ALWAYS AS (breast_meat_kg / carcass_weight_kg * 100) STORED,
  thigh_yield_pct DECIMAL(5,2) GENERATED ALWAYS AS (thigh_kg / carcass_weight_kg * 100) STORED,
  
  -- Offline sync support
  synced BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT customer_processing_unique UNIQUE (customer_id, batch_id, processing_date)
);

-- Indexes for processing_records
CREATE INDEX idx_processing_records_batch_id ON processing_records(batch_id);
CREATE INDEX idx_processing_records_customer_id ON processing_records(customer_id);
CREATE INDEX idx_processing_records_processing_date ON processing_records(processing_date);
CREATE INDEX idx_processing_records_synced ON processing_records(synced) WHERE synced = false;

-- Row Level Security (RLS) Policies
ALTER TABLE processing_records ENABLE ROW LEVEL SECURITY;

-- Processing Records RLS
CREATE POLICY "Users can view own processing_records"
ON processing_records FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own processing_records"
ON processing_records FOR INSERT
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own processing_records"
ON processing_records FOR UPDATE
USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own processing_records"
ON processing_records FOR DELETE
USING (customer_id = auth.uid());

-- Updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to processing_records
CREATE TRIGGER update_processing_records_updated_at BEFORE UPDATE ON processing_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment on table
COMMENT ON TABLE processing_records IS 'Stores processing metrics for harvested batches including yield, condemnation, downgrade, and parts yield data';
