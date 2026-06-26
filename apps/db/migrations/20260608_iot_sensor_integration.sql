-- ============================================================
-- FlockIQ IoT Sensor Integration Schema
-- Migration: 20260608_iot_sensor_integration.sql
-- Description: Creates IoT sensor integration tables for environment monitoring
--              per specs/iot device.md PART 1 — DATABASE SCHEMA
-- Dependencies: 20260523_farm_management.sql (farms, sheds tables must exist)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ============================================================
-- TABLE 1: IoT Devices (one row per physical sensor node)
-- ============================================================
CREATE TABLE IF NOT EXISTS iot_devices (
  device_uuid       TEXT PRIMARY KEY,         -- unique ID flashed onto hardware
  shed_id           UUID REFERENCES sheds(id) ON DELETE SET NULL,
  farm_id           UUID REFERENCES farms(id) ON DELETE CASCADE,
  integrator_id     UUID REFERENCES customers(id) ON DELETE CASCADE,
  label             TEXT,                      -- e.g. "Shed A Node 1"
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','active','inactive','error')),
  firmware_version  TEXT,
  last_seen_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  registered_at     TIMESTAMPTZ,              -- when mapped to a farm
  registered_by     UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_iot_devices_farm     ON iot_devices(farm_id);
CREATE INDEX IF NOT EXISTS idx_iot_devices_shed     ON iot_devices(shed_id);
CREATE INDEX IF NOT EXISTS idx_iot_devices_status   ON iot_devices(status);

-- RLS: integrator sees only their own devices
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "integrator_own_devices" ON iot_devices;
CREATE POLICY "integrator_own_devices" ON iot_devices
  USING (integrator_id = auth.uid());


-- ============================================================
-- TABLE 2: Sensor Telemetry (time-series — append only)
-- ============================================================
CREATE TABLE IF NOT EXISTS sensor_telemetry (
  id                BIGSERIAL PRIMARY KEY,
  device_uuid       TEXT NOT NULL REFERENCES iot_devices(device_uuid),
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  shed_id           UUID REFERENCES sheds(id),
  integrator_id     UUID NOT NULL REFERENCES customers(id),
  temperature_c     DECIMAL(5,2),             -- °C, range -10 to 60
  humidity_pct      DECIMAL(5,2),             -- %, range 0 to 100
  ammonia_ppm       DECIMAL(6,2),             -- ppm, range 0 to 200
  raw_payload       JSONB,                    -- full original payload for audit
  received_at       TIMESTAMPTZ DEFAULT now(), -- when server received it
  device_timestamp  TIMESTAMPTZ,              -- timestamp from device (may differ)
  is_anomaly        BOOLEAN DEFAULT FALSE,
  anomaly_flags     TEXT[],                   -- e.g. ['HIGH_AMMONIA', 'HIGH_HUMIDITY']
  alert_sent        BOOLEAN DEFAULT FALSE
);

-- Partition by month for performance (production-ready)
-- For MVP: single table with index is sufficient
CREATE INDEX IF NOT EXISTS idx_telemetry_device     ON sensor_telemetry(device_uuid, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_farm       ON sensor_telemetry(farm_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_anomaly    ON sensor_telemetry(farm_id, is_anomaly) WHERE is_anomaly = TRUE;
CREATE INDEX IF NOT EXISTS idx_telemetry_time       ON sensor_telemetry(received_at DESC);

-- RLS: integrator sees only their own farms' data
ALTER TABLE sensor_telemetry ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "integrator_own_telemetry" ON sensor_telemetry;
CREATE POLICY "integrator_own_telemetry" ON sensor_telemetry
  USING (integrator_id = auth.uid());


-- ============================================================
-- TABLE 3: Alert Log (one row per alert sent)
-- ============================================================
CREATE TABLE IF NOT EXISTS iot_alert_log (
  id            BIGSERIAL PRIMARY KEY,
  telemetry_id  BIGINT REFERENCES sensor_telemetry(id),
  device_uuid   TEXT NOT NULL,
  farm_id       UUID NOT NULL REFERENCES farms(id),
  alert_type    TEXT NOT NULL
                CHECK (alert_type IN (
                  'HIGH_AMMONIA', 'HIGH_HUMIDITY', 'HIGH_TEMP',
                  'LOW_TEMP', 'DEVICE_OFFLINE', 'SENSOR_ERROR'
                )),
  threshold_value DECIMAL(8,2),               -- the limit that was crossed
  actual_value    DECIMAL(8,2),               -- the reading that triggered alert
  channel         TEXT CHECK (channel IN ('whatsapp','sms','push','email')),
  recipient_phone TEXT,
  message_body    TEXT,
  sent_at         TIMESTAMPTZ DEFAULT now(),
  delivery_status TEXT DEFAULT 'sent'
                  CHECK (delivery_status IN ('sent','delivered','failed'))
);

CREATE INDEX IF NOT EXISTS idx_alert_log_farm ON iot_alert_log(farm_id, sent_at DESC);


-- ============================================================
-- MATERIALIZED VIEW: Latest reading per device (for dashboard)
-- ============================================================
DROP MATERIALIZED VIEW IF EXISTS mv_latest_sensor_readings;
CREATE MATERIALIZED VIEW mv_latest_sensor_readings AS
SELECT DISTINCT ON (device_uuid)
  device_uuid,
  farm_id,
  shed_id,
  integrator_id,
  temperature_c,
  humidity_pct,
  ammonia_ppm,
  is_anomaly,
  anomaly_flags,
  received_at
FROM sensor_telemetry
ORDER BY device_uuid, received_at DESC;

CREATE UNIQUE INDEX ON mv_latest_sensor_readings(device_uuid);

-- Refresh every 5 minutes via pg_cron (or via the worker after each insert)
SELECT cron.schedule(
  'refresh-sensor-readings',
  '*/5 * * * *',
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_latest_sensor_readings'
);


-- ============================================================
-- FUNCTION: Environment score (1-10) — called after insert
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_environment_score(
  temp    DECIMAL,
  humidity DECIMAL,
  ammonia  DECIMAL
) RETURNS DECIMAL AS $$
DECLARE score DECIMAL := 10;
BEGIN
  -- Temperature penalties
  IF temp < 18 OR temp > 32 THEN score := score - 2; END IF;
  IF temp < 14 OR temp > 36 THEN score := score - 1; END IF;
  -- Humidity penalties
  IF humidity > 70 THEN score := score - 2.5; END IF;
  IF humidity > 80 THEN score := score - 1.0; END IF;
  -- Ammonia penalties
  IF ammonia > 25 THEN score := score - 3.0; END IF;
  IF ammonia > 40 THEN score := score - 1.5; END IF;
  RETURN GREATEST(0, LEAST(10, score));
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- ============================================================
-- FUNCTION: Detect anomaly flags from a reading
-- ============================================================
CREATE OR REPLACE FUNCTION detect_anomaly_flags(
  temp      DECIMAL,
  humidity  DECIMAL,
  ammonia   DECIMAL
) RETURNS TEXT[] AS $$
DECLARE flags TEXT[] := '{}';
BEGIN
  IF ammonia > 25    THEN flags := array_append(flags, 'HIGH_AMMONIA'); END IF;
  IF humidity > 70   THEN flags := array_append(flags, 'HIGH_HUMIDITY'); END IF;
  IF temp > 32       THEN flags := array_append(flags, 'HIGH_TEMP'); END IF;
  IF temp < 18       THEN flags := array_append(flags, 'LOW_TEMP'); END IF;
  RETURN flags;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- ============================================================
-- TRIGGER: Auto-populate anomaly fields on telemetry insert
-- ============================================================
CREATE OR REPLACE FUNCTION trg_set_telemetry_anomaly()
RETURNS TRIGGER AS $$
BEGIN
  NEW.anomaly_flags := detect_anomaly_flags(
    NEW.temperature_c, NEW.humidity_pct, NEW.ammonia_ppm
  );
  NEW.is_anomaly := array_length(NEW.anomaly_flags, 1) > 0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_telemetry_anomaly ON sensor_telemetry;
CREATE TRIGGER set_telemetry_anomaly
  BEFORE INSERT ON sensor_telemetry
  FOR EACH ROW EXECUTE FUNCTION trg_set_telemetry_anomaly();

-- ============================================================
-- Comments
-- ============================================================
COMMENT ON TABLE iot_devices IS 'IoT sensor device registry for environment monitoring';
COMMENT ON TABLE sensor_telemetry IS 'Time-series sensor readings from IoT devices';
COMMENT ON TABLE iot_alert_log IS 'Log of alerts sent for IoT sensor anomalies';
COMMENT ON MATERIALIZED VIEW mv_latest_sensor_readings IS 'Latest sensor reading per device for dashboard';
COMMENT ON FUNCTION calculate_environment_score IS 'Calculates environment score (1-10) based on temp, humidity, ammonia';
COMMENT ON FUNCTION detect_anomaly_flags IS 'Detects anomaly flags from sensor readings';
