-- PoultryPulse AI - Litter/House Turnover Schema
-- Migration: 20260615_litter_turnover.sql
-- Description: Adds tables for litter/house turnover tracking
-- ISSUE-021: Missing Metrics Implementation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Houses/Sheds table (if not exists, reference existing)
-- This migration assumes houses/sheds are tracked elsewhere, but we'll create a relationship

-- Litter management table
CREATE TABLE IF NOT EXISTS litter_management (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  shed_id TEXT NOT NULL,
  
  -- Litter cycle details
  cycle_start_date DATE NOT NULL,
  cycle_end_date DATE,
  batch_sequence_number INTEGER NOT NULL, -- 1, 2, 3, etc. for number of batches on same litter
  
  -- Litter type and condition
  litter_type TEXT NOT NULL, -- rice_husk, sawdust, straw, etc.
  initial_litter_depth_cm DECIMAL(5,2),
  final_litter_depth_cm DECIMAL(5,2),
  
  -- Litter quality assessment
  initial_moisture_pct DECIMAL(5,2),
  final_moisture_pct DECIMAL(5,2),
  initial_ph_level DECIMAL(5,2),
  final_ph_level DECIMAL(5,2),
  litter_condition_rating TEXT CHECK (litter_condition_rating IN ('excellent', 'good', 'fair', 'poor')),
  
  -- Litter treatment
  treatment_method TEXT, -- lime, acidifier, etc.
  treatment_date DATE,
  treatment_quantity_kg DECIMAL(10,2),
  
  -- Litter removal
  removal_date DATE,
  removal_method TEXT, -- manual, mechanical, etc.
  litter_removed_kg DECIMAL(10,2),
  litter_disposal_method TEXT, -- composting, burning, etc.
  
  -- Downtime between batches
  downtime_days INTEGER,
  cleaning_method TEXT,
  disinfection_method TEXT,
  
  -- Performance metrics for this litter cycle
  batch_mortality_pct DECIMAL(5,2),
  batch_fcr DECIMAL(5,3),
  batch_avg_weight_kg DECIMAL(5,2),
  
  -- Cost tracking
  litter_cost DECIMAL(12,2),
  treatment_cost DECIMAL(12,2),
  removal_cost DECIMAL(12,2),
  total_litter_cost DECIMAL(12,2) GENERATED ALWAYS AS (COALESCE(litter_cost, 0) + COALESCE(treatment_cost, 0) + COALESCE(removal_cost, 0)) STORED,
  
  -- Notes
  notes TEXT,
  
  -- Offline sync support
  synced BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT customer_shed_cycle_unique UNIQUE (customer_id, shed_id, cycle_start_date)
);

-- Indexes for litter_management
CREATE INDEX idx_litter_management_customer_id ON litter_management(customer_id);
CREATE INDEX idx_litter_management_batch_id ON litter_management(batch_id);
CREATE INDEX idx_litter_management_shed_id ON litter_management(shed_id);
CREATE INDEX idx_litter_management_cycle_start_date ON litter_management(cycle_start_date);
CREATE INDEX idx_litter_management_batch_sequence ON litter_management(shed_id, batch_sequence_number);
CREATE INDEX idx_litter_management_synced ON litter_management(synced) WHERE synced = false;

-- House turnover tracking table
CREATE TABLE IF NOT EXISTS house_turnover (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  shed_id TEXT NOT NULL,
  
  -- Turnover cycle details
  turnover_date DATE NOT NULL,
  previous_batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  new_batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  
  -- Turnover metrics
  downtime_days INTEGER NOT NULL,
  cleaning_hours DECIMAL(5,2),
  disinfection_hours DECIMAL(5,2),
  total_turnover_hours DECIMAL(5,2) GENERATED ALWAYS AS (COALESCE(cleaning_hours, 0) + COALESCE(disinfection_hours, 0)) STORED,
  
  -- Turnover quality assessment
  cleaning_quality_rating TEXT CHECK (cleaning_quality_rating IN ('excellent', 'good', 'fair', 'poor')),
  disinfection_quality_rating TEXT CHECK (disinfection_quality_rating IN ('excellent', 'good', 'fair', 'poor')),
  overall_turnover_rating TEXT CHECK (overall_turnover_rating IN ('excellent', 'good', 'fair', 'poor')),
  
  -- Biosecurity measures
  biosecurity_protocol_followed BOOLEAN,
  pest_control_performed BOOLEAN,
  equipment_sanitized BOOLEAN,
  
  -- Cost tracking
  labor_cost DECIMAL(12,2),
  chemical_cost DECIMAL(12,2),
  water_cost DECIMAL(12,2),
  total_turnover_cost DECIMAL(12,2) GENERATED ALWAYS AS (COALESCE(labor_cost, 0) + COALESCE(chemical_cost, 0) + COALESCE(water_cost, 0)) STORED,
  
  -- Issues encountered
  issues_encountered TEXT[],
  corrective_actions TEXT[],
  
  -- Notes
  notes TEXT,
  
  -- Offline sync support
  synced BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT customer_shed_turnover_unique UNIQUE (customer_id, shed_id, turnover_date)
);

-- Indexes for house_turnover
CREATE INDEX idx_house_turnover_customer_id ON house_turnover(customer_id);
CREATE INDEX idx_house_turnover_shed_id ON house_turnover(shed_id);
CREATE INDEX idx_house_turnover_turnover_date ON house_turnover(turnover_date);
CREATE INDEX idx_house_turnover_previous_batch ON house_turnover(previous_batch_id);
CREATE INDEX idx_house_turnover_new_batch ON house_turnover(new_batch_id);
CREATE INDEX idx_house_turnover_synced ON house_turnover(synced) WHERE synced = false;

-- Row Level Security (RLS) Policies
ALTER TABLE litter_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_turnover ENABLE ROW LEVEL SECURITY;

-- Litter Management RLS
CREATE POLICY "Users can view own litter_management"
ON litter_management FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own litter_management"
ON litter_management FOR INSERT
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own litter_management"
ON litter_management FOR UPDATE
USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own litter_management"
ON litter_management FOR DELETE
USING (customer_id = auth.uid());

-- House Turnover RLS
CREATE POLICY "Users can view own house_turnover"
ON house_turnover FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own house_turnover"
ON house_turnover FOR INSERT
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own house_turnover"
ON house_turnover FOR UPDATE
USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own house_turnover"
ON house_turnover FOR DELETE
USING (customer_id = auth.uid());

-- Apply updated_at trigger
CREATE TRIGGER update_litter_management_updated_at BEFORE UPDATE ON litter_management
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_house_turnover_updated_at BEFORE UPDATE ON house_turnover
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment on tables
COMMENT ON TABLE litter_management IS 'Tracks litter usage, quality, and management across multiple batches';
COMMENT ON TABLE house_turnover IS 'Tracks house/shed turnover activities between batches including cleaning and disinfection';
