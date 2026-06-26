-- ============================================================
-- PoultryPulse AI — Supabase Seed Data
-- Period  : 1 May 2025 to 26 May 2025
-- Districts: Gorakhpur, Deoria, Basti, Kushinagar, Maharajganj (UP)
-- Prices  : Farm gate (selling price from farm, NOT retail/mandi)
-- ============================================================

-- ┌─────────────────────────────────────────────────────────────┐
-- │  PART 1 — DDL ADDITIONS (run only if columns/tables        │
-- │  are not already present in your Supabase project)          │
-- └─────────────────────────────────────────────────────────────┘

-- ── 1a. Weather / Temperature observations table ────────────────
CREATE TABLE IF NOT EXISTS weather_observations (
    id              BIGSERIAL PRIMARY KEY,
    date            DATE        NOT NULL,
    district        TEXT        NOT NULL,
    temp_max_c      NUMERIC(5,1),
    temp_min_c      NUMERIC(5,1),
    rainfall_mm     NUMERIC(6,1) DEFAULT 0,
    humidity_pct    SMALLINT,
    heat_stress_flag SMALLINT    DEFAULT 0 CHECK (heat_stress_flag IN (0,1)),
    source          TEXT        DEFAULT 'IMD',
    station_ref     TEXT,
    scraped_at      TIMESTAMPTZ DEFAULT NOW(),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, district)
);
CREATE INDEX IF NOT EXISTS idx_weather_date_district
    ON weather_observations(district, date DESC);

-- ── 1b. NECC egg prices (zone-level, daily) ─────────────────────
CREATE TABLE IF NOT EXISTS necc_egg_prices (
    id              BIGSERIAL PRIMARY KEY,
    date            DATE        NOT NULL,
    zone            TEXT        NOT NULL,   -- 'NECC UP Zone'
    price_per_egg   NUMERIC(5,2) NOT NULL,  -- Rs/egg at production centre
    price_per_tray  NUMERIC(7,2),           -- 30 eggs
    price_per_peti  NUMERIC(8,2),           -- 210 eggs
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, zone)
);
CREATE INDEX IF NOT EXISTS idx_necc_egg_date
    ON necc_egg_prices(date DESC);

-- ── 1c. District-level egg prices ───────────────────────────────
CREATE TABLE IF NOT EXISTS egg_prices_district (
    id              BIGSERIAL PRIMARY KEY,
    date            DATE        NOT NULL,
    district        TEXT        NOT NULL,
    price_per_egg   NUMERIC(5,2) NOT NULL,  -- Rs/egg
    price_per_tray  NUMERIC(7,2),           -- 30 eggs
    source          TEXT        DEFAULT 'NECC',
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, district)
);
CREATE INDEX IF NOT EXISTS idx_egg_dist_date
    ON egg_prices_district(district, date DESC);

-- ── 1d. Add weather feature columns to raw_prices if missing ────
-- (Only needed if you want them denormalised; the join-view below
--  is the preferred approach. Run ALTER only once.)
-- ALTER TABLE raw_prices ADD COLUMN IF NOT EXISTS temp_max_c      NUMERIC(5,1);
-- ALTER TABLE raw_prices ADD COLUMN IF NOT EXISTS temp_min_c      NUMERIC(5,1);
-- ALTER TABLE raw_prices ADD COLUMN IF NOT EXISTS rainfall_mm     NUMERIC(6,1);
-- ALTER TABLE raw_prices ADD COLUMN IF NOT EXISTS heat_stress_flag SMALLINT DEFAULT 0;
-- ALTER TABLE raw_prices ADD COLUMN IF NOT EXISTS humidity_pct    SMALLINT;

-- ── 1e. Helper view — joined feature row for ML pipeline ─────────
-- Combines farm-gate price + same-day weather + egg price + lagged
-- commodity prices into one row ready for feature engineering.
CREATE OR REPLACE VIEW ml_feature_base AS
SELECT
    r.date,
    r.mandi_name                        AS district,
    r.broiler_price_per_kg              AS farm_gate_price,
    r.arrivals_kg,
    w.temp_max_c,
    w.temp_min_c,
    w.rainfall_mm,
    w.humidity_pct,
    w.heat_stress_flag,
    e.price_per_egg                     AS necc_egg_price,
    e.price_per_tray                    AS necc_egg_tray,
    m_maize.national_modal              AS maize_price,
    m_soy.national_modal                AS soy_price,
    m_palm.national_modal               AS palm_oil_price,
    -- lag-42 maize for feed_cost_ratio feature
    lag42.national_modal                AS maize_price_lag42,
    CASE WHEN lag42.national_modal > 0
         THEN r.broiler_price_per_kg / (lag42.national_modal / 100.0)
         ELSE NULL END                  AS feed_cost_ratio_lag42
FROM raw_prices r
LEFT JOIN weather_observations w
       ON w.date = r.date AND w.district = r.mandi_name
LEFT JOIN egg_prices_district e
       ON e.date = r.date AND e.district = r.mandi_name
LEFT JOIN commodity_national_modal m_maize
       ON m_maize.date = r.date AND m_maize.commodity = 'Maize'
LEFT JOIN commodity_national_modal m_soy
       ON m_soy.date   = r.date AND m_soy.commodity   = 'Soybean'
LEFT JOIN commodity_national_modal m_palm
       ON m_palm.date  = r.date AND m_palm.commodity   = 'Palm Oil'
LEFT JOIN commodity_national_modal lag42
       ON lag42.date   = r.date - INTERVAL '42 days'
       AND lag42.commodity = 'Maize'
ORDER BY r.date DESC, r.mandi_name;


-- ┌─────────────────────────────────────────────────────────────┐
-- │  PART 2 — SEED DATA (INSERT … ON CONFLICT DO NOTHING)      │
-- └─────────────────────────────────────────────────────────────┘

