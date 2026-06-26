-- Lead Magnet System Migration
-- File: apps/db/migrations/008_lead_magnet_system.sql
-- Version: v1.0 | May 2026
-- Description: Creates tables and functions for lead magnet capture and delivery

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  district VARCHAR(100),
  magnet_type VARCHAR(50) NOT NULL CHECK (magnet_type IN ('template', 'checklist')),
  source VARCHAR(100) DEFAULT 'lead_magnet_landing',
  status VARCHAR(50) DEFAULT 'delivered' CHECK (status IN ('pending', 'delivered', 'bounced', 'opened', 'clicked')),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  converted_to_trial BOOLEAN DEFAULT FALSE,
  trial_started_at TIMESTAMPTZ,
  converted_to_paid BOOLEAN DEFAULT FALSE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on email for fast lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_district ON leads(district);
CREATE INDEX IF NOT EXISTS idx_leads_magnet_type ON leads(magnet_type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- Create lead_events table for tracking engagement
CREATE TABLE IF NOT EXISTS lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('delivered', 'opened', 'clicked', 'downloaded', 'trial_started', 'paid')),
  event_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on lead_events
CREATE INDEX IF NOT EXISTS idx_lead_events_lead_id ON lead_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_events_event_type ON lead_events(event_type);
CREATE INDEX IF NOT EXISTS idx_lead_events_created_at ON lead_events(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for leads table
DROP TRIGGER IF EXISTS trigger_update_leads_updated_at ON leads;
CREATE TRIGGER trigger_update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_leads_updated_at();

-- Create function to track lead conversion to trial
CREATE OR REPLACE FUNCTION track_lead_trial_conversion()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE leads
  SET 
    converted_to_trial = TRUE,
    trial_started_at = NOW()
  WHERE email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger would be added to the users/subscriptions table when a trial starts
-- Example: CREATE TRIGGER trigger_track_lead_trial_conversion AFTER INSERT ON users...

-- Create function to track lead conversion to paid
CREATE OR REPLACE FUNCTION track_lead_paid_conversion()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE leads
  SET 
    converted_to_paid = TRUE,
    paid_at = NOW()
  WHERE email = NEW.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: This trigger would be added to the subscriptions table when payment is made

-- Create view for lead magnet performance
CREATE OR REPLACE VIEW lead_magnet_performance AS
SELECT 
  magnet_type,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_count,
  COUNT(CASE WHEN converted_to_trial = TRUE THEN 1 END) as trial_conversions,
  COUNT(CASE WHEN converted_to_paid = TRUE THEN 1 END) as paid_conversions,
  ROUND(
    (COUNT(CASE WHEN converted_to_trial = TRUE THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0)) * 100,
    2
  ) as trial_conversion_rate,
  ROUND(
    (COUNT(CASE WHEN converted_to_paid = TRUE THEN 1 END)::FLOAT / NULLIF(COUNT(*), 0)) * 100,
    2
  ) as paid_conversion_rate,
  COUNT(DISTINCT district) as districts_reached
FROM leads
GROUP BY magnet_type;

-- Create view for district performance
CREATE OR REPLACE VIEW district_lead_performance AS
SELECT 
  COALESCE(district, 'Unknown') as district,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN magnet_type = 'template' THEN 1 END) as template_downloads,
  COUNT(CASE WHEN magnet_type = 'checklist' THEN 1 END) as checklist_downloads,
  COUNT(CASE WHEN converted_to_trial = TRUE THEN 1 END) as trial_conversions,
  COUNT(CASE WHEN converted_to_paid = TRUE THEN 1 END) as paid_conversions,
  MIN(created_at) as first_lead,
  MAX(created_at) as last_lead
FROM leads
GROUP BY district
ORDER BY total_leads DESC;

-- Grant permissions (adjust based on your Supabase setup)
-- GRANT SELECT, INSERT, UPDATE ON leads TO authenticated;
-- GRANT SELECT, INSERT ON lead_events TO authenticated;
-- GRANT SELECT ON lead_magnet_performance TO authenticated;
-- GRANT SELECT ON district_lead_performance TO authenticated;

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads
CREATE POLICY "Anyone can view lead performance stats" ON lead_magnet_performance
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view district stats" ON district_lead_performance
  FOR SELECT USING (true);

-- Note: Add specific RLS policies for leads and lead_events based on your auth requirements
