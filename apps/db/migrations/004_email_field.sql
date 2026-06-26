-- PoultryPulse AI - Email Field Migration
-- Migration: 004_email_field.sql
-- Description: Add email field to customers table for re-engagement emails
-- Requirements: Email re-engagement functionality

-- Add email field to customers table
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS email_opt_in BOOLEAN DEFAULT false;

-- Create index for email queries
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email) WHERE email IS NOT NULL;

-- Add comment to document the fields
COMMENT ON COLUMN customers.email IS 'Customer email address for re-engagement and notifications';
COMMENT ON COLUMN customers.email_verified IS 'Whether email address has been verified';
COMMENT ON COLUMN customers.email_verified_at IS 'Timestamp when email was verified';
COMMENT ON COLUMN customers.email_opt_in IS 'Whether customer has opted in to email communications';
