-- PoultryPulse AI - IoT Device Registry Schema
-- Migration: 20260602_iot_devices.sql
-- Description: Creates IoT device registry table for device management
-- Requirements: REQ-018 §18.1, Design Addendum §17.1
-- Task: TASK-049

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types for IoT devices
CREATE TYPE iot_device_type AS ENUM ('environment_sensor', 'auto_weighing_scale', 'water_meter', 'feed_silo_sensor');
CREATE TYPE iot_device_status AS ENUM ('online', 'offline', 'error');

-- Main IoT devices table
CREATE TABLE IF NOT EXISTS iot_devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Device identification
  device_name TEXT NOT NULL,
  device_type iot_device_type NOT NULL,
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT UNIQUE,
  
  -- Shed assignment
  shed_id TEXT,
  
  -- Connection details
  api_key TEXT UNIQUE NOT NULL, -- Device-specific API key for authentication
  api_endpoint TEXT, -- REST endpoint or MQTT topic
  mqtt_topic TEXT, -- Alternative for MQTT-based devices
  
  -- Reporting configuration
  reporting_interval_minutes INTEGER DEFAULT 15, -- Expected reporting interval
  last_reading_at TIMESTAMPTZ,
  status iot_device_status DEFAULT 'offline',
  
  -- Device-specific settings
  settings JSONB DEFAULT '{}', -- Flexible settings per device type
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT customer_device_unique UNIQUE (customer_id, device_name)
);

-- Indexes for iot_devices
CREATE INDEX idx_iot_devices_customer_id ON iot_devices(customer_id);
CREATE INDEX idx_iot_devices_device_type ON iot_devices(device_type);
CREATE INDEX idx_iot_devices_shed_id ON iot_devices(shed_id);
CREATE INDEX idx_iot_devices_status ON iot_devices(status);
CREATE INDEX idx_iot_devices_api_key ON iot_devices(api_key);
CREATE INDEX idx_iot_devices_last_reading_at ON iot_devices(last_reading_at);

-- Row Level Security (RLS) Policies
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;

-- Users can only read/write their own IoT devices
CREATE POLICY "Users can view own iot_devices" 
ON iot_devices FOR SELECT 
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert own iot_devices" 
ON iot_devices FOR INSERT 
WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update own iot_devices" 
ON iot_devices FOR UPDATE 
USING (customer_id = auth.uid());

CREATE POLICY "Users can delete own iot_devices" 
ON iot_devices FOR DELETE 
USING (customer_id = auth.uid());

-- Function to generate device API key
CREATE OR REPLACE FUNCTION generate_device_api_key()
RETURNS TEXT AS $$
DECLARE
  api_key TEXT;
BEGIN
  -- Generate a random 32-character API key
  api_key := encode(gen_random_bytes(24), 'base64');
  -- Remove base64 padding and special characters
  api_key := regexp_replace(api_key, '[+/=]', '', 'g');
  RETURN 'pp_iot_' || api_key;
END;
$$ LANGUAGE plpgsql;

-- Updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to iot_devices
CREATE TRIGGER update_iot_devices_updated_at BEFORE UPDATE ON iot_devices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update device status based on last reading
CREATE OR REPLACE FUNCTION update_device_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update device status based on last reading time
  IF NEW.last_reading_at IS NULL THEN
    NEW.status := 'offline';
  ELSIF NEW.last_reading_at > NOW() - (NEW.reporting_interval_minutes * 2 || ' minutes')::INTERVAL THEN
    NEW.status := 'online';
  ELSE
    NEW.status := 'offline';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply status update trigger
CREATE TRIGGER trg_update_device_status
  BEFORE INSERT OR UPDATE ON iot_devices
  FOR EACH ROW
  EXECUTE FUNCTION update_device_status();

-- Seed data for development (2 sample devices for S1 customer)
INSERT INTO iot_devices (
    id,
    customer_id,
    device_name,
    device_type,
    manufacturer,
    model,
    serial_number,
    shed_id,
    api_key,
    reporting_interval_minutes,
    last_reading_at,
    status,
    settings,
    created_at
) VALUES (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001',
    'Shed 3 Environment Sensor',
    'environment_sensor',
    'SenseTech',
    'EnvMonitor Pro',
    'ST-ENV-2024-001',
    'Shed 3',
    generate_device_api_key(),
    15,
    NOW() - INTERVAL '2 minutes',
    'online',
    '{"temperature_enabled": true, "humidity_enabled": true, "ammonia_enabled": true}',
    NOW()
), (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440001',
    'Shed 3 Water Meter',
    'water_meter',
    'AquaFlow',
    'SmartMeter 2000',
    'AF-WM-2024-003',
    'Shed 3',
    generate_device_api_key(),
    15,
    NOW() - INTERVAL '5 minutes',
    'online',
    '{"flow_rate_enabled": true, "total_volume_enabled": true}',
    NOW()
);
