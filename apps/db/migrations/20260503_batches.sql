-- PoultryPulse AI - Batch Lifecycle Management Schema
-- Migration: 20260503_batches.sql
-- Description: Creates full batch lifecycle database schema with operational data tables
-- Requirements: REQ-013 §13.7, Design Addendum §11, DB Schema Addendum
-- Task: TASK-029

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types for batch management
CREATE TYPE batch_type AS ENUM ('broiler', 'layer', 'breeder', 'hatchery');
CREATE TYPE batch_status AS ENUM ('placement', 'growing', 'pre_harvest', 'harvest_ready', 'harvested');
CREATE TYPE vaccination_route AS ENUM ('drinking_water', 'spray', 'injection', 'eye_drop', 'nasal');
CREATE TYPE medication_route AS ENUM ('oral', 'injection', 'topical', 'intramuscular', 'subcutaneous');
CREATE TYPE mortality_cause AS ENUM ('unknown', 'respiratory', 'digestive', 'heat_stress', 'cold_stress', 'injury', 'predator', 'other');

-- Function to generate batch ID: [district_code]-[YYYYMM]-[3-digit-sequence]
CREATE OR REPLACE FUNCTION generate_batch_id(district TEXT, placement_date DATE)
RETURNS TEXT AS $$
DECLARE
  district_code TEXT;
  year_month TEXT;
  sequence_num INTEGER;
  batch_id TEXT;
BEGIN
  -- Convert district to 3-letter code (first 3 chars uppercase)
  district_code := UPPER(SUBSTRING(district, 1, 3));
  
  -- Get YYYYMM from placement_date
  year_month := TO_CHAR(placement_date, 'YYYYMM');
  
  -- Get next sequence number for this district+month
  SELECT COALESCE(MAX(CAST(SUBSTRING(batch_id FROM '[0-9]{3}$') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM batches
  WHERE batch_id LIKE district_code || '-' || year_month || '-%';
  
  -- Format sequence as 3-digit with leading zeros
  batch_id := district_code || '-' || year_month || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN batch_id;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update batch status based on age
CREATE OR REPLACE FUNCTION update_batch_status()
RETURNS TRIGGER AS $$
DECLARE
  age_days INTEGER;
BEGIN
  -- Calculate age in days
  age_days := CURRENT_DATE - NEW.doc_placement_date;
  
  -- Auto-update status based on age
  IF age_days BETWEEN 1 AND 7 THEN
    NEW.status := 'placement';
  ELSIF age_days BETWEEN 8 AND 28 THEN
    NEW.status := 'growing';
  ELSIF age_days BETWEEN 29 AND 42 THEN
    NEW.status := 'pre_harvest';
  ELSIF age_days >= 43 THEN
    NEW.status := 'harvest_ready';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Main batches table
CREATE TABLE IF NOT EXISTS batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  integrator_id UUID REFERENCES customers(id) ON DELETE SET NULL, -- For S2 integrator cross-account access
  
  -- Auto-generated batch ID
  batch_id TEXT NOT NULL UNIQUE,
  
  -- Batch type and status
  batch_type batch_type NOT NULL DEFAULT 'broiler',
  status batch_status NOT NULL DEFAULT 'placement',
  
  -- DOC placement details
  doc_placement_date DATE NOT NULL,
  doc_count INTEGER NOT NULL CHECK (doc_count > 0),
  doc_supplier TEXT,
  doc_supplier_rating INTEGER CHECK (doc_supplier_rating BETWEEN 1 AND 5),
  
  -- Breed and target metrics
  breed TEXT NOT NULL,
  target_harvest_weight_kg DECIMAL(5,2) NOT NULL,
  target_harvest_age_days INTEGER DEFAULT 42,
  
  -- Shed assignment
  shed_id TEXT,
  
  -- Initial feed details
  initial_feed_brand TEXT,
  initial_feed_type TEXT,
  
  -- Current metrics (updated by triggers)
  current_bird_count INTEGER,
  current_avg_weight_kg DECIMAL(5,2),
  current_fcr DECIMAL(5,3),
  cumulative_mortality_pct DECIMAL(5,2),
  
  -- Harvest details
  actual_harvest_date DATE,
  actual_harvest_weight_kg DECIMAL(5,2),
  birds_sold INTEGER,
  sale_price_per_kg DECIMAL(8,2),
  buyer_name TEXT,
  
  -- Offline sync support
  synced BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT customer_batch_unique UNIQUE (customer_id, batch_id)
);

-- Indexes for batches
CREATE INDEX idx_batches_customer_id ON batches(customer_id);
CREATE INDEX idx_batches_integrator_id ON batches(integrator_id) WHERE integrator_id IS NOT NULL;
CREATE INDEX idx_batches_status ON batches(status);
CREATE INDEX idx_batches_doc_placement_date ON batches(doc_placement_date);
CREATE INDEX idx_batches_batch_type ON batches(batch_type);
CREATE INDEX idx_batches_synced ON batches(synced) WHERE synced = false;

-- Apply status update trigger
CREATE TRIGGER trg_update_batch_status
  BEFORE INSERT OR UPDATE ON batches
  FOR EACH ROW
  EXECUTE FUNCTION update_batch_status();

-- DOC suppliers registry
CREATE TABLE IF NOT EXISTS doc_suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  avg_survival_rate DECIMAL(5,2),
  total_batches_supplied INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT customer_supplier_unique UNIQUE (customer_id, name)
);

CREATE INDEX idx_doc_suppliers_customer_id ON doc_suppliers(customer_id);

-- Feed logs table
CREATE TABLE IF NOT EXISTS feed_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  morning_feed_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  evening_feed_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_feed_kg DECIMAL(10,2) GENERATED ALWAYS AS (morning_feed_kg + evening_feed_kg) STORED,
  water_litres DECIMAL(10,2),
  feed_brand TEXT,
  feed_type TEXT,
  feed_refusal_kg DECIMAL(10,2) DEFAULT 0,
  logged_by UUID REFERENCES customers(id),
  notes TEXT,
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT batch_feed_date_unique UNIQUE (batch_id, log_date)
);

