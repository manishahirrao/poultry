-- PoultryPulse AI - Development Seed Data
-- File: dev_seed.sql
-- Description: Synthetic test data for development environment
-- Requirements: Development setup

-- Insert test customer accounts
-- Customer 1: S1 segment (Commercial Farm - Core)
INSERT INTO customers (id, phone_hash, segment, mandi, bird_count, subscription, device_fingerprint_hash, consent_given, consent_given_at, consent_text_version)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    'S1',
    'gorakhpur',
    25000,
    '{"tier": "PULSE_FARM", "status": "active", "expires_at": "2026-12-31T23:59:59Z", "amount": 2000}',
    'fp_hash_s1_test_001',
    true,
    NOW(),
    'v1.0'
);

-- Customer 2: S2 segment (Mid-Size Integrator)
INSERT INTO customers (id, phone_hash, segment, mandi, bird_count, subscription, device_fingerprint_hash, consent_given, consent_given_at, consent_text_version)
VALUES (
    '550e8400-e29b-41d4-a716-446655440002',
    'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3',
    'S2',
    'gorakhpur',
    150000,
    '{"tier": "PULSE_PRO", "status": "active", "expires_at": "2026-12-31T23:59:59Z", "amount": 8000}',
    'fp_hash_s2_test_001',
    true,
    NOW(),
    'v1.0'
);

-- Customer 3: Admin account (for testing admin features)
INSERT INTO customers (id, phone_hash, segment, mandi, bird_count, subscription, device_fingerprint_hash, consent_given, consent_given_at, consent_text_version)
VALUES (
    '550e8400-e29b-41d4-a716-446655440003',
    'c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    'S6',
    'gorakhpur',
    500000,
    '{"tier": "PULSE_INTEL", "status": "active", "expires_at": "2027-12-31T23:59:59Z", "amount": 50000}',
    'fp_hash_admin_test_001',
    true,
    NOW(),
    'v1.0'
);

-- Insert 30 days of synthetic predictions for gorakhpur mandi
-- Realistic price range: ₹140–₹175 per kg
-- Starting from 30 days ago to today
DO $$
DECLARE
    i INT;
    base_price NUMERIC := 155;
    price_variation NUMERIC;
    p10_val NUMERIC;
    p50_val NUMERIC;
    p90_val NUMERIC;
    prediction_date DATE;
BEGIN
    FOR i IN 0..29 LOOP
        prediction_date := CURRENT_DATE - i;
        
        -- Generate realistic price variation
        price_variation := (RANDOM() * 35) - 17.5; -- ±17.5 variation
        p50_val := base_price + price_variation;
        
        -- Ensure price stays within realistic range
        p50_val := GREATEST(140, LEAST(175, p50_val));
        
        -- P10 and P90 around P50 with confidence interval
        p10_val := p50_val - (RANDOM() * 8 + 4); -- 4-12 below P50
        p90_val := p50_val + (RANDOM() * 8 + 4); -- 4-12 above P50
        
        -- Ensure P10 <= P50 <= P90
        p10_val := LEAST(p10_val, p50_val);
        p90_val := GREATEST(p90_val, p50_val);
        
        INSERT INTO predictions (
            mandi,
            predicted_for,
            p10,
            p50,
            p90,
            drivers,
            confidence,
            model_version,
            staleness_flag,
            created_at
        ) VALUES (
            'gorakhpur',
            prediction_date,
            ROUND(p10_val, 2),
            ROUND(p50_val, 2),
            ROUND(p90_val, 2),
            jsonb_build_array(
                jsonb_build_object('factor', 'feed_cost_ratio_42d', 'impact', 'positive', 'magnitude', 0.65, 'description_hi', 'मक्का की कीमत कम है'),
                jsonb_build_object('factor', 'festival_7d_flag', 'impact', 'neutral', 'magnitude', 0.12, 'description_hi', 'त्योहार का प्रभाव कम'),
                jsonb_build_object('factor', 'heat_stress_7d', 'impact', 'negative', 'magnitude', 0.23, 'description_hi', 'गर्मी का प्रभाव')
            ),
            ROUND(0.85 + (RANDOM() * 0.1), 2), -- 0.85-0.95 confidence
            'v1.0.0',
            false,
            prediction_date - INTERVAL '1 day'
        );
        
        -- Slightly adjust base price for next day (simulate market movement)
        base_price := base_price + (RANDOM() * 4) - 2; -- ±2 daily movement
        base_price := GREATEST(140, LEAST(175, base_price));
    END LOOP;
