-- PoultryPulse AI - District Price Summary Materialized View
-- Migration: 20260501_district_price_summary.sql
-- Description: Creates materialized view for district-level price summaries for the map
-- Requirements: REQ-002 §2.1, Architecture v1.0 §4.2, TASK-010

-- Drop existing materialized view if it exists (for migration reruns)
DROP MATERIALIZED VIEW IF EXISTS district_price_summary CASCADE;

-- Create materialized view for district price summaries
-- This pre-computes district-level price data to eliminate complex joins at map load time
-- PERFORMANCE FIX: Replaced correlated subqueries with CTE and window functions for efficiency
CREATE MATERIALIZED VIEW district_price_summary AS
WITH latest_prices AS (
  SELECT DISTINCT ON (mandi)
    mandi,
    p50,
    p10,
    p90,
    predicted_for,
    LAG(p50) OVER (PARTITION BY mandi ORDER BY predicted_for) as prev_p50
  FROM predictions
  WHERE predicted_for >= CURRENT_DATE - INTERVAL '30 days'
    AND deleted_at IS NULL
  ORDER BY mandi, predicted_for DESC
)
SELECT 
  lp.mandi AS district,
  lp.p50,
  lp.p10,
  lp.p90,
  CASE 
    WHEN lp.prev_p50 IS NOT NULL
    THEN ROUND(((lp.p50 - lp.prev_p50) / NULLIF(lp.prev_p50, 0)) * 100, 2)
    ELSE 0
  END AS delta_pct,
  CASE 
    WHEN lp.p50 > lp.prev_p50 THEN 'sell'
    WHEN lp.p50 < lp.prev_p50 THEN 'caution'
    ELSE 'hold'
  END AS signal,
  false AS hpai_flag,
  (SELECT COUNT(*) FROM alerts a 
   WHERE a.district = lp.mandi 
   AND a.expires_at > NOW()
   AND a.deleted_at IS NULL) AS active_alert_count,
  lp.predicted_for AS last_updated
FROM latest_prices lp
WITH DATA;

-- Create index on district column for fast single-district lookups
CREATE INDEX idx_district_price_summary_district ON district_price_summary(district);

-- Create index on last_updated for efficient refresh queries
CREATE INDEX idx_district_price_summary_last_updated ON district_price_summary(last_updated DESC);

-- Create function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_district_price_summary()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY district_price_summary;
END;
$$ LANGUAGE plpgsql;

-- Grant read access to authenticated users
GRANT SELECT ON district_price_summary TO authenticated;

-- Grant execute on refresh function to service role
GRANT EXECUTE ON FUNCTION refresh_district_price_summary() TO service_role;

-- Add comment to document the view
COMMENT ON MATERIALIZED VIEW district_price_summary IS 'Pre-computed district-level price summaries for the map interface. Refreshed daily by dag_model_infer.';