-- ── 2a. raw_prices  (farm-gate selling price, Rs/kg live weight) ─
INSERT INTO raw_prices (date, mandi_name, broiler_price_per_kg, arrivals_kg, source)
VALUES
  ('2025-05-01','Gorakhpur',145.9,88963,'farm_gate_direct'),
  ('2025-05-01','Deoria',142.35,48449,'farm_gate_direct'),
  ('2025-05-01','Basti',141.24,40684,'farm_gate_direct'),
  ('2025-05-01','Kushinagar',137.75,35245,'farm_gate_direct'),
  ('2025-05-01','Maharajganj',137.12,28713,'farm_gate_direct'),
  ('2025-05-02','Gorakhpur',146.94,90119,'farm_gate_direct'),
  ('2025-05-02','Deoria',143.8,43753,'farm_gate_direct'),
  ('2025-05-02','Basti',143.71,45200,'farm_gate_direct'),
  ('2025-05-02','Kushinagar',140.99,36947,'farm_gate_direct'),
  ('2025-05-02','Maharajganj',138.39,33436,'farm_gate_direct'),
  ('2025-05-03','Gorakhpur',148.24,92415,'farm_gate_direct'),
  ('2025-05-03','Deoria',144.7,50039,'farm_gate_direct'),
  ('2025-05-03','Basti',142.55,37713,'farm_gate_direct'),
  ('2025-05-03','Kushinagar',139.62,33615,'farm_gate_direct'),
  ('2025-05-03','Maharajganj',137.04,27753,'farm_gate_direct'),
  ('2025-05-04','Gorakhpur',144.39,90855,'farm_gate_direct'),
  ('2025-05-04','Deoria',140.46,52466,'farm_gate_direct'),
  ('2025-05-04','Basti',141.51,38737,'farm_gate_direct'),
  ('2025-05-04','Kushinagar',139.44,32494,'farm_gate_direct'),
  ('2025-05-04','Maharajganj',135.41,29461,'farm_gate_direct'),
  ('2025-05-05','Gorakhpur',145.12,78794,'farm_gate_direct'),
  ('2025-05-05','Deoria',142.73,46143,'farm_gate_direct'),
  ('2025-05-05','Basti',141.23,41113,'farm_gate_direct'),
  ('2025-05-05','Kushinagar',138.84,33007,'farm_gate_direct'),
  ('2025-05-05','Maharajganj',136.42,32191,'farm_gate_direct'),
  ('2025-05-06','Gorakhpur',145.58,87113,'farm_gate_direct'),
  ('2025-05-06','Deoria',143.68,48721,'farm_gate_direct'),
  ('2025-05-06','Basti',141.68,42385,'farm_gate_direct'),
  ('2025-05-06','Kushinagar',138.35,36292,'farm_gate_direct'),
  ('2025-05-06','Maharajganj',137.29,27288,'farm_gate_direct'),
  ('2025-05-07','Gorakhpur',145.6,85656,'farm_gate_direct'),
  ('2025-05-07','Deoria',143.53,50377,'farm_gate_direct'),
  ('2025-05-07','Basti',142.11,38644,'farm_gate_direct'),
  ('2025-05-07','Kushinagar',139.04,33095,'farm_gate_direct'),
  ('2025-05-07','Maharajganj',137.03,27023,'farm_gate_direct'),
  ('2025-05-08','Gorakhpur',147.51,77092,'farm_gate_direct'),
  ('2025-05-08','Deoria',143.83,47557,'farm_gate_direct'),
  ('2025-05-08','Basti',141.28,40027,'farm_gate_direct'),
  ('2025-05-08','Kushinagar',139.18,38292,'farm_gate_direct'),
  ('2025-05-08','Maharajganj',138.96,30050,'farm_gate_direct'),
  ('2025-05-09','Gorakhpur',148.02,81347,'farm_gate_direct'),
  ('2025-05-09','Deoria',144.29,42578,'farm_gate_direct'),
  ('2025-05-09','Basti',145.72,44851,'farm_gate_direct'),
  ('2025-05-09','Kushinagar',140.26,35776,'farm_gate_direct'),
  ('2025-05-09','Maharajganj',138.74,29726,'farm_gate_direct'),
  ('2025-05-10','Gorakhpur',149.06,92537,'farm_gate_direct'),
  ('2025-05-10','Deoria',145.21,42275,'farm_gate_direct'),
  ('2025-05-10','Basti',143.87,38224,'farm_gate_direct'),
  ('2025-05-10','Kushinagar',141.53,30858,'farm_gate_direct'),
  ('2025-05-10','Maharajganj',138.2,27872,'farm_gate_direct'),
  ('2025-05-11','Gorakhpur',146.23,91488,'farm_gate_direct'),
  ('2025-05-11','Deoria',144.9,53076,'farm_gate_direct'),
  ('2025-05-11','Basti',143.51,41151,'farm_gate_direct'),
  ('2025-05-11','Kushinagar',142.73,38286,'farm_gate_direct'),
  ('2025-05-11','Maharajganj',138.62,27086,'farm_gate_direct'),
  ('2025-05-12','Gorakhpur',145.84,86168,'farm_gate_direct'),
  ('2025-05-12','Deoria',141.57,44900,'farm_gate_direct'),
  ('2025-05-12','Basti',142.83,46628,'farm_gate_direct'),
  ('2025-05-12','Kushinagar',140.86,32525,'farm_gate_direct'),
  ('2025-05-12','Maharajganj',138.54,33577,'farm_gate_direct'),
  ('2025-05-13','Gorakhpur',147.32,82993,'farm_gate_direct'),
  ('2025-05-13','Deoria',143.95,45461,'farm_gate_direct'),
  ('2025-05-13','Basti',142.21,45965,'farm_gate_direct'),
  ('2025-05-13','Kushinagar',140.09,36550,'farm_gate_direct'),
  ('2025-05-13','Maharajganj',136.74,31056,'farm_gate_direct'),
  ('2025-05-14','Gorakhpur',147.62,84062,'farm_gate_direct'),
  ('2025-05-14','Deoria',144.46,53434,'farm_gate_direct'),
  ('2025-05-14','Basti',141.44,44980,'farm_gate_direct'),
  ('2025-05-14','Kushinagar',139.55,32615,'farm_gate_direct'),
  ('2025-05-14','Maharajganj',137.4,29226,'farm_gate_direct'),
  ('2025-05-15','Gorakhpur',146.46,84509,'farm_gate_direct'),
  ('2025-05-15','Deoria',144.93,45919,'farm_gate_direct'),
  ('2025-05-15','Basti',143.49,38452,'farm_gate_direct'),
  ('2025-05-15','Kushinagar',139.89,35473,'farm_gate_direct'),
  ('2025-05-15','Maharajganj',140.18,28908,'farm_gate_direct'),
  ('2025-05-16','Gorakhpur',151.03,88468,'farm_gate_direct'),
  ('2025-05-16','Deoria',147.15,50754,'farm_gate_direct'),
  ('2025-05-16','Basti',146.12,38888,'farm_gate_direct'),
  ('2025-05-16','Kushinagar',141.51,30801,'farm_gate_direct'),
  ('2025-05-16','Maharajganj',139.96,27700,'farm_gate_direct'),
  ('2025-05-17','Gorakhpur',148.48,91638,'farm_gate_direct'),
  ('2025-05-17','Deoria',146.62,42303,'farm_gate_direct'),
  ('2025-05-17','Basti',145.99,38030,'farm_gate_direct'),
  ('2025-05-17','Kushinagar',142.22,33901,'farm_gate_direct'),
  ('2025-05-17','Maharajganj',139.24,27776,'farm_gate_direct'),
  ('2025-05-18','Gorakhpur',147.8,90850,'farm_gate_direct'),
  ('2025-05-18','Deoria',144.87,53285,'farm_gate_direct'),
  ('2025-05-18','Basti',143.96,42496,'farm_gate_direct'),
  ('2025-05-18','Kushinagar',140.95,33911,'farm_gate_direct'),
  ('2025-05-18','Maharajganj',137.98,26912,'farm_gate_direct'),
  ('2025-05-19','Gorakhpur',148.68,92500,'farm_gate_direct'),
  ('2025-05-19','Deoria',145.01,45977,'farm_gate_direct'),
  ('2025-05-19','Basti',144.63,41593,'farm_gate_direct'),
  ('2025-05-19','Kushinagar',140.72,35591,'farm_gate_direct'),
  ('2025-05-19','Maharajganj',138.65,30554,'farm_gate_direct'),
  ('2025-05-20','Gorakhpur',146.71,75913,'farm_gate_direct'),
  ('2025-05-20','Deoria',145.4,47408,'farm_gate_direct'),
  ('2025-05-20','Basti',142.9,41318,'farm_gate_direct'),
  ('2025-05-20','Kushinagar',139.85,35785,'farm_gate_direct'),
  ('2025-05-20','Maharajganj',138.64,30578,'farm_gate_direct'),
  ('2025-05-21','Gorakhpur',147.68,85427,'farm_gate_direct'),
  ('2025-05-21','Deoria',144.65,49341,'farm_gate_direct'),
  ('2025-05-21','Basti',144.17,42719,'farm_gate_direct'),
  ('2025-05-21','Kushinagar',139.28,38687,'farm_gate_direct'),
  ('2025-05-21','Maharajganj',137.13,27980,'farm_gate_direct'),
  ('2025-05-22','Gorakhpur',148.93,85096,'farm_gate_direct'),
  ('2025-05-22','Deoria',145.36,45730,'farm_gate_direct'),
  ('2025-05-22','Basti',144.55,43249,'farm_gate_direct'),
  ('2025-05-22','Kushinagar',140.25,33901,'farm_gate_direct'),
  ('2025-05-22','Maharajganj',139.74,30257,'farm_gate_direct'),
  ('2025-05-23','Gorakhpur',148.3,81176,'farm_gate_direct'),
  ('2025-05-23','Deoria',146.38,46708,'farm_gate_direct'),
  ('2025-05-23','Basti',144.46,41977,'farm_gate_direct'),
  ('2025-05-23','Kushinagar',140.15,33343,'farm_gate_direct'),
  ('2025-05-23','Maharajganj',140.26,26540,'farm_gate_direct'),
  ('2025-05-24','Gorakhpur',149.54,93373,'farm_gate_direct'),
  ('2025-05-24','Deoria',147.46,52930,'farm_gate_direct'),
  ('2025-05-24','Basti',145.87,43736,'farm_gate_direct'),
  ('2025-05-24','Kushinagar',143.05,33060,'farm_gate_direct'),
  ('2025-05-24','Maharajganj',140.79,27789,'farm_gate_direct'),
  ('2025-05-25','Gorakhpur',147.39,92061,'farm_gate_direct'),
  ('2025-05-25','Deoria',145.28,44571,'farm_gate_direct'),
  ('2025-05-25','Basti',143.7,37675,'farm_gate_direct'),
  ('2025-05-25','Kushinagar',142.34,34030,'farm_gate_direct'),
  ('2025-05-25','Maharajganj',138.35,28305,'farm_gate_direct'),
  ('2025-05-26','Gorakhpur',148.21,86259,'farm_gate_direct'),
  ('2025-05-26','Deoria',143.98,43068,'farm_gate_direct'),
  ('2025-05-26','Basti',144.86,40035,'farm_gate_direct'),
  ('2025-05-26','Kushinagar',141.45,34249,'farm_gate_direct'),
  ('2025-05-26','Maharajganj',138.98,30631,'farm_gate_direct')
