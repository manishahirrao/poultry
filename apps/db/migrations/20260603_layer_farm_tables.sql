-- PoultryPulse AI - Layer Farm Tables Migration
-- Migration: 20260603_layer_farm_tables.sql
-- Description: Creates tables for layer farm egg production tracking
-- Requirements: REQ-022 §22.1-22.4, TASK-051
-- Depends on: 20260503_batches.sql

-- Add poultry_type to customers table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'customers' AND column_name = 'poultry_type'
    ) THEN
        ALTER TABLE customers ADD COLUMN poultry_type TEXT DEFAULT 'broiler' CHECK (poultry_type IN ('broiler', 'layer'));
    END IF;
END $$;

-- Egg production logs table
CREATE TABLE IF NOT EXISTS egg_production_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    flock_age_weeks INTEGER,
    total_eggs INTEGER NOT NULL CHECK (total_eggs >= 0),
    broken_eggs INTEGER DEFAULT 0 CHECK (broken_eggs >= 0),
    floor_eggs INTEGER DEFAULT 0 CHECK (floor_eggs >= 0),
    saleable_eggs INTEGER GENERATED ALWAYS AS (total_eggs - broken_eggs - floor_eggs) STORED,
    hdp_percentage DECIMAL(5,2), -- Hen-Day Production % (calculated)
    feed_consumed_kg DECIMAL(10,2),
    water_consumed_litres DECIMAL(10,2),
    logged_by UUID REFERENCES customers(id),
    notes TEXT,
    synced BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT batch_egg_date_unique UNIQUE (batch_id, log_date)
);

CREATE INDEX idx_egg_production_logs_batch_id ON egg_production_logs(batch_id);
CREATE INDEX idx_egg_production_logs_log_date ON egg_production_logs(log_date);
CREATE INDEX idx_egg_production_logs_synced ON egg_production_logs(synced) WHERE synced = false;

-- Egg grading logs table
CREATE TABLE IF NOT EXISTS egg_grading_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    large_count INTEGER DEFAULT 0 CHECK (large_count >= 0),
    medium_count INTEGER DEFAULT 0 CHECK (medium_count >= 0),
    small_count INTEGER DEFAULT 0 CHECK (small_count >= 0),
    cracked_count INTEGER DEFAULT 0 CHECK (cracked_count >= 0),
    total_graded INTEGER GENERATED ALWAYS AS (large_count + medium_count + small_count + cracked_count) STORED,
    logged_by UUID REFERENCES customers(id),
    notes TEXT,
    synced BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT batch_grading_date_unique UNIQUE (batch_id, log_date)
);

CREATE INDEX idx_egg_grading_logs_batch_id ON egg_grading_logs(batch_id);
CREATE INDEX idx_egg_grading_logs_log_date ON egg_grading_logs(log_date);
CREATE INDEX idx_egg_grading_logs_synced ON egg_grading_logs(synced) WHERE synced = false;

-- Egg packing logs table
CREATE TABLE IF NOT EXISTS egg_packing_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    packing_date DATE NOT NULL,
    trays_packed INTEGER DEFAULT 0 CHECK (trays_packed >= 0),
    eggs_per_tray INTEGER DEFAULT 30, -- Standard tray size
    total_eggs_packed INTEGER GENERATED ALWAYS AS (trays_packed * eggs_per_tray) STORED,
    crate_count INTEGER DEFAULT 0 CHECK (crate_count >= 0),
    packing_location TEXT,
    logged_by UUID REFERENCES customers(id),
    notes TEXT,
    synced BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT batch_packing_date_unique UNIQUE (batch_id, packing_date)
);

CREATE INDEX idx_egg_packing_logs_batch_id ON egg_packing_logs(batch_id);
CREATE INDEX idx_egg_packing_logs_packing_date ON egg_packing_logs(packing_date);
CREATE INDEX idx_egg_packing_logs_synced ON egg_packing_logs(synced) WHERE synced = false;

-- Egg dispatch logs table
CREATE TABLE IF NOT EXISTS egg_dispatch_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    dispatch_date DATE NOT NULL,
    buyer_name TEXT NOT NULL,
    quantity_trays INTEGER NOT NULL CHECK (quantity_trays >= 0),
    quantity_eggs INTEGER GENERATED ALWAYS AS (quantity_trays * 30) STORED,
    price_per_dozen DECIMAL(8,2),
    total_amount DECIMAL(12,2) GENERATED ALWAYS AS (quantity_trays * 30 / 12 * price_per_dozen) STORED,
    invoice_number TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid')),
    logged_by UUID REFERENCES customers(id),
    notes TEXT,
    synced BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_egg_dispatch_logs_batch_id ON egg_dispatch_logs(batch_id);
CREATE INDEX idx_egg_dispatch_logs_dispatch_date ON egg_dispatch_logs(dispatch_date);
CREATE INDEX idx_egg_dispatch_logs_synced ON egg_dispatch_logs(synced) WHERE synced = false;

