-- PoultryPulse AI - IoT Readings Schema
-- Migration: 20260602_iot_readings.sql
-- Description: Creates time-series optimized IoT readings table with monthly partitioning
-- Requirements: REQ-018 §18.2, §18.8, Design Addendum §17.1
-- Task: TASK-049

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_partman";

-- Main IoT readings table (parent table for partitioning)
CREATE TABLE IF NOT EXISTS iot_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID NOT NULL REFERENCES iot_devices(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL, -- Denormalized for faster queries
  shed_id TEXT, -- Denormalized from device for faster queries
  
  -- Reading timestamp
  reading_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Environment sensor readings
  temperature_c DECIMAL(5,2), -- Temperature in Celsius
  humidity_pct DECIMAL(5,2), -- Humidity percentage
  ammonia_ppm DECIMAL(6,2), -- Ammonia level in ppm
  
  -- Water meter readings
  water_flow_litres_per_min DECIMAL(8,2), -- Flow rate
  water_total_litres DECIMAL(12,2), -- Total volume
  
  -- Auto-weighing scale readings
  weight_kg DECIMAL(8,3), -- Weight reading
  bird_count INTEGER, -- Bird count (if scale has counting capability)
  
  -- Feed silo sensor readings
  feed_level_percent DECIMAL(5,2), -- Feed level percentage
  feed_weight_kg DECIMAL(10,2), -- Feed weight in silo
  
  -- Device metadata
  battery_level_pct DECIMAL(5,2), -- Battery level if applicable
  signal_strength INTEGER, -- Signal strength (0-100)
  device_status TEXT, -- Device status message
  
  -- Additional sensor data (flexible JSON)
  additional_data JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (reading_at);

-- Create monthly partitions for current and next 12 months
-- This is a simplified approach - in production, use pg_partman for automatic partition management
CREATE TABLE IF NOT EXISTS iot_readings_2025_12 PARTITION OF iot_readings
  FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

CREATE TABLE IF NOT EXISTS iot_readings_2026_01 PARTITION OF iot_readings
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE IF NOT EXISTS iot_readings_2026_02 PARTITION OF iot_readings
  FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE IF NOT EXISTS iot_readings_2026_03 PARTITION OF iot_readings
  FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE IF NOT EXISTS iot_readings_2026_04 PARTITION OF iot_readings
  FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

CREATE TABLE IF NOT EXISTS iot_readings_2026_05 PARTITION OF iot_readings
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');

CREATE TABLE IF NOT EXISTS iot_readings_2026_06 PARTITION OF iot_readings
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE IF NOT EXISTS iot_readings_2026_07 PARTITION OF iot_readings
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

CREATE TABLE IF NOT EXISTS iot_readings_2026_08 PARTITION OF iot_readings
  FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

CREATE TABLE IF NOT EXISTS iot_readings_2026_09 PARTITION OF iot_readings
  FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');

CREATE TABLE IF NOT EXISTS iot_readings_2026_10 PARTITION OF iot_readings
  FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');

CREATE TABLE IF NOT EXISTS iot_readings_2026_11 PARTITION OF iot_readings
  FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

CREATE TABLE IF NOT EXISTS iot_readings_2026_12 PARTITION OF iot_readings
  FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- Indexes for iot_readings (created on parent, inherited by partitions)
CREATE INDEX idx_iot_readings_device_id ON iot_readings(device_id);
CREATE INDEX idx_iot_readings_customer_id ON iot_readings(customer_id);
CREATE INDEX idx_iot_readings_shed_id ON iot_readings(shed_id);
CREATE INDEX idx_iot_readings_reading_at ON iot_readings(reading_at DESC);
CREATE INDEX idx_iot_readings_device_reading_at ON iot_readings(device_id, reading_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE iot_readings ENABLE ROW LEVEL SECURITY;

-- Users can only read their own IoT readings (via customer_id)
CREATE POLICY "Users can view own iot_readings" 
ON iot_readings FOR SELECT 
USING (customer_id = auth.uid());

-- IoT devices can insert readings (authenticated via API key, not JWT)
-- This policy allows service role to insert on behalf of devices
CREATE POLICY "Service can insert iot_readings" 
ON iot_readings FOR INSERT 
WITH CHECK (true);

-- Function to update device last_reading_at on new reading
CREATE OR REPLACE FUNCTION update_device_last_reading()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the device's last_reading_at and status
  UPDATE iot_devices
  SET 
    last_reading_at = NEW.reading_at,
    status = 'online',
    updated_at = NOW()
  WHERE id = NEW.device_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to update device status on new reading
CREATE TRIGGER trg_update_device_last_reading
  AFTER INSERT ON iot_readings
  FOR EACH ROW
  EXECUTE FUNCTION update_device_last_reading();

-- Function to check IoT reading against safe ranges and create alert if out of range
CREATE OR REPLACE FUNCTION check_iot_reading_ranges()
RETURNS TRIGGER AS $$
DECLARE
  alert_message TEXT;
  alert_severity TEXT;
  is_out_of_range BOOLEAN := false;
BEGIN
  -- Check temperature range (18-25°C for broilers)
  IF NEW.temperature_c IS NOT NULL AND (NEW.temperature_c < 18 OR NEW.temperature_c > 25) THEN
    is_out_of_range := true;
    alert_message := 'Shed ' || COALESCE(NEW.shed_id, 'Unknown') || ' — Temperature out of range: ' || NEW.temperature_c || '°C (safe: 18-25°C)';
    alert_severity := CASE 
      WHEN NEW.temperature_c > 30 THEN 'critical'
      WHEN NEW.temperature_c < 15 THEN 'critical'
      ELSE 'medium'
    END;
    
    -- Insert alert into alerts table
    INSERT INTO alerts (
      customer_id,
      alert_type,
      severity,
      message,
      message_hindi,
      batch_id,
      metadata,
      created_at
    ) VALUES (
      NEW.customer_id,
      'iot_environment',
      alert_severity,
      alert_message,
      'शेड ' || COALESCE(NEW.shed_id, 'अज्ञात') || ' — तापमान सीमा से बाहर: ' || NEW.temperature_c || '°C',
      NULL,
      jsonb_build_object(
        'device_id', NEW.device_id,
        'shed_id', NEW.shed_id,
        'temperature_c', NEW.temperature_c,
        'safe_range', '18-25°C',
        'reading_at', NEW.reading_at
      ),
      NOW()
    );
  END IF;
  
  -- Check humidity range (50-70%)
  IF NEW.humidity_pct IS NOT NULL AND (NEW.humidity_pct < 50 OR NEW.humidity_pct > 70) THEN
    is_out_of_range := true;
    alert_message := 'Shed ' || COALESCE(NEW.shed_id, 'Unknown') || ' — Humidity out of range: ' || NEW.humidity_pct || '% (safe: 50-70%)';
    alert_severity := CASE 
      WHEN NEW.humidity_pct > 80 THEN 'critical'
      WHEN NEW.humidity_pct < 40 THEN 'critical'
      ELSE 'medium'
    END;
    
    INSERT INTO alerts (
      customer_id,
      alert_type,
      severity,
      message,
      message_hindi,
      batch_id,
      metadata,
      created_at
    ) VALUES (
      NEW.customer_id,
      'iot_environment',
      alert_severity,
      alert_message,
      'शेड ' || COALESCE(NEW.shed_id, 'अज्ञात') || ' — नमी सीमा से बाहर: ' || NEW.humidity_pct || '%',
      NULL,
      jsonb_build_object(
        'device_id', NEW.device_id,
        'shed_id', NEW.shed_id,
        'humidity_pct', NEW.humidity_pct,
        'safe_range', '50-70%',
        'reading_at', NEW.reading_at
      ),
      NOW()
    );
  END IF;
  
  -- Check ammonia level (< 20 ppm)
  IF NEW.ammonia_ppm IS NOT NULL AND NEW.ammonia_ppm > 20 THEN
    is_out_of_range := true;
    alert_message := 'Shed ' || COALESCE(NEW.shed_id, 'Unknown') || ' — Ammonia level high: ' || NEW.ammonia_ppm || ' ppm (safe: < 20 ppm)';
    alert_severity := CASE 
      WHEN NEW.ammonia_ppm > 40 THEN 'critical'
      ELSE 'medium'
    END;
    
    INSERT INTO alerts (
      customer_id,
      alert_type,
      severity,
      message,
      message_hindi,
      batch_id,
      metadata,
      created_at
    ) VALUES (
      NEW.customer_id,
      'iot_environment',
      alert_severity,
      alert_message,
      'शेड ' || COALESCE(NEW.shed_id, 'अज्ञात') || ' — अमोनिया स्तर अधिक: ' || NEW.ammonia_ppm || ' ppm',
      NULL,
      jsonb_build_object(
        'device_id', NEW.device_id,
        'shed_id', NEW.shed_id,
        'ammonia_ppm', NEW.ammonia_ppm,
        'safe_range', '< 20 ppm',
        'reading_at', NEW.reading_at
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to check ranges on new reading
CREATE TRIGGER trg_check_iot_reading_ranges
  AFTER INSERT ON iot_readings
  FOR EACH ROW
  EXECUTE FUNCTION check_iot_reading_ranges();

-- Seed data for development (sample readings for the devices)
-- Get device IDs from seed data
DO $$
DECLARE
  env_sensor_id UUID;
  water_meter_id UUID;
  customer_id UUID := '550e8400-e29b-41d4-a716-446655440001';
BEGIN
  -- Get the environment sensor device ID
  SELECT id INTO env_sensor_id FROM iot_devices WHERE device_name = 'Shed 3 Environment Sensor' AND customer_id = customer_id;
  
  -- Get the water meter device ID
  SELECT id INTO water_meter_id FROM iot_devices WHERE device_name = 'Shed 3 Water Meter' AND customer_id = customer_id;
  
  -- Insert sample environment sensor readings (last 24 hours, every 15 minutes)
  IF env_sensor_id IS NOT NULL THEN
    INSERT INTO iot_readings (
      device_id,
      customer_id,
      shed_id,
      reading_at,
      temperature_c,
      humidity_pct,
      ammonia_ppm
    ) SELECT
      env_sensor_id,
      customer_id,
      'Shed 3',
      NOW() - (i * 15 || ' minutes')::INTERVAL,
      22 + (RANDOM() * 8 - 2)::DECIMAL(5,2), -- Temperature between 20-30°C
      55 + (RANDOM() * 20 - 5)::DECIMAL(5,2), -- Humidity between 50-70%
      5 + (RANDOM() * 15)::DECIMAL(6,2) -- Ammonia between 5-20 ppm
    FROM generate_series(0, 95) AS i; -- 96 readings = 24 hours at 15-min intervals
  END IF;
  
  -- Insert sample water meter readings (last 24 hours, every 15 minutes)
  IF water_meter_id IS NOT NULL THEN
    INSERT INTO iot_readings (
      device_id,
      customer_id,
      shed_id,
      reading_at,
      water_flow_litres_per_min,
      water_total_litres
    ) SELECT
      water_meter_id,
      customer_id,
      'Shed 3',
      NOW() - (i * 15 || ' minutes')::INTERVAL,
      2 + (RANDOM() * 3)::DECIMAL(8,2), -- Flow rate between 2-5 L/min
      10000 + (i * 75)::DECIMAL(12,2) -- Total volume increasing over time
    FROM generate_series(0, 95) AS i;
  END IF;
END $$;

-- Comment on table
COMMENT ON TABLE iot_readings IS 'Time-series IoT sensor readings with monthly partitioning for performance';
COMMENT ON COLUMN iot_readings.temperature_c IS 'Temperature in Celsius (safe range: 18-25°C for broilers)';
COMMENT ON COLUMN iot_readings.humidity_pct IS 'Humidity percentage (safe range: 50-70%)';
COMMENT ON COLUMN iot_readings.ammonia_ppm IS 'Ammonia level in ppm (safe: < 20 ppm)';