ON CONFLICT (date, mandi_name) DO NOTHING;

-- ── 2b. weather_observations (IMD daily, per district) ──────────
INSERT INTO weather_observations
  (date, district, temp_max_c, temp_min_c, rainfall_mm, humidity_pct, heat_stress_flag, source, station_ref)
VALUES
  ('2025-05-01','Gorakhpur',36.5,24.9,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-01','Deoria',36.8,25.0,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-01','Basti',36.3,24.8,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-01','Kushinagar',36.9,25.1,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-01','Maharajganj',36.4,24.8,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-02','Gorakhpur',37.6,26.1,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-02','Deoria',37.9,26.2,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-02','Basti',37.4,26.0,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-02','Kushinagar',38.0,26.3,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-02','Maharajganj',37.5,26.1,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-03','Gorakhpur',37.0,25.4,0.0,43,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-03','Deoria',37.3,25.5,0.0,43,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-03','Basti',36.8,25.3,0.0,43,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-03','Kushinagar',37.4,25.6,0.0,43,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-03','Maharajganj',36.9,25.3,0.0,43,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-04','Gorakhpur',36.4,25.3,0.0,47,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-04','Deoria',36.7,25.4,0.0,47,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-04','Basti',36.2,25.2,0.0,47,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-04','Kushinagar',36.8,25.5,0.0,47,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-04','Maharajganj',36.3,25.2,0.0,47,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-05','Gorakhpur',36.8,25.8,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-05','Deoria',37.1,25.9,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-05','Basti',36.6,25.7,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-05','Kushinagar',37.2,26.0,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-05','Maharajganj',36.7,25.8,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-06','Gorakhpur',37.5,24.4,0.0,43,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-06','Deoria',37.8,24.5,0.0,43,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-06','Basti',37.3,24.3,0.0,43,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-06','Kushinagar',37.9,24.6,0.0,43,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-06','Maharajganj',37.4,24.3,0.0,43,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-07','Gorakhpur',36.6,25.7,0.0,45,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-07','Deoria',36.9,25.8,0.0,45,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-07','Basti',36.4,25.6,0.0,45,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-07','Kushinagar',37.0,25.9,0.0,45,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-07','Maharajganj',36.5,25.6,0.0,45,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-08','Gorakhpur',36.2,26.7,1.9,53,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-08','Deoria',36.5,26.8,1.9,53,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-08','Basti',36.0,26.6,1.9,53,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-08','Kushinagar',36.6,26.9,1.9,53,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-08','Maharajganj',36.1,26.6,1.9,53,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-09','Gorakhpur',37.3,25.3,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-09','Deoria',37.6,25.4,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-09','Basti',37.1,25.2,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-09','Kushinagar',37.7,25.5,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-09','Maharajganj',37.2,25.2,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-10','Gorakhpur',36.4,26.2,0.0,48,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-10','Deoria',36.7,26.3,0.0,48,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-10','Basti',36.2,26.1,0.0,48,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-10','Kushinagar',36.8,26.4,0.0,48,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-10','Maharajganj',36.3,26.1,0.0,48,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-11','Gorakhpur',38.1,26.7,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-11','Deoria',38.4,26.8,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-11','Basti',37.9,26.6,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-11','Kushinagar',38.5,26.9,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-11','Maharajganj',38.0,26.6,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-12','Gorakhpur',38.2,26.8,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-12','Deoria',38.5,26.9,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-12','Basti',38.0,26.7,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-12','Kushinagar',38.6,27.0,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-12','Maharajganj',38.1,26.8,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-13','Gorakhpur',39.4,26.5,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-13','Deoria',39.7,26.6,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-13','Basti',39.2,26.4,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-13','Kushinagar',39.8,26.7,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-13','Maharajganj',39.3,26.4,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-14','Gorakhpur',37.7,28.1,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-14','Deoria',38.0,28.2,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-14','Basti',37.5,28.0,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-14','Kushinagar',38.1,28.3,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-14','Maharajganj',37.6,28.1,0.0,46,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-15','Gorakhpur',38.9,28.1,1.3,57,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-15','Deoria',39.2,28.2,1.3,57,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-15','Basti',38.7,28.0,1.3,57,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-15','Kushinagar',39.3,28.3,1.3,57,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-15','Maharajganj',38.8,28.1,1.3,57,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-16','Gorakhpur',38.1,27.3,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-16','Deoria',38.4,27.4,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-16','Basti',37.9,27.2,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-16','Kushinagar',38.5,27.5,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-16','Maharajganj',38.0,27.2,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-17','Gorakhpur',38.3,27.1,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-17','Deoria',38.6,27.2,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-17','Basti',38.1,27.0,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-17','Kushinagar',38.7,27.3,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-17','Maharajganj',38.2,27.1,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-18','Gorakhpur',37.9,27.7,0.0,48,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-18','Deoria',38.2,27.8,0.0,48,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-18','Basti',37.7,27.6,0.0,48,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-18','Kushinagar',38.3,27.9,0.0,48,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-18','Maharajganj',37.8,27.6,0.0,48,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-19','Gorakhpur',39.3,27.0,0.0,43,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-19','Deoria',39.6,27.1,0.0,43,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-19','Basti',39.1,26.9,0.0,43,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-19','Kushinagar',39.7,27.2,0.0,43,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-19','Maharajganj',39.2,26.9,0.0,43,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-20','Gorakhpur',37.0,26.1,6.5,55,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-20','Deoria',37.3,26.2,6.5,55,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-20','Basti',36.8,26.0,6.5,55,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-20','Kushinagar',37.4,26.3,6.5,55,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-20','Maharajganj',36.9,26.1,6.5,55,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-21','Gorakhpur',38.5,27.9,6.2,56,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-21','Deoria',38.8,28.0,6.2,56,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-21','Basti',38.3,27.8,6.2,56,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-21','Kushinagar',38.9,28.1,6.2,56,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-21','Maharajganj',38.4,27.8,6.2,56,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-22','Gorakhpur',39.3,27.1,1.6,57,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-22','Deoria',39.6,27.2,1.6,57,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-22','Basti',39.1,27.0,1.6,57,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-22','Kushinagar',39.7,27.3,1.6,57,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-22','Maharajganj',39.2,27.1,1.6,57,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-23','Gorakhpur',38.6,26.8,0.0,47,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-23','Deoria',38.9,26.9,0.0,47,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-23','Basti',38.4,26.7,0.0,47,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-23','Kushinagar',39.0,27.0,0.0,47,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-23','Maharajganj',38.5,26.8,0.0,47,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-24','Gorakhpur',39.0,27.1,2.6,56,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-24','Deoria',39.3,27.2,2.6,56,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-24','Basti',38.8,27.0,2.6,56,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-24','Kushinagar',39.4,27.3,2.6,56,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-24','Maharajganj',38.9,27.1,2.6,56,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-25','Gorakhpur',39.0,27.6,0.9,52,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-25','Deoria',39.3,27.8,0.9,52,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-25','Basti',38.8,27.5,0.9,52,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-25','Kushinagar',39.4,27.8,0.9,52,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-25','Maharajganj',38.9,27.6,0.9,52,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-26','Gorakhpur',38.6,27.9,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-26','Deoria',38.9,28.0,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-26','Basti',38.4,27.8,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-26','Kushinagar',39.0,28.1,0.0,44,0,'IMD','imd_gorakhpur_region'),
  ('2025-05-26','Maharajganj',38.5,27.8,0.0,44,0,'IMD','imd_gorakhpur_region')
