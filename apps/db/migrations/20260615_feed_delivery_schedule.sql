-- PoultryPulse AI - Feed Delivery Schedule Schema
-- Migration: 20260615_feed_delivery_schedule.sql
-- Description: Adds tables for feed delivery schedule vs actual tracking
-- ISSUE-021: Missing Metrics Implementation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Feed delivery schedules table
CREATE TABLE IF NOT EXISTS feed_delivery_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  
  -- Schedule details
  schedule_date DATE NOT NULL,
  feed_type TEXT NOT NULL, -- Starter, Grower, Finisher, etc.
  feed_brand TEXT NOT NULL,
  
  -- Scheduled quantities
  scheduled_quantity_kg DECIMAL(10,2) NOT NULL CHECK (scheduled_quantity_kg > 0),
  scheduled_delivery_time TIME,
  
  -- Supplier details
  supplier_name TEXT,
  supplier_contact TEXT,
  
  -- Status
  delivery_status TEXT NOT NULL DEFAULT 'scheduled' CHECK (delivery_status IN ('scheduled', 'confirmed', 'in_transit', 'delivered', 'delayed', 'cancelled')),
  
  -- Actual delivery details
  actual_quantity_kg DECIMAL(10,2),
  actual_delivery_time TIMESTAMPTZ,
  delivery_notes TEXT,
  
  -- Variance calculation
  quantity_variance_kg DECIMAL(10,2) GENERATED ALWAYS AS (COALESCE(actual_quantity_kg, 0) - scheduled_quantity_kg) STORED,
  quantity_variance_pct DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN scheduled_quantity_kg > 0 THEN (COALESCE(actual_quantity_kg, 0) - scheduled_quantity_kg) / scheduled_quantity_kg * 100
      ELSE NULL 
    END
  ) STORED,
  
  -- Delay calculation (in hours)
  delivery_delay_hours DECIMAL(8,2),
  
  -- Quality checks
  quality_check_passed BOOLEAN,
  quality_check_notes TEXT,
  
  -- Related documents
  invoice_number TEXT,
  attachment_url TEXT,
  
  -- Offline sync support
  synced BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT customer_schedule_unique UNIQUE (customer_id, batch_id, schedule_date, feed_type)
);

-- Indexes for feed_delivery_schedules
CREATE INDEX idx_feed_delivery_schedules_customer_id ON feed_delivery_schedules(customer_id);
CREATE INDEX idx_feed_delivery_schedules_batch_id ON feed_delivery_schedules(batch_id);
CREATE INDEX idx_feed_delivery_schedules_schedule_date ON feed_delivery_schedules(schedule_date);
CREATE INDEX idx_feed_delivery_schedules_delivery_status ON feed_delivery_schedules(delivery_status);
CREATE INDEX idx_feed_delivery_schedules_feed_type ON feed_delivery_schedules(feed_type);
CREATE INDEX idx_feed_delivery_schedules_synced ON feed_delivery_schedules(synced) WHERE synced = false;

-- Row Level Security (RLS) Policies
ALTER TABLE feed_delivery_schedules ENABLE ROW LEVEL SECURITY;

-- Feed Delivery Schedules RLS
CREATE POLICY "Users can view own feed_delivery_schedules"
ON feed_delivery_schedules FOR SELECT
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own feed_delivery_schedules"
ON feed_delivery_schedules FOR INSERT
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own feed_delivery_schedules"
ON feed_delivery_schedules FOR UPDATE
USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own feed_delivery_schedules"
ON feed_delivery_schedules FOR DELETE
USING (customer_id = auth.uid());

-- Apply updated_at trigger
CREATE TRIGGER update_feed_delivery_schedules_updated_at BEFORE UPDATE ON feed_delivery_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment on table
COMMENT ON TABLE feed_delivery_schedules IS 'Tracks scheduled feed deliveries vs actual deliveries to monitor supply chain reliability';
