-- PoultryPulse AI - AI Cache Table
-- Migration: 20260502_ai_cache.sql
-- Description: Creates cache table for AI-generated content (negotiation scripts, etc.)
-- Requirements: TASK-015, TASK-014

-- Drop existing table if it exists
DROP TABLE IF EXISTS ai_cache CASCADE;

-- Create ai_cache table
CREATE TABLE ai_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key TEXT NOT NULL,
    cache_type TEXT NOT NULL, -- 'negotiation_script', 'drivers_explanation', etc.
    response TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    -- Ensure unique cache keys per type
    UNIQUE(cache_key, cache_type)
);

-- Create indexes for efficient cache lookups
CREATE INDEX idx_ai_cache_key ON ai_cache(cache_key);
CREATE INDEX idx_ai_cache_type ON ai_cache(cache_type);
CREATE INDEX idx_ai_cache_created_at ON ai_cache(created_at DESC);
CREATE INDEX idx_ai_cache_expires_at ON ai_cache(expires_at) WHERE expires_at IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE ai_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies - service role can manage, authenticated can read
CREATE POLICY "Service role can manage ai_cache"
    ON ai_cache FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Authenticated can read ai_cache"
    ON ai_cache FOR SELECT
    TO authenticated
    USING (true);

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_ai_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM ai_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON ai_cache TO authenticated;
GRANT ALL ON ai_cache TO service_role;

-- Add comment for documentation
COMMENT ON TABLE ai_cache IS 'Cache table for AI-generated content to reduce API costs and improve response times. Entries expire based on expires_at or are cleaned manually.';
COMMENT ON COLUMN ai_cache.cache_key IS 'Unique key for cache lookup (e.g., district_priceBucket for negotiation scripts)';
COMMENT ON COLUMN ai_cache.cache_type IS 'Type of cached content (negotiation_script, drivers_explanation, etc.)';
COMMENT ON COLUMN ai_cache.expires_at IS 'Optional expiration time for cache entries';
