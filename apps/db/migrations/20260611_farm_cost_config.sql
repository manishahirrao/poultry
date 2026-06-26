-- Migration: Farm Cost Configuration Table
-- Purpose: Store configurable cost rates per farm/region for Batch P&L calculations
-- Issue Reference: ISSUE-015 - Batch P&L Hardcoded Cost Rates
-- Created: 2026-06-11

-- Create farm_cost_config table
CREATE TABLE IF NOT EXISTS farm_cost_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  integrator_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Cost rates (all in INR)
  doc_price DECIMAL(10, 2) DEFAULT 42.00, -- Day-old chick price per bird
  feed_price_per_kg DECIMAL(10, 2) DEFAULT 25.00, -- Feed cost per kg
  medicine_cost_per_unit DECIMAL(10, 2) DEFAULT 100.00, -- Medicine cost per unit
  vaccine_cost_per_unit DECIMAL(10, 2) DEFAULT 50.00, -- Vaccine cost per unit
  labor_rate_per_day DECIMAL(10, 2) DEFAULT 800.00, -- Labor cost per day
  electricity_rate_per_day DECIMAL(10, 2) DEFAULT 200.00, -- Electricity cost per day
  overhead_rate_per_day DECIMAL(10, 2) DEFAULT 300.00, -- Overhead cost per day
  
  -- Metadata
  region VARCHAR(100), -- Optional region for regional defaults
  is_default BOOLEAN DEFAULT false, -- Whether this is a default config for the integrator
  effective_from DATE DEFAULT CURRENT_DATE, -- When this config becomes effective
  effective_until DATE, -- When this config expires (NULL = no expiry)
  
  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES customers(id),
  updated_by UUID REFERENCES customers(id),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT unique_farm_config UNIQUE (farm_id, deleted_at) WHERE deleted_at IS NULL,
  CONSTRAINT valid_date_range CHECK (effective_until IS NULL OR effective_until >= effective_from)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_farm_cost_config_farm_id ON farm_cost_config(farm_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_farm_cost_config_integrator_id ON farm_cost_config(integrator_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_farm_cost_config_region ON farm_cost_config(region) WHERE deleted_at IS NULL AND region IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_farm_cost_config_effective_dates ON farm_cost_config(effective_from, effective_until) WHERE deleted_at IS NULL;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_farm_cost_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_farm_cost_config_updated_at
  BEFORE UPDATE ON farm_cost_config
  FOR EACH ROW
  EXECUTE FUNCTION update_farm_cost_config_updated_at();

-- Add comments for documentation
COMMENT ON TABLE farm_cost_config IS 'Stores configurable cost rates per farm/region for Batch P&L calculations. Replaces hardcoded cost rates in BatchPnL component.';
COMMENT ON COLUMN farm_cost_config.doc_price IS 'Day-old chick price per bird in INR. Default: ₹42';
COMMENT ON COLUMN farm_cost_config.feed_price_per_kg IS 'Feed cost per kg in INR. Default: ₹25';
COMMENT ON COLUMN farm_cost_config.medicine_cost_per_unit IS 'Medicine cost per unit in INR. Default: ₹100';
COMMENT ON COLUMN farm_cost_config.vaccine_cost_per_unit IS 'Vaccine cost per unit in INR. Default: ₹50';
COMMENT ON COLUMN farm_cost_config.labor_rate_per_day IS 'Labor cost per day in INR. Default: ₹800';
COMMENT ON COLUMN farm_cost_config.electricity_rate_per_day IS 'Electricity cost per day in INR. Default: ₹200';
COMMENT ON COLUMN farm_cost_config.overhead_rate_per_day IS 'Overhead cost per day in INR. Default: ₹300';
COMMENT ON COLUMN farm_cost_config.is_default IS 'Whether this is a default configuration for the integrator (applies to all farms without specific config)';
COMMENT ON COLUMN farm_cost_config.effective_from IS 'Date when this configuration becomes effective';
COMMENT ON COLUMN farm_cost_config.effective_until IS 'Date when this configuration expires (NULL = no expiry)';

-- Create function to get cost config for a farm with fallback to integrator default
CREATE OR REPLACE FUNCTION get_farm_cost_config(p_farm_id UUID, p_integrator_id UUID)
RETURNS TABLE (
  doc_price DECIMAL,
  feed_price_per_kg DECIMAL,
  medicine_cost_per_unit DECIMAL,
  vaccine_cost_per_unit DECIMAL,
  labor_rate_per_day DECIMAL,
  electricity_rate_per_day DECIMAL,
  overhead_rate_per_day DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  WITH farm_config AS (
    SELECT 
      COALESCE(doc_price, 42.00) as doc_price,
      COALESCE(feed_price_per_kg, 25.00) as feed_price_per_kg,
      COALESCE(medicine_cost_per_unit, 100.00) as medicine_cost_per_unit,
      COALESCE(vaccine_cost_per_unit, 50.00) as vaccine_cost_per_unit,
      COALESCE(labor_rate_per_day, 800.00) as labor_rate_per_day,
      COALESCE(electricity_rate_per_day, 200.00) as electricity_rate_per_day,
      COALESCE(overhead_rate_per_day, 300.00) as overhead_rate_per_day
    FROM farm_cost_config
    WHERE farm_id = p_farm_id
      AND deleted_at IS NULL
      AND CURRENT_DATE BETWEEN effective_from AND COALESCE(effective_until, CURRENT_DATE + INTERVAL '1 year')
    ORDER BY effective_from DESC
    LIMIT 1
  ),
  integrator_default AS (
    SELECT 
      COALESCE(doc_price, 42.00) as doc_price,
      COALESCE(feed_price_per_kg, 25.00) as feed_price_per_kg,
      COALESCE(medicine_cost_per_unit, 100.00) as medicine_cost_per_unit,
      COALESCE(vaccine_cost_per_unit, 50.00) as vaccine_cost_per_unit,
      COALESCE(labor_rate_per_day, 800.00) as labor_rate_per_day,
      COALESCE(electricity_rate_per_day, 200.00) as electricity_rate_per_day,
      COALESCE(overhead_rate_per_day, 300.00) as overhead_rate_per_day
    FROM farm_cost_config
    WHERE integrator_id = p_integrator_id
      AND is_default = true
      AND deleted_at IS NULL
      AND CURRENT_DATE BETWEEN effective_from AND COALESCE(effective_until, CURRENT_DATE + INTERVAL '1 year')
    ORDER BY effective_from DESC
    LIMIT 1
  )
  SELECT 
    COALESCE(fc.doc_price, id.doc_price, 42.00),
    COALESCE(fc.feed_price_per_kg, id.feed_price_per_kg, 25.00),
    COALESCE(fc.medicine_cost_per_unit, id.medicine_cost_per_unit, 100.00),
    COALESCE(fc.vaccine_cost_per_unit, id.vaccine_cost_per_unit, 50.00),
    COALESCE(fc.labor_rate_per_day, id.labor_rate_per_day, 800.00),
    COALESCE(fc.electricity_rate_per_day, id.electricity_rate_per_day, 200.00),
    COALESCE(fc.overhead_rate_per_day, id.overhead_rate_per_day, 300.00)
  FROM farm_config fc
  FULL OUTER JOIN integrator_default id ON true
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust based on your auth setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON farm_cost_config TO authenticated;
-- GRANT EXECUTE ON FUNCTION get_farm_cost_config(UUID, UUID) TO authenticated;