ON CONFLICT (date, district) DO NOTHING;

-- ── 2c. commodity_national_modal (NCDEX/AgMarkNet daily) ────────
INSERT INTO commodity_national_modal (date, commodity, national_modal, sample_size, total_arrivals, source, computed_at)
VALUES
  ('2025-05-01','Maize',2388.95,45,NULL,'NCDEX','2025-05-01T06:00:00+05:30'),
  ('2025-05-01','Soybean',4664.51,30,NULL,'NCDEX','2025-05-01T06:00:00+05:30'),
  ('2025-05-01','Palm Oil',956.65,20,NULL,'MCX/NCDEX','2025-05-01T06:00:00+05:30'),
  ('2025-05-02','Maize',2372.6,45,NULL,'NCDEX','2025-05-02T06:00:00+05:30'),
  ('2025-05-02','Soybean',4671.23,30,NULL,'NCDEX','2025-05-02T06:00:00+05:30'),
  ('2025-05-02','Palm Oil',964.82,20,NULL,'MCX/NCDEX','2025-05-02T06:00:00+05:30'),
  ('2025-05-03','Maize',2405.86,45,NULL,'NCDEX','2025-05-03T06:00:00+05:30'),
  ('2025-05-03','Soybean',4682.94,30,NULL,'NCDEX','2025-05-03T06:00:00+05:30'),
  ('2025-05-03','Palm Oil',960.72,20,NULL,'MCX/NCDEX','2025-05-03T06:00:00+05:30'),
  ('2025-05-04','Maize',2404.5,45,NULL,'NCDEX','2025-05-04T06:00:00+05:30'),
  ('2025-05-04','Soybean',4661.05,30,NULL,'NCDEX','2025-05-04T06:00:00+05:30'),
  ('2025-05-04','Palm Oil',934.41,20,NULL,'MCX/NCDEX','2025-05-04T06:00:00+05:30'),
  ('2025-05-05','Maize',2411.64,45,NULL,'NCDEX','2025-05-05T06:00:00+05:30'),
  ('2025-05-05','Soybean',4724.06,30,NULL,'NCDEX','2025-05-05T06:00:00+05:30'),
  ('2025-05-05','Palm Oil',949.66,20,NULL,'MCX/NCDEX','2025-05-05T06:00:00+05:30'),
  ('2025-05-06','Maize',2395.82,45,NULL,'NCDEX','2025-05-06T06:00:00+05:30'),
  ('2025-05-06','Soybean',4685.12,30,NULL,'NCDEX','2025-05-06T06:00:00+05:30'),
  ('2025-05-06','Palm Oil',948.46,20,NULL,'MCX/NCDEX','2025-05-06T06:00:00+05:30'),
  ('2025-05-07','Maize',2410.89,45,NULL,'NCDEX','2025-05-07T06:00:00+05:30'),
  ('2025-05-07','Soybean',4682.3,30,NULL,'NCDEX','2025-05-07T06:00:00+05:30'),
  ('2025-05-07','Palm Oil',945.42,20,NULL,'MCX/NCDEX','2025-05-07T06:00:00+05:30'),
  ('2025-05-08','Maize',2409.92,45,NULL,'NCDEX','2025-05-08T06:00:00+05:30'),
  ('2025-05-08','Soybean',4687.44,30,NULL,'NCDEX','2025-05-08T06:00:00+05:30'),
  ('2025-05-08','Palm Oil',945.41,20,NULL,'MCX/NCDEX','2025-05-08T06:00:00+05:30'),
  ('2025-05-09','Maize',2421.91,45,NULL,'NCDEX','2025-05-09T06:00:00+05:30'),
  ('2025-05-09','Soybean',4702.25,30,NULL,'NCDEX','2025-05-09T06:00:00+05:30'),
  ('2025-05-09','Palm Oil',950.71,20,NULL,'MCX/NCDEX','2025-05-09T06:00:00+05:30'),
  ('2025-05-10','Maize',2417.64,45,NULL,'NCDEX','2025-05-10T06:00:00+05:30'),
  ('2025-05-10','Soybean',4726.46,30,NULL,'NCDEX','2025-05-10T06:00:00+05:30'),
  ('2025-05-10','Palm Oil',963.72,20,NULL,'MCX/NCDEX','2025-05-10T06:00:00+05:30'),
  ('2025-05-11','Maize',2413.19,45,NULL,'NCDEX','2025-05-11T06:00:00+05:30'),
  ('2025-05-11','Soybean',4672.2,30,NULL,'NCDEX','2025-05-11T06:00:00+05:30'),
  ('2025-05-11','Palm Oil',965.45,20,NULL,'MCX/NCDEX','2025-05-11T06:00:00+05:30'),
  ('2025-05-12','Maize',2399.0,45,NULL,'NCDEX','2025-05-12T06:00:00+05:30'),
  ('2025-05-12','Soybean',4758.51,30,NULL,'NCDEX','2025-05-12T06:00:00+05:30'),
  ('2025-05-12','Palm Oil',964.52,20,NULL,'MCX/NCDEX','2025-05-12T06:00:00+05:30'),
  ('2025-05-13','Maize',2428.84,45,NULL,'NCDEX','2025-05-13T06:00:00+05:30'),
  ('2025-05-13','Soybean',4738.8,30,NULL,'NCDEX','2025-05-13T06:00:00+05:30'),
  ('2025-05-13','Palm Oil',952.08,20,NULL,'MCX/NCDEX','2025-05-13T06:00:00+05:30'),
  ('2025-05-14','Maize',2413.18,45,NULL,'NCDEX','2025-05-14T06:00:00+05:30'),
  ('2025-05-14','Soybean',4698.59,30,NULL,'NCDEX','2025-05-14T06:00:00+05:30'),
  ('2025-05-14','Palm Oil',956.38,20,NULL,'MCX/NCDEX','2025-05-14T06:00:00+05:30'),
  ('2025-05-15','Maize',2442.64,45,NULL,'NCDEX','2025-05-15T06:00:00+05:30'),
  ('2025-05-15','Soybean',4732.26,30,NULL,'NCDEX','2025-05-15T06:00:00+05:30'),
  ('2025-05-15','Palm Oil',959.7,20,NULL,'MCX/NCDEX','2025-05-15T06:00:00+05:30'),
  ('2025-05-16','Maize',2444.98,45,NULL,'NCDEX','2025-05-16T06:00:00+05:30'),
  ('2025-05-16','Soybean',4739.87,30,NULL,'NCDEX','2025-05-16T06:00:00+05:30'),
  ('2025-05-16','Palm Oil',967.82,20,NULL,'MCX/NCDEX','2025-05-16T06:00:00+05:30'),
  ('2025-05-17','Maize',2471.73,45,NULL,'NCDEX','2025-05-17T06:00:00+05:30'),
  ('2025-05-17','Soybean',4782.69,30,NULL,'NCDEX','2025-05-17T06:00:00+05:30'),
  ('2025-05-17','Palm Oil',975.04,20,NULL,'MCX/NCDEX','2025-05-17T06:00:00+05:30'),
  ('2025-05-18','Maize',2450.94,45,NULL,'NCDEX','2025-05-18T06:00:00+05:30'),
  ('2025-05-18','Soybean',4727.56,30,NULL,'NCDEX','2025-05-18T06:00:00+05:30'),
  ('2025-05-18','Palm Oil',973.69,20,NULL,'MCX/NCDEX','2025-05-18T06:00:00+05:30'),
  ('2025-05-19','Maize',2402.88,45,NULL,'NCDEX','2025-05-19T06:00:00+05:30'),
  ('2025-05-19','Soybean',4720.06,30,NULL,'NCDEX','2025-05-19T06:00:00+05:30'),
  ('2025-05-19','Palm Oil',966.55,20,NULL,'MCX/NCDEX','2025-05-19T06:00:00+05:30'),
  ('2025-05-20','Maize',2435.59,45,NULL,'NCDEX','2025-05-20T06:00:00+05:30'),
  ('2025-05-20','Soybean',4755.5,30,NULL,'NCDEX','2025-05-20T06:00:00+05:30'),
  ('2025-05-20','Palm Oil',963.81,20,NULL,'MCX/NCDEX','2025-05-20T06:00:00+05:30'),
  ('2025-05-21','Maize',2438.69,45,NULL,'NCDEX','2025-05-21T06:00:00+05:30'),
  ('2025-05-21','Soybean',4746.77,30,NULL,'NCDEX','2025-05-21T06:00:00+05:30'),
  ('2025-05-21','Palm Oil',948.75,20,NULL,'MCX/NCDEX','2025-05-21T06:00:00+05:30'),
  ('2025-05-22','Maize',2438.73,45,NULL,'NCDEX','2025-05-22T06:00:00+05:30'),
  ('2025-05-22','Soybean',4722.63,30,NULL,'NCDEX','2025-05-22T06:00:00+05:30'),
  ('2025-05-22','Palm Oil',970.86,20,NULL,'MCX/NCDEX','2025-05-22T06:00:00+05:30'),
  ('2025-05-23','Maize',2442.95,45,NULL,'NCDEX','2025-05-23T06:00:00+05:30'),
  ('2025-05-23','Soybean',4763.37,30,NULL,'NCDEX','2025-05-23T06:00:00+05:30'),
  ('2025-05-23','Palm Oil',972.41,20,NULL,'MCX/NCDEX','2025-05-23T06:00:00+05:30'),
  ('2025-05-24','Maize',2434.47,45,NULL,'NCDEX','2025-05-24T06:00:00+05:30'),
  ('2025-05-24','Soybean',4754.26,30,NULL,'NCDEX','2025-05-24T06:00:00+05:30'),
  ('2025-05-24','Palm Oil',958.33,20,NULL,'MCX/NCDEX','2025-05-24T06:00:00+05:30'),
  ('2025-05-25','Maize',2455.48,45,NULL,'NCDEX','2025-05-25T06:00:00+05:30'),
  ('2025-05-25','Soybean',4763.03,30,NULL,'NCDEX','2025-05-25T06:00:00+05:30'),
  ('2025-05-25','Palm Oil',962.95,20,NULL,'MCX/NCDEX','2025-05-25T06:00:00+05:30'),
  ('2025-05-26','Maize',2441.13,45,NULL,'NCDEX','2025-05-26T06:00:00+05:30'),
  ('2025-05-26','Soybean',4768.55,30,NULL,'NCDEX','2025-05-26T06:00:00+05:30'),
  ('2025-05-26','Palm Oil',979.31,20,NULL,'MCX/NCDEX','2025-05-26T06:00:00+05:30')
