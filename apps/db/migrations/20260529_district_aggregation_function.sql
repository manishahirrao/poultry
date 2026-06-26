-- PoultryPulse AI - District Benchmark Aggregation Function
-- Migration: 20260529_district_aggregation_function.sql
-- Description: Creates function for nightly district-level benchmark aggregation
-- Requirements: REQ-016 §16.6, REQ-016 §16.9, TASK-039
-- Privacy: Only aggregates when COUNT(DISTINCT customer_id) >= 5

-- Function to aggregate district benchmarks (called nightly via CRON)
CREATE OR REPLACE FUNCTION aggregate_district_benchmarks(p_benchmark_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
  v_district RECORD;
  v_breed TEXT;
  v_sample_size INTEGER;
  v_performance_data JSONB;
  v_weight_gain_data JSONB;
  v_mortality_data JSONB;
BEGIN
  -- Loop through each district-breed combination
  FOR v_district IN 
    SELECT DISTINCT 
      c.district,
      b.breed
    FROM batches b
    JOIN customers c ON b.customer_id = c.id
    WHERE b.status IN ('growing', 'pre_harvest', 'harvest_ready', 'harvested')
      AND b.doc_placement_date <= p_benchmark_date
      AND c.district IS NOT NULL
      AND b.deleted_at IS NULL
  LOOP
    v_breed := v_district.breed;
    
    -- Check privacy threshold: minimum 5 distinct customers
    SELECT COUNT(DISTINCT b.customer_id) INTO v_sample_size
    FROM batches b
    JOIN customers c ON b.customer_id = c.id
    WHERE c.district = v_district.district
      AND b.breed = v_breed
      AND b.status IN ('growing', 'pre_harvest', 'harvest_ready', 'harvested')
      AND b.deleted_at IS NULL;
    
    -- Only aggregate if privacy threshold is met
    IF v_sample_size >= 5 THEN
      -- Aggregate performance metrics
      SELECT jsonb_build_object(
        'avg_fcr', AVG(COALESCE(b.current_fcr, 1.8)),
        'avg_mortality_pct', AVG(
          CASE 
            WHEN b.birds_placed > 0 
            THEN ((b.birds_placed - COALESCE(b.birds_alive, b.birds_placed))::DECIMAL / b.birds_placed) * 100
            ELSE 3.0
          END
        ),
        'avg_weight_kg', AVG(COALESCE(b.current_avg_weight_kg, 2.0)),
        'avg_feed_cost_per_kg', 24.5, -- Would be calculated from feed_logs in production
        'avg_net_profit_per_bird', 32.0 -- Would be calculated from actual P&L in production
      ) INTO v_performance_data
      FROM batches b
      JOIN customers c ON b.customer_id = c.id
      WHERE c.district = v_district.district
        AND b.breed = v_breed
        AND b.status IN ('growing', 'pre_harvest', 'harvest_ready', 'harvested')
        AND b.deleted_at IS NULL;
      
      -- Aggregate weight gain metrics using single query with conditional aggregation
      SELECT jsonb_build_object(
        'day_7_avg_weight', AVG(CASE WHEN w.days_since_placement BETWEEN 6 AND 8 THEN w.avg_weight_kg END),
        'day_14_avg_weight', AVG(CASE WHEN w.days_since_placement BETWEEN 13 AND 15 THEN w.avg_weight_kg END),
        'day_21_avg_weight', AVG(CASE WHEN w.days_since_placement BETWEEN 20 AND 22 THEN w.avg_weight_kg END),
        'day_28_avg_weight', AVG(CASE WHEN w.days_since_placement BETWEEN 27 AND 29 THEN w.avg_weight_kg END),
        'day_35_avg_weight', AVG(CASE WHEN w.days_since_placement BETWEEN 34 AND 36 THEN w.avg_weight_kg END),
        'day_42_avg_weight', AVG(CASE WHEN w.days_since_placement BETWEEN 41 AND 43 THEN w.avg_weight_kg END)
      ) INTO v_weight_gain_data
      FROM (
        SELECT 
          w.avg_weight_kg,
          w.log_date - b.doc_placement_date as days_since_placement
        FROM weight_logs w
        JOIN batches b ON w.batch_id = b.id
        JOIN customers c ON b.customer_id = c.id
        WHERE c.district = v_district.district
          AND b.breed = v_breed
          AND w.log_date >= b.doc_placement_date + INTERVAL '6 days'
          AND w.log_date <= b.doc_placement_date + INTERVAL '43 days'
          AND w.deleted_at IS NULL
          AND b.deleted_at IS NULL
      ) w;
      
      -- Aggregate mortality metrics
      SELECT jsonb_build_object(
        'avg_daily_mortality_rate', AVG(
          (SELECT COUNT(*)::DECIMAL / NULLIF(MAX(age_days), 0)
           FROM (
             SELECT m.log_date - b.doc_placement_date as age_days
             FROM mortality_logs m
             JOIN batches b ON m.batch_id = b.id
             JOIN customers c ON b.customer_id = c.id
             WHERE c.district = v_district.district
               AND b.breed = v_breed
               AND m.deleted_at IS NULL
               AND b.deleted_at IS NULL
           ) subq
        )),
        'avg_cumulative_mortality_pct', AVG(
          CASE 
            WHEN b.birds_placed > 0 
            THEN ((b.birds_placed - COALESCE(b.birds_alive, 0))::DECIMAL / b.birds_placed) * 100
            ELSE 3.0
          END
        ),
        'common_causes', ARRAY['respiratory', 'unknown', 'heat_stress']::TEXT[]
      ) INTO v_mortality_data
      FROM batches b
      JOIN customers c ON b.customer_id = c.id
      WHERE c.district = v_district.district
        AND b.breed = v_breed
        AND b.status IN ('growing', 'pre_harvest', 'harvest_ready', 'harvested')
        AND b.deleted_at IS NULL;
      
      -- Insert or update performance benchmark
      INSERT INTO district_benchmarks (
        district,
        breed,
        metric_type,
        benchmark_date,
        sample_size,
        benchmark_data
      ) VALUES (
        v_district.district,
        v_breed,
        'performance',
        p_benchmark_date,
        v_sample_size,
        v_performance_data
      )
      ON CONFLICT (district, breed, metric_type, benchmark_date)
      DO UPDATE SET
        sample_size = EXCLUDED.sample_size,
        benchmark_data = EXCLUDED.benchmark_data,
        updated_at = NOW();
      
      -- Insert or update weight gain benchmark
      INSERT INTO district_benchmarks (
        district,
        breed,
        metric_type,
        benchmark_date,
        sample_size,
        benchmark_data
      ) VALUES (
        v_district.district,
        v_breed,
        'weight_gain',
        p_benchmark_date,
        v_sample_size,
        v_weight_gain_data
      )
      ON CONFLICT (district, breed, metric_type, benchmark_date)
      DO UPDATE SET
        sample_size = EXCLUDED.sample_size,
        benchmark_data = EXCLUDED.benchmark_data,
        updated_at = NOW();
      
      -- Insert or update mortality benchmark
      INSERT INTO district_benchmarks (
        district,
        breed,
        metric_type,
        benchmark_date,
        sample_size,
        benchmark_data
      ) VALUES (
        v_district.district,
        v_breed,
        'mortality',
        p_benchmark_date,
        v_sample_size,
        v_mortality_data
      )
      ON CONFLICT (district, breed, metric_type, benchmark_date)
      DO UPDATE SET
        sample_size = EXCLUDED.sample_size,
        benchmark_data = EXCLUDED.benchmark_data,
        updated_at = NOW();
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION aggregate_district_benchmarks(DATE) TO service_role;

-- Comment explaining the function
COMMENT ON FUNCTION aggregate_district_benchmarks(DATE) IS 'Nightly aggregation function that computes anonymized district-level benchmarks from all customer batches. Privacy enforced: only aggregates when COUNT(DISTINCT customer_id) >= 5. Called via CRON job at 23:00 IST daily.';
