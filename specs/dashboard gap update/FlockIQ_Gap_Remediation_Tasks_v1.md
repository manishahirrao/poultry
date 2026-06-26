# FlockIQ — Gap Remediation Implementation Tasks (v1.0)
# Addresses: 7 Competitive Gaps vs PoultryCare & PoultryPlan
# Version: v1.0 | June 2026 | CONFIDENTIAL
# Builds on: FlockIQ_Updated_Design_Master_v2.md + FlockIQ_Gap_Remediation_Design_Master_v1.md
# Requirements: FlockIQ_Gap_Remediation_Requirements_v1.md
# Written for: SWE implementing with a slow model (Claude 1.6 class) — maximum detail, no assumptions

---

## HOW TO USE THIS DOCUMENT

Every task below is written to be **self-contained**. A developer should be able to pick up any task, read it fully, and know exactly:
1. Which file(s) to create or edit
2. What the exact data shape is (DB columns, API request/response, component props)
3. What the UI should look like (layout, colours, states)
4. What "done" means (acceptance test)

**Task ID format:** TASK-GAP[N]-[PHASE]-[NNN]
- GAP1 = Batch P&L | GAP2 = Sales & Lifting | GAP3 = Medication | GAP4 = Environment
- GAP5 = Benchmarking | GAP6 = Risk Score | GAP7 = Document Library
- PHASE: DB = Database | API = Backend API | UI = Frontend | INT = Integration

**Estimated sizes:** XS (<1h) | S (1–3h) | M (3–6h) | L (6–12h) | XL (12–24h)

**Dependency notation:** "Requires TASK-XXX" means do that task first.

---

## SPRINT 0: DATABASE MIGRATIONS (Do All of These First)

All DB tasks are listed here. They must be done before any API or UI task in the same gap.

---

### TASK-GAP1-DB-001 — Create batch_costs table (Chick, Overhead, Labour)
**Size:** S | **Priority:** P0

Create the Supabase migration file at `supabase/migrations/[timestamp]_batch_costs.sql`:

```sql
-- batch_costs: stores chick procurement, labour, and overhead costs per batch

CREATE TABLE batch_costs (
  cost_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id      UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  farm_id       UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  integrator_id UUID NOT NULL REFERENCES integrators(id) ON DELETE CASCADE,
  category      TEXT NOT NULL CHECK (category IN ('chick', 'labour_daily', 'labour_period', 'overhead', 'other')),

  -- Chick-specific fields (nullable for other categories)
  doc_supplier        TEXT,
  price_per_doc       NUMERIC(10,2),
  transport_cost      NUMERIC(10,2),

  -- Labour-specific fields
  workers_count       INTEGER,
  rate_per_day        NUMERIC(10,2),
  period_start_date   DATE,
  period_end_date     DATE,
  days_count          INTEGER,

  -- Overhead-specific fields
  overhead_category   TEXT, -- electricity | water | litter | fuel | repairs | insurance | depreciation | other
  frequency           TEXT CHECK (frequency IN ('once', 'weekly', 'monthly')),
  batch_share_pct     NUMERIC(5,2) DEFAULT 100.00,

  -- Common fields
  description   TEXT,
  amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes         TEXT,
  entry_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_batch_costs_batch_id ON batch_costs(batch_id);
CREATE INDEX idx_batch_costs_integrator_id ON batch_costs(integrator_id);
CREATE INDEX idx_batch_costs_category ON batch_costs(batch_id, category);

-- RLS
ALTER TABLE batch_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own batch_costs"
  ON batch_costs
  FOR ALL
  USING (integrator_id = auth.jwt() ->> 'integrator_id')
  WITH CHECK (integrator_id = auth.jwt() ->> 'integrator_id');

-- Trigger for updated_at
CREATE TRIGGER set_batch_costs_updated_at
  BEFORE UPDATE ON batch_costs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

**Done when:** `supabase db push` runs without error; table visible in Supabase dashboard with RLS enabled.

---

### TASK-GAP1-DB-002 — Create batch_medicine_costs table
**Size:** S | **Priority:** P0

```sql
-- batch_medicine_costs: medicine and vaccine cost entries per batch
-- Also used by Treatment Log (Gap 3) — single source of truth