CREATE INDEX idx_feed_logs_batch_id ON feed_logs(batch_id);
CREATE INDEX idx_feed_logs_log_date ON feed_logs(log_date);
CREATE INDEX idx_feed_logs_synced ON feed_logs(synced) WHERE synced = false;

-- Mortality logs table
CREATE TABLE IF NOT EXISTS mortality_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  count INTEGER NOT NULL CHECK (count >= 0),
  cause mortality_cause NOT NULL DEFAULT 'unknown',
  age_at_death_days INTEGER,
  photo_url TEXT,
  logged_by UUID REFERENCES customers(id),
  notes TEXT,
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT batch_mortality_date_unique UNIQUE (batch_id, log_date)
);

CREATE INDEX idx_mortality_logs_batch_id ON mortality_logs(batch_id);
CREATE INDEX idx_mortality_logs_log_date ON mortality_logs(log_date);
CREATE INDEX idx_mortality_logs_cause ON mortality_logs(cause);
CREATE INDEX idx_mortality_logs_synced ON mortality_logs(synced) WHERE synced = false;

-- Vaccination schedules table
CREATE TABLE IF NOT EXISTS vaccination_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  vaccine_type TEXT,
  scheduled_day INTEGER NOT NULL,
  due_date DATE NOT NULL,
  administered_date DATE,
  brand TEXT,
  batch_number TEXT,
  dose_per_bird TEXT,
  route vaccination_route,
  administered_by TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'overdue', 'skipped')),
  notes TEXT,
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vaccination_schedules_batch_id ON vaccination_schedules(batch_id);
CREATE INDEX idx_vaccination_schedules_due_date ON vaccination_schedules(due_date);
CREATE INDEX idx_vaccination_schedules_status ON vaccination_schedules(status);
CREATE INDEX idx_vaccination_schedules_synced ON vaccination_schedules(synced) WHERE synced = false;