ON CONFLICT (date, commodity) DO NOTHING;

-- ── 2d. necc_egg_prices (UP zone, Rs/egg production-centre rate) ─
INSERT INTO necc_egg_prices (date, zone, price_per_egg, price_per_tray, price_per_peti, published_at)
VALUES
  ('2025-05-01','NECC UP Zone',4.88,146.4,1024.8,'2025-05-01T08:00:00+05:30'),
  ('2025-05-02','NECC UP Zone',4.8,144.0,1008.0,'2025-05-02T08:00:00+05:30'),
  ('2025-05-03','NECC UP Zone',4.83,144.9,1014.3,'2025-05-03T08:00:00+05:30'),
  ('2025-05-04','NECC UP Zone',4.81,144.3,1010.1,'2025-05-04T08:00:00+05:30'),
  ('2025-05-05','NECC UP Zone',4.83,144.9,1014.3,'2025-05-05T08:00:00+05:30'),
  ('2025-05-06','NECC UP Zone',4.99,149.7,1047.9,'2025-05-06T08:00:00+05:30'),
  ('2025-05-07','NECC UP Zone',4.93,147.9,1035.3,'2025-05-07T08:00:00+05:30'),
  ('2025-05-08','NECC UP Zone',4.88,146.4,1024.8,'2025-05-08T08:00:00+05:30'),
  ('2025-05-09','NECC UP Zone',4.91,147.3,1031.1,'2025-05-09T08:00:00+05:30'),
  ('2025-05-10','NECC UP Zone',5.01,150.3,1052.1,'2025-05-10T08:00:00+05:30'),
  ('2025-05-11','NECC UP Zone',4.98,149.4,1045.8,'2025-05-11T08:00:00+05:30'),
  ('2025-05-12','NECC UP Zone',5.05,151.5,1060.5,'2025-05-12T08:00:00+05:30'),
  ('2025-05-13','NECC UP Zone',4.99,149.7,1047.9,'2025-05-13T08:00:00+05:30'),
  ('2025-05-14','NECC UP Zone',5.07,152.1,1064.7,'2025-05-14T08:00:00+05:30'),
  ('2025-05-15','NECC UP Zone',5.14,154.2,1079.4,'2025-05-15T08:00:00+05:30'),
  ('2025-05-16','NECC UP Zone',5.08,152.4,1066.8,'2025-05-16T08:00:00+05:30'),
  ('2025-05-17','NECC UP Zone',5.06,151.8,1062.6,'2025-05-17T08:00:00+05:30'),
  ('2025-05-18','NECC UP Zone',5.15,154.5,1081.5,'2025-05-18T08:00:00+05:30'),
  ('2025-05-19','NECC UP Zone',5.15,154.5,1081.5,'2025-05-19T08:00:00+05:30'),
  ('2025-05-20','NECC UP Zone',5.13,153.9,1077.3,'2025-05-20T08:00:00+05:30'),
  ('2025-05-21','NECC UP Zone',5.14,154.2,1079.4,'2025-05-21T08:00:00+05:30'),
  ('2025-05-22','NECC UP Zone',5.13,153.9,1077.3,'2025-05-22T08:00:00+05:30'),
  ('2025-05-23','NECC UP Zone',5.28,158.4,1108.8,'2025-05-23T08:00:00+05:30'),
  ('2025-05-24','NECC UP Zone',5.25,157.5,1102.5,'2025-05-24T08:00:00+05:30'),
  ('2025-05-25','NECC UP Zone',5.25,157.5,1102.5,'2025-05-25T08:00:00+05:30'),
  ('2025-05-26','NECC UP Zone',5.18,155.4,1087.8,'2025-05-26T08:00:00+05:30')