CREATE TABLE batch_medicine_costs (
  med_cost_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id          UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  integrator_id     UUID NOT NULL REFERENCES integrators(id) ON DELETE CASCADE,

  -- Treatment reference (nullable: medicine cost can exist without a treatment record)
  treatment_id      UUID REFERENCES batch_treatments(treatment_id) ON DELETE SET NULL,

  entry_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  medicine_name     TEXT NOT NULL,
  brand_name        TEXT,
  lot_number        TEXT,
  purpose           TEXT CHECK (purpose IN ('preventive','therapeutic','vaccination','vitamin','other')),

  quantity          NUMERIC(10,3) NOT NULL,
  unit              TEXT NOT NULL CHECK (unit IN ('ml','g','kg','tablets','vials')),
  rate_per_unit     NUMERIC(10,2),
  total_cost        NUMERIC(12,2),

  -- Treatment schedule
  treatment_day_start INTEGER,
  treatment_day_end   INTEGER,
  withdrawal_days     INTEGER DEFAULT 0,
  last_dose_date      DATE,
  clearance_date      DATE GENERATED ALWAYS AS (last_dose_date + withdrawal_days * INTERVAL '1 day') STORED,

  is_complete       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bmc_batch_id ON batch_medicine_costs(batch_id);
CREATE INDEX idx_bmc_clearance ON batch_medicine_costs(clearance_date) WHERE withdrawal_days > 0;

ALTER TABLE batch_medicine_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own batch_medicine_costs"
  ON batch_medicine_costs FOR ALL
  USING (integrator_id = auth.jwt() ->> 'integrator_id')
  WITH CHECK (integrator_id = auth.jwt() ->> 'integrator_id');
```

**Done when:** Migration runs clean; `clearance_date` computed column auto-calculates correctly (test: insert row with last_dose_date='2026-06-01' and withdrawal_days=7; SELECT clearance_date should return '2026-06-08').

---

### TASK-GAP1-DB-003 — Seed medicines_db table
**Size:** M | **Priority:** P0

```sql
CREATE TABLE medicines_db (
  medicine_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generic_name         TEXT NOT NULL UNIQUE,
  category             TEXT NOT NULL CHECK (category IN ('antibiotic','antifungal','antiparasitic','vaccine','vitamin','probiotic','other')),
  standard_withdrawal_days_india  INTEGER NOT NULL DEFAULT 0,
  dosage_guidance      TEXT,
  brand_names          TEXT[], -- array of common brand names for autocomplete
  notes                TEXT
);
-- No RLS needed — this is a read-only reference table accessible to all authenticated users
```

Seed with the following 55 records (INSERT statements):

```sql
INSERT INTO medicines_db (generic_name, category, standard_withdrawal_days_india, dosage_guidance, brand_names) VALUES
('Tylosin', 'antibiotic', 7, '100mg/L drinking water for 3-5 days', ARRAY['Tylan', 'Tyla 10%']),
('Enrofloxacin', 'antibiotic', 10, '10mg/kg body weight for 5 days', ARRAY['Baytril', 'Quintas', 'Enrowin']),
('Oxytetracycline', 'antibiotic', 10, '10-20mg/kg for 5-7 days', ARRAY['OTC-20', 'Terramycin']),
('Ampicillin', 'antibiotic', 7, '10mg/kg for 5 days', ARRAY['Ampicef', 'Ampivet']),
('Colistin', 'antibiotic', 1, '75,000 IU/kg feed for 7 days', ARRAY['Colimycin', 'Colistin 10%']),
('Doxycycline', 'antibiotic', 10, '25mg/kg for 5 days', ARRAY['Doxywin', 'Doxybid']),
('Trimethoprim-Sulfa', 'antibiotic', 10, '30mg/kg combined for 5 days', ARRAY['TMP-SMX', 'Cosumix']),
('Neomycin', 'antibiotic', 7, '10mg/kg for 5 days', ARRAY['Neobiotic']),
('Chlortetracycline', 'antibiotic', 10, '10mg/kg for 5-7 days', ARRAY['Aureomycin']),
('Florfenicol', 'antibiotic', 14, '20mg/kg for 5 days', ARRAY['Nuflor']),
('Lincomycin', 'antibiotic', 7, '2-4g/L water for 5 days', ARRAY['Lincomix']),
('Tiamulin', 'antibiotic', 5, '10mg/kg for 5 days', ARRAY['Dynamutilin']),
('Amprolium', 'antiparasitic', 0, '240mg/L water for 5 days (coccidiosis)', ARRAY['Amprolmix', 'Coxistac']),
('Toltrazuril', 'antiparasitic', 18, '75mg/L water for 2 days', ARRAY['Baycox']),
('Diclazuril', 'antiparasitic', 1, '1mg/L water for 2 days', ARRAY['Clinacox']),
('Levamisole', 'antiparasitic', 7, '25mg/kg single dose (worms)', ARRAY['Nilverm', 'Decaris']),
('Ivermectin', 'antiparasitic', 14, '0.2mg/kg for external/internal parasites', ARRAY['Ivomec']),
('Newcastle Disease Vaccine (Live)', 'vaccine', 0, 'Eye/nostril drop or drinking water per label', ARRAY['Lasota', 'Clone 30', 'Hitchner B1']),
('Newcastle Disease Vaccine (Killed)', 'vaccine', 0, 'Subcutaneous injection per label', ARRAY['ND-H120 killed']),
('Infectious Bronchitis Vaccine', 'vaccine', 0, 'Spray or drinking water per label', ARRAY['H120', 'M41', 'IB-88']),
('Infectious Bursal Disease Vaccine (IBD)', 'vaccine', 0, 'Drinking water per label', ARRAY['Gumboro', 'IBD Blen', 'D78']),
('Marek Disease Vaccine', 'vaccine', 0, 'Subcutaneous injection at hatchery', ARRAY['Rispens', 'HVT']),
('Fowl Pox Vaccine', 'vaccine', 0, 'Wing web prick per label', ARRAY['Fowl Pox Vac']),
('Vitamin A+D3+E', 'vitamin', 0, '1ml/L water for 5 days (stress)', ARRAY['Adivit', 'ADE-Forte']),
('Vitamin C (Ascorbic Acid)', 'vitamin', 0, '250-500mg/L water (heat stress)', ARRAY['Vitamin C powder']),
('B-Complex (B1+B2+B6+B12)', 'vitamin', 0, '1g/L water for 5 days', ARRAY['B-Plex']),
('Electrolytes (Oral Rehydration)', 'vitamin', 0, 'Per label for rehydration', ARRAY['Electral Vet', 'Rehydion']),
('Liver Tonic (Silymarin)', 'vitamin', 0, 'Per label — liver support', ARRAY['Livol', 'Hepasol']),
('Methionine (Amino Acid)', 'vitamin', 0, 'Per label as growth supplement', ARRAY['DL-Methionine']),
('Lysine (Amino Acid)', 'vitamin', 0, 'Per label as growth supplement', ARRAY['L-Lysine']),
('Probiotic (Lactobacillus)', 'probiotic', 0, '1g/L water or per feed label', ARRAY['Protexin', 'Bactoflor']),
('Prebiotic (MOS/FOS)', 'probiotic', 0, 'Per feed label', ARRAY['Bio-Mos']),
('Enzyme (Phytase)', 'probiotic', 0, 'Per feed formulation', ARRAY['Axtra PHY']),
('Organic Acids (Butyric Acid)', 'probiotic', 0, 'Per feed label — gut health', ARRAY['Gut-Pro']),
('Calcium Gluconate', 'vitamin', 0, '2-4g/L water for calcium supplement', ARRAY['CalciVet']),
('Zinc Bacitracin', 'antibiotic', 7, '10-50g/tonne feed as growth promoter', ARRAY['Albac']),
('Virginiamycin', 'antibiotic', 0, '5-20g/tonne feed', ARRAY['Stafac']),
('Fenbendazole', 'antiparasitic', 14, '7mg/kg for 5 days (roundworms)', ARRAY['Safe-Guard', 'Panacur']),
('Piperazine', 'antiparasitic', 7, '100mg/kg single dose (roundworms)', ARRAY['Piperazine Citrate']),
('Salinomycin', 'antiparasitic', 5, '60-70g/tonne feed (coccidiostat)', ARRAY['Bio-Cox', 'Sacox']),
('Monensin', 'antiparasitic', 3, '90-110g/tonne feed (coccidiostat)', ARRAY['Coban', 'Elancoban']),
('Lasalocid', 'antiparasitic', 3, '75-125g/tonne feed (coccidiostat)', ARRAY['Avatec']),
('Narasin', 'antiparasitic', 0, '60-80g/tonne feed (coccidiostat)', ARRAY['Monteban']),
('Maduramicin', 'antiparasitic', 5, '5g/tonne feed (coccidiostat)', ARRAY['Cygro']),
('Metronidazole', 'antibiotic', 7, '40mg/kg for 5 days (clostridial)', ARRAY['Flagyl Vet']),
('Chloramphenicol', 'antibiotic', 28, '20mg/kg — NOTE: banned in food animals in India/EU', ARRAY['Chloromycetin']),
('Spiramycin', 'antibiotic', 7, '50-100mg/kg for 5 days', ARRAY['Rovamycin']),
('Erythromycin', 'antibiotic', 7, '125mg/L water for 5 days', ARRAY['Erythrocin']),
('Gentamicin', 'antibiotic', 14, '5mg/kg SC for 3-5 days', ARRAY['Gentocin']),
('Ceftiofur', 'antibiotic', 0, 'Single SC injection at hatchery', ARRAY['Excenel']),
('Flumequine', 'antibiotic', 7, '12mg/kg for 5 days', ARRAY['Flumequil']),
('Sodium Bicarbonate', 'vitamin', 0, '0.5% in water for heat stress', ARRAY['Baking Soda Feed Grade']),
('Potassium Chloride', 'vitamin', 0, '0.15% in water for electrolyte balance', ARRAY['KCl electrolyte']),
('Kaolin-Pectin', 'other', 0, 'Per label for diarrhoea management', ARRAY['Kaopectate']),
('Activated Charcoal', 'other', 0, 'Per label for mycotoxin binding', ARRAY['Toxibind']),
('Fumonisin Binder (Bentonite)', 'other', 0, 'Per feed label — mycotoxin binder', ARRAY['Mycofix', 'Toxfin Dry']);
```

**Done when:** `SELECT COUNT(*) FROM medicines_db` returns 55. Autocomplete query `SELECT generic_name, brand_names, standard_withdrawal_days_india FROM medicines_db WHERE generic_name ILIKE 'oxy%'` returns Oxytetracycline correctly.

---

### TASK-GAP2-DB-001 — Create batch_sales and buyers tables
**Size:** S | **Priority:** P0

```sql
CREATE TABLE buyers (
  buyer_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integrator_id UUID NOT NULL REFERENCES integrators(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  phone         TEXT,
  location      TEXT,
  buyer_type    TEXT CHECK (buyer_type IN ('trader','processor','cooperative','direct','other')),
  notes         TEXT,
  rating        SMALLINT CHECK (rating BETWEEN 1 AND 5),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own buyers" ON buyers FOR ALL
  USING (integrator_id = auth.jwt() ->> 'integrator_id')
  WITH CHECK (integrator_id = auth.jwt() ->> 'integrator_id');

-- ─────────────────────────────────────────────────────────

CREATE TABLE batch_sales (
  sale_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id          UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  integrator_id     UUID NOT NULL REFERENCES integrators(id) ON DELETE CASCADE,

  sale_date         DATE NOT NULL DEFAULT CURRENT_DATE,
  sale_type         TEXT NOT NULL CHECK (sale_type IN ('full','partial')),

  birds_sold        INTEGER NOT NULL CHECK (birds_sold > 0),
  total_weight_kg   NUMERIC(10,3) NOT NULL,
  actual_avg_weight_g NUMERIC(8,1),
  rate_per_kg       NUMERIC(10,2) NOT NULL,
  gross_revenue     NUMERIC(14,2) GENERATED ALWAYS AS (total_weight_kg * rate_per_kg) STORED,

  commission_amount NUMERIC(10,2) DEFAULT 0,
  commission_pct    NUMERIC(5,2),
  weighment_deduction_kg NUMERIC(8,3) DEFAULT 0,
  net_revenue       NUMERIC(14,2),

  buyer_id          UUID REFERENCES buyers(buyer_id) ON DELETE SET NULL,
  buyer_name_snapshot TEXT, -- stores name at time of sale if no buyer_id

  vehicle_number    TEXT,
  driver_name       TEXT,
  departure_time    TIMESTAMPTZ,
  destination       TEXT,
  crates_used       INTEGER,
  dead_in_transit   INTEGER DEFAULT 0,

  payment_status    TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','confirmed','paid')),
  challan_number    TEXT,
  notes             TEXT,
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_batch_sales_batch_id ON batch_sales(batch_id);
CREATE INDEX idx_batch_sales_farm_id ON batch_sales(farm_id);

ALTER TABLE batch_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own batch_sales" ON batch_sales FOR ALL
  USING (integrator_id = auth.jwt() ->> 'integrator_id')
  WITH CHECK (integrator_id = auth.jwt() ->> 'integrator_id');
```

**Done when:** Both tables created. Test insert into batch_sales with sale_type='partial', birds_sold=5000; confirm gross_revenue auto-computes.

---

### TASK-GAP3-DB-001 — Create batch_treatments and vets tables
**Size:** S | **Priority:** P0

```sql
CREATE TABLE vets (
  vet_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integrator_id UUID NOT NULL REFERENCES integrators(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  specialisation TEXT,
  phone         TEXT,
  location      TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE vets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own vets" ON vets FOR ALL
  USING (integrator_id = auth.jwt() ->> 'integrator_id')
  WITH CHECK (integrator_id = auth.jwt() ->> 'integrator_id');

-- ─────────────────────────────────────────────────────────

CREATE TABLE batch_treatments (
  treatment_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id          UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  integrator_id     UUID NOT NULL REFERENCES integrators(id) ON DELETE CASCADE,

  treatment_date    DATE NOT NULL,
  medicine_name     TEXT NOT NULL,
  brand_name        TEXT,
  lot_number        TEXT,
  purpose           TEXT[],  -- multi-select: ['respiratory', 'enteric', etc.]
  dosage_amount     NUMERIC(10,3),
  dosage_unit       TEXT,
  dosage_per        TEXT CHECK (dosage_per IN ('per_litre_water','per_bird','per_kg_bw','per_kg_feed')),
  route             TEXT CHECK (route IN ('water','feed','injectable','topical','spray')),

  treatment_day_start INTEGER,
  treatment_day_end   INTEGER,
  last_dose_date      DATE,
  withdrawal_days     INTEGER NOT NULL DEFAULT 0,
  clearance_date      DATE,
  is_complete         BOOLEAN NOT NULL DEFAULT FALSE,

  vet_id            UUID REFERENCES vets(vet_id) ON DELETE SET NULL,
  vet_name_snapshot TEXT,
  notes             TEXT,
  created_by        UUID REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_treatments_batch_id ON batch_treatments(batch_id);
CREATE INDEX idx_treatments_clearance ON batch_treatments(clearance_date) WHERE withdrawal_days > 0;

ALTER TABLE batch_treatments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own treatments" ON batch_treatments FOR ALL
  USING (integrator_id = auth.jwt() ->> 'integrator_id')
  WITH CHECK (integrator_id = auth.jwt() ->> 'integrator_id');
```

**Done when:** Both tables created; RLS active.

---

### TASK-GAP4-DB-001 — Add environment columns to daily_logs
**Size:** S | **Priority:** P0

```sql
-- Add environment tracking columns to existing daily_logs table
-- All nullable for backwards compatibility

ALTER TABLE daily_logs
  ADD COLUMN IF NOT EXISTS temp_morning       NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS temp_afternoon     NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS temp_evening       NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS humidity_morning   NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS humidity_afternoon NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS ammonia_ppm        NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS ammonia_method     TEXT CHECK (ammonia_method IN ('measured','estimated_litter')),
  ADD COLUMN IF NOT EXISTS litter_condition   TEXT CHECK (litter_condition IN ('dry','damp','wet','very_wet')),
  ADD COLUMN IF NOT EXISTS light_hours        NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS light_schedule     TEXT CHECK (light_schedule IN ('continuous','intermittent','other')),
  ADD COLUMN IF NOT EXISTS fan_speed          TEXT CHECK (fan_speed IN ('tunnel','low','medium','high')),
  ADD COLUMN IF NOT EXISTS curtain_position   TEXT CHECK (curtain_position IN ('fully_open','half_open','closed')),
  ADD COLUMN IF NOT EXISTS inlet_pct          SMALLINT CHECK (inlet_pct BETWEEN 0 AND 100),
  ADD COLUMN IF NOT EXISTS ventilation_notes  TEXT,
  ADD COLUMN IF NOT EXISTS water_temp_c       NUMERIC(5,1);

-- NOTE: existing temperature column (if named 'temp_c' or 'temperature') is kept for backwards
-- compatibility; new columns are temp_morning, temp_afternoon, temp_evening
-- Map old temp_c to temp_afternoon on read if temp_afternoon is NULL
```

**Done when:** `\d daily_logs` shows all new columns; existing rows unchanged.

---

### TASK-GAP4-DB-002 — Create breed_growth_standards and breed_light_programme tables
**Size:** S | **Priority:** P2

```sql
CREATE TABLE breed_growth_standards (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breed       TEXT NOT NULL,
  day         SMALLINT NOT NULL,
  standard_weight_g NUMERIC(8,1) NOT NULL,
  source      TEXT, -- 'Aviagen Ross 308 2022 Performance Objectives'
  PRIMARY KEY (breed, day) -- no duplication
);

-- Seed with standard Aviagen/Cobb data (publicly available from their breed guides)
-- Ross 308 Male+Female average (approximate from Aviagen 2022 guide):
INSERT INTO breed_growth_standards (breed, day, standard_weight_g, source) VALUES
('Ross 308', 1, 42, 'Aviagen 2022'),('Ross 308', 3, 67, 'Aviagen 2022'),
('Ross 308', 5, 100, 'Aviagen 2022'),('Ross 308', 7, 147, 'Aviagen 2022'),
('Ross 308', 10, 232, 'Aviagen 2022'),('Ross 308', 14, 393, 'Aviagen 2022'),
('Ross 308', 17, 548, 'Aviagen 2022'),('Ross 308', 21, 775, 'Aviagen 2022'),
('Ross 308', 24, 992, 'Aviagen 2022'),('Ross 308', 28, 1322, 'Aviagen 2022'),
('Ross 308', 31, 1600, 'Aviagen 2022'),('Ross 308', 35, 1970, 'Aviagen 2022'),
('Ross 308', 38, 2245, 'Aviagen 2022'),('Ross 308', 42, 2580, 'Aviagen 2022'),
-- Cobb 430 (approximate from Cobb-Vantress 2020 guide):
('Cobb 430', 1, 44, 'Cobb-Vantress 2020'),('Cobb 430', 7, 152, 'Cobb-Vantress 2020'),
('Cobb 430', 14, 404, 'Cobb-Vantress 2020'),('Cobb 430', 21, 793, 'Cobb-Vantress 2020'),
('Cobb 430', 28, 1350, 'Cobb-Vantress 2020'),('Cobb 430', 35, 2005, 'Cobb-Vantress 2020'),
('Cobb 430', 42, 2638, 'Cobb-Vantress 2020'),
-- Hubbard JV (approximate):
('Hubbard JV', 7, 162, 'Hubbard 2021'),('Hubbard JV', 14, 430, 'Hubbard 2021'),
('Hubbard JV', 21, 835, 'Hubbard 2021'),('Hubbard JV', 28, 1410, 'Hubbard 2021'),
('Hubbard JV', 35, 2050, 'Hubbard 2021'),('Hubbard JV', 42, 2700, 'Hubbard 2021');

-- ─────────────────────────────────────────────────────────

CREATE TABLE breed_light_programme (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breed       TEXT NOT NULL,
  day_start   SMALLINT NOT NULL,
  day_end     SMALLINT NOT NULL,
  target_hours NUMERIC(4,1) NOT NULL,
  notes       TEXT
);

INSERT INTO breed_light_programme (breed, day_start, day_end, target_hours, notes) VALUES
('Ross 308', 1, 7, 22, 'First week near-continuous light'),
('Ross 308', 8, 21, 18, 'Standard growing phase'),
('Ross 308', 22, 35, 18, 'Pre-harvest phase'),
('Ross 308', 36, 42, 20, 'Final growth stimulation'),
('Cobb 430', 1, 7, 23, 'Near-continuous early light'),
('Cobb 430', 8, 28, 18, 'Standard growing'),
('Cobb 430', 29, 42, 20, 'Pre-harvest increase'),
('Hubbard JV', 1, 7, 22, 'Early growth'),
('Hubbard JV', 8, 35, 18, 'Standard phase'),
('Hubbard JV', 36, 42, 20, 'Harvest prep');
```

**Done when:** Both tables seeded; `SELECT * FROM breed_growth_standards WHERE breed = 'Ross 308' ORDER BY day` returns 14 rows in day order.

---

### TASK-GAP6-DB-001 — Create farm_risk_scores table; add biosecurity_level to farms
**Size:** S | **Priority:** P1

```sql
-- Add biosecurity level to farms table
ALTER TABLE farms
  ADD COLUMN IF NOT EXISTS biosecurity_level TEXT
    NOT NULL DEFAULT 'medium'
    CHECK (biosecurity_level IN ('low', 'medium', 'high'));

-- ─────────────────────────────────────────────────────────

CREATE TABLE farm_risk_scores (
  score_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  alert_id          UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  integrator_id     UUID NOT NULL REFERENCES integrators(id),

  proximity_km      NUMERIC(8,2),
  proximity_score   NUMERIC(4,2) NOT NULL,
  age_score         NUMERIC(4,2) NOT NULL,
  vaccination_score NUMERIC(4,2) NOT NULL,
  biosecurity_score NUMERIC(4,2) NOT NULL,
  total_score       NUMERIC(5,2) NOT NULL,
  risk_level        TEXT NOT NULL CHECK (risk_level IN ('LOW','MEDIUM','HIGH')),

  calculated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (farm_id, alert_id, calculated_at)  -- history of recalculations
);

CREATE INDEX idx_risk_farm_alert ON farm_risk_scores(farm_id, alert_id);
CREATE INDEX idx_risk_level ON farm_risk_scores(risk_level, alert_id);

ALTER TABLE farm_risk_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own risk scores" ON farm_risk_scores FOR SELECT
  USING (integrator_id = auth.jwt() ->> 'integrator_id');
-- INSERT/UPDATE only via service role (from Edge Function)
```

**Done when:** Table created; `farms` table has `biosecurity_level` column with default 'medium'.

---

### TASK-GAP5-DB-001 — Create aggregated_benchmarks and add batch completion fields
**Size:** M | **Priority:** P1

```sql
-- aggregated_benchmarks: pre-computed anonymised benchmark data
-- Populated by a nightly scheduled Supabase Edge Function
-- Never exposes individual farm data — min sample_count = 10

CREATE TABLE aggregated_benchmarks (
  benchmark_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  breed           TEXT NOT NULL DEFAULT 'All',
  region          TEXT NOT NULL DEFAULT 'All India',
  flock_size_cat  TEXT NOT NULL DEFAULT 'All'
    CHECK (flock_size_cat IN ('All','small','medium','large','commercial')),
  period          TEXT NOT NULL DEFAULT 'last_3_batches',
  metric_name     TEXT NOT NULL,
  p10_value       NUMERIC(10,4),
  p25_value       NUMERIC(10,4),
  p50_value       NUMERIC(10,4),
  p75_value       NUMERIC(10,4),
  p90_value       NUMERIC(10,4),
  sample_count    INTEGER NOT NULL,
  computed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bench_filters ON aggregated_benchmarks(breed, region, flock_size_cat, period, metric_name);

-- This table is READ-ONLY for all authenticated users
-- No RLS write policy (insert only via service role from Edge Function)
ALTER TABLE aggregated_benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated users read benchmarks" ON aggregated_benchmarks FOR SELECT
  TO authenticated USING (true);

-- Seed with initial placeholder data (will be replaced by Edge Function nightly)
-- These are approximate real-world Indian broiler averages for Gorakhpur region
INSERT INTO aggregated_benchmarks (breed, region, flock_size_cat, period, metric_name, p25_value, p50_value, p75_value, sample_count, computed_at) VALUES
('All','All India','All','last_3_batches','fcr', 1.85, 1.92, 2.05, 0, NOW()),
('All','All India','All','last_3_batches','mortality_pct', 2.1, 3.2, 4.8, 0, NOW()),
('All','All India','All','last_3_batches','adg_g', 44, 48, 53, 0, NOW()),
('All','All India','All','last_3_batches','harvest_weight_kg', 1.72, 1.85, 2.0, 0, NOW()),
('All','All India','All','last_3_batches','batch_duration_days', 38, 40, 43, 0, NOW()),
('All','All India','All','last_3_batches','gross_margin_pct', 12, 18, 24, 0, NOW()),
('Cobb 430','UP/Bihar Belt','All','last_3_batches','fcr', 1.80, 1.88, 2.00, 0, NOW()),
('Cobb 430','UP/Bihar Belt','All','last_3_batches','mortality_pct', 2.0, 3.0, 4.5, 0, NOW()),
('Ross 308','Maharashtra/Gujarat','All','last_3_batches','fcr', 1.78, 1.87, 1.98, 0, NOW()),
('Ross 308','Maharashtra/Gujarat','All','last_3_batches','mortality_pct', 1.8, 2.9, 4.2, 0, NOW());
-- NOTE: sample_count = 0 for placeholder data; Edge Function sets real counts after first run
```

**Done when:** Table created; `SELECT * FROM aggregated_benchmarks LIMIT 5` returns seeded rows.

---

### TASK-GAP7-DB-001 — Create documents and document_audit_log tables
**Size:** S | **Priority:** P0

```sql
CREATE TABLE documents (
  doc_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id       UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id      UUID REFERENCES batches(id) ON DELETE SET NULL, -- NULL = farm-level doc
  integrator_id UUID NOT NULL REFERENCES integrators(id) ON DELETE CASCADE,
  doc_name      TEXT NOT NULL,
  doc_type      TEXT NOT NULL CHECK (doc_type IN (
    'chick_invoice','feed_invoice','vaccination_cert','medicine_bill',
    'movement_permit','sale_invoice','lab_report','insurance','batch_closure_report','other'
  )),
  file_path     TEXT NOT NULL,  -- Supabase Storage path
  file_size_bytes BIGINT,
  file_ext      TEXT CHECK (file_ext IN ('pdf','jpg','jpeg','png','heif','heic')),
  document_date DATE,
  tags          TEXT[],
  notes         TEXT,
  uploaded_by   UUID REFERENCES auth.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ  -- soft delete
);

CREATE INDEX idx_docs_farm_batch ON documents(farm_id, batch_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_docs_integrator ON documents(integrator_id) WHERE deleted_at IS NULL;

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own documents" ON documents FOR ALL
  USING (integrator_id = auth.jwt() ->> 'integrator_id')
  WITH CHECK (integrator_id = auth.jwt() ->> 'integrator_id');

-- ─────────────────────────────────────────────────────────

CREATE TABLE document_audit_log (
  log_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id        UUID NOT NULL REFERENCES documents(doc_id) ON DELETE CASCADE,
  farm_id       UUID NOT NULL,
  action        TEXT NOT NULL CHECK (action IN ('upload','download','preview','rename','delete')),
  performed_by  UUID REFERENCES auth.users(id),
  performed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- No RLS write block — inserts from service role via API
ALTER TABLE document_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own audit log" ON document_audit_log FOR SELECT
  USING (
    farm_id IN (SELECT id FROM farms WHERE integrator_id = auth.jwt() ->> 'integrator_id')
  );
```

**Done when:** Both tables created; Supabase Storage bucket "farm-documents" created as private with RLS.

---

## SPRINT 1: API ROUTES

---

### TASK-GAP1-API-001 — Batch P&L API routes ✅ COMPLETED
**Size:** M | **Priority:** P0
**Requires:** TASK-GAP1-DB-001, TASK-GAP1-DB-002
**Status:** COMPLETED - Implemented in Python/FastAPI as apps/api/batch_costs.py with routes in main.py

Create file: `app/api/farms/[farmId]/costs/route.ts`

```typescript
// GET /api/farms/[farmId]/costs?batchId=[batchId]
// Returns: all cost entries for a batch, grouped by category + computed totals

// POST /api/farms/[farmId]/costs
// Body: { batchId, category, ...categorySpecificFields, amount }
// Returns: { cost_id, ...newRecord }

// PATCH /api/farms/[farmId]/costs/[costId]
// Body: partial update fields
// Returns: updated record

// DELETE /api/farms/[farmId]/costs/[costId]
// Returns: { deleted: true }
```

Implementation notes:
- All routes: verify `farmId` belongs to `auth.jwt().integrator_id` or return 404
- GET computes `pl_summary`:
  ```typescript
  const pl_summary = {
    chick_total: sum of batch_costs WHERE category='chick',
    feed_total: sum of feed_purchase_log WHERE batch_id (JOIN to existing feed table),
    medicine_total: sum of batch_medicine_costs WHERE batch_id,
    labour_total: sum of batch_costs WHERE category IN ('labour_daily','labour_period'),
    overhead_total: sum of batch_costs WHERE category='overhead' * batch_share_pct / 100,
    other_total: sum of batch_costs WHERE category='other',
    grand_total: sum of all above,
    live_cost_per_bird: grand_total / batch.birds_placed,
    estimated_revenue: batch.birds_alive * batch.latest_avg_weight_kg * latest_p50_price
  }
  ```
- POST for `category='labour_daily'`: auto-compute `amount = workers_count * rate_per_day * batch.current_day`
- Response shape for GET:
  ```typescript
  {
    costs: BatchCostRecord[],
    pl_summary: PLSummary,
    feed_costs: { total: number, avg_rate: number, total_mt: number }, // from feed table
    medicine_costs: MedicineCostRecord[] // from batch_medicine_costs
  }
  ```

**Done when:** `curl -X POST /api/farms/[id]/costs -d '{"batchId":"...","category":"chick","price_per_doc":42,"birds_placed":12500}' -H "Authorization: Bearer [token]"` returns 201 with the new record. GET returns pl_summary with correct totals.

---

### TASK-GAP2-API-001 — Sales & Lifting API routes ✅ COMPLETED
**Size:** M | **Priority:** P0
**Requires:** TASK-GAP2-DB-001
**Status:** COMPLETED - Implemented in Python/FastAPI as apps/api/batch_sales.py with routes in main.py

Create file: `app/api/farms/[farmId]/sales/route.ts`

```typescript
// GET /api/farms/[farmId]/sales?batchId=[batchId]
// Returns: all sale events for the batch + sales_summary

// POST /api/farms/[farmId]/sales
// Body: SaleEventInput
// Side effects:
//   1. Decrements birds_alive on batch by (birds_sold + dead_in_transit)
//   2. Updates batch.total_revenue = SUM(net_revenue) for batch
//   3. If sale.sale_type = 'full' OR batch.birds_alive becomes 0: sets batch.harvest_ready = true

// PATCH /api/farms/[farmId]/sales/[saleId]
// Returns: updated record

// DELETE /api/farms/[farmId]/sales/[saleId]
// Side effects: reverses birds_alive decrement; reverses revenue update
```

Withdrawal check on POST:
```typescript
// BEFORE inserting a sale, check for active withdrawal periods:
const activeWithdrawals = await supabase
  .from('batch_medicine_costs')
  .select('medicine_name, clearance_date')
  .eq('batch_id', body.batchId)
  .gt('withdrawal_days', 0)
  .gt('clearance_date', new Date().toISOString().split('T')[0]);

if (activeWithdrawals.data?.length > 0) {
  return NextResponse.json({
    error: 'WITHDRAWAL_PERIOD_ACTIVE',
    message: `Active withdrawal period. Earliest safe harvest: ${latestClearanceDate}`,
    medicines: activeWithdrawals.data
  }, { status: 422 });
}
```

Sales summary computation:
```typescript
const sales_summary = {
  total_birds_sold: SUM(birds_sold),
  total_weight_kg: SUM(total_weight_kg),
  total_gross_revenue: SUM(gross_revenue),
  total_net_revenue: SUM(net_revenue),
  avg_rate_per_kg: total_gross_revenue / total_weight_kg,
  birds_remaining: batch.birds_alive,
  pct_sold: total_birds_sold / batch.birds_placed * 100,
  sale_count: COUNT(*)
}
```

**Done when:** POST with active withdrawal returns 422 with the correct error. POST without withdrawal creates record and decrements birds_alive on the batch. GET returns sales_summary with correct totals.

---

### TASK-GAP2-API-002 — Batch close API route
**Size:** M | **Priority:** P1
**Requires:** TASK-GAP2-API-001, TASK-GAP1-API-001

Create file: `app/api/batches/[batchId]/close/route.ts`

```typescript
// POST /api/batches/[batchId]/close
// Body: { finalMortality?: number, notes?: string }
// Returns: { success: true, batch: updatedBatch }
// Side effects:
//   1. SET batch.status = 'harvested'
//   2. SET batch.batch_closed_at = NOW()
//   3. SET batch.final_fcr = computed from daily logs
//   4. SET batch.final_mortality_pct = final_mortality / birds_placed * 100
//   5. SET batch.final_avg_weight_g = latest daily_log.avg_weight_g
//   6. SET batch.total_revenue = SUM(batch_sales.net_revenue)
//   7. SET batch.total_cost = pl_summary.grand_total
//   8. SET batch.gross_profit = total_revenue - total_cost
//   9. Cancel pending WhatsApp reminders for this farm (set wa_reminders_active = false)
```

**Done when:** POST /api/batches/[id]/close sets status to 'harvested'; subsequent GET on the batch returns the updated status and all final metrics.

---

### TASK-GAP3-API-001 — Treatment log API routes ✅ COMPLETED
**Size:** M | **Priority:** P0
**Requires:** TASK-GAP3-DB-001
**Status:** COMPLETED - Implemented in Python/FastAPI as apps/api/batch_treatments.py with routes in main.py

Create file: `app/api/farms/[farmId]/treatments/route.ts`

```typescript
// GET /api/farms/[farmId]/treatments?batchId=[batchId]
// Returns: { treatments: Treatment[], withdrawal_status: WithdrawalStatus }

// POST /api/farms/[farmId]/treatments
// Body: TreatmentInput
// Side effects:
//   1. Creates batch_treatments record
//   2. If cost_per_unit + quantity provided: auto-creates batch_medicine_costs record
//      (links treatment_id FK to medicine cost record)
//   3. Computes clearance_date = last_dose_date + withdrawal_days
// Returns: { treatment: Treatment, medicine_cost?: MedicineCostRecord }

// PATCH /api/farms/[farmId]/treatments/[treatmentId]
// DELETE /api/farms/[farmId]/treatments/[treatmentId]
```

WithdrawalStatus computed on GET:
```typescript
const withdrawal_status = {
  has_active_withdrawal: boolean,
  active_withdrawals: Array<{
    medicine_name: string,
    last_dose_date: string,
    clearance_date: string,
    days_remaining: number
  }>,
  latest_clearance_date: string | null,
  harvest_safe: boolean // true if no active withdrawals
}
```

Medicine autocomplete endpoint: `app/api/medicines/route.ts`
```typescript
// GET /api/medicines?q=[query]&limit=10
// Returns: medicines_db rows matching generic_name or brand_names ILIKE '%query%'
// No auth required (reference data)
// Cache: 24 hours (medicines DB rarely changes)
```

**Done when:** POST creates treatment + medicine cost records simultaneously. GET returns correct withdrawal_status.has_active_withdrawal=true when a treatment with withdrawal_days=10 was saved 3 days ago.

---

### TASK-GAP4-API-001 — Environment data in daily log (extend existing endpoint) ✅ COMPLETED
**Size:** S | **Priority:** P0
**Requires:** TASK-GAP4-DB-001
**Status:** COMPLETED - Modified apps/web/app/api/farms/[farmId]/logs/route.ts to accept and return all new environment fields with alert computation

Modify existing file: `app/api/farms/[farmId]/logs/route.ts`

Changes:
1. POST handler: accept all new environment fields (temp_morning, temp_afternoon, temp_evening, humidity_morning, humidity_afternoon, ammonia_ppm, ammonia_method, litter_condition, light_hours, light_schedule, fan_speed, curtain_position, inlet_pct, ventilation_notes, water_temp_c) — all optional
2. GET handler: return new fields in response
3. Add environment alert computation on POST:
```typescript
const env_alerts = [];
if (body.temp_afternoon > 35) env_alerts.push({ type: 'HEAT_STRESS', severity: 'WARNING' });
if (body.humidity_morning > 75 || body.humidity_afternoon > 75)
  env_alerts.push({ type: 'HIGH_HUMIDITY', severity: 'WARNING' });
if (body.ammonia_ppm > 25) env_alerts.push({ type: 'HIGH_AMMONIA', severity: 'CRITICAL' });
// Return alerts in response so UI can show them immediately
return NextResponse.json({ log: savedLog, env_alerts });
```

**Done when:** POST /api/farms/[id]/logs with temp_morning=36 returns env_alerts containing HEAT_STRESS; GET returns all new columns.

---

### TASK-GAP5-API-001 — Benchmark data API route ✅ COMPLETED
**Size:** M | **Priority:** P1
**Requires:** TASK-GAP5-DB-001
**Status:** COMPLETED - Implemented in Python/FastAPI as apps/api/benchmark.py with routes in main.py

Create file: `app/api/benchmark/data/route.ts`

```typescript
// GET /api/benchmark/data?breed=All&region=All+India&size=All&period=last_3_batches
// Returns: {
//   user_metrics: UserMetrics, // user's own farm performance for selected period
//   benchmark: BenchmarkRow[], // from aggregated_benchmarks table
//   sample_count: number,
//   privacy_minimum_met: boolean // false if sample_count < 10
// }

// user_metrics computation:
// SELECT AVG(fcr), AVG(mortality_pct), AVG(adg_g), AVG(harvest_weight_kg),
//        AVG(batch_duration_days), AVG(gross_margin_pct)
// FROM batches
// WHERE integrator_id = ? AND status = 'harvested'
// AND breed ILIKE ? (if filter)
// LIMIT (period determines how many batches: last_3 = LIMIT 3 ORDER BY batch_closed_at DESC)
```

Benchmark insights API: `app/api/benchmark/insights/route.ts`

```typescript
// POST /api/benchmark/insights
// Body: { user_metrics, benchmark_data, filters }
// Returns: { strength, improvement, context, action } — strings of max 60 words each

// Implementation: calls Claude Sonnet API
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 400,
    system: `You are a poultry farm performance analyst. Generate 4 concise benchmark insights
             (max 60 words each). Return ONLY valid JSON: {"strength":"...","improvement":"...","context":"...","action":"..."}`,
    messages: [{
      role: 'user',
      content: `User metrics: ${JSON.stringify(user_metrics)}
                Group benchmark: ${JSON.stringify(benchmark_data)}
                Filters: ${JSON.stringify(filters)}
                Generate 4 specific, actionable insights for a commercial broiler farm.`
    }]
  })
});
// Parse response, extract JSON, return to client
// Fallback: if API fails or parse fails, return template insights based on metric comparisons
```

**Done when:** GET /api/benchmark/data returns user_metrics + benchmark data with privacy_minimum_met correctly computed. POST /api/benchmark/insights returns valid 4-key JSON with non-empty strings.

---

### TASK-GAP6-API-001 — Risk score calculation Edge Function ✅ COMPLETED
**Size:** L | **Priority:** P1
**Requires:** TASK-GAP6-DB-001, alerts table (existing)
**Status:** COMPLETED - Implemented as Next.js API routes with risk calculation utility functions

Create file: `supabase/functions/calculate-risk-scores/index.ts`

This is a Supabase Edge Function (Deno) that:
1. Fetches all active disease alerts from the `alerts` table
2. Fetches all farms with active batches
3. Calculates risk score for each farm-alert pair using Haversine distance
4. Upserts results into `farm_risk_scores`
5. Sends WhatsApp notification if risk level changes (HIGH or MEDIUM → up only)

```typescript
// Haversine distance formula (returns km):
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) *
            Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// Proximity score:
function proximityScore(km: number): number {
  if (km < 20) return 4;
  if (km < 50) return 3;
  if (km < 100) return 2;
  if (km < 200) return 1;
  return 0;
}

// Age score from batch.current_day:
function ageScore(day: number): number {
  if (!day) return 0;
  if (day <= 7) return 2;
  if (day <= 21) return 1.5;
  if (day <= 35) return 1;
  return 0.5;
}

// Vaccination score from vaccination_schedule in health records:
// Check if ND (Newcastle) vaccine is marked as Done
function vaccinationScore(vaccinations: VaccinationRecord[]): number {
  const ndVacc = vaccinations.filter(v => v.vaccine.toLowerCase().includes('newcastle'));
  if (!ndVacc.length) return 2;
  const allDone = ndVacc.every(v => v.status === 'done');
  if (allDone) return 0;
  return 1;
}

// Biosecurity score from farm.biosecurity_level:
function biosecurityScore(level: string): number {
  return level === 'high' ? 0 : level === 'medium' ? 1 : 2;
}

// Risk level classification:
function riskLevel(total: number): string {
  if (total < 4) return 'LOW';
  if (total < 8) return 'MEDIUM';
  return 'HIGH';
}
```

Also create HTTP trigger endpoint: `app/api/alerts/risk/recalculate/route.ts`
```typescript
// POST /api/alerts/risk/recalculate
// Triggers the Edge Function manually (for admin + auto-trigger on new alert creation)
// Called automatically when: new alert created, vaccination status updated, biosecurity updated
```

And read endpoint: `app/api/alerts/risk/[farmId]/route.ts`
```typescript
// GET /api/alerts/risk/[farmId]?alertId=[alertId]
// Returns: latest risk score record for this farm + alert + history (last 5 calculations)
```

**Done when:** Edge Function runs without error. Given a farm with GPS coords 26.7606, 83.3732 (Gorakhpur) and an alert epicentre at 27.2, 84.0, `haversineKm` returns approximately 70.5 km. Full pipeline: new alert created → Edge Function triggered → risk_scores row created with correct proximity_score=2.

---

### TASK-GAP7-API-001 — Document upload and management API ✅ COMPLETED
**Size:** M | **Priority:** P0
**Requires:** TASK-GAP7-DB-001
**Status:** COMPLETED - Implemented in Python/FastAPI as apps/api/batch_documents.py with routes in main.py

Create file: `app/api/farms/[farmId]/documents/route.ts`

```typescript
// GET /api/farms/[farmId]/documents?batchId=[batchId]&type=[doc_type]
// Returns: documents grouped by doc_type, with Supabase Storage signed URLs (expire: 60s)

// POST /api/farms/[farmId]/documents (multipart/form-data)
// Fields: file (File), docName (string), docType (string), batchId? (string),
//         documentDate? (string), tags? (string JSON array), notes? (string)
// Steps:
//   1. Validate file type (pdf/jpg/jpeg/png/heif) and size (< 10MB)
//   2. Generate storage path: [integrator_id]/[farmId]/[batchId ?? 'farm-level']/[docType]/[uuid].[ext]
//   3. Upload to Supabase Storage 'farm-documents' bucket
//   4. Insert into documents table with file_path, file_size_bytes, etc.
//   5. Insert into document_audit_log (action='upload')
//   6. Return: { doc_id, doc_name, download_url (signed, 60s) }
```

Create file: `app/api/farms/[farmId]/documents/[docId]/route.ts`
```typescript
// GET /api/farms/[farmId]/documents/[docId]
// Returns: document record + fresh signed download URL
// Side effect: inserts document_audit_log record (action='download')

// PATCH /api/farms/[farmId]/documents/[docId]
// Body: { doc_name?, tags?, notes?, document_date? }
// Side effect: inserts audit log (action='rename' if doc_name changed)

// DELETE /api/farms/[farmId]/documents/[docId]
// Soft delete: SET deleted_at = NOW() (does NOT delete from Storage for 30 days)
// Side effect: inserts audit log (action='delete')
```

**Done when:** Full upload roundtrip works: POST with a test PDF → 201 with doc_id → GET returns download_url → URL works in browser. DELETE sets deleted_at; document no longer returned by GET list.

---

## SPRINT 2: FRONTEND — UI COMPONENTS

---

### TASK-GAP1-UI-001 — P&L Tab: Tab registration and page shell ✅ COMPLETED
**Size:** S | **Priority:** P0
**Requires:** TASK-GAP1-API-001
**Status:** COMPLETED - Implemented P&L tab in FarmDetailTabs.tsx with Coin icon, created PLTab component, PLSummaryBanner, PLCostSections, PLCharts, and page shell at app/dashboard/farms/[farmId]/pl/page.tsx

**File to edit:** `app/dashboard/farms/[farmId]/page.tsx` (or wherever Farm Detail tabs are defined)

Step 1: Add new tab to the tab array:
```typescript
const farmTabs = [
  { id: 'metrics',  label: 'Metrics',     labelHi: 'मेट्रिक्स',  icon: '📊' },
  { id: 'daily-log', label: 'Daily Log',  labelHi: 'दैनिक लॉग', icon: '📅' },
  { id: 'health',   label: 'Health',      labelHi: 'स्वास्थ्य', icon: '🏥' },
  { id: 'feed',     label: 'Feed',        labelHi: 'फ़ीड',      icon: '🌾' },
  { id: 'pl',       label: 'P&L',         labelHi: 'P&L / लागत', icon: '💰' }, // NEW
  { id: 'sales',    label: 'Sales',       labelHi: 'Sales / बिक्री', icon: '🚛' }, // NEW
  { id: 'history',  label: 'History',     labelHi: 'इतिहास',    icon: '📋' },
  { id: 'docs',     label: 'Docs',        labelHi: 'Docs / दस्तावेज़', icon: '📄' }, // NEW
  { id: 'whatsapp', label: 'WhatsApp',    labelHi: 'WhatsApp',  icon: '📲' },
];
```

Step 2: Create page file: `app/dashboard/farms/[farmId]/pl/page.tsx`
- Page shell: fetch P&L data via GET /api/farms/[farmId]/costs?batchId=[activeBatchId]
- Show skeleton while loading (5 grey shimmer rectangles)
- On load: render `<PLSummaryBanner>` + `<PLCostSections>` + `<PLCharts>`

Step 3: URL routing — ensure ?tab=pl activates the P&L tab (same pattern as other tabs)

**Done when:** Clicking "P&L" tab navigates to tab content without page reload; skeleton shown during fetch; no console errors.

---

### TASK-GAP1-UI-002 — P&L Summary Banner component ✅ COMPLETED
**Size:** M | **Priority:** P0
**Requires:** TASK-GAP1-UI-001
**Status:** COMPLETED - Enhanced PLSummaryBanner component with bilingual labels, revenue estimate tooltip, correct target cost per bird calculation, Sora font for values, updated CSS to match design specs (border color #E3EDE7, shadow, proper padding)

**Create file:** `components/farm/pl/PLSummaryBanner.tsx`

```tsx
interface PLSummaryBannerProps {
  plSummary: PLSummary;
  currency: string; // '₹' | '$' | '€' etc.
  batchDay: number;
  batchName: string;
}

// Renders 6 KPI tiles in a horizontal sticky row
// Tile structure: label (bilingual, small, muted) + value (large, Sora font) + sub-info
```

Tile details:
- Est. Revenue: `₹{formatNumber(pl_summary.estimated_revenue)} (at harvest)` — muted grey styling
- Total Cost: `₹{formatNumber(pl_summary.grand_total)}` — green if under target, red if over
- Gross Profit: `₹{formatNumber(pl_summary.estimated_revenue - pl_summary.grand_total)}` — in parentheses "(pre-harvest)" below value
- Live Cost/Bird: `₹{pl_summary.live_cost_per_bird.toFixed(2)}` — coloured by target comparison
- Target Margin: `{pl_summary.target_margin}%` with pencil icon (inline editable on click)
- Days to Harvest: `~{pl_summary.days_to_harvest} days` as a link to price forecast

Colour rules for Live Cost/Bird:
```typescript
const costColour =
  pl_summary.live_cost_per_bird <= pl_summary.target_cost_per_bird ? '#16A34A' :
  pl_summary.live_cost_per_bird <= pl_summary.target_cost_per_bird * 1.1 ? '#D97706' : '#DC2626';
```

Banner CSS: `position: sticky; top: [tab_bar_height]px; z-index: 10; background: #FFFFFF; border-bottom: 1px solid #E3EDE7; padding: 16px 24px;`

**Done when:** Banner renders correctly with colour-coded Live Cost/Bird; inline edit of Target Margin updates value without page reload.

---

### TASK-GAP1-UI-003 — P&L Cost Sections (accordion) ✅ COMPLETED
**Size:** L | **Priority:** P0
**Requires:** TASK-GAP1-UI-002
**Status:** COMPLETED - Implemented all 6 cost section components (ChickCostSection, FeedCostSection, MedicineCostSection, LabourCostSection, OverheadCostSection, OtherCostSection) with proper state management, summary card views, edit modes, and API integration. Updated PLCostSections.tsx to use the new separate components.

**Create files:**
- `components/farm/pl/ChickCostSection.tsx`
- `components/farm/pl/FeedCostSection.tsx`
- `components/farm/pl/MedicineCostSection.tsx`
- `components/farm/pl/LabourCostSection.tsx`
- `components/farm/pl/OverheadCostSection.tsx`
- `components/farm/pl/OtherCostSection.tsx`
- `components/farm/pl/PLCostSections.tsx` (parent — renders all 6)

Each cost section component follows this pattern:
```tsx
// State: isExpanded (boolean), isEditing (boolean), savedData (from API)
// When savedData exists AND isEditing=false: show Summary Card
// When no savedData OR isEditing=true: show inline form
// [Edit ✏] button: sets isEditing=true
// [Save] button: POST/PATCH to API, then sets isEditing=false, updates local state
// [Cancel] button: sets isEditing=false without saving

// Summary Card: grey background, all entered values listed neatly
// Form: white background, labelled fields, validation errors inline
```

ChickCostSection specific: auto-fill Breed from batch data, Date from batch.placement_date, Birds Placed from batch.birds_placed.

MedicineCostSection specific: renders a `<MedicineCostTable>` sub-component (NOT an inline form — it's a table of entries). Each row has Delete. Below table: `<AddMedicineEntryForm>` (expandable inline form with autocomplete for medicine name).

LabourCostSection: toggleable MODE A (daily rate) vs MODE B (period log) — store mode preference in localStorage key `labour_cost_mode_${farmId}`.

**Done when:** Each section collapses to summary after save; editing reopens pre-filled form; deleting an entry updates grand total in banner.

---

### TASK-GAP1-UI-004 — P&L Waterfall Chart and Pie Chart ✅ COMPLETED
**Size:** M | **Priority:** P1
**Requires:** TASK-GAP1-UI-001
**Status:** COMPLETED - Implemented PLWaterfallChart component with waterfall chart using stacked bar trick, donut pie chart with innerRadius={60}, and "View as table" accessibility toggle. Integrated into PLTab component replacing PLCharts.

**Create file:** `components/farm/pl/PLWaterfallChart.tsx`

Recharts implementation. The waterfall pattern requires a stacked bar trick:
```tsx
// Waterfall technique with Recharts:
// 1. Transform data into: [{ name, invisible (offset), value, fill }]
// 2. Render stacked BarChart: first bar is transparent (invisible) for offset
// 3. Second bar is the actual value (positive = green, negative = red)

const waterfallData = [
  { name: 'Revenue', invisible: 0, value: pl.estimated_revenue, fill: '#16A34A' },
  { name: 'Chick Cost', invisible: pl.estimated_revenue - pl.chick_total, value: -pl.chick_total, fill: '#DC2626' },
  { name: 'Feed Cost', invisible: ..., value: -pl.feed_total, fill: '#DC2626' },
  // ... etc for each cost category
  { name: 'Net Profit', invisible: 0, value: pl.estimated_revenue - pl.grand_total,
    fill: net_profit >= 0 ? '#16A34A' : '#DC2626' },
];
```

Pie chart (donut): `<PieChart>` with `innerRadius={60}` for donut style. Legend below using Recharts `<Legend>` component.

"View as table" toggle: when active, shows HTML table with same data (WCAG accessibility requirement). Toggle button styled as ghost button in top-right of chart container.

**Done when:** Waterfall chart renders with correct bars; hover tooltips show correct values; "View as table" toggle works.

---

### TASK-GAP2-UI-001 — Sales Tab: page shell + harvest readiness panel ✅ COMPLETED
**Size:** M | **Priority:** P0
**Requires:** TASK-GAP2-API-001, TASK-GAP3-API-001
**Status:** COMPLETED - Implemented SalesTab component, HarvestReadinessPanel, SalesSummaryBar, and integrated Sales tab into FarmDetailTabs at 6th position (after P&L, before Batch History)

**Create file:** `app/dashboard/farms/[farmId]/sales/page.tsx`

Fetch on load:
- GET /api/farms/[farmId]/sales?batchId=[id] → sales data
- GET /api/farms/[farmId]/treatments?batchId=[id] → withdrawal_status

HarvestReadinessPanel component (`components/farm/sales/HarvestReadinessPanel.tsx`):
```tsx
// Show when: batch.current_day >= batch.target_days * 0.85 OR batch.harvest_ready = true

// Withdrawal status check:
if (withdrawal_status.has_active_withdrawal) {
  // Red warning band
  // [+ Record Sale] button DISABLED with tooltip: "Withdrawal period active until [date]"
} else {
  // Green "CLEAR" badge
  // [+ Record Sale / Lifting Event →] CTA (primary button, brand700 bg)
}
```

SalesSummaryBar (`components/farm/sales/SalesSummaryBar.tsx`):
- 4 KPI tiles: Total Birds Sold | Total Revenue | Avg Rate | Remaining Birds
- Progress bar: "N% of batch sold. [M] birds remaining."
- Only visible when ≥1 sale recorded

**Done when:** Panel shows correctly with withdrawal block when active; CTA disabled with explanatory tooltip when withdrawal active.

---

### TASK-GAP2-UI-002 — Record Sale Drawer form ✅ COMPLETED
**Size:** L | **Priority:** P0
**Requires:** TASK-GAP2-UI-001
**Status:** COMPLETED - Implemented RecordSaleDrawer component with all 5 sections, buyer dropdown with New Buyer option, rate deviation warning, and Close batch checkbox logic. Integrated with SalesTab.

**Create file:** `components/farm/sales/RecordSaleDrawer.tsx`

Implementation notes:
- Desktop: right-side drawer, `position: fixed; right: 0; top: 0; width: 600px; height: 100vh; z-index: 50` with dark overlay behind
- Mobile: full-screen bottom sheet (100vh, slides up from bottom)
- 5 sections as described in Design spec; collapsible sections 3–5 (optional fields)

Buyer dropdown:
```tsx
// Fetches buyers list from GET /api/buyers (filter by integrator_id)
// "New Buyer" option: shows inline sub-form below dropdown
// If "New Buyer" selected + Save checked: auto-creates buyer on sale save
```

Rate deviation warning:
```tsx
// Today's P50 price is fetched on form open: GET /api/price?mandi=[primaryMandi]
const deviation = ((enteredRate - p50) / p50) * 100;
if (deviation < -15) {
  showInlineWarning(`⚠ Rate is ${Math.abs(deviation).toFixed(1)}% below today's mandi price (₹${p50}/kg). Confirm?`);
}
```

"Close batch after saving" checkbox: only shown when sale_type='full' OR remaining_birds would reach 0

**Done when:** Form opens as drawer on desktop, full-screen on mobile; all 5 sections render; rate deviation warning triggers correctly; form submission creates sale + updates sales table + updates bird count.

---

### TASK-GAP2-UI-003 — Batch Close Wizard modal ✅ COMPLETED
**Size:** L | **Priority:** P1
**Requires:** TASK-GAP2-UI-002, TASK-GAP1-API-001
**Status:** COMPLETED - Implemented BatchCloseWizard.tsx with 3-step wizard, radar chart, AI summary, confetti animation, and integrated into RecordSaleDrawer

**Create file:** `components/farm/sales/BatchCloseWizard.tsx`

3-step modal, 640px wide. Manages its own step state internally.

Step 2 Radar chart: use Recharts `<RadarChart>` with 3 datasets overlaid. Fetch benchmark data from GET /api/benchmark/data for overlay.

Step 2 AI Summary: `useEffect` on step=2 entry → calls POST /api/benchmark/insights → renders text in 2-line card; loading spinner while fetching.

Confetti animation on close (no library needed):
```css
@keyframes confetti-fall {
  0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}
/* 20 absolutely-positioned small coloured squares using CSS animation */
```

**Done when:** All 3 steps navigate correctly; batch closes via API on step 3 confirm; PDF download option works (can use placeholder until TASK-GAP7-API-002); confetti plays for 3 seconds.

---

### TASK-GAP3-UI-001 — Treatment Log section in Health Tab ✅ COMPLETED
**Size:** L | **Priority:** P0
**Requires:** TASK-GAP3-API-001
**Status:** COMPLETED - Implemented TreatmentLog, TreatmentLogTable, AddTreatmentForm, and WithdrawalTracker components; integrated into HealthTab.tsx

**Edit file:** `app/dashboard/farms/[farmId]/health/page.tsx`
Add Treatment Log section between Symptom Quick-Log and Health Event Timeline.

**Create files:**
- `components/farm/health/TreatmentLog.tsx` — section container ✅
- `components/farm/health/TreatmentLogTable.tsx` — table of treatments ✅
- `components/farm/health/AddTreatmentForm.tsx` — inline expandable form ✅
- `components/farm/health/WithdrawalTracker.tsx` — withdrawal status widget ✅

AddTreatmentForm: medicine name field uses `<input>` with a `<datalist>` for autocomplete (progressive enhancement — works on all browsers):
```tsx
<input
  type="text"
  list="medicines-list"
  value={medicineName}
  onChange={handleMedicineChange}
/>
<datalist id="medicines-list">
  {suggestions.map(m => (
    <option key={m.medicine_id} value={m.generic_name}>{m.brand_names?.join(', ')}</option>
  ))}
</datalist>
```

On medicine name change: debounce 300ms → GET /api/medicines?q=[name] → update suggestions; if match found → auto-fill withdrawal_days field.

WithdrawalTracker: show for each treatment where withdrawal_days > 0:
- Progress bar: `width: ${(days_elapsed / withdrawal_days * 100)}%` capped at 100%
- Colour: green >50% done, amber 25–50%, red <25%

**Done when:** Adding a treatment with Enrofloxacin auto-fills withdrawal=10 days; treatment appears in table; WithdrawalTracker shows progress bar; medicine cost auto-created in P&L tab.

---

### TASK-GAP4-UI-001 — Environment data fields in Daily Log form
**Size:** M | **Priority:** P0
**Requires:** TASK-GAP4-API-001

**Edit file:** `components/farm/daily-log/DailyLogForm.tsx`

Add after temperature section, before notes:

```tsx
<EnvironmentSection isExpanded={envExpanded} onToggle={() => setEnvExpanded(!envExpanded)}>
  <TemperatureRow /> {/* Morning, Afternoon, Evening — replaces old single temp field */}
  <HumidityRow />
  <AmmoniaRow /> {/* with Measured/Estimated toggle */}
  <LightProgrammeRow />
  <VentilationSection isCollapsed={true} /> {/* optional, collapsed by default */}
  <WaterSection /> {/* existing water field + new water temp */}
  <EnvironmentSummaryBar /> {/* shows "Today: ✅ Temp OK | ⚠ Humidity" */}
</EnvironmentSection>
```

EnvironmentSummaryBar logic:
```tsx
const envStatus = {
  temp: tempAfternoon <= 35 && tempMorning >= 10 ? 'ok' : 'warning',
  humidity: humidityMorning <= 75 && humidityAfternoon <= 75 ? 'ok' : 'warning',
  ammonia: !ammoniaPpm || ammoniaPpm < 10 ? 'ok' : ammoniaPpm < 25 ? 'warning' : 'critical',
};
// Render coloured pills: ✅ for ok, ⚠ for warning, 🔴 for critical
```

Litter condition → estimated ammonia display:
```typescript
const litterToAmmonia = {
  dry: '2–5 ppm', damp: '10–20 ppm', wet: '25–40 ppm', very_wet: '40+ ppm'
};
// Show estimated range as muted text below litter condition selector
```

**Done when:** Environment section collapses/expands correctly; ammonia alert shows red when >25 ppm entered; daily log save includes new environment fields; environment summary bar reflects entered values.

---

### TASK-GAP4-UI-002 — Environment Trend Charts in Metrics Tab ✅ COMPLETED
**Size:** M | **Priority:** P1
**Requires:** TASK-GAP4-UI-001 (need data), Metrics tab (existing)
**Status:** COMPLETED - Implemented EnvironmentTrends component with TempHumidityChart, AmmoniaChart, and LightComplianceChart sub-components. Integrated into MetricsTab.

**Edit file:** `app/dashboard/farms/[farmId]/metrics/page.tsx`
Add `<EnvironmentTrends>` section after existing 5 charts.

**Create file:** `components/farm/metrics/EnvironmentTrends.tsx`

Fetches: GET /api/farms/[farmId]/logs?batchId=[id]&fields=temp_morning,temp_afternoon,humidity_morning,ammonia_ppm,light_hours — returns array of daily log environment fields

Three charts as separate sub-components:
- `<TempHumidityChart>` — dual-axis Recharts ComposedChart (Line + Area)
- `<AmmoniaChart>` — single-axis Recharts LineChart with ReferenceLines
- `<LightComplianceChart>` — Recharts BarChart grouped

EnvironmentHealthSummary above charts:
```tsx
// Compute from last 7 days of data:
const summary = {
  tempOk: last7.filter(d => d.temp_afternoon <= 35 && d.temp_morning >= 10).length,
  humidityOk: last7.filter(d => (d.humidity_morning || 60) <= 75).length,
  ammoniaOk: last7.filter(d => (d.ammonia_ppm || 0) < 10).length,
};
// Render: "Temperature: {summary.tempOk}/7 days within safe range ✅"
```

**Done when:** Charts render after 3+ days of environment data logged; summary card shows correct counts; "View as table" accessible toggle works on all 3 charts.

---

### TASK-GAP5-UI-001 — Benchmark page shell + filters ✅ COMPLETED
**Size:** M | **Priority:** P1
**Requires:** TASK-GAP5-API-001
**Status:** COMPLETED - Implemented benchmark page with all components at apps/web/app/dashboard/metrics/benchmark/

**Create file:** `app/dashboard/metrics/benchmark/page.tsx`

Page layout:
```tsx
<BenchmarkFilterBar filters={filters} onApply={handleApply} />
<div className="grid grid-cols-12 gap-4">
  <div className="col-span-4">
    <YourPerformanceSummary metrics={userMetrics} />
  </div>
  <div className="col-span-8">
    <BenchmarkComparisonTable benchmarkData={benchmarkData} userMetrics={userMetrics} />
  </div>
  <div className="col-span-6">
    <BenchmarkRadarChart userMetrics={userMetrics} benchmarkData={benchmarkData} />
  </div>
  <div className="col-span-6">
    <BenchmarkInsights insights={insights} isLoading={insightsLoading} />
  </div>
  <div className="col-span-12">
    <BreedGrowthCurveChart userWeights={userWeights} selectedBreed={filters.breed} />
  </div>
</div>
```

BenchmarkFilterBar: 5 `<select>` dropdowns + Apply + Reset buttons. [Apply] triggers `router.push('/dashboard/metrics/benchmark?' + new URLSearchParams(filters))` and re-fetches data. Filters read from URL on mount.

Privacy guard: if `benchmarkData.privacy_minimum_met = false`:
```tsx
<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
  <p>Not enough data in this filter combination (min. 10 farms required). Try broader filters.</p>
</div>
```

**Done when:** Filters update URL params; Apply re-fetches benchmark data; privacy guard shows correctly when < 10 farm sample.

---

### TASK-GAP5-UI-002 — Benchmark Comparison Table and Radar Chart ✅ COMPLETED
**Size:** M | **Priority:** P1
**Requires:** TASK-GAP5-UI-001
**Status:** COMPLETED - Enhanced existing components to match exact specifications from task document

**Create file:** `components/benchmark/BenchmarkComparisonTable.tsx`

Table row colour logic for "Your Avg" column:
```tsx
const getMetricColour = (yours: number, groupAvg: number, metric: string) => {
  // For FCR, mortality, duration: lower is better
  const lowerIsBetter = ['fcr', 'mortality_pct', 'batch_duration_days'];
  const better = lowerIsBetter.includes(metric) ? yours <= groupAvg : yours >= groupAvg;
  const pctDiff = Math.abs((yours - groupAvg) / groupAvg * 100);
  if (better) return 'text-green-700 bg-green-50';
  if (pctDiff <= 10) return 'text-amber-700 bg-amber-50';
  return 'text-red-700 bg-red-50';
};
```

Rank column: compute from user's value vs p25/p75 of benchmark:
```tsx
const getRank = (yours: number, p25: number, p75: number, metric: string): string => {
  const lowerIsBetter = ['fcr', 'mortality_pct', 'batch_duration_days'];
  if (lowerIsBetter.includes(metric)) {
    if (yours < p25) return 'Top 25% ✅';
    if (yours < p75) return 'Average';
    return 'Bottom 25% ⚠';
  } else {
    if (yours > p75) return 'Top 25% ✅';
    if (yours > p25) return 'Average';
    return 'Bottom 25% ⚠';
  }
};
```

**Create file:** `components/benchmark/BenchmarkRadarChart.tsx`

Recharts RadarChart: normalise each metric to 0–100 scale (100 = best possible) before plotting:
```tsx
// Normalisation: for FCR (lower better), 100 = 1.5, 0 = 2.5 → score = (2.5 - value) / (2.5 - 1.5) * 100
// For mortality (lower better), 100 = 0%, 0 = 10% → score = (10 - value) / 10 * 100
// For ADG (higher better), 100 = 70g, 0 = 30g → score = (value - 30) / (70 - 30) * 100
```

**Done when:** Table shows correctly coloured rows; rank column computed correctly; radar chart plots 3 overlaid areas with legend.

---

### TASK-GAP6-UI-001 — Per-farm risk score section on Alerts page ✅ COMPLETED
**Size:** M | **Priority:** P1
**Requires:** TASK-GAP6-API-001
**Status:** COMPLETED - Implemented FarmRiskAssessmentSection component, risk detail page with Leaflet map, and API integration

**Edit file:** `app/dashboard/alerts/page.tsx`

On page load (Active Alerts tab): additionally fetch GET /api/alerts/risk?integratorId=[id]
Returns: { active_alerts: Alert[], farm_risks: FarmRiskScore[] }

**Create file:** `components/alerts/FarmRiskAssessmentSection.tsx`

Only render if `farm_risks.some(r => r.total_score > 0)`.

Risk badge component:
```tsx
const RiskBadge = ({ score, level }: { score: number, level: string }) => {
  const colours = { LOW: 'bg-green-100 text-green-800', MEDIUM: 'bg-amber-100 text-amber-800', HIGH: 'bg-red-100 text-red-800' };
  const emojis = { LOW: '🟢', MEDIUM: '🟡', HIGH: '🔴' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${colours[level]}`}>
      {emojis[level]} {level} {score.toFixed(1)}
    </span>
  );
};
```

**Create file:** `app/dashboard/alerts/risk/[farmId]/page.tsx`

Leaflet mini-map: farm marker (green) + alert epicentre marker (red) + polyline connecting them with distance label.

Risk breakdown table: renders each of the 4 factors with score, out-of-max, and plain English reasoning.

"How to reduce your risk" section: 2–3 items depending on which factors score highest. Conditional rendering:
```tsx
{score_data.proximity_score > 2 && <ReductionItem text="Consider moving birds to a more distant shed if possible or strengthening perimeter biosecurity." />}
{score_data.vaccination_score > 0 && <ReductionItem text="Ensure all Newcastle Disease vaccinations are completed and recorded in your Health tab." />}
{score_data.biosecurity_score > 1 && <ReductionItem text="Upgrade biosecurity: restrict external visitors, enforce footbath use at all shed entry points." />}
```

**Done when:** Risk section appears on Alerts page when farm has active risk score; risk detail page renders map + table + recommendations.

---

### TASK-GAP7-UI-001 — Documents Tab page and upload flow ✅ COMPLETED
**Size:** L | **Priority:** P0
**Requires:** TASK-GAP7-API-001
**Status:** COMPLETED - Implemented all components and integrated Docs tab into FarmDetailTabs

**Create file:** `app/dashboard/farms/[farmId]/docs/page.tsx`

Fetch on load: GET /api/farms/[farmId]/documents → groups by doc_type, grouped by batch_id

Batch selector tabs (top of page): render a tab per batch + "Farm-Level" tab. Selected batch filters displayed docs.

Storage quota bar (top header):
```tsx
// total_file_size_bytes from GET response
const usedMB = (totalBytes / 1024 / 1024).toFixed(1);
const maxMB = 500;
const pct = Math.min(usedMB / maxMB * 100, 100);
// Progress bar with colour: green < 70%, amber 70–90%, red > 90%
```

**Create file:** `components/farm/docs/DocumentCategorySection.tsx`
Props: `{ category: DocType, docs: Document[], onUpload: () => void }`
- Accordion section: header + doc count badge + [+ Upload] shortcut
- Maps `doc_type` values to display names: `{'chick_invoice': '🐣 Chick Purchase Documents', ...}`

**Create file:** `components/farm/docs/DocumentCard.tsx`
Shows: thumbnail (for images use `<img src={signedUrl} loading="lazy">`, for PDFs show icon) + name + meta + action buttons.

**Create file:** `components/farm/docs/UploadDocumentModal.tsx`
Two-step modal. Step 1: drag-drop zone using `onDragOver`, `onDrop` events.

Drag-drop zone:
```tsx
const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  validateAndSetFile(file);
};

const validateAndSetFile = (file: File) => {
  const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/heif', 'image/heic'];
  if (!allowed.includes(file.type)) { setError('File must be PDF, JPG, or PNG'); return; }
  if (file.size > 10 * 1024 * 1024) { setError('File must be under 10MB'); return; }
  setSelectedFile(file);
  setStep(2);
};
```

Upload progress bar: use `XMLHttpRequest` (not fetch) to get upload progress events:
```typescript
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener('progress', (e) => {
  if (e.lengthComputable) setProgress(Math.round(e.loaded / e.total * 100));
});
```

**Done when:** Docs tab shows category sections; upload modal opens, accepts drag-drop, shows progress bar, creates document record, shows new card after upload.

---

### TASK-GAP7-UI-002 — Cross-tab document attachment buttons ✅ COMPLETED
**Size:** M | **Priority:** P2
**Requires:** TASK-GAP7-UI-001
**Status:** COMPLETED - Implemented attachment buttons in TreatmentLogTable, SalesTab, and FeedTab with pre-configured docType

Add `[📎 Attach Invoice]` buttons to:

1. **Sales Log Table** (`components/farm/sales/SalesLogTable.tsx`):
   - Per row: small ghost button "[📎 Attach Invoice]"
   - On click: opens `<UploadDocumentModal>` pre-configured with `docType='sale_invoice'`, `batchId=row.batch_id`
   - After upload: row shows `<a href={signedUrl}>📄 {doc_name}</a>` link

2. **Treatment Log Table** (`components/farm/health/TreatmentLogTable.tsx`):
   - Per row: `[📎 Attach Bill]`
   - Opens modal pre-configured with `docType='medicine_bill'`

3. **Feed Purchase Log** (`components/farm/feed/FeedPurchaseLog.tsx`):
   - Per row: `[📎 Attach Invoice]`
   - Opens modal pre-configured with `docType='feed_invoice'`

**Done when:** Clicking attach in any of these 3 tables opens the upload modal pre-configured correctly; uploaded docs appear in the Documents tab under the right category.

---

## SPRINT 3: INTEGRATION & POLISH TASKS

---

### TASK-INT-001 — Withdrawal block integration: Treatment → Sales tab ✅ COMPLETED
**Size:** S | **Priority:** P0
**Requires:** TASK-GAP3-UI-001, TASK-GAP2-UI-001
**Status:** COMPLETED - Implemented custom event system for cross-tab communication

**What to do:**
1. When treatment is saved with withdrawal_days > 0:
   - Invalidate the sales tab data cache (use SWR's `mutate()` or React Query `invalidateQueries()`)
   - The HarvestReadinessPanel re-fetches withdrawal_status and re-renders with the block
2. When clearance_date passes (check on page load + every 6 hours via interval):
   - Withdrawal block automatically lifts
3. Test scenario: Add treatment "Enrofloxacin, 10 days withdrawal, last dose today"
   → Sales tab HarvestReadinessPanel shows 🔴 block immediately without page reload

**Done when:** Adding a treatment immediately blocks the "Record Sale" button in Sales tab. After clearance_date passes, button becomes enabled.

**Implementation:**
- Modified `apps/web/components/farms/detail/health/AddTreatmentForm.tsx` to dispatch custom event 'treatment:added' when treatment with withdrawal_days > 0 is saved
- Modified `apps/web/components/farms/detail/tabs/SalesTab.tsx` to listen for the event and re-fetch withdrawal status
- Added interval check in SalesTab to automatically lift block when clearance_date passes (every 6 hours)

---

### TASK-INT-002 — Treatment cost → P&L auto-sync ✅ COMPLETED
**Size:** S | **Priority:** P0
**Requires:** TASK-GAP3-API-001, TASK-GAP1-API-001
**Status:** COMPLETED - Implemented SWR-based data fetching in PLTab and mutate trigger in AddTreatmentForm

**What to do:**
The API already creates a `batch_medicine_costs` record when a treatment with cost is saved (TASK-GAP3-API-001). The P&L tab's GET endpoint already sums `batch_medicine_costs` for the total (TASK-GAP1-API-001).

Frontend sync: after saving a treatment, also call `mutate('/api/farms/[farmId]/costs?batchId=...')` to refresh the P&L tab data.

**Test:** Save treatment "Tylosin, ₹90 cost" → switch to P&L tab → Medicine Cost section shows ₹90 entry without page refresh.

**Implementation:**
- Modified `apps/web/components/farms/detail/tabs/PLTab.tsx` to use SWR for data fetching from `/api/v1/farms/${farmId}/costs?batchId=${batchId}` endpoint
- Modified `apps/web/components/farms/detail/health/AddTreatmentForm.tsx` to import mutate from swr and call `mutate(`/api/v1/farms/${farmId}/costs?batchId=${batchId}`)` after saving a treatment with cost
- This ensures the P&L tab Medicine Cost section updates automatically without page refresh when a treatment with cost is saved

---

### TASK-INT-003 — Benchmark nav item and Portfolio Metrics quick filters ✅ COMPLETED
**Size:** S | **Priority:** P1
**Requires:** TASK-GAP5-UI-001
**Status:** COMPLETED - Implemented Benchmark nav item in Sidebar.tsx and breed/region filter pills in MetricsClient.tsx

1. **Sidebar update** (`components/layout/Sidebar.tsx`): Add "Benchmark" nav item under ANALYTICS section ✅
2. **Portfolio Metrics page** (`app/dashboard/metrics/MetricsClient.tsx`): Add breed/region filter pills to Network Benchmark section + "View Detailed Benchmark →" link ✅

**Done when:** Clicking "Benchmark" in sidebar navigates to /dashboard/metrics/benchmark; filter pills on Portfolio Metrics page update benchmark cards. ✅

---

### TASK-INT-004 — Risk badge on Batch Status Board cards ✅ COMPLETED
**Size:** S | **Priority:** P1
**Requires:** TASK-GAP6-UI-001
**Status:** COMPLETED - Implemented risk badge integration on Batch Status Board cards

**Edit file:** `components/batch-board/BatchCard.tsx`

On Batch Status Board load: fetch latest risk scores for all farms alongside batch data.
If `riskScore.total_score > 0` for a farm, show `<RiskBadge>` in top-right of that farm's batch card.

**Done when:** Batch card shows coloured risk badge when active alert exists for that farm.

**Implementation:**
- Created reusable RiskBadge component at `apps/web/components/dashboard/alerts/RiskBadge.tsx`
- Added risk score fetching logic to BatchStatusBoard component
- Added farm_id field to BatchRow interface
- Integrated RiskBadge into BatchCard component with conditional display
- Updated FarmRiskAssessmentSection to use the reusable RiskBadge component

---

### TASK-INT-005 — Document count badges on farm cards and batch cards ✅ COMPLETED
**Size:** S | **Priority:** P2
**Requires:** TASK-GAP7-UI-001
**Status:** COMPLETED - Implemented document count badges on FarmCard and BatchCard components with optimized count-only API endpoint

1. **My Farms page — Farm Card** (`components/farms/FarmCard.tsx`): Fetch doc count from GET /api/farms/[farmId]/documents?count=true and show "📄 N docs" in card footer
2. **Batch Status Board — Batch Card**: Show "📄 N docs" badge if batch has documents

**Done when:** Farm cards show document count; batch cards show "📄 0 docs" (or N docs).

---

### TASK-INT-006 — Batch closure report PDF generation ✅ COMPLETED
**Size:** L | **Priority:** P1
**Requires:** TASK-GAP2-API-002, P&L data (Gap 1), Health data (Gap 3), Documents tab (Gap 7)
**Status:** COMPLETED - Implemented in Next.js API route with @react-pdf/renderer

**Create file:** `app/api/batches/[batchId]/closure-report/route.ts`

Use `@react-pdf/renderer` (npm package, works in Node.js):
```typescript
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// Install: npm install @react-pdf/renderer

// Define styles using StyleSheet.create({})
// Render 6-page PDF structure (see Design spec)
// Key sections: cover page, performance vs benchmarks, full P&L, health events, environment summary, documents checklist

// Page 1 — Cover:
// FlockIQ brand colours (bg: #1A5C34 header), farm name, batch number, closure date
// Summary metrics: 6 KPI values in 2-column layout

// After generating: save buffer to Supabase Storage + create documents record
const buffer = await pdf(<ClosureReportDocument data={closureData} />).toBuffer();
const filePath = `${integrator_id}/${farmId}/${batchId}/batch_closure_report/${filename}`;
await supabase.storage.from('farm-documents').upload(filePath, buffer, { contentType: 'application/pdf' });
await supabase.from('documents').insert({ farm_id, batch_id, doc_type: 'batch_closure_report', file_path: filePath, ... });

// Return download URL
```

**Done when:** POST /api/batches/[id]/closure-report returns a signed URL to a valid PDF. PDF has all 6 pages with correct data. File also appears in Documents tab.

---

## SPRINT 4: TESTING CHECKLIST

For each gap, the following manual smoke tests must pass before marking done:

### Gap 1 (P&L) Tests:
- [ ] Add chick cost → banner total updates immediately
- [ ] Feed cost shows auto-synced from feed tab (after adding a feed purchase in feed tab)
- [ ] Add medicine entry with Tylosin (withdrawal=7) → P&L medicine cost updated; withdrawal tracker in Health tab also updated
- [ ] P&L waterfall chart renders with all bars; hover shows correct values
- [ ] Delete overhead entry → P&L total decreases

### Gap 2 (Sales) Tests:
- [ ] Add treatment with 10-day withdrawal → Sales tab blocks "Record Sale" immediately
- [ ] After clearance_date: block lifts (mock by setting system date)
- [ ] Record partial sale (50% of birds) → birds_alive halved; "50% sold" progress bar shown
- [ ] Record second partial sale (remaining 50%) → "Close batch" option appears
- [ ] Close batch → status = 'harvested'; batch appears in History tab

### Gap 3 (Treatment) Tests:
- [ ] Type "Enro" in medicine name → autocomplete shows Enrofloxacin with withdrawal=10 days
- [ ] Save treatment without cost → P&L medicine section not updated
- [ ] Save treatment WITH cost → P&L medicine section auto-updated
- [ ] WithdrawalTracker shows progress bar with correct % complete

### Gap 4 (Environment) Tests:
- [ ] Enter temp_afternoon = 36 → heat stress alert shown immediately in form
- [ ] Enter ammonia_ppm = 30 → red critical alert shown immediately
- [ ] Save log with environment data → Environment Trend Charts in Metrics tab show new data point
- [ ] Litter condition "very_wet" → estimated ammonia shows "~40+ ppm ⚠"

### Gap 5 (Benchmark) Tests:
- [ ] Select breed=Cobb430 + region=UP/Bihar Belt → table refreshes with filtered data
- [ ] Sample count < 10 → privacy guard shown (not benchmark data)
- [ ] AI insights load within 5 seconds; fallback template shown if API times out
- [ ] "View Detailed Benchmark →" from Portfolio Metrics navigates correctly

### Gap 6 (Risk Score) Tests:
- [ ] Create test alert with epicentre within 50km of a farm → risk score computed = proximity_score 3 + age + vaccination + biosecurity
- [ ] Farm detail page shows biosecurity_level selector; changing it recalculates risk score
- [ ] Batch Status Board shows risk badge on affected farm's card
- [ ] Risk detail page renders map with farm + alert markers

### Gap 7 (Documents) Tests:
- [ ] Upload a PDF → progress bar shows → document appears in correct category section
- [ ] Preview image document → lightbox opens
- [ ] Preview PDF document → in-browser PDF viewer opens
- [ ] Delete document → confirmation modal appears → after confirm, document gone from list
- [ ] Upload via Sales tab "Attach Invoice" → doc appears in Documents tab under Sale Invoice category
- [ ] Batch Closure Report generated → appears in Documents tab under batch_closure_report

---

*End of FlockIQ Gap Remediation Tasks v1.0*
*Companion: FlockIQ_Gap_Remediation_Design_Master_v1.md | FlockIQ_Gap_Remediation_Requirements_v1.md*
*Total tasks: 6 DB migration tasks + 9 API tasks + 14 UI tasks + 6 integration tasks = 35 tasks*
*Estimated total effort: ~120–160 engineering hours across all 7 gaps*