-- Medication logs table
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  symptom TEXT,
  diagnosis TEXT,
  drug_name TEXT NOT NULL,
  dose TEXT,
  route medication_route,
  duration_days INTEGER,
  withdrawal_days INTEGER NOT NULL,
  withdrawal_end_date DATE GENERATED ALWAYS AS (log_date + (duration_days + withdrawal_days)) STORED,
  administered_by TEXT,
  is_antibiotic BOOLEAN DEFAULT false,
  notes TEXT,
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medication_logs_batch_id ON medication_logs(batch_id);
CREATE INDEX idx_medication_logs_log_date ON medication_logs(log_date);
CREATE INDEX idx_medication_logs_withdrawal_end_date ON medication_logs(withdrawal_end_date);
CREATE INDEX idx_medication_logs_synced ON medication_logs(synced) WHERE synced = false;

-- Weight logs table
CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  sample_size INTEGER NOT NULL CHECK (sample_size >= 30),
  avg_weight_kg DECIMAL(5,3) NOT NULL,
  std_deviation_kg DECIMAL(5,3),
  logged_by UUID REFERENCES customers(id),
  notes TEXT,
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT batch_weight_date_unique UNIQUE (batch_id, log_date)
);

CREATE INDEX idx_weight_logs_batch_id ON weight_logs(batch_id);
CREATE INDEX idx_weight_logs_log_date ON weight_logs(log_date);
CREATE INDEX idx_weight_logs_synced ON weight_logs(synced) WHERE synced = false;

-- Health checklists table
CREATE TABLE IF NOT EXISTS health_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  bird_behaviour TEXT CHECK (bird_behaviour IN ('normal', 'lethargic', 'aggressive')),
  appetite TEXT CHECK (appetite IN ('normal', 'reduced', 'refused')),
  droppings TEXT CHECK (droppings IN ('normal', 'loose', 'yellow', 'bloody')),
  respiratory TEXT CHECK (respiratory IN ('normal', 'coughing', 'sneezing', 'gasping')),
  water_consumption TEXT CHECK (water_consumption IN ('normal', 'reduced', 'excessive')),
  notes TEXT,
  logged_by UUID REFERENCES customers(id),
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT batch_health_date_unique UNIQUE (batch_id, log_date)
);

CREATE INDEX idx_health_checklists_batch_id ON health_checklists(batch_id);
CREATE INDEX idx_health_checklists_log_date ON health_checklists(log_date);
CREATE INDEX idx_health_checklists_synced ON health_checklists(synced) WHERE synced = false;

-- Biosecurity audits table
CREATE TABLE IF NOT EXISTS biosecurity_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  audit_date DATE NOT NULL,
  visitor_log BOOLEAN,
  vehicle_entry_log BOOLEAN,
  footbath_maintenance BOOLEAN,
  feed_store_hygiene BOOLEAN,
  dead_bird_disposal BOOLEAN,
  equipment_sanitation BOOLEAN,
  rodent_control BOOLEAN,
  flock_isolation BOOLEAN,
  worker_ppe BOOLEAN,
  vaccination_records_up_to_date BOOLEAN,
  sick_bird_isolation_protocol BOOLEAN,
  biosecurity_training_up_to_date BOOLEAN,
  score DECIMAL(5,2) GENERATED ALWAYS AS (
    (COALESCE(visitor_log::INTEGER, 0) +
     COALESCE(vehicle_entry_log::INTEGER, 0) +
     COALESCE(footbath_maintenance::INTEGER, 0) +
     COALESCE(feed_store_hygiene::INTEGER, 0) +
     COALESCE(dead_bird_disposal::INTEGER, 0) +
     COALESCE(equipment_sanitation::INTEGER, 0) +
     COALESCE(rodent_control::INTEGER, 0) +
     COALESCE(flock_isolation::INTEGER, 0) +
     COALESCE(worker_ppe::INTEGER, 0) +
     COALESCE(vaccination_records_up_to_date::INTEGER, 0) +
     COALESCE(sick_bird_isolation_protocol::INTEGER, 0) +
     COALESCE(biosecurity_training_up_to_date::INTEGER, 0))::DECIMAL / 12 * 100
  ) STORED,
  audited_by UUID REFERENCES customers(id),
  notes TEXT,
  synced BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_biosecurity_audits_batch_id ON biosecurity_audits(batch_id);