-- Row Level Security (RLS) Policies
ALTER TABLE egg_production_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_grading_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_packing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE egg_dispatch_logs ENABLE ROW LEVEL SECURITY;

-- Egg Production Logs RLS (via batch ownership)
CREATE POLICY "Users can view own egg_production_logs" 
ON egg_production_logs FOR SELECT 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can insert own egg_production_logs" 
ON egg_production_logs FOR INSERT 
WITH CHECK (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can update own egg_production_logs" 
ON egg_production_logs FOR UPDATE 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

-- Egg Grading Logs RLS
CREATE POLICY "Users can view own egg_grading_logs" 
ON egg_grading_logs FOR SELECT 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can insert own egg_grading_logs" 
ON egg_grading_logs FOR INSERT 
WITH CHECK (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can update own egg_grading_logs" 
ON egg_grading_logs FOR UPDATE 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

-- Egg Packing Logs RLS
CREATE POLICY "Users can view own egg_packing_logs" 
ON egg_packing_logs FOR SELECT 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can insert own egg_packing_logs" 
ON egg_packing_logs FOR INSERT 
WITH CHECK (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can update own egg_packing_logs" 
ON egg_packing_logs FOR UPDATE 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

-- Egg Dispatch Logs RLS
CREATE POLICY "Users can view own egg_dispatch_logs" 
ON egg_dispatch_logs FOR SELECT 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can insert own egg_dispatch_logs" 
ON egg_dispatch_logs FOR INSERT 
WITH CHECK (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can update own egg_dispatch_logs" 
ON egg_dispatch_logs FOR UPDATE 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

-- Function to calculate HDP percentage automatically
CREATE OR REPLACE FUNCTION calculate_hdp()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate HDP: (saleable_eggs / surviving_hens) * 100
    -- Get current bird count from batches table
    DECLARE bird_count INTEGER;
    BEGIN
        SELECT current_bird_count INTO bird_count
        FROM batches
        WHERE id = NEW.batch_id;
        
        IF bird_count IS NOT NULL AND bird_count > 0 THEN
            NEW.hdp_percentage = (NEW.saleable_eggs::DECIMAL / bird_count) * 100;
        END IF;
        
        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_hdp
    BEFORE INSERT OR UPDATE ON egg_production_logs
    FOR EACH ROW
    EXECUTE FUNCTION calculate_hdp();

-- Seed data for development (sample layer batch with egg production)
-- This will be executed only in development environment
INSERT INTO batches (
    id,
    customer_id,
    batch_id,
    batch_type,
    status,
    doc_placement_date,
    doc_count,
    doc_supplier,
    breed,
    target_harvest_weight_kg,
    target_harvest_age_days,
    shed_id,
    initial_feed_brand,
    initial_feed_type,
    current_bird_count,
    synced,
    created_at
) VALUES (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001',
    'GKP-202605-005',
    'layer',
    'growing',
    CURRENT_DATE - 140, -- 20 weeks ago (typical layer start)
    10000,
    'Venkateshwara Hatchery',
    'Lohmann Brown',
    1.8,
    520, -- 74 weeks for layers
    'Shed 4',
    'Godrej Agrovet',
    'Layer Starter',
    9850,
    true,
    NOW()
) ON CONFLICT (batch_id) DO NOTHING;

-- Sample egg production logs for the layer batch
INSERT INTO egg_production_logs (
    batch_id,
    log_date,
    flock_age_weeks,
    total_eggs,
    broken_eggs,
    floor_eggs,
    feed_consumed_kg,
    water_consumed_litres,
    synced,
    created_at
) SELECT
    (SELECT id FROM batches WHERE batch_id = 'GKP-202605-005'),
    CURRENT_DATE - i,
    20 + FLOOR(i / 7), -- Age in weeks
    8800 + (RANDOM() * 400)::INT, -- ~90% production
    (RANDOM() * 50)::INT,
    (RANDOM() * 30)::INT,
    280 + (RANDOM() * 20)::DECIMAL(10,2),
    840 + (RANDOM() * 100)::DECIMAL(10,2),
    true,
    NOW()
FROM generate_series(0, 29) AS i
ON CONFLICT (batch_id, log_date) DO NOTHING;

-- Sample egg grading logs
INSERT INTO egg_grading_logs (
    batch_id,
    log_date,
    large_count,
    medium_count,
    small_count,
    cracked_count,
    synced,
    created_at
) SELECT
    (SELECT id FROM batches WHERE batch_id = 'GKP-202605-005'),
    CURRENT_DATE - i,
    5000 + (RANDOM() * 500)::INT,
    3000 + (RANDOM() * 300)::INT,
    800 + (RANDOM() * 100)::INT,
    (RANDOM() * 50)::INT,
    true,
    NOW()
FROM generate_series(0, 14) AS i
ON CONFLICT (batch_id, log_date) DO NOTHING;
