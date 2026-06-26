-- ============================================================
-- PoultryPulse AI — Supabase SQL Setup for All 3 Scrapers
-- Run this entire file in Supabase SQL Editor before first run
-- ============================================================

-- ── Scraper 01: Commodity Prices (Maize + Soybean) ────────────────────────

CREATE TABLE IF NOT EXISTS commodity_prices (
    id                  BIGSERIAL PRIMARY KEY,
    date                DATE NOT NULL,
    commodity           TEXT NOT NULL,
    state               TEXT,
    district            TEXT,
    market              TEXT,
    variety             TEXT,
    min_price           NUMERIC(10,2),
    max_price           NUMERIC(10,2),
    modal_price         NUMERIC(10,2) NOT NULL,
    arrivals_tonnes     NUMERIC(12,2),
    unit                TEXT DEFAULT 'quintal',
    source              TEXT,
    scraped_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, commodity, state, market)
);

CREATE TABLE IF NOT EXISTS commodity_national_modal (
    id                  BIGSERIAL PRIMARY KEY,
    date                DATE NOT NULL,
    commodity           TEXT NOT NULL,
    national_modal      NUMERIC(10,2) NOT NULL,
    sample_size         INTEGER,
    total_arrivals      NUMERIC(14,2),
    source              TEXT,
    computed_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, commodity)
);

-- Index for fast lag-42 lookups (most used query in feature engineering)
CREATE INDEX IF NOT EXISTS idx_commodity_modal_date_commodity
    ON commodity_national_modal(commodity, date DESC);

-- ── Scraper 02: Disease Alerts ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS disease_alerts (
    id                          TEXT PRIMARY KEY,
    date                        DATE NOT NULL,
    source                      TEXT NOT NULL,
    title                       TEXT NOT NULL,
    description                 TEXT,
    state                       TEXT,
    district                    TEXT,
    disease_type                TEXT,
    distance_from_gorakhpur_km  NUMERIC(8,2),
    proximity_label             TEXT,
    hpai_district_flag          SMALLINT DEFAULT 0 CHECK (hpai_district_flag IN (0,1)),
    hpai_adjacent_flag          SMALLINT DEFAULT 0 CHECK (hpai_adjacent_flag IN (0,1)),
    source_url                  TEXT,
    scraped_at                  TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- Daily aggregated flag table — this is what the ML pipeline reads
CREATE TABLE IF NOT EXISTS hpai_daily_flags (
    date                    DATE PRIMARY KEY,
    hpai_district_flag      SMALLINT DEFAULT 0 CHECK (hpai_district_flag IN (0,1)),
    hpai_adjacent_flag      SMALLINT DEFAULT 0 CHECK (hpai_adjacent_flag IN (0,1)),
    active_alert_count      INTEGER DEFAULT 0,
    nearest_alert_km        NUMERIC(8,2),
    nearest_state           TEXT,
    computed_at             TIMESTAMPTZ DEFAULT NOW()
);

-- Index for 14-day lookback (Training Guide: flag if HPAI in last 14 days)
CREATE INDEX IF NOT EXISTS idx_hpai_flags_date
    ON hpai_daily_flags(date DESC);

CREATE INDEX IF NOT EXISTS idx_disease_alerts_date_type
    ON disease_alerts(date DESC, disease_type, hpai_district_flag);

-- ── Scraper 03: Mobile App Data ───────────────────────────────────────────

CREATE TABLE IF NOT EXISTS mobile_app_data (
    id              BIGSERIAL PRIMARY KEY,
    date            DATE NOT NULL,
    app_name        TEXT NOT NULL,
    price_per_kg    NUMERIC(8,2),
    disease_alert   BOOLEAN DEFAULT FALSE,
    disease_details JSONB,
    raw_text        TEXT,
    screenshot_count INTEGER,
    source          TEXT DEFAULT 'mobile_app_ocr',
    scraped_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Existing tables (from main notebook) ─────────────────────────────────

CREATE TABLE IF NOT EXISTS raw_prices (
    id                   BIGSERIAL PRIMARY KEY,
    date                 DATE NOT NULL,
    mandi_name           TEXT NOT NULL,
    broiler_price_per_kg NUMERIC(8,2),
    arrivals_kg          NUMERIC(12,2),
    source               TEXT,
    created_at           TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, mandi_name)
);

CREATE TABLE IF NOT EXISTS predictions (
    id             BIGSERIAL PRIMARY KEY,
    forecast_date  DATE NOT NULL,
    mandi_name     TEXT NOT NULL,
    p10            NUMERIC(8,2),
    p50            NUMERIC(8,2),
    p90            NUMERIC(8,2),
    q_hat          NUMERIC(8,2),
    model_version  TEXT,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(forecast_date, mandi_name)
);

-- ── Helper view: 42-day lagged feed cost (Top feature #1) ─────────────────
-- This view makes it easy to join today's broiler price with the maize price
-- from 42 days ago — the most important feature in your model.

CREATE OR REPLACE VIEW feed_cost_ratio_lag42 AS
SELECT
    r.date                                      AS date,
    r.mandi_name,
    r.broiler_price_per_kg,
    m.national_modal                            AS maize_price_lag42,
    r.broiler_price_per_kg / NULLIF(m.national_modal / 100.0, 0) AS feed_cost_ratio
FROM raw_prices r
LEFT JOIN commodity_national_modal m
    ON m.date  = r.date - INTERVAL '42 days'
    AND m.commodity = 'Maize'
WHERE r.broiler_price_per_kg IS NOT NULL
ORDER BY r.date DESC, r.mandi_name;

-- ── Helper view: HPAI feature for last 14 days ───────────────────────────
-- Training Guide §4.2: hpai_district_flag = 1 if any HPAI within 200km in last 14 days

CREATE OR REPLACE VIEW hpai_14day_window AS
SELECT
    gs.date::date AS date,
    COALESCE(MAX(f.hpai_district_flag), 0) AS hpai_district_flag_14d,
    COALESCE(MAX(f.hpai_adjacent_flag), 0) AS hpai_adjacent_flag_14d,
    COALESCE(SUM(f.active_alert_count), 0) AS total_alerts_14d
FROM generate_series(
    CURRENT_DATE - INTERVAL '365 days',
    CURRENT_DATE,
    INTERVAL '1 day'
) AS gs(date)
LEFT JOIN hpai_daily_flags f
    ON f.date BETWEEN gs.date - INTERVAL '14 days' AND gs.date
GROUP BY gs.date
ORDER BY gs.date DESC;