CREATE INDEX idx_biosecurity_audits_audit_date ON biosecurity_audits(audit_date);
CREATE INDEX idx_biosecurity_audits_synced ON biosecurity_audits(synced) WHERE synced = false;

-- Row Level Security (RLS) Policies
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE doc_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE feed_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mortality_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE biosecurity_audits ENABLE ROW LEVEL SECURITY;

-- Batches RLS: Users can only read/write their own batches
CREATE POLICY "Users can view own batches" 
ON batches FOR SELECT 
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own batches" 
ON batches FOR INSERT 
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own batches" 
ON batches FOR UPDATE 
USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own batches" 
ON batches FOR DELETE 
USING (customer_id = auth.uid());

-- S2 Integrator cross-account policy
CREATE POLICY "Integrators can view sub-account batches"
ON batches FOR SELECT
USING (integrator_id = auth.uid());

-- DOC Suppliers RLS
CREATE POLICY "Users can view own doc_suppliers" 
ON doc_suppliers FOR SELECT 
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own doc_suppliers" 
ON doc_suppliers FOR INSERT 
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own doc_suppliers" 
ON doc_suppliers FOR UPDATE 
USING (customer_id = auth.uid());

-- Feed Logs RLS (via batch ownership)
CREATE POLICY "Users can view own feed_logs" 
ON feed_logs FOR SELECT 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can insert own feed_logs" 
ON feed_logs FOR INSERT 
WITH CHECK (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can update own feed_logs" 
ON feed_logs FOR UPDATE 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

-- Mortality Logs RLS
CREATE POLICY "Users can view own mortality_logs" 
ON mortality_logs FOR SELECT 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can insert own mortality_logs" 
ON mortality_logs FOR INSERT 
WITH CHECK (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can update own mortality_logs" 
ON mortality_logs FOR UPDATE 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

-- Vaccination Schedules RLS
CREATE POLICY "Users can view own vaccination_schedules" 
ON vaccination_schedules FOR SELECT 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can insert own vaccination_schedules" 
ON vaccination_schedules FOR INSERT 
WITH CHECK (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can update own vaccination_schedules" 
ON vaccination_schedules FOR UPDATE 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

-- Medication Logs RLS
CREATE POLICY "Users can view own medication_logs" 
ON medication_logs FOR SELECT 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can insert own medication_logs" 
ON medication_logs FOR INSERT 
WITH CHECK (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can update own medication_logs" 
ON medication_logs FOR UPDATE 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

-- Weight Logs RLS
CREATE POLICY "Users can view own weight_logs" 
ON weight_logs FOR SELECT 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can insert own weight_logs" 
ON weight_logs FOR INSERT 
WITH CHECK (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can update own weight_logs" 
ON weight_logs FOR UPDATE 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

-- Health Checklists RLS
CREATE POLICY "Users can view own health_checklists" 
ON health_checklists FOR SELECT 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can insert own health_checklists" 
ON health_checklists FOR INSERT 
WITH CHECK (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can update own health_checklists" 
ON health_checklists FOR UPDATE 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

-- Biosecurity Audits RLS
CREATE POLICY "Users can view own biosecurity_audits" 
ON biosecurity_audits FOR SELECT 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can insert own biosecurity_audits" 
ON biosecurity_audits FOR INSERT 
WITH CHECK (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

CREATE POLICY "Users can update own biosecurity_audits" 
ON biosecurity_audits FOR UPDATE 
USING (batch_id IN (SELECT id FROM batches WHERE customer_id = auth.uid()));

-- Updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables with updated_at column
CREATE TRIGGER update_doc_suppliers_updated_at BEFORE UPDATE ON doc_suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vaccination_schedules_updated_at BEFORE UPDATE ON vaccination_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update current bird count on mortality log
CREATE OR REPLACE FUNCTION update_bird_count_on_mortality()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if current_bird_count is not NULL to prevent NULL propagation
  IF (SELECT current_bird_count FROM batches WHERE id = NEW.batch_id) IS NOT NULL THEN
    UPDATE batches
    SET current_bird_count = current_bird_count - NEW.count
    WHERE id = NEW.batch_id;
  ELSE
    -- Initialize current_bird_count if it's NULL
    UPDATE batches
    SET current_bird_count = (SELECT doc_count FROM batches WHERE id = NEW.batch_id) - NEW.count
    WHERE id = NEW.batch_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_bird_count_on_mortality
  AFTER INSERT ON mortality_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_bird_count_on_mortality();

-- Seed data for development (3 sample batches per dev customer)
-- This will be executed only in development environment
-- Note: Customer IDs from dev_seed.sql are used here

-- Sample batch 1 for S1 customer (Placement phase)
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
    'GKP-202605-001',
    'broiler',
    'placement',
    CURRENT_DATE - 3,
    25000,
    'Navbharat Hatchery',
    'Cobb 500',
    2.2,
    42,
    'Shed 1',
    'Godrej Agrovet',
    'Starter',
    25000,
    true,
    NOW()
);

-- Sample batch 2 for S1 customer (Growing phase)
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
    current_avg_weight_kg,
    current_fcr,
    cumulative_mortality_pct,
    synced,
    created_at
) VALUES (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001',
    'GKP-202604-002',
    'broiler',
    'growing',
    CURRENT_DATE - 18,
    25000,
    'Venkateshwara Hatchery',
    'Ross 308',
    2.3,
    42,
    'Shed 2',
    'Godrej Agrovet',
    'Grower',
    24750,
    1.45,
    1.75,
    1.0,
    true,
    NOW()
);

-- Sample batch 3 for S1 customer (Pre-Harvest phase)
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
    current_avg_weight_kg,
    current_fcr,
    cumulative_mortality_pct,
    synced,
    created_at
) VALUES (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001',
    'GKP-202604-003',
    'broiler',
    'pre_harvest',
    CURRENT_DATE - 35,
    25000,
    'Suguna Hatchery',
    'Cobb 500',
    2.2,
    42,
    'Shed 3',
    'Godrej Agrovet',
    'Finisher',
    24200,
    1.95,
    1.88,
    3.2,
    true,
    NOW()
);

-- Sample batch 4 for S2 customer (Growing phase - integrator)
INSERT INTO batches (
    id,
    customer_id,
    integrator_id,
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
    current_avg_weight_kg,
    current_fcr,
    cumulative_mortality_pct,
    synced,
    created_at
) VALUES (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    'GKP-202604-004',
    'broiler',
    'growing',
    CURRENT_DATE - 20,
    50000,
    'Navbharat Hatchery',
    'Ross 308',
    2.3,
    42,
    'Shed A',
    'Amrit Feeds',
    'Grower',
    49500,
    1.52,
    1.82,
    1.0,
    true,
    NOW()
);

-- Sample DOC suppliers for S1 customer
INSERT INTO doc_suppliers (
    id,
    customer_id,
    name,
    location,
    contact_person,
    phone,
    avg_survival_rate,
    total_batches_supplied,
    avg_rating,
    created_at
) VALUES (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001',
    'Navbharat Hatchery',
    'Gorakhpur',
    'Rajesh Kumar',
    '9876543210',
    97.5,
    15,
    4.5,
    NOW()
), (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001',
    'Venkateshwara Hatchery',
    'Gorakhpur',
    'Suresh Yadav',
    '9876543211',
    96.8,
    22,
    4.2,
    NOW()
), (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001',
    'Suguna Hatchery',
    'Basti',
    'Amit Singh',
    '9876543212',
    98.2,
    18,
    4.7,
    NOW()
);

-- Sample feed logs for batch 2 (Growing phase)
INSERT INTO feed_logs (
    id,
    batch_id,
    log_date,
    morning_feed_kg,
    evening_feed_kg,
    water_litres,
    feed_brand,
    feed_type,
    synced,
    created_at
) SELECT
    gen_random_uuid(),
    (SELECT id FROM batches WHERE batch_id = 'GKP-202604-002'),
    CURRENT_DATE - i,
    450 + (RANDOM() * 50)::DECIMAL(10,2),
    480 + (RANDOM() * 50)::DECIMAL(10,2),
    1200 + (RANDOM() * 200)::DECIMAL(10,2),
    'Godrej Agrovet',
    'Grower',
    true,
    NOW()
FROM generate_series(0, 17) AS i;

-- Sample mortality logs for batch 2
INSERT INTO mortality_logs (
    id,
    batch_id,
    log_date,
    count,
    cause,
    age_at_death_days,
    synced,
    created_at
) SELECT
    gen_random_uuid(),
    (SELECT id FROM batches WHERE batch_id = 'GKP-202604-002'),
    CURRENT_DATE - i,
    CASE WHEN i = 5 THEN 15 ELSE (RANDOM() * 8)::INT END,
    CASE WHEN RANDOM() > 0.7 THEN 'respiratory' WHEN RANDOM() > 0.4 THEN 'digestive' ELSE 'unknown' END,
    i + 1,
    true,
    NOW()
FROM generate_series(0, 17) AS i;

-- Sample vaccination schedules for batch 2
INSERT INTO vaccination_schedules (
    id,
    batch_id,
    vaccine_name,
    vaccine_type,
    scheduled_day,
    due_date,
    administered_date,
    brand,
    dose_per_bird,
    route,
    administered_by,
    status,
    synced,
    created_at
) SELECT
    gen_random_uuid(),
    (SELECT id FROM batches WHERE batch_id = 'GKP-202604-002'),
    CASE i
        WHEN 0 THEN 'Marek''s Disease Vaccine'
        WHEN 1 THEN 'Newcastle Disease (La Sota)'
        WHEN 2 THEN 'IBD (Gumboro)'
        WHEN 3 THEN 'Infectious Bronchitis'
        WHEN 4 THEN 'Newcastle Clone 30 Booster'
    END,
    'Live',
    CASE i
        WHEN 0 THEN 1
        WHEN 1 THEN 7
        WHEN 2 THEN 14
        WHEN 3 THEN 21
        WHEN 4 THEN 28
    END,
    (SELECT doc_placement_date FROM batches WHERE batch_id = 'GKP-202604-002') + CASE i
        WHEN 0 THEN 1
        WHEN 1 THEN 7
        WHEN 2 THEN 14
        WHEN 3 THEN 21
        WHEN 4 THEN 28
    END,
    CASE
        WHEN i < 3 THEN (SELECT doc_placement_date FROM batches WHERE batch_id = 'GKP-202604-002') + CASE i WHEN 0 THEN 1 WHEN 1 THEN 7 WHEN 2 THEN 14 END
        ELSE NULL
    END,
    CASE i
        WHEN 0 THEN 'Venky''s MD'
        WHEN 1 THEN 'Venky''s ND-La Sota'
        WHEN 2 THEN 'Venky''s IBD'
        WHEN 3 THEN 'Venky''s IB'
        WHEN 4 THEN 'Venky''s ND'
    END,
    '1 dose/bird',
    CASE i
        WHEN 0 THEN 'injection'
        WHEN 1 THEN 'drinking_water'
        WHEN 2 THEN 'drinking_water'
        WHEN 3 THEN 'spray'
        WHEN 4 THEN 'drinking_water'
    END,
    'Ram Prasad',
    CASE
        WHEN i < 3 THEN 'done'
        WHEN i = 3 THEN 'pending'
        ELSE 'pending'
    END,
    true,
    NOW()
FROM generate_series(0, 4) AS i;

-- Sample weight logs for batch 3 (Pre-Harvest phase)
INSERT INTO weight_logs (
    id,
    batch_id,
    log_date,
    sample_size,
    avg_weight_kg,
    std_deviation_kg,
    synced,
    created_at
) SELECT
    gen_random_uuid(),
    (SELECT id FROM batches WHERE batch_id = 'GKP-202604-003'),
    (SELECT doc_placement_date FROM batches WHERE batch_id = 'GKP-202604-003') + (i * 7),
    30 + (RANDOM() * 20)::INT,
    0.4 + (i * 0.15)::DECIMAL(5,3),
    0.05 + (RANDOM() * 0.02)::DECIMAL(5,3),
    true,
    NOW()
FROM generate_series(1, 5) AS i;
