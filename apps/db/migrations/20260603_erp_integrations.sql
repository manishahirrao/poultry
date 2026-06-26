-- PoultryPulse AI - ERP Integration Hub Schema
-- Migration: 20260603_erp_integrations.sql
-- Description: Creates tables for ERP integrations (Tally, Zoho Books, SAP, Webhooks)
-- Requirements: REQ-019 §19.1–19.5, Design Addendum §
-- Task: TASK-053

-- Enum types for integrations
CREATE TYPE integration_type AS ENUM ('tally', 'zoho_books', 'zoho_inventory', 'sap', 'oracle', 'webhook');
CREATE TYPE integration_status AS ENUM ('active', 'inactive', 'error', 'pending');
CREATE TYPE sync_status AS ENUM ('success', 'failed', 'pending', 'in_progress');

-- Customer integrations table (stores encrypted credentials and configuration)
CREATE TABLE IF NOT EXISTS customer_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  integration_type integration_type NOT NULL,
  status integration_status NOT NULL DEFAULT 'pending',
  
  -- Encrypted credentials (using pgcrypto)
  credentials JSONB, -- Encrypted at application level before storage
  config JSONB, -- Non-sensitive configuration (webhook URLs, organization IDs, etc.)
  
  -- OAuth specific fields
  oauth_access_token TEXT, -- Encrypted
  oauth_refresh_token TEXT, -- Encrypted
  oauth_token_expires_at TIMESTAMPTZ,
  oauth_scope TEXT,
  
  -- Webhook specific fields
  webhook_url TEXT,
  webhook_secret TEXT, -- For HMAC signature verification
  webhook_events TEXT[], -- Array of events: ['batch.created', 'batch.harvested', etc.]
  
  -- Tally specific fields
  tally_company_name TEXT,
  tally_ledger_name TEXT,
  
  -- Zoho specific fields
  zoho_organization_id TEXT,
  zoho_organization_name TEXT,
  
  -- SAP specific fields
  sap_system_id TEXT,
  sap_client_id TEXT,
  
  -- Metadata
  last_sync_at TIMESTAMPTZ,
  last_sync_status sync_status,
  last_sync_error TEXT,
  last_test_connection_at TIMESTAMPTZ,
  last_test_connection_status sync_status,
  last_test_connection_error TEXT,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT customer_integration_unique UNIQUE (customer_id, integration_type)
);

CREATE INDEX idx_customer_integrations_customer_id ON customer_integrations(customer_id);
CREATE INDEX idx_customer_integrations_integration_type ON customer_integrations(integration_type);
CREATE INDEX idx_customer_integrations_status ON customer_integrations(status);
CREATE INDEX idx_customer_integrations_last_sync_at ON customer_integrations(last_sync_at DESC);

-- Integration sync logs table (audit trail for all sync operations)
CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_integration_id UUID NOT NULL REFERENCES customer_integrations(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- 'batch_harvest', 'purchase_order', 'inventory', etc.
  sync_status sync_status NOT NULL,
  
  -- Sync details
  batch_id UUID REFERENCES batches(id),
  purchase_order_id UUID REFERENCES purchase_orders(id),
  entity_type TEXT, -- 'batch', 'purchase_order', 'invoice', etc.
  entity_id TEXT,
  
  -- Request/Response data (for debugging)
  request_payload JSONB,
  response_payload JSONB,
  error_message TEXT,
  error_code TEXT,
  
  -- Timing
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER,
  
  retry_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ
);

CREATE INDEX idx_integration_sync_logs_integration_id ON integration_sync_logs(customer_integration_id);
CREATE INDEX idx_integration_sync_logs_sync_status ON integration_sync_logs(sync_status);
CREATE INDEX idx_integration_sync_logs_batch_id ON integration_sync_logs(batch_id);
CREATE INDEX idx_integration_sync_logs_started_at ON integration_sync_logs(started_at DESC);
CREATE INDEX idx_integration_sync_logs_next_retry_at ON integration_sync_logs(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- Row Level Security (RLS) Policies
ALTER TABLE customer_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_sync_logs ENABLE ROW LEVEL SECURITY;

-- Customer Integrations RLS
CREATE POLICY "Users can view own integrations" 
ON customer_integrations FOR SELECT 
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own integrations" 
ON customer_integrations FOR INSERT 
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own integrations" 
ON customer_integrations FOR UPDATE 
USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own integrations" 
ON customer_integrations FOR DELETE 
USING (customer_id = auth.uid());

-- Admin can view all integrations
CREATE POLICY "Admin can view all integrations"
ON customer_integrations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM customers 
    WHERE id = customer_integrations.customer_id 
    AND role = 'admin'
  )
);

-- Integration Sync Logs RLS (via integration ownership)
CREATE POLICY "Users can view own sync_logs" 
ON integration_sync_logs FOR SELECT 
USING (customer_integration_id IN (SELECT id FROM customer_integrations WHERE customer_id = auth.uid()));

CREATE POLICY "Users can insert own sync_logs" 
ON integration_sync_logs FOR INSERT 
WITH CHECK (customer_integration_id IN (SELECT id FROM customer_integrations WHERE customer_id = auth.uid()));

-- Admin can view all sync logs
CREATE POLICY "Admin can view all sync_logs"
ON integration_sync_logs FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM customer_integrations ci
    JOIN customers c ON ci.customer_id = c.id
    WHERE ci.id = integration_sync_logs.customer_integration_id
    AND c.role = 'admin'
  )
);

-- Updated_at trigger
CREATE TRIGGER update_customer_integrations_updated_at BEFORE UPDATE ON customer_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate sync duration
CREATE OR REPLACE FUNCTION calculate_sync_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
    NEW.duration_ms := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at)) * 1000;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_sync_duration
  BEFORE INSERT OR UPDATE ON integration_sync_logs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_sync_duration();

-- Function to update integration status based on latest sync
CREATE OR REPLACE FUNCTION update_integration_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the integration's last sync status and timestamp
  UPDATE customer_integrations
  SET 
    last_sync_at = NEW.completed_at,
    last_sync_status = NEW.sync_status,
    last_sync_error = NEW.error_message,
    status = CASE 
      WHEN NEW.sync_status = 'success' THEN 'active'
      WHEN NEW.sync_status = 'failed' THEN 'error'
      ELSE status
    END,
    updated_at = NOW()
  WHERE id = NEW.customer_integration_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_integration_status
  AFTER INSERT OR UPDATE ON integration_sync_logs
  FOR EACH ROW
  WHEN (NEW.sync_status IN ('success', 'failed'))
  EXECUTE FUNCTION update_integration_status();

-- Function to retry failed syncs (called by CRON job)
CREATE OR REPLACE FUNCTION retry_failed_syncs()
RETURNS INTEGER AS $$
DECLARE
  retry_count INTEGER := 0;
BEGIN
  -- Retry syncs that failed and are due for retry
  UPDATE integration_sync_logs
  SET 
    sync_status = 'pending',
    retry_count = retry_count + 1,
    next_retry_at = NOW() + (POWER(2, retry_count + 1) * INTERVAL '1 minute') -- Exponential backoff
  WHERE 
    sync_status = 'failed'
    AND retry_count < 3 -- Max 3 retries
    AND (next_retry_at IS NULL OR next_retry_at <= NOW());
  
  GET DIAGNOSTICS retry_count = ROW_COUNT;
  
  RETURN retry_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on retry function
GRANT EXECUTE ON FUNCTION retry_failed_syncs TO postgres;