END $$;

-- Insert accuracy log entries for the last 7 days
-- Simulate 95%+ directional accuracy as per PRD requirements
DO $$
DECLARE
    i INT;
    prediction_id UUID;
    actual_price NUMERIC;
    mape_val NUMERIC;
    directional_correct BOOLEAN;
BEGIN
    FOR i IN 0..6 LOOP
        -- Get a prediction from i days ago
        SELECT id INTO prediction_id
        FROM predictions
        WHERE predicted_for = CURRENT_DATE - i
        AND mandi = 'gorakhpur'
        LIMIT 1;
        
        IF prediction_id IS NOT NULL THEN
            -- Generate actual price close to prediction (simulating accuracy)
            SELECT p50 + (RANDOM() * 6) - 3 INTO actual_price
            FROM predictions
            WHERE id = prediction_id;
            
            -- Calculate MAPE
            mape_val := ABS(actual_price - (SELECT p50 FROM predictions WHERE id = prediction_id)) / 
                        (SELECT p50 FROM predictions WHERE id = prediction_id) * 100;
            
            -- 95% directional accuracy (6 out of 7 correct, 1 incorrect)
            directional_correct := (i != 3); -- Make day 3 incorrect
            
            INSERT INTO accuracy_log (
                prediction_id,
                actual_price,
                mape_1d,
                directional_correct,
                evaluated_at
            ) VALUES (
                prediction_id,
                ROUND(actual_price, 2),
                ROUND(mape_val, 4),
                directional_correct,
                CURRENT_DATE - i + INTERVAL '6 hours'
            );
        END IF;
    END LOOP;
END $$;

-- Insert sample alerts
-- Alert 1: HPAI Disease Alert (CRITICAL)
INSERT INTO alerts (
    type,
    severity,
    title_hi,
    body_hi,
    district,
    issued_at,
    expires_at,
    source_url,
    is_active
) VALUES (
    'HPAI_OUTBREAK',
    'CRITICAL',
    'HPAI चेतावनी — गोरखपुर जिला',
    'गोरखपुर जिले में HPAI (बर्ड फ्लू) का मामला सामने आया है। 50 किमी के दायरे में सभी पोल्ट्री फार्मों को सावधान रहने की सलाह दी जाती है। आवश्यक हो तो बिक्री से पहले पक्षियों को बेचने पर विचार करें।',
    'gorakhpur',
    NOW() - INTERVAL '2 days',
    NOW() + INTERVAL '14 days',
    'https://dahd.gov.in/disease-surveillance',
    true
);

-- Alert 2: Weather Extreme Alert (HIGH)
INSERT INTO alerts (
    type,
    severity,
    title_hi,
    body_hi,
    district,
    issued_at,
    expires_at,
    source_url,
    is_active
) VALUES (
    'WEATHER_EXTREME',
    'HIGH',
    'गर्मी की लहर — तापमान 42°C पहुंच सकता है',
    'अगले 5 दिनों में गोरखपुर जिले में तापमान 42°C तक पहुंच सकता है। इससे पक्षियों के स्वास्थ्य पर प्रभाव पड़ सकता है और फीड कनवर्जन रेट बिगड़ सकता है। पर्याप्त पानी और छाया की व्यवस्था सुनिश्चित करें।',
    'gorakhpur',
    NOW() - INTERVAL '5 days',
    NOW() + INTERVAL '5 days',
    'https://mausam.imd.gov.in',
    true
);