ON CONFLICT (date, zone) DO NOTHING;

-- ── 2e. egg_prices_district (per district, from NECC zone ±small diff) ─
INSERT INTO egg_prices_district (date, district, price_per_egg, price_per_tray, source, published_at)
VALUES
  ('2025-05-01','Gorakhpur',4.92,147.6,'NECC','2025-05-01T08:30:00+05:30'),
  ('2025-05-01','Deoria',4.89,146.7,'NECC','2025-05-01T08:30:00+05:30'),
  ('2025-05-01','Basti',4.88,146.4,'NECC','2025-05-01T08:30:00+05:30'),
  ('2025-05-01','Kushinagar',4.87,146.1,'NECC','2025-05-01T08:30:00+05:30'),
  ('2025-05-01','Maharajganj',4.86,145.8,'NECC','2025-05-01T08:30:00+05:30'),
  ('2025-05-02','Gorakhpur',4.88,146.4,'NECC','2025-05-02T08:30:00+05:30'),
  ('2025-05-02','Deoria',4.85,145.5,'NECC','2025-05-02T08:30:00+05:30'),
  ('2025-05-02','Basti',4.84,145.2,'NECC','2025-05-02T08:30:00+05:30'),
  ('2025-05-02','Kushinagar',4.83,144.9,'NECC','2025-05-02T08:30:00+05:30'),
  ('2025-05-02','Maharajganj',4.82,144.6,'NECC','2025-05-02T08:30:00+05:30'),
  ('2025-05-03','Gorakhpur',4.8,144.0,'NECC','2025-05-03T08:30:00+05:30'),
  ('2025-05-03','Deoria',4.77,143.1,'NECC','2025-05-03T08:30:00+05:30'),
  ('2025-05-03','Basti',4.76,142.8,'NECC','2025-05-03T08:30:00+05:30'),
  ('2025-05-03','Kushinagar',4.75,142.5,'NECC','2025-05-03T08:30:00+05:30'),
  ('2025-05-03','Maharajganj',4.74,142.2,'NECC','2025-05-03T08:30:00+05:30'),
  ('2025-05-04','Gorakhpur',5.01,150.3,'NECC','2025-05-04T08:30:00+05:30'),
  ('2025-05-04','Deoria',4.98,149.4,'NECC','2025-05-04T08:30:00+05:30'),
  ('2025-05-04','Basti',4.97,149.1,'NECC','2025-05-04T08:30:00+05:30'),
  ('2025-05-04','Kushinagar',4.96,148.8,'NECC','2025-05-04T08:30:00+05:30'),
  ('2025-05-04','Maharajganj',4.95,148.5,'NECC','2025-05-04T08:30:00+05:30'),
  ('2025-05-05','Gorakhpur',4.88,146.4,'NECC','2025-05-05T08:30:00+05:30'),
  ('2025-05-05','Deoria',4.85,145.5,'NECC','2025-05-05T08:30:00+05:30'),
  ('2025-05-05','Basti',4.84,145.2,'NECC','2025-05-05T08:30:00+05:30'),
  ('2025-05-05','Kushinagar',4.83,144.9,'NECC','2025-05-05T08:30:00+05:30'),
  ('2025-05-05','Maharajganj',4.82,144.6,'NECC','2025-05-05T08:30:00+05:30'),
  ('2025-05-06','Gorakhpur',4.92,147.6,'NECC','2025-05-06T08:30:00+05:30'),
  ('2025-05-06','Deoria',4.89,146.7,'NECC','2025-05-06T08:30:00+05:30'),
  ('2025-05-06','Basti',4.88,146.4,'NECC','2025-05-06T08:30:00+05:30'),
  ('2025-05-06','Kushinagar',4.87,146.1,'NECC','2025-05-06T08:30:00+05:30'),
  ('2025-05-06','Maharajganj',4.86,145.8,'NECC','2025-05-06T08:30:00+05:30'),
  ('2025-05-07','Gorakhpur',4.97,149.1,'NECC','2025-05-07T08:30:00+05:30'),
  ('2025-05-07','Deoria',4.94,148.2,'NECC','2025-05-07T08:30:00+05:30'),
  ('2025-05-07','Basti',4.93,147.9,'NECC','2025-05-07T08:30:00+05:30'),
  ('2025-05-07','Kushinagar',4.92,147.6,'NECC','2025-05-07T08:30:00+05:30'),
  ('2025-05-07','Maharajganj',4.91,147.3,'NECC','2025-05-07T08:30:00+05:30'),
  ('2025-05-08','Gorakhpur',4.94,148.2,'NECC','2025-05-08T08:30:00+05:30'),
  ('2025-05-08','Deoria',4.91,147.3,'NECC','2025-05-08T08:30:00+05:30'),
  ('2025-05-08','Basti',4.9,147.0,'NECC','2025-05-08T08:30:00+05:30'),
  ('2025-05-08','Kushinagar',4.89,146.7,'NECC','2025-05-08T08:30:00+05:30'),
  ('2025-05-08','Maharajganj',4.88,146.4,'NECC','2025-05-08T08:30:00+05:30'),
  ('2025-05-09','Gorakhpur',4.97,149.1,'NECC','2025-05-09T08:30:00+05:30'),
  ('2025-05-09','Deoria',4.94,148.2,'NECC','2025-05-09T08:30:00+05:30'),
  ('2025-05-09','Basti',4.93,147.9,'NECC','2025-05-09T08:30:00+05:30'),
  ('2025-05-09','Kushinagar',4.92,147.6,'NECC','2025-05-09T08:30:00+05:30'),
  ('2025-05-09','Maharajganj',4.91,147.3,'NECC','2025-05-09T08:30:00+05:30'),
  ('2025-05-10','Gorakhpur',4.91,147.3,'NECC','2025-05-10T08:30:00+05:30'),
  ('2025-05-10','Deoria',4.88,146.4,'NECC','2025-05-10T08:30:00+05:30'),
  ('2025-05-10','Basti',4.87,146.1,'NECC','2025-05-10T08:30:00+05:30'),
  ('2025-05-10','Kushinagar',4.86,145.8,'NECC','2025-05-10T08:30:00+05:30'),
  ('2025-05-10','Maharajganj',4.85,145.5,'NECC','2025-05-10T08:30:00+05:30'),
  ('2025-05-11','Gorakhpur',4.94,148.2,'NECC','2025-05-11T08:30:00+05:30'),
  ('2025-05-11','Deoria',4.91,147.3,'NECC','2025-05-11T08:30:00+05:30'),
  ('2025-05-11','Basti',4.9,147.0,'NECC','2025-05-11T08:30:00+05:30'),
  ('2025-05-11','Kushinagar',4.89,146.7,'NECC','2025-05-11T08:30:00+05:30'),
  ('2025-05-11','Maharajganj',4.88,146.4,'NECC','2025-05-11T08:30:00+05:30'),
  ('2025-05-12','Gorakhpur',5.07,152.1,'NECC','2025-05-12T08:30:00+05:30'),
  ('2025-05-12','Deoria',5.04,151.2,'NECC','2025-05-12T08:30:00+05:30'),
  ('2025-05-12','Basti',5.03,150.9,'NECC','2025-05-12T08:30:00+05:30'),
  ('2025-05-12','Kushinagar',5.02,150.6,'NECC','2025-05-12T08:30:00+05:30'),
  ('2025-05-12','Maharajganj',5.01,150.3,'NECC','2025-05-12T08:30:00+05:30'),
  ('2025-05-13','Gorakhpur',5.06,151.8,'NECC','2025-05-13T08:30:00+05:30'),
  ('2025-05-13','Deoria',5.03,150.9,'NECC','2025-05-13T08:30:00+05:30'),
  ('2025-05-13','Basti',5.02,150.6,'NECC','2025-05-13T08:30:00+05:30'),
  ('2025-05-13','Kushinagar',5.01,150.3,'NECC','2025-05-13T08:30:00+05:30'),
  ('2025-05-13','Maharajganj',5.0,150.0,'NECC','2025-05-13T08:30:00+05:30'),
  ('2025-05-14','Gorakhpur',4.86,145.8,'NECC','2025-05-14T08:30:00+05:30'),
  ('2025-05-14','Deoria',4.83,144.9,'NECC','2025-05-14T08:30:00+05:30'),
  ('2025-05-14','Basti',4.82,144.6,'NECC','2025-05-14T08:30:00+05:30'),
  ('2025-05-14','Kushinagar',4.81,144.3,'NECC','2025-05-14T08:30:00+05:30'),
  ('2025-05-14','Maharajganj',4.8,144.0,'NECC','2025-05-14T08:30:00+05:30'),
  ('2025-05-15','Gorakhpur',5.01,150.3,'NECC','2025-05-15T08:30:00+05:30'),
  ('2025-05-15','Deoria',4.98,149.4,'NECC','2025-05-15T08:30:00+05:30'),
  ('2025-05-15','Basti',4.97,149.1,'NECC','2025-05-15T08:30:00+05:30'),
  ('2025-05-15','Kushinagar',4.96,148.8,'NECC','2025-05-15T08:30:00+05:30'),
  ('2025-05-15','Maharajganj',4.95,148.5,'NECC','2025-05-15T08:30:00+05:30'),
  ('2025-05-16','Gorakhpur',5.06,151.8,'NECC','2025-05-16T08:30:00+05:30'),
  ('2025-05-16','Deoria',5.03,150.9,'NECC','2025-05-16T08:30:00+05:30'),
  ('2025-05-16','Basti',5.02,150.6,'NECC','2025-05-16T08:30:00+05:30'),
  ('2025-05-16','Kushinagar',5.01,150.3,'NECC','2025-05-16T08:30:00+05:30'),
  ('2025-05-16','Maharajganj',5.0,150.0,'NECC','2025-05-16T08:30:00+05:30'),
  ('2025-05-17','Gorakhpur',5.15,154.5,'NECC','2025-05-17T08:30:00+05:30'),
  ('2025-05-17','Deoria',5.12,153.6,'NECC','2025-05-17T08:30:00+05:30'),
  ('2025-05-17','Basti',5.11,153.3,'NECC','2025-05-17T08:30:00+05:30'),
  ('2025-05-17','Kushinagar',5.1,153.0,'NECC','2025-05-17T08:30:00+05:30'),
  ('2025-05-17','Maharajganj',5.09,152.7,'NECC','2025-05-17T08:30:00+05:30'),
  ('2025-05-18','Gorakhpur',5.0,150.0,'NECC','2025-05-18T08:30:00+05:30'),
  ('2025-05-18','Deoria',4.97,149.1,'NECC','2025-05-18T08:30:00+05:30'),
  ('2025-05-18','Basti',4.96,148.8,'NECC','2025-05-18T08:30:00+05:30'),
  ('2025-05-18','Kushinagar',4.95,148.5,'NECC','2025-05-18T08:30:00+05:30'),
  ('2025-05-18','Maharajganj',4.94,148.2,'NECC','2025-05-18T08:30:00+05:30'),
  ('2025-05-19','Gorakhpur',5.08,152.4,'NECC','2025-05-19T08:30:00+05:30'),
  ('2025-05-19','Deoria',5.05,151.5,'NECC','2025-05-19T08:30:00+05:30'),
  ('2025-05-19','Basti',5.04,151.2,'NECC','2025-05-19T08:30:00+05:30'),
  ('2025-05-19','Kushinagar',5.03,150.9,'NECC','2025-05-19T08:30:00+05:30'),
  ('2025-05-19','Maharajganj',5.02,150.6,'NECC','2025-05-19T08:30:00+05:30'),
  ('2025-05-20','Gorakhpur',5.21,156.3,'NECC','2025-05-20T08:30:00+05:30'),
  ('2025-05-20','Deoria',5.18,155.4,'NECC','2025-05-20T08:30:00+05:30'),
  ('2025-05-20','Basti',5.17,155.1,'NECC','2025-05-20T08:30:00+05:30'),
  ('2025-05-20','Kushinagar',5.16,154.8,'NECC','2025-05-20T08:30:00+05:30'),
  ('2025-05-20','Maharajganj',5.15,154.5,'NECC','2025-05-20T08:30:00+05:30'),
  ('2025-05-21','Gorakhpur',5.15,154.5,'NECC','2025-05-21T08:30:00+05:30'),
  ('2025-05-21','Deoria',5.12,153.6,'NECC','2025-05-21T08:30:00+05:30'),
  ('2025-05-21','Basti',5.11,153.3,'NECC','2025-05-21T08:30:00+05:30'),
  ('2025-05-21','Kushinagar',5.1,153.0,'NECC','2025-05-21T08:30:00+05:30'),
  ('2025-05-21','Maharajganj',5.09,152.7,'NECC','2025-05-21T08:30:00+05:30'),
  ('2025-05-22','Gorakhpur',5.19,155.7,'NECC','2025-05-22T08:30:00+05:30'),
  ('2025-05-22','Deoria',5.16,154.8,'NECC','2025-05-22T08:30:00+05:30'),
  ('2025-05-22','Basti',5.15,154.5,'NECC','2025-05-22T08:30:00+05:30'),
  ('2025-05-22','Kushinagar',5.14,154.2,'NECC','2025-05-22T08:30:00+05:30'),
  ('2025-05-22','Maharajganj',5.13,153.9,'NECC','2025-05-22T08:30:00+05:30'),
  ('2025-05-23','Gorakhpur',5.24,157.2,'NECC','2025-05-23T08:30:00+05:30'),
  ('2025-05-23','Deoria',5.21,156.3,'NECC','2025-05-23T08:30:00+05:30'),
  ('2025-05-23','Basti',5.2,156.0,'NECC','2025-05-23T08:30:00+05:30'),
  ('2025-05-23','Kushinagar',5.19,155.7,'NECC','2025-05-23T08:30:00+05:30'),
  ('2025-05-23','Maharajganj',5.18,155.4,'NECC','2025-05-23T08:30:00+05:30'),
  ('2025-05-24','Gorakhpur',5.17,155.1,'NECC','2025-05-24T08:30:00+05:30'),
  ('2025-05-24','Deoria',5.14,154.2,'NECC','2025-05-24T08:30:00+05:30'),
  ('2025-05-24','Basti',5.13,153.9,'NECC','2025-05-24T08:30:00+05:30'),
  ('2025-05-24','Kushinagar',5.12,153.6,'NECC','2025-05-24T08:30:00+05:30'),
  ('2025-05-24','Maharajganj',5.11,153.3,'NECC','2025-05-24T08:30:00+05:30'),
  ('2025-05-25','Gorakhpur',5.22,156.6,'NECC','2025-05-25T08:30:00+05:30'),
  ('2025-05-25','Deoria',5.19,155.7,'NECC','2025-05-25T08:30:00+05:30'),
  ('2025-05-25','Basti',5.18,155.4,'NECC','2025-05-25T08:30:00+05:30'),
  ('2025-05-25','Kushinagar',5.17,155.1,'NECC','2025-05-25T08:30:00+05:30'),
  ('2025-05-25','Maharajganj',5.16,154.8,'NECC','2025-05-25T08:30:00+05:30'),
  ('2025-05-26','Gorakhpur',5.08,152.4,'NECC','2025-05-26T08:30:00+05:30'),
  ('2025-05-26','Deoria',5.05,151.5,'NECC','2025-05-26T08:30:00+05:30'),
  ('2025-05-26','Basti',5.04,151.2,'NECC','2025-05-26T08:30:00+05:30'),
  ('2025-05-26','Kushinagar',5.03,150.9,'NECC','2025-05-26T08:30:00+05:30'),
  ('2025-05-26','Maharajganj',5.02,150.6,'NECC','2025-05-26T08:30:00+05:30')
