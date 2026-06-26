-- PoultryPulse AI - Accuracy Functions and Materialized View
-- Migration: 002_accuracy_functions.sql
-- Description: PostgreSQL functions for computing rolling MAPE and directional accuracy
-- Requirements: TRD §3.2 (dag_accuracy_monitor)

-- Function: Compute rolling MAPE for last N days
-- Returns the Mean Absolute Percentage Error for predictions evaluated in the last N days
CREATE OR REPLACE FUNCTION compute_rolling_mape(days INT)
RETURNS NUMERIC AS $$
DECLARE
    rolling_mape NUMERIC;
BEGIN
    SELECT AVG(mape_1d)
    INTO rolling_mape
    FROM accuracy_log al
    JOIN predictions p ON al.prediction_id = p.id
    WHERE al.evaluated_at >= NOW() - (days || ' days')::INTERVAL
    AND al.evaluated_at <= NOW();
    
    RETURN COALESCE(rolling_mape, 0);
END;
$$ LANGUAGE plpgsql;

-- Function: Compute directional accuracy for last N days
-- Returns the percentage of predictions where direction was correct
CREATE OR REPLACE FUNCTION compute_directional_accuracy(days INT)
RETURNS NUMERIC AS $$
DECLARE
    directional_accuracy NUMERIC;
BEGIN
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE directional_correct = true)::NUMERIC / COUNT(*)) * 100
            ELSE 0 
        END
    INTO directional_accuracy
    FROM accuracy_log al
    JOIN predictions p ON al.prediction_id = p.id
    WHERE al.evaluated_at >= NOW() - (days || ' days')::INTERVAL
    AND al.evaluated_at <= NOW();
    
    RETURN COALESCE(directional_accuracy, 0);
END;
$$ LANGUAGE plpgsql;

-- Function: Compute conformal coverage for last N days
-- Returns the percentage of actual prices that fell within the P10-P90 confidence interval
CREATE OR REPLACE FUNCTION compute_conformal_coverage(days INT)
RETURNS NUMERIC AS $$
DECLARE
    conformal_coverage NUMERIC;
BEGIN
    SELECT 
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE actual_price BETWEEN p10 AND p90)::NUMERIC / COUNT(*)) * 100
            ELSE 0 
        END
    INTO conformal_coverage
    FROM accuracy_log al
    JOIN predictions p ON al.prediction_id = p.id
    WHERE al.evaluated_at >= NOW() - (days || ' days')::INTERVAL
    AND al.evaluated_at <= NOW();
    
    RETURN COALESCE(conformal_coverage, 0);
END;
$$ LANGUAGE plpgsql;