-- Alert 3: Price Spike Alert (MEDIUM)
INSERT INTO alerts (
    type,
    severity,
    title_hi,
    body_hi,
    district,
    issued_at,
    expires_at,
    source_url,
    is_active
) VALUES (
    'PRICE_SPIKE',
    'MEDIUM',
    'भाव में वृद्धि — ₹5/kg तक बढ़ सकता है',
    'अगले सप्ताह में गोरखपुर मंडी में भाव में ₹3-5/kg की वृद्धि की संभावना है। यह त्योहारी मांग और आपूर्ती कमी के कारण है। अगर आपका बैच बिक्री के लिए तैयार है, तो अभी बेचने पर विचार करें।',
    'gorakhpur',
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '7 days',
    'https://agmarknet.gov.in',
    true
);

-- Note: Batch records are now seeded in the 20260503_batches.sql migration
-- This ensures they use the correct new schema with proper column names

-- Insert model registry entry (champion model)
INSERT INTO model_registry (
    version,
    mape_30d,
    directional_accuracy,
    conformal_coverage,
    promoted_at,
    is_champion,
    s3_artifact_path,
    created_at
) VALUES (
    'v1.0.0',
    4.8,
    0.952,
    0.804,
    NOW() - INTERVAL '7 days',
    true,
    's3://poultrypulse-models/champion/v1.0.0/model.onnx',
    NOW() - INTERVAL '7 days'
);

-- Insert scraper config entries
INSERT INTO scraper_config (source_name, base_url, css_selector, rate_limit_per_hour, is_active) VALUES
('agmarknet', 'https://agmarknet.gov.in', '{"price_table": ".table-responsive", "mandi_select": "#mandi"}', 10, true),
('necc', 'https://necc.co.in', '{"rate_table": ".daily-rates", "zone_select": "#zone"}', 5, true),
('imd', 'https://api.imd.gov.in', '{"temp": ".temperature", "humidity": ".humidity"}', 20, true);

-- Insert NECC weekly data (last 4 weeks)
DO $$
DECLARE
    i INT;
    week_start DATE;
    week_end DATE;
BEGIN
    FOR i IN 0..3 LOOP
        week_start := CURRENT_DATE - (i * 7) - (EXTRACT(DOW FROM CURRENT_DATE)::INT);
        week_end := week_start + 6;
        
        INSERT INTO necc_weekly (
            week_start,
            week_end,
            zone,
            egg_price_weekly,
            national_egg_production_index,
            broiler_production_index,
            created_at
        ) VALUES (
            week_start,
            week_end,
            'UP',
            5.8 + (RANDOM() * 0.4),
            100 + (RANDOM() * 5),
            100 + (RANDOM() * 8),
            week_start
        );
    END LOOP;
END $$;

-- Insert macro data (last 12 months)
DO $$
DECLARE
    i INT;
    year_val INT;
    month_val INT;
BEGIN
    FOR i IN 0..11 LOOP
        year_val := EXTRACT(YEAR FROM CURRENT_DATE);
        month_val := EXTRACT(MONTH FROM CURRENT_DATE) - i;
        
        IF month_val <= 0 THEN
            month_val := month_val + 12;
            year_val := year_val - 1;
        END IF;
        
        INSERT INTO macro_data (
            source,
            data_type,
            country,
            year,
            month,
            value,
            unit,
            fetched_at
        ) VALUES (
            'FAO',
            'poultry_production_index',
            'India',
            year_val,
            month_val,
            100 + (RANDOM() * 10),
            'index',
            NOW()
        ) ON CONFLICT (source, data_type, country, year, month) DO NOTHING;
    END LOOP;
END $$;

-- Refresh materialized view after seeding
REFRESH MATERIALIZED VIEW mv_accuracy_dashboard;
