-- PoultryPulse AI - Onboarding Fields Migration
-- Migration: 003_onboarding_fields.sql
-- Description: Add onboarding tracking fields to customers table
-- Requirements: Onboarding analysis recommendations

-- Add onboarding tracking fields to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS onboarding_step TEXT,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_abandoned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS first_signal_received_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS whatsapp_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_data JSONB DEFAULT '{}';

-- Create index for onboarding step queries
CREATE INDEX IF NOT EXISTS idx_customers_onboarding_step ON customers(onboarding_step) WHERE onboarding_step IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_onboarding_completed ON customers(onboarding_completed_at) WHERE onboarding_completed_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_first_signal ON customers(first_signal_received_at) WHERE first_signal_received_at IS NOT NULL;

-- Add comment to document the fields
COMMENT ON COLUMN customers.onboarding_step IS 'Current onboarding step (OB-01 to OB-10)';
COMMENT ON COLUMN customers.onboarding_completed_at IS 'Timestamp when onboarding was completed';
COMMENT ON COLUMN customers.onboarding_abandoned_at IS 'Timestamp when user abandoned onboarding';
COMMENT ON COLUMN customers.first_signal_received_at IS 'Timestamp when user received their first WhatsApp signal (true activation)';
COMMENT ON COLUMN customers.whatsapp_verified IS 'Whether WhatsApp number has been verified';
COMMENT ON COLUMN customers.whatsapp_verified_at IS 'Timestamp when WhatsApp was verified';
COMMENT ON COLUMN customers.onboarding_data IS 'JSONB storage for onboarding step data';
