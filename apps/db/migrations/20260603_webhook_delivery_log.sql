-- PoultryPulse AI - Webhook Delivery Log Schema
-- Migration: 20260603_webhook_delivery_log.sql
-- Description: Creates webhook_delivery_log table for tracking outbound webhook deliveries
-- Requirements: REQ-019 §19.4, TASK-054

CREATE TABLE IF NOT EXISTS webhook_delivery_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_integration_id UUID NOT NULL REFERENCES customer_integrations(id) ON DELETE CASCADE,
  
  -- Event details
  event_type TEXT NOT NULL, -- 'batch.created', 'batch.harvested', 'forecast.updated', 'alert.fired'
  event_payload JSONB NOT NULL, -- The actual event data sent
  
  -- Delivery details
  webhook_url TEXT NOT NULL,
  http_status_code INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  
  -- Retry tracking
  attempt_number INTEGER DEFAULT 1,
  next_retry_at TIMESTAMPTZ,
  max_retries INTEGER DEFAULT 3,
  
  -- Status
  delivery_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'delivered', 'failed', 'retrying'
  error_message TEXT,
  
  -- HMAC signature (for verification)
  signature_header TEXT, -- The X-PoultryPulse-Signature header value sent
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

CREATE INDEX idx_webhook_delivery_log_integration_id ON webhook_delivery_log(customer_integration_id);
CREATE INDEX idx_webhook_delivery_log_event_type ON webhook_delivery_log(event_type);
CREATE INDEX idx_webhook_delivery_log_status ON webhook_delivery_log(delivery_status);
CREATE INDEX idx_webhook_delivery_log_created_at ON webhook_delivery_log(created_at DESC);
CREATE INDEX idx_webhook_delivery_log_next_retry_at ON webhook_delivery_log(next_retry_at) WHERE next_retry_at IS NOT NULL;

-- Row Level Security (RLS) Policies
ALTER TABLE webhook_delivery_log ENABLE ROW LEVEL SECURITY;

-- Users can view own webhook delivery logs
CREATE POLICY "Users can view own webhook_delivery_logs" 
ON webhook_delivery_log FOR SELECT 
USING (customer_integration_id IN (SELECT id FROM customer_integrations WHERE customer_id = auth.uid()));

-- Users can insert own webhook_delivery_logs
CREATE POLICY "Users can insert own webhook_delivery_logs" 
ON webhook_delivery_log FOR INSERT 
WITH CHECK (customer_integration_id IN (SELECT id FROM customer_integrations WHERE customer_id = auth.uid()));

-- Admin can view all webhook delivery logs
CREATE POLICY "Admin can view all webhook_delivery_logs"
ON webhook_delivery_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM customer_integrations ci
    JOIN customers c ON ci.customer_id = c.id
    WHERE ci.id = webhook_delivery_log.customer_integration_id
    AND c.role = 'admin'
  )
);