-- Function: Get comprehensive accuracy metrics for last N days
-- Returns a JSON object with MAPE, directional accuracy, and conformal coverage
CREATE OR REPLACE FUNCTION get_accuracy_metrics(days INT DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
    metrics JSONB;
BEGIN
    SELECT jsonb_build_object(
        'mape', compute_rolling_mape(days),
        'directional_accuracy', compute_directional_accuracy(days),
        'conformal_coverage', compute_conformal_coverage(days),
        'evaluated_at', NOW(),
        'days_window', days
    )
    INTO metrics;
    
    RETURN metrics;
END;
$$ LANGUAGE plpgsql;

-- Materialized View: Accuracy Dashboard
-- Refreshed daily, provides aggregated accuracy metrics for web dashboard
CREATE MATERIALIZED VIEW mv_accuracy_dashboard AS
SELECT 
    DATE(al.evaluated_at) as evaluation_date,
    COUNT(*) as total_predictions,
    AVG(al.mape_1d) as avg_mape,
    (COUNT(*) FILTER (WHERE al.directional_correct = true)::NUMERIC / COUNT(*)) * 100 as directional_accuracy_pct,
    (COUNT(*) FILTER (WHERE al.actual_price BETWEEN p.p10 AND p.p90)::NUMERIC / COUNT(*)) * 100 as conformal_coverage_pct,
    p.mandi,
    p.model_version,
    MIN(al.evaluated_at) as first_evaluated_at,
    MAX(al.evaluated_at) as last_evaluated_at
FROM accuracy_log al
JOIN predictions p ON al.prediction_id = p.id
GROUP BY DATE(al.evaluated_at), p.mandi, p.model_version
ORDER BY DATE(al.evaluated_at) DESC;

-- Indexes for materialized view
CREATE INDEX idx_mv_accuracy_dashboard_date ON mv_accuracy_dashboard(evaluation_date);
CREATE INDEX idx_mv_accuracy_dashboard_mandi ON mv_accuracy_dashboard(mandi);
CREATE INDEX idx_mv_accuracy_dashboard_model ON mv_accuracy_dashboard(model_version);

-- Function: Refresh accuracy dashboard materialized view
-- Should be called daily after accuracy_log is updated
CREATE OR REPLACE FUNCTION refresh_accuracy_dashboard()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_accuracy_dashboard;
END;
$$ LANGUAGE plpgsql;

-- Function: Get latest champion model metrics
-- Returns accuracy metrics for the current champion model
CREATE OR REPLACE FUNCTION get_champion_model_metrics()
RETURNS JSONB AS $$
DECLARE
    champion_metrics JSONB;
BEGIN
    SELECT jsonb_build_object(
        'model_version', mr.version,
        'mape_30d', mr.mape_30d,
        'directional_accuracy', mr.directional_accuracy * 100,
        'conformal_coverage', mr.conformal_coverage * 100,
        'promoted_at', mr.promoted_at,
        's3_artifact_path', mr.s3_artifact_path,
        'is_champion', mr.is_champion
    )
    INTO champion_metrics
    FROM model_registry mr
    WHERE mr.is_champion = true
    ORDER BY mr.promoted_at DESC
    LIMIT 1;
    
    RETURN COALESCE(champion_metrics, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Function: Check accuracy gates
-- Returns whether all three accuracy gates are passing
-- Gates: MAPE < 6%, Directional > 95%, Conformal Coverage 78-82%
CREATE OR REPLACE FUNCTION check_accuracy_gates(days INT DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
    mape_val NUMERIC;
    directional_val NUMERIC;
    conformal_val NUMERIC;
    gates_passing BOOLEAN;
    gate_results JSONB;
BEGIN
    -- Get current metrics
    mape_val := compute_rolling_mape(days);
    directional_val := compute_directional_accuracy(days);
    conformal_val := compute_conformal_coverage(days);
    
    -- Check each gate
    gates_passing := (
        mape_val < 6 AND 
        directional_val >= 95 AND 
        conformal_val >= 78 AND 
        conformal_val <= 82
    );
    
    -- Build results JSON
    gate_results := jsonb_build_object(
        'mape', jsonb_build_object(
            'value', mape_val,
            'gate_passes', mape_val < 6,
            'threshold', 6
        ),
        'directional_accuracy', jsonb_build_object(
            'value', directional_val,
            'gate_passes', directional_val >= 95,
            'threshold', 95
        ),
        'conformal_coverage', jsonb_build_object(
            'value', conformal_val,
            'gate_passes', conformal_val >= 78 AND conformal_val <= 82,
            'threshold_min', 78,
            'threshold_max', 82
        ),
        'all_gates_passing', gates_passing,
        'evaluated_at', NOW(),
        'days_window', days
    );
    
    RETURN gate_results;
END;
$$ LANGUAGE plpgsql;

-- Function: Log accuracy check result
-- Inserts accuracy gate check results into anomaly_log for monitoring
CREATE OR REPLACE FUNCTION log_accuracy_check(days INT DEFAULT 30)
RETURNS UUID AS $$
DECLARE
    gate_results JSONB;
    all_passing BOOLEAN;
    anomaly_id UUID;
BEGIN
    -- Get gate results
    gate_results := check_accuracy_gates(days);
    all_passing := (gate_results->>'all_gates_passing')::BOOLEAN;
    
    -- If gates are not passing, log as anomaly
    IF NOT all_passing THEN
        INSERT INTO anomaly_log (
            source,
            anomaly_type,
            description,
            severity,
            data,
            detected_at
        ) VALUES (
            'accuracy_monitor',
            'accuracy_gate_failure',
            'Accuracy gates not passing: ' || gate_results::TEXT,
            CASE 
                WHEN (gate_results->'mape'->>'gate_passes')::BOOLEAN = false THEN 'CRITICAL'
                WHEN (gate_results->'directional_accuracy'->>'gate_passes')::BOOLEAN = false THEN 'HIGH'
                ELSE 'MEDIUM'
            END,
            gate_results,
            NOW()
        ) RETURNING id INTO anomaly_id;
    END IF;
    
    RETURN COALESCE(anomaly_id, uuid_generate_v4());
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION compute_rolling_mape(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION compute_directional_accuracy(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION compute_conformal_coverage(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_accuracy_metrics(INT) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_accuracy_dashboard() TO service_role;
GRANT EXECUTE ON FUNCTION get_champion_model_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION check_accuracy_gates(INT) TO service_role;
GRANT EXECUTE ON FUNCTION log_accuracy_check(INT) TO service_role;

-- Grant select on materialized view
GRANT SELECT ON mv_accuracy_dashboard TO authenticated;
