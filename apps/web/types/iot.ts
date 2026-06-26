export interface IoTDevice {
  device_uuid: string;
  shed_id: string | null;
  farm_id: string;
  integrator_id: string;
  label: string | null;
  status: 'pending' | 'active' | 'inactive' | 'error';
  firmware_version: string | null;
  last_seen_at: string | null;
  created_at: string;
  registered_at: string | null;
  registered_by: string | null;
}

export interface SensorTelemetry {
  id: number;
  device_uuid: string;
  farm_id: string;
  shed_id: string | null;
  integrator_id: string;
  temperature_c: number | null;
  humidity_pct: number | null;
  ammonia_ppm: number | null;
  raw_payload: Record<string, unknown>;
  received_at: string;
  device_timestamp: string | null;
  is_anomaly: boolean;
  anomaly_flags: AnomalyFlag[];
  alert_sent: boolean;
}

export type AnomalyFlag =
  | 'HIGH_AMMONIA'
  | 'HIGH_HUMIDITY'
  | 'HIGH_TEMP'
  | 'LOW_TEMP'
  | 'DEVICE_OFFLINE'
  | 'SENSOR_ERROR';

export interface LatestSensorReading {
  device_uuid: string;
  farm_id: string;
  shed_id: string | null;
  temperature_c: number | null;
  humidity_pct: number | null;
  ammonia_ppm: number | null;
  is_anomaly: boolean;
  anomaly_flags: AnomalyFlag[];
  received_at: string;
}

// Raw payload structure sent by ESP32 hardware
export interface DeviceTelemetryPayload {
  device_uuid: string;
  temperature_c: number;
  humidity_pct: number;
  ammonia_ppm: number;
  timestamp: number;              // Unix epoch from device RTC
  firmware_version?: string;
}

export interface EnvironmentThresholds {
  ammonia_warning_ppm: number;    // default 25
  ammonia_critical_ppm: number;   // default 40
  humidity_warning_pct: number;   // default 70
  humidity_critical_pct: number;  // default 80
  temp_min_c: number;             // default 18
  temp_max_c: number;             // default 32
}

export const DEFAULT_THRESHOLDS: EnvironmentThresholds = {
  ammonia_warning_ppm: 25,
  ammonia_critical_ppm: 40,
  humidity_warning_pct: 70,
  humidity_critical_pct: 80,
  temp_min_c: 18,
  temp_max_c: 32,
};

export interface EnvironmentScore {
  score: number;           // 1-10
  band: 'safe' | 'caution' | 'warning' | 'critical';
  primary_concern: string | null;
}

export function getEnvironmentBand(score: number): EnvironmentScore['band'] {
  if (score >= 8)   return 'safe';
  if (score >= 6)   return 'caution';
  if (score >= 4)   return 'warning';
  return 'critical';
}