ON CONFLICT (date, district) DO NOTHING;

-- ┌─────────────────────────────────────────────────────────────┐
-- │  PART 3 — VERIFICATION QUERIES (run after inserts)         │
-- └─────────────────────────────────────────────────────────────┘

-- Row counts
SELECT 'raw_prices'           AS tbl, COUNT(*) FROM raw_prices           WHERE date BETWEEN '2025-05-01' AND '2025-05-26'
UNION ALL
SELECT 'weather_observations' ,        COUNT(*) FROM weather_observations  WHERE date BETWEEN '2025-05-01' AND '2025-05-26'
UNION ALL
SELECT 'commodity_national_modal',     COUNT(*) FROM commodity_national_modal WHERE date BETWEEN '2025-05-01' AND '2025-05-26'
UNION ALL
SELECT 'necc_egg_prices'      ,        COUNT(*) FROM necc_egg_prices        WHERE date BETWEEN '2025-05-01' AND '2025-05-26'
UNION ALL
SELECT 'egg_prices_district'  ,        COUNT(*) FROM egg_prices_district    WHERE date BETWEEN '2025-05-01' AND '2025-05-26';

-- Price sanity check (should be Rs 125-162, farm gate May 2025)
SELECT mandi_name,
       MIN(broiler_price_per_kg)  AS min_price,
       ROUND(AVG(broiler_price_per_kg),2) AS avg_price,
       MAX(broiler_price_per_kg)  AS max_price
FROM raw_prices
WHERE date BETWEEN '2025-05-01' AND '2025-05-26'
GROUP BY mandi_name ORDER BY mandi_name;

-- Weather sanity (Gorakhpur May 2025 avg max should be ~37-40°C)
SELECT district, MIN(temp_max_c), ROUND(AVG(temp_max_c),1), MAX(temp_max_c),
       SUM(rainfall_mm) AS total_rain_mm,
       SUM(heat_stress_flag) AS heat_stress_days
FROM weather_observations
WHERE date BETWEEN '2025-05-01' AND '2025-05-26'
GROUP BY district ORDER BY district;

-- Egg sanity (NECC UP zone May 2025: Rs 4.82-5.25/egg)
SELECT MIN(price_per_egg), ROUND(AVG(price_per_egg),2), MAX(price_per_egg)
FROM necc_egg_prices
WHERE date BETWEEN '2025-05-01' AND '2025-05-26';

-- ML feature view check
SELECT date, district, farm_gate_price, temp_max_c, heat_stress_flag,
       necc_egg_price, maize_price, feed_cost_ratio_lag42
FROM ml_feature_base
WHERE date = '2025-05-15'
ORDER BY district;
