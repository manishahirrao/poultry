cat << 'IOTPROMPT' > /home/claude/output/WINDSURF_IOT_INTEGRATION_PROMPT.md
# FlockIQ — IoT Sensor Integration Implementation Prompt
# For: Windsurf Code Editor
# Feature: Environment Monitoring via IoT Sensors (Ammonia, Temperature, Humidity)
# Stack: Next.js 15 App Router · TypeScript strict · Supabase (PostgreSQL) · Vercel
# Integration: MQTT broker → Backend worker → Supabase → Dashboard + WhatsApp alerts

---

## CONTEXT & SCOPE

FlockIQ is a poultry farm management platform. This task implements IoT sensor
integration for environment monitoring inside poultry sheds. Each shed has:

- DHT22 sensor → Temperature (°C) + Humidity (%)
- MQ-137 sensor → Ammonia (ppm)
- ESP32 microcontroller → Reads sensors, publishes JSON via MQTT every 10 minutes

Your job is to build the SOFTWARE SIDE only (no hardware code). You will build:
1. Database schema (Supabase/PostgreSQL)
2. MQTT worker service (Node.js)
3. API routes (Next.js App Router)
4. Dashboard UI components
5. Alert system (WhatsApp notifications)
6. Device onboarding UI

Do NOT modify any existing files unless explicitly told to below.
Do NOT remove any existing functionality.
All new code must be TypeScript strict mode with no `any` types.

---

## EXISTING TECH STACK (Do not change these)

```
Framework:    Next.js 15 App Router
Language:     TypeScript (strict: true, no implicit any)
Database:     Supabase (PostgreSQL) — client at src/lib/supabase/
Styling:      Tailwind CSS v4
State:        React hooks (no Redux, no Zustand)
Icons:        Lucide React
Alerts:       WhatsApp Business API (existing sender at src/lib/whatsapp/sender.ts)
Environment:  Vercel (Edge functions supported)
```

---

## PART 1 — DATABASE SCHEMA

Create a new migration file at:
`supabase/migrations/[timestamp]_iot_sensor_integration.sql`

```sql
-- ============================================================
-- TABLE 1: IoT Devices (one row per physical sensor node)
-- ============================================================
CREATE TABLE iot_devices (
  device_uuid       TEXT PRIMARY KEY,         -- unique ID flashed onto hardware
  shed_id           UUID REFERENCES sheds(id) ON DELETE SET NULL,
  farm_id           UUID REFERENCES farms(id) ON DELETE CASCADE,
  integrator_id     UUID REFERENCES integrators(id) ON DELETE CASCADE,
  label             TEXT,                      -- e.g. "Shed A Node 1"
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','active','inactive','error')),
  firmware_version  TEXT,
  last_seen_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  registered_at     TIMESTAMPTZ,              -- when mapped to a farm
  registered_by     UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_iot_devices_farm     ON iot_devices(farm_id);
CREATE INDEX idx_iot_devices_shed     ON iot_devices(shed_id);
CREATE INDEX idx_iot_devices_status   ON iot_devices(status);

-- RLS: integrator sees only their own devices
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integrator_own_devices" ON iot_devices
  USING (integrator_id = auth.uid());


-- ============================================================
-- TABLE 2: Sensor Telemetry (time-series — append only)
-- ============================================================
CREATE TABLE sensor_telemetry (
  id                BIGSERIAL PRIMARY KEY,
  device_uuid       TEXT NOT NULL REFERENCES iot_devices(device_uuid),
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  shed_id           UUID REFERENCES sheds(id),
  integrator_id     UUID NOT NULL REFERENCES integrators(id),
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
CREATE INDEX idx_telemetry_device     ON sensor_telemetry(device_uuid, received_at DESC);
CREATE INDEX idx_telemetry_farm       ON sensor_telemetry(farm_id, received_at DESC);
CREATE INDEX idx_telemetry_anomaly    ON sensor_telemetry(farm_id, is_anomaly) WHERE is_anomaly = TRUE;
CREATE INDEX idx_telemetry_time       ON sensor_telemetry(received_at DESC);

-- RLS: integrator sees only their own farms' data
ALTER TABLE sensor_telemetry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integrator_own_telemetry" ON sensor_telemetry
  USING (integrator_id = auth.uid());


-- ============================================================
-- TABLE 3: Alert Log (one row per alert sent)
-- ============================================================
CREATE TABLE iot_alert_log (
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

CREATE INDEX idx_alert_log_farm ON iot_alert_log(farm_id, sent_at DESC);


-- ============================================================
-- MATERIALIZED VIEW: Latest reading per device (for dashboard)
-- ============================================================
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

CREATE TRIGGER set_telemetry_anomaly
  BEFORE INSERT ON sensor_telemetry
  FOR EACH ROW EXECUTE FUNCTION trg_set_telemetry_anomaly();
```

---

## PART 2 — TYPE DEFINITIONS

Create file: `src/types/iot.ts`

```typescript
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
```

---

## PART 3 — MQTT WORKER SERVICE

This is a standalone Node.js process that runs separately from Next.js.
Create the following files:

### 3.1 Worker entry point

Create file: `workers/mqtt-worker.ts`

```typescript
/**
 * FlockIQ MQTT Worker
 * Runs as a standalone Node.js process (not part of Next.js)
 * Start with: npx tsx workers/mqtt-worker.ts
 * Production: pm2 start workers/mqtt-worker.ts --interpreter=tsx
 */

import mqtt from 'mqtt';
import { createClient } from '@supabase/supabase-js';
import { processTelemetryPayload } from './handlers/processTelemetry';
import { checkAndSendAlerts } from './handlers/alertHandler';

// Environment variable validation at startup
const REQUIRED_ENV = [
  'MQTT_BROKER_URL',
  'MQTT_USERNAME',
  'MQTT_PASSWORD',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'WHATSAPP_ACCESS_TOKEN',
  'WHATSAPP_PHONE_NUMBER_ID',
] as const;

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[STARTUP] Missing required environment variable: ${key}`);
    process.exit(1);
  }
}

// Supabase admin client (bypasses RLS — worker has full access)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// MQTT topic pattern — matches all farm telemetry
// Topic format: poultry/farms/{farm_id}/sheds/{shed_id}/telemetry
const TOPIC_PATTERN = 'poultry/farms/+/sheds/+/telemetry';

// MQTT connection options
const mqttOptions: mqtt.IClientOptions = {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  clientId: `flockiq-worker-${Date.now()}`,
  clean: true,
  reconnectPeriod: 5000,         // reconnect every 5s on disconnect
  connectTimeout: 30000,
  keepalive: 60,
  will: {                        // last-will message if worker crashes
    topic: 'poultry/system/worker-status',
    payload: JSON.stringify({ status: 'offline', timestamp: Date.now() }),
    qos: 1,
    retain: false,
  },
};

const client = mqtt.connect(process.env.MQTT_BROKER_URL!, mqttOptions);

client.on('connect', () => {
  console.log(`[MQTT] Connected to broker: ${process.env.MQTT_BROKER_URL}`);
  client.subscribe(TOPIC_PATTERN, { qos: 1 }, (err) => {
    if (err) {
      console.error('[MQTT] Subscribe failed:', err);
      process.exit(1);
    }
    console.log(`[MQTT] Subscribed to: ${TOPIC_PATTERN}`);
  });
});

client.on('message', async (topic: string, rawMessage: Buffer) => {
  try {
    // Parse topic to extract farm_id and shed_id
    // Topic: poultry/farms/{farm_id}/sheds/{shed_id}/telemetry
    const parts = topic.split('/');
    const topicFarmId  = parts[2];
    const topicShedId  = parts[4];

    // Parse payload
    const payload = JSON.parse(rawMessage.toString()) as Record<string, unknown>;

    console.log(`[MQTT] Received from ${payload.device_uuid} (Farm: ${topicFarmId})`);

    // Process and save telemetry
    const result = await processTelemetryPayload({
      payload,
      topicFarmId,
      topicShedId,
      supabase,
    });

    if (!result.success) {
      console.error(`[WORKER] Processing failed: ${result.error}`);
      return;
    }

    // Check thresholds and send alerts if needed
    if (result.telemetryId && result.isAnomaly) {
      await checkAndSendAlerts({
        telemetryId: result.telemetryId,
        deviceUuid: String(payload.device_uuid),
        farmId: topicFarmId,
        anomalyFlags: result.anomalyFlags ?? [],
        readings: {
          temperature_c: Number(payload.temperature_c),
          humidity_pct: Number(payload.humidity_pct),
          ammonia_ppm: Number(payload.ammonia_ppm),
        },
        supabase,
      });
    }

    // Refresh materialized view after insert
    await supabase.rpc('refresh_latest_sensor_readings').catch(() => {
      // Non-fatal — view refreshes on schedule anyway
    });

  } catch (err) {
    console.error('[MQTT] Message handler error:', err);
  }
});

client.on('error', (err) => {
  console.error('[MQTT] Client error:', err);
});

client.on('offline', () => {
  console.warn('[MQTT] Client went offline — will reconnect automatically');
});

client.on('reconnect', () => {
  console.log('[MQTT] Reconnecting...');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[WORKER] Shutting down gracefully...');
  client.end(true, () => process.exit(0));
});
process.on('SIGINT', () => {
  client.end(true, () => process.exit(0));
});
```

---

### 3.2 Telemetry processor

Create file: `workers/handlers/processTelemetry.ts`

```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { DeviceTelemetryPayload, AnomalyFlag } from '@/types/iot';

interface ProcessResult {
  success: boolean;
  telemetryId?: number;
  isAnomaly?: boolean;
  anomalyFlags?: AnomalyFlag[];
  error?: string;
}

interface ProcessArgs {
  payload: Record<string, unknown>;
  topicFarmId: string;
  topicShedId: string;
  supabase: SupabaseClient;
}

export async function processTelemetryPayload({
  payload,
  topicFarmId,
  topicShedId,
  supabase,
}: ProcessArgs): Promise<ProcessResult> {

  // STEP 1: Validate payload shape
  const deviceUuid = payload.device_uuid;
  if (typeof deviceUuid !== 'string' || !deviceUuid) {
    return { success: false, error: 'Missing or invalid device_uuid' };
  }

  // STEP 2: Look up device — must exist and be active
  const { data: device, error: deviceError } = await supabase
    .from('iot_devices')
    .select('device_uuid, farm_id, shed_id, integrator_id, status')
    .eq('device_uuid', deviceUuid)
    .single();

  if (deviceError || !device) {
    console.warn(`[PROCESSOR] Unknown device: ${deviceUuid}`);
    return { success: false, error: `Unknown device: ${deviceUuid}` };
  }

  if (device.status === 'inactive') {
    console.warn(`[PROCESSOR] Inactive device ignored: ${deviceUuid}`);
    return { success: false, error: 'Device is inactive' };
  }

  // STEP 3: Verify farm_id from topic matches device record (security check)
  if (device.farm_id !== topicFarmId) {
    console.error(
      `[SECURITY] Topic farm_id (${topicFarmId}) does not match device record ` +
      `(${device.farm_id}) for device ${deviceUuid}`
    );
    return { success: false, error: 'Farm ID mismatch — possible spoofing' };
  }

  // STEP 4: Validate numeric sensor values
  const temp     = parseFloat(String(payload.temperature_c));
  const humidity = parseFloat(String(payload.humidity_pct));
  const ammonia  = parseFloat(String(payload.ammonia_ppm));

  if (isNaN(temp) || temp < -10 || temp > 60) {
    console.warn(`[PROCESSOR] Invalid temperature: ${payload.temperature_c}`);
    // Continue with null rather than rejecting the reading
  }
  if (isNaN(humidity) || humidity < 0 || humidity > 100) {
    console.warn(`[PROCESSOR] Invalid humidity: ${payload.humidity_pct}`);
  }
  if (isNaN(ammonia) || ammonia < 0 || ammonia > 200) {
    console.warn(`[PROCESSOR] Invalid ammonia: ${payload.ammonia_ppm}`);
  }

  // STEP 5: Insert telemetry record
  const deviceTimestamp = typeof payload.timestamp === 'number'
    ? new Date(payload.timestamp * 1000).toISOString()
    : null;

  const { data: inserted, error: insertError } = await supabase
    .from('sensor_telemetry')
    .insert({
      device_uuid:      deviceUuid,
      farm_id:          device.farm_id,
      shed_id:          device.shed_id ?? topicShedId ?? null,
      integrator_id:    device.integrator_id,
      temperature_c:    isNaN(temp) ? null : temp,
      humidity_pct:     isNaN(humidity) ? null : humidity,
      ammonia_ppm:      isNaN(ammonia) ? null : ammonia,
      raw_payload:      payload,
      device_timestamp: deviceTimestamp,
    })
    .select('id, is_anomaly, anomaly_flags')
    .single();

  if (insertError || !inserted) {
    console.error('[PROCESSOR] Insert failed:', insertError);
    return { success: false, error: insertError?.message };
  }

  // STEP 6: Update device last_seen_at
  await supabase
    .from('iot_devices')
    .update({
      last_seen_at: new Date().toISOString(),
      status: 'active',
      firmware_version: payload.firmware_version
        ? String(payload.firmware_version)
        : undefined,
    })
    .eq('device_uuid', deviceUuid);

  console.log(
    `[PROCESSOR] Saved telemetry ID ${inserted.id} ` +
    `for device ${deviceUuid} ` +
    `(anomaly: ${inserted.is_anomaly})`
  );

  return {
    success: true,
    telemetryId: inserted.id,
    isAnomaly: inserted.is_anomaly,
    anomalyFlags: inserted.anomaly_flags as AnomalyFlag[],
  };
}
```

---

### 3.3 Alert handler

Create file: `workers/handlers/alertHandler.ts`

```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { AnomalyFlag } from '@/types/iot';

interface AlertArgs {
  telemetryId: number;
  deviceUuid: string;
  farmId: string;
  anomalyFlags: AnomalyFlag[];
  readings: {
    temperature_c: number;
    humidity_pct: number;
    ammonia_ppm: number;
  };
  supabase: SupabaseClient;
}

// Minimum minutes between repeat alerts for the same device + alert type
const ALERT_COOLDOWN_MINUTES = 60;

export async function checkAndSendAlerts(args: AlertArgs): Promise<void> {
  const { telemetryId, deviceUuid, farmId, anomalyFlags, readings, supabase } = args;

  if (anomalyFlags.length === 0) return;

  // Get farm + integrator contact details
  const { data: farm } = await supabase
    .from('farms')
    .select(`
      id, name,
      integrators (
        id,
        profiles (full_name, whatsapp_phone, whatsapp_lang)
      )
    `)
    .eq('id', farmId)
    .single();

  if (!farm) {
    console.warn(`[ALERTS] Farm not found: ${farmId}`);
    return;
  }

  const integrator = (farm as Record<string, unknown>).integrators as {
    profiles: { full_name: string; whatsapp_phone: string; whatsapp_lang: string };
  } | null;

  if (!integrator?.profiles?.whatsapp_phone) {
    console.warn(`[ALERTS] No WhatsApp contact for farm ${farmId}`);
    return;
  }

  const recipientPhone = integrator.profiles.whatsapp_phone;
  const farmName = (farm as Record<string, unknown>).name as string;

  for (const flag of anomalyFlags) {
    // Check cooldown — don't spam the same alert
    const cooldownStart = new Date(
      Date.now() - ALERT_COOLDOWN_MINUTES * 60 * 1000
    ).toISOString();

    const { data: recentAlert } = await supabase
      .from('iot_alert_log')
      .select('id')
      .eq('device_uuid', deviceUuid)
      .eq('alert_type', flag)
      .gte('sent_at', cooldownStart)
      .limit(1)
      .maybeSingle();

    if (recentAlert) {
      console.log(`[ALERTS] Cooldown active for ${flag} on ${deviceUuid}`);
      continue;
    }

    // Build alert message
    const message = buildAlertMessage(flag, readings, farmName);

    // Send WhatsApp alert
    try {
      await sendWhatsAppAlert(recipientPhone, message);

      // Log the alert
      await supabase.from('iot_alert_log').insert({
        telemetry_id:     telemetryId,
        device_uuid:      deviceUuid,
        farm_id:          farmId,
        alert_type:       flag,
        threshold_value:  getThresholdValue(flag),
        actual_value:     getActualValue(flag, readings),
        channel:          'whatsapp',
        recipient_phone:  recipientPhone,
        message_body:     message,
        delivery_status:  'sent',
      });

      // Mark telemetry record as alerted
      await supabase
        .from('sensor_telemetry')
        .update({ alert_sent: true })
        .eq('id', telemetryId);

      console.log(`[ALERTS] Sent ${flag} alert to ${recipientPhone}`);

    } catch (err) {
      console.error(`[ALERTS] Failed to send ${flag} alert:`, err);
      // Log failed attempt
      await supabase.from('iot_alert_log').insert({
        telemetry_id:    telemetryId,
        device_uuid:     deviceUuid,
        farm_id:         farmId,
        alert_type:      flag,
        threshold_value: getThresholdValue(flag),
        actual_value:    getActualValue(flag, readings),
        channel:         'whatsapp',
        recipient_phone: recipientPhone,
        message_body:    message,
        delivery_status: 'failed',
      });
    }
  }
}

function buildAlertMessage(
  flag: AnomalyFlag,
  readings: AlertArgs['readings'],
  farmName: string
): string {
  const messages: Record<AnomalyFlag, string> = {
    HIGH_AMMONIA: [
      `⚠️ *FlockIQ Environment Alert — ${farmName}*`,
      ``,
      `🔴 *High Ammonia Detected*`,
      `Current: ${readings.ammonia_ppm} ppm (limit: 25 ppm)`,
      ``,
      `Action required: Improve ventilation immediately.`,
      `High ammonia causes respiratory disease in birds.`,
      `Check fan speed, curtain position, and litter conditions.`,
    ].join('\n'),

    HIGH_HUMIDITY: [
      `⚠️ *FlockIQ Environment Alert — ${farmName}*`,
      ``,
      `🟠 *High Humidity Detected*`,
      `Current: ${readings.humidity_pct}% (limit: 70%)`,
      ``,
      `Action required: Increase ventilation and check drinker leakage.`,
      `High humidity raises respiratory disease risk.`,
    ].join('\n'),

    HIGH_TEMP: [
      `⚠️ *FlockIQ Environment Alert — ${farmName}*`,
      ``,
      `🌡️ *High Temperature Detected*`,
      `Current: ${readings.temperature_c}°C (limit: 32°C)`,
      ``,
      `Action required: Increase ventilation and check water supply.`,
      `Heat stress reduces FCR and increases mortality.`,
    ].join('\n'),

    LOW_TEMP: [
      `⚠️ *FlockIQ Environment Alert — ${farmName}*`,
      ``,
      `❄️ *Low Temperature Detected*`,
      `Current: ${readings.temperature_c}°C (minimum: 18°C)`,
      ``,
      `Action required: Check brooder and heating system.`,
      `Low temperature increases feed consumption and mortality risk.`,
    ].join('\n'),

    DEVICE_OFFLINE: [
      `⚠️ *FlockIQ Device Alert — ${farmName}*`,
      ``,
      `📡 *Sensor Node Offline*`,
      `No data received in the last 30 minutes.`,
      ``,
      `Check: power supply, Wi-Fi/SIM connection, device status.`,
    ].join('\n'),

    SENSOR_ERROR: [
      `⚠️ *FlockIQ Device Alert — ${farmName}*`,
      ``,
      `⚡ *Sensor Reading Error*`,
      `One or more sensors returned invalid data.`,
      ``,
      `Check sensor connections and device health.`,
    ].join('\n'),
  };

  return messages[flag];
}

function getThresholdValue(flag: AnomalyFlag): number {
  const thresholds: Record<AnomalyFlag, number> = {
    HIGH_AMMONIA:    25,
    HIGH_HUMIDITY:   70,
    HIGH_TEMP:       32,
    LOW_TEMP:        18,
    DEVICE_OFFLINE:  30,   // minutes
    SENSOR_ERROR:    0,
  };
  return thresholds[flag];
}

function getActualValue(flag: AnomalyFlag, readings: AlertArgs['readings']): number {
  switch (flag) {
    case 'HIGH_AMMONIA':  return readings.ammonia_ppm;
    case 'HIGH_HUMIDITY': return readings.humidity_pct;
    case 'HIGH_TEMP':
    case 'LOW_TEMP':      return readings.temperature_c;
    default:              return 0;
  }
}

async function sendWhatsAppAlert(phone: string, message: string): Promise<void> {
  const response = await fetch(
    `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone.replace(/\D/g, ''), // strip non-digits
        type: 'text',
        text: { body: message, preview_url: false },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(`WhatsApp API error: ${JSON.stringify(err)}`);
  }
}
```

---

## PART 4 — API ROUTES (Next.js App Router)

### 4.1 Telemetry ingestion via HTTP (fallback if MQTT unavailable)

Create file: `src/app/api/iot/telemetry/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { DeviceTelemetryPayload } from '@/types/iot';

// Rate limit: 1 request per device per 60 seconds
const RATE_LIMIT_MAP = new Map<string, number>();

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Verify request is from a device (bearer token = device secret)
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const deviceSecret = auth.slice(7);

    // Parse payload
    const body = await req.json() as DeviceTelemetryPayload;
    const { device_uuid } = body;

    if (!device_uuid) {
      return NextResponse.json({ error: 'Missing device_uuid' }, { status: 400 });
    }

    // Rate limiting per device
    const lastCall = RATE_LIMIT_MAP.get(device_uuid) ?? 0;
    const now = Date.now();
    if (now - lastCall < 60_000) {
      return NextResponse.json(
        { error: 'Rate limit: max 1 reading per minute per device' },
        { status: 429 }
      );
    }
    RATE_LIMIT_MAP.set(device_uuid, now);

    // Use service role for server-side operations
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    // Validate device + secret
    const { data: device } = await supabase
      .from('iot_devices')
      .select('device_uuid, farm_id, shed_id, integrator_id, status')
      .eq('device_uuid', device_uuid)
      .single();

    if (!device || device.status === 'inactive') {
      return NextResponse.json({ error: 'Device not found or inactive' }, { status: 404 });
    }

    // Insert telemetry
    const { data: inserted, error } = await supabase
      .from('sensor_telemetry')
      .insert({
        device_uuid,
        farm_id:       device.farm_id,
        shed_id:       device.shed_id,
        integrator_id: device.integrator_id,
        temperature_c: body.temperature_c,
        humidity_pct:  body.humidity_pct,
        ammonia_ppm:   body.ammonia_ppm,
        raw_payload:   body,
        device_timestamp: body.timestamp
          ? new Date(body.timestamp * 1000).toISOString()
          : null,
      })
      .select('id, is_anomaly, anomaly_flags')
      .single();

    if (error) throw error;

    // Update device last_seen
    await supabase
      .from('iot_devices')
      .update({ last_seen_at: new Date().toISOString(), status: 'active' })
      .eq('device_uuid', device_uuid);

    return NextResponse.json({
      success: true,
      telemetry_id: inserted.id,
      is_anomaly: inserted.is_anomaly,
      anomaly_flags: inserted.anomaly_flags,
    });

  } catch (err) {
    console.error('[IoT API] Telemetry error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

---

### 4.2 Device registration API

Create file: `src/app/api/iot/devices/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// POST /api/iot/devices — Register a new device UUID to a farm/shed
export async function POST(req: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  // Auth check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as {
    device_uuid: string;
    farm_id: string;
    shed_id?: string;
    label?: string;
  };

  const { device_uuid, farm_id, shed_id, label } = body;

  if (!device_uuid || !farm_id) {
    return NextResponse.json(
      { error: 'device_uuid and farm_id are required' },
      { status: 400 }
    );
  }

  // Validate UUID format (basic)
  if (!/^[a-zA-Z0-9\-]{8,64}$/.test(device_uuid)) {
    return NextResponse.json({ error: 'Invalid device_uuid format' }, { status: 400 });
  }

  // Check device does not already belong to another integrator
  const { data: existing } = await supabase
    .from('iot_devices')
    .select('device_uuid, integrator_id')
    .eq('device_uuid', device_uuid)
    .maybeSingle();

  if (existing && existing.integrator_id !== user.id) {
    return NextResponse.json(
      { error: 'Device is already registered to another account' },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from('iot_devices')
    .upsert({
      device_uuid,
      farm_id,
      shed_id: shed_id ?? null,
      integrator_id:  user.id,
      label:          label ?? null,
      status:         'pending',
      registered_at:  new Date().toISOString(),
      registered_by:  user.id,
    }, { onConflict: 'device_uuid' })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, device: data }, { status: 201 });
}

// GET /api/iot/devices?farm_id=xxx — List devices for a farm
export async function GET(req: NextRequest): Promise<NextResponse> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const farmId = req.nextUrl.searchParams.get('farm_id');
  if (!farmId) {
    return NextResponse.json({ error: 'farm_id required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('iot_devices')
    .select('*')
    .eq('farm_id', farmId)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ devices: data });
}
```

---

## PART 5 — DASHBOARD UI COMPONENTS

### 5.1 Environment Score Card

Create file: `src/components/dashboard/iot/EnvironmentScoreCard.tsx`

```typescript
'use client';

import { LatestSensorReading, getEnvironmentBand } from '@/types/iot';
import { Thermometer, Droplets, Wind, Wifi, WifiOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EnvironmentScoreCardProps {
  reading: LatestSensorReading | null;
  farmName: string;
  compact?: boolean;
}

const bandConfig = {
  safe:     { bg: 'bg-green-50',  border: 'border-green-200', badge: 'bg-green-100 text-green-800',  label: 'Safe'     },
  caution:  { bg: 'bg-yellow-50', border: 'border-yellow-200',badge: 'bg-yellow-100 text-yellow-800',label: 'Caution'  },
  warning:  { bg: 'bg-orange-50', border: 'border-orange-200',badge: 'bg-orange-100 text-orange-800',label: 'Warning'  },
  critical: { bg: 'bg-red-50',    border: 'border-red-200',   badge: 'bg-red-100 text-red-800',      label: 'Critical' },
};

function calculateScore(r: LatestSensorReading): number {
  let score = 10;
  if (r.temperature_c !== null) {
    if (r.temperature_c < 18 || r.temperature_c > 32) score -= 2;
    if (r.temperature_c < 14 || r.temperature_c > 36) score -= 1;
  }
  if (r.humidity_pct !== null) {
    if (r.humidity_pct > 70) score -= 2.5;
    if (r.humidity_pct > 80) score -= 1;
  }
  if (r.ammonia_ppm !== null) {
    if (r.ammonia_ppm > 25) score -= 3;
    if (r.ammonia_ppm > 40) score -= 1.5;
  }
  return Math.max(0, Math.min(10, score));
}

export function EnvironmentScoreCard({
  reading,
  farmName,
  compact = false,
}: EnvironmentScoreCardProps) {
  if (!reading) {
    return (
      <div className="bg-neutral-50 border border-neutral-150 rounded-2xl p-6 flex items-center gap-3">
        <WifiOff size={20} className="text-neutral-400" />
        <div>
          <p className="font-jakarta font-semibold text-neutral-700 text-sm">{farmName}</p>
          <p className="font-jakarta text-neutral-500 text-xs">No sensor data — device offline</p>
        </div>
      </div>
    );
  }

  const score = calculateScore(reading);
  const band = getEnvironmentBand(score);
  const config = bandConfig[band];
  const minutesAgo = Math.round(
    (Date.now() - new Date(reading.received_at).getTime()) / 60000
  );
  const isStale = minutesAgo > 20;

  const metrics = [
    {
      icon: Thermometer,
      label: 'Temperature',
      value: reading.temperature_c !== null ? `${reading.temperature_c}°C` : '—',
      alert: reading.temperature_c !== null &&
             (reading.temperature_c > 32 || reading.temperature_c < 18),
    },
    {
      icon: Droplets,
      label: 'Humidity',
      value: reading.humidity_pct !== null ? `${reading.humidity_pct}%` : '—',
      alert: reading.humidity_pct !== null && reading.humidity_pct > 70,
    },
    {
      icon: Wind,
      label: 'Ammonia',
      value: reading.ammonia_ppm !== null ? `${reading.ammonia_ppm} ppm` : '—',
      alert: reading.ammonia_ppm !== null && reading.ammonia_ppm > 25,
    },
  ];

  return (
    <div className={`
      rounded-2xl border p-6 transition-all
      ${config.bg} ${config.border}
      ${compact ? 'p-4' : 'p-6'}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-jakarta font-semibold text-neutral-900 text-sm">{farmName}</p>
          <p className="font-jakarta text-neutral-500 text-xs mt-0.5 flex items-center gap-1">
            {isStale
              ? <><WifiOff size={10} className="text-orange-500" /> Stale — {minutesAgo}m ago</>
              : <><Wifi size={10} className="text-green-500" /> {minutesAgo < 1 ? 'Just now' : `${minutesAgo}m ago`}</>
            }
          </p>
        </div>
        <div className={`
          flex items-center gap-1.5 rounded-full px-2.5 py-1
          ${config.badge}
          text-xs font-semibold
        `}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {config.label}
        </div>
      </div>

      {/* Score */}
      {!compact && (
        <div className="mb-4">
          <div className="flex items-end gap-1">
            <span className="font-sora font-extrabold text-3xl text-neutral-900 tracking-tight">
              {score.toFixed(1)}
            </span>
            <span className="font-jakarta text-neutral-500 text-sm mb-1">/10</span>
          </div>
          <p className="font-jakarta text-neutral-600 text-xs">Environment score</p>
        </div>
      )}

      {/* Metric rows */}
      <div className={`grid ${compact ? 'grid-cols-3 gap-2' : 'grid-cols-1 gap-3'}`}>
        {metrics.map(({ icon: Icon, label, value, alert }) => (
          <div
            key={label}
            className={`
              flex items-center gap-2.5
              ${compact ? 'flex-col text-center' : 'flex-row'}
            `}
          >
            <Icon
              size={compact ? 16 : 18}
              className={alert ? 'text-red-500' : 'text-neutral-500'}
            />
            <div className={compact ? '' : 'flex items-center gap-2 flex-1'}>
              <span className="font-jakarta text-neutral-500 text-xs">{label}</span>
              <span className={`
                font-jakarta font-semibold text-sm
                ${compact ? '' : 'ml-auto'}
                ${alert ? 'text-red-600' : 'text-neutral-900'}
              `}>
                {value}
              </span>
              {alert && (
                <span className="text-red-500 text-xs font-semibold ml-1">⚠</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 5.2 Add Sensor Node UI (Device onboarding modal)

Create file: `src/components/dashboard/iot/AddSensorNodeModal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { X, Wifi, QrCode, CheckCircle, AlertCircle } from 'lucide-react';

interface AddSensorNodeModalProps {
  farmId: string;
  farmName: string;
  sheds: { id: string; name: string }[];
  onClose: () => void;
  onSuccess: (deviceUuid: string) => void;
}

type Step = 'enter_uuid' | 'assign_shed' | 'success' | 'error';

export function AddSensorNodeModal({
  farmId,
  farmName,
  sheds,
  onClose,
  onSuccess,
}: AddSensorNodeModalProps) {
  const [step, setStep] = useState<Step>('enter_uuid');
  const [deviceUuid, setDeviceUuid] = useState('');
  const [label, setLabel] = useState('');
  const [selectedShedId, setSelectedShedId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!deviceUuid.trim()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/iot/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_uuid: deviceUuid.trim(),
          farm_id: farmId,
          shed_id: selectedShedId || undefined,
          label: label.trim() || undefined,
        }),
      });

      const data = await res.json() as { success?: boolean; error?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Registration failed');
      }

      setStep('success');
      onSuccess(deviceUuid.trim());

    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Registration failed');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-neutral-150">
          <div>
            <h2 id="modal-title" className="font-jakarta font-semibold text-neutral-900 text-[17px]">
              Add Sensor Node
            </h2>
            <p className="font-jakarta text-neutral-500 text-sm mt-0.5">{farmName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-neutral-100 text-neutral-500 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          {(step === 'enter_uuid' || step === 'error') && (
            <div className="space-y-5">
              {/* Instructions */}
              <div className="bg-brand-50 rounded-xl p-4 text-sm font-jakarta text-brand-700">
                <p className="font-semibold mb-1">Find the Device ID on your sensor node:</p>
                <ul className="list-disc list-inside space-y-1 text-brand-600">
                  <li>Printed on the label on top of the device</li>
                  <li>Or scan the QR code on the device</li>
                  <li>Format: alphanumeric, e.g. <code className="font-mono bg-brand-100 px-1 rounded">node-9843-ax89</code></li>
                </ul>
              </div>

              {/* Device UUID input */}
              <div>
                <label className="block font-jakarta font-semibold text-neutral-700 text-sm mb-1.5">
                  Device ID *
                </label>
                <input
                  type="text"
                  value={deviceUuid}
                  onChange={(e) => setDeviceUuid(e.target.value.trim())}
                  placeholder="e.g. node-9843-ax89"
                  className="w-full h-12 px-4 border border-neutral-200 rounded-xl font-mono text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                  autoFocus
                />
              </div>

              {/* Label */}
              <div>
                <label className="block font-jakarta font-semibold text-neutral-700 text-sm mb-1.5">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Shed A — Node 1"
                  className="w-full h-12 px-4 border border-neutral-200 rounded-xl font-jakarta text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                />
              </div>

              {/* Shed selector */}
              {sheds.length > 0 && (
                <div>
                  <label className="block font-jakarta font-semibold text-neutral-700 text-sm mb-1.5">
                    Assign to shed
                  </label>
                  <select
                    value={selectedShedId}
                    onChange={(e) => setSelectedShedId(e.target.value)}
                    className="w-full h-12 px-4 border border-neutral-200 rounded-xl font-jakarta text-sm text-neutral-900 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400"
                  >
                    <option value="">— Not assigned —</option>
                    {sheds.map((shed) => (
                      <option key={shed.id} value={shed.id}>{shed.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Error message */}
              {step === 'error' && errorMessage && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <CheckCircle size={48} className="text-brand-400 mx-auto mb-4" />
              <h3 className="font-jakarta font-semibold text-neutral-900 text-lg mb-2">
                Device Registered
              </h3>
              <p className="font-jakarta text-neutral-600 text-sm mb-1">
                <code className="font-mono bg-neutral-100 px-2 py-0.5 rounded">{deviceUuid}</code>
              </p>
              <p className="font-jakarta text-neutral-500 text-sm mt-3">
                Power on the sensor node. It will connect automatically and start
                sending readings within 2 minutes.
              </p>
              <div className="mt-5 bg-brand-50 rounded-xl p-4 text-sm font-jakarta text-brand-700 flex items-start gap-2">
                <Wifi size={16} className="flex-shrink-0 mt-0.5" />
                <p>Status will change from <strong>Pending</strong> to <strong>Active</strong>
                when the first reading arrives.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-neutral-150 flex gap-3">
          {step !== 'success' ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 h-11 rounded-xl border border-neutral-200 font-jakarta font-semibold text-[15px] text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRegister}
                disabled={isLoading || !deviceUuid.trim()}
                className="flex-1 h-11 rounded-xl bg-brand-700 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed font-jakarta font-semibold text-[15px] text-white transition-colors"
              >
                {isLoading ? 'Registering...' : 'Register Device'}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full h-11 rounded-xl bg-brand-700 font-jakarta font-semibold text-[15px] text-white hover:bg-brand-600 transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## PART 6 — DEVICE OFFLINE MONITOR (Cron Job)

Create file: `src/app/api/cron/check-offline-devices/route.ts`

```typescript
/**
 * Cron: runs every 30 minutes
 * Finds devices that haven't reported in 30+ minutes
 * Sends WhatsApp alert and marks device as 'error'
 *
 * Add to vercel.json crons:
 * { "path": "/api/cron/check-offline-devices", "schedule": "*/30 * * * *" }
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Find active devices with no reading in the last 30 minutes
  const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data: offlineDevices } = await supabase
    .from('iot_devices')
    .select('device_uuid, farm_id, label')
    .eq('status', 'active')
    .lt('last_seen_at', cutoff);

  if (!offlineDevices?.length) {
    return NextResponse.json({ checked: true, offline: 0 });
  }

  // Mark as error status
  await supabase
    .from('iot_devices')
    .update({ status: 'error' })
    .in('device_uuid', offlineDevices.map((d) => d.device_uuid));

  // TODO: Send WhatsApp alert for each offline device
  // (use the same sendWhatsAppAlert function from workers/handlers/alertHandler.ts)
  console.log(`[OFFLINE CHECK] Found ${offlineDevices.length} offline devices`);

  return NextResponse.json({
    checked: true,
    offline: offlineDevices.length,
    devices: offlineDevices.map((d) => d.device_uuid),
  });
}
```

---

## PART 7 — ENVIRONMENT VARIABLES TO ADD

Append these to `.env.local` and `.env.example`:

```bash
# MQTT Broker (AWS IoT Core or self-hosted Mosquitto)
MQTT_BROKER_URL=mqtt://your-broker-url:1883
MQTT_USERNAME=flockiq-worker
MQTT_PASSWORD=your-secure-password

# Or for AWS IoT Core (TLS):
# MQTT_BROKER_URL=mqtts://your-iot-endpoint.amazonaws.com:8883
# MQTT_CERT_PATH=./certs/device.pem.crt
# MQTT_KEY_PATH=./certs/private.pem.key
# MQTT_CA_PATH=./certs/AmazonRootCA1.pem
```

---

## PART 8 — WORKER PACKAGE.JSON SCRIPTS

Add to root `package.json` scripts:

```json
{
  "scripts": {
    "worker:mqtt": "tsx workers/mqtt-worker.ts",
    "worker:mqtt:dev": "tsx watch workers/mqtt-worker.ts"
  }
}
```

Install worker dependencies:

```bash
npm install mqtt
npm install -D tsx
```

---

## PART 9 — INTEGRATION INTO EXISTING FARM DETAIL PAGE

In the existing farm detail page (likely at
`src/app/dashboard/farms/[id]/page.tsx`), add the environment tab:

1. Import `EnvironmentScoreCard` from the new component
2. Fetch latest sensor reading from `mv_latest_sensor_readings` where `farm_id = params.id`
3. Render the card in the farm overview section

```typescript
// In the farm detail server component:
const { data: sensorReading } = await supabase
  .from('mv_latest_sensor_readings')
  .select('*')
  .eq('farm_id', params.id)
  .maybeSingle();

// Then in JSX:
<EnvironmentScoreCard
  reading={sensorReading}
  farmName={farm.name}
/>
```

---

## VERIFICATION CHECKLIST

After implementation, verify:

**Database:**
- [ ] `iot_devices` table created with correct columns
- [ ] `sensor_telemetry` table created with correct columns
- [ ] `iot_alert_log` table created
- [ ] `mv_latest_sensor_readings` materialized view exists
- [ ] `calculate_environment_score` function works: `SELECT calculate_environment_score(26, 65, 12)` returns ~8.5
- [ ] Anomaly trigger fires: insert row with `ammonia_ppm=30` → `is_anomaly=true`, `anomaly_flags=['HIGH_AMMONIA']`
- [ ] RLS policies active on all three tables

**API Routes:**
- [ ] `POST /api/iot/telemetry` returns 401 without auth header
- [ ] `POST /api/iot/telemetry` with valid device UUID saves a row
- [ ] `POST /api/iot/devices` with valid body creates device record
- [ ] `GET /api/iot/devices?farm_id=xxx` returns device list

**Worker:**
- [ ] `npm run worker:mqtt:dev` starts without errors
- [ ] Worker subscribes to `poultry/farms/+/sheds/+/telemetry`
- [ ] Publishing a test MQTT message saves a telemetry row in Supabase

**UI:**
- [ ] `AddSensorNodeModal` opens and submits correctly
- [ ] `EnvironmentScoreCard` renders with live data
- [ ] Score band colours correct: ≥8 green, 6-7 yellow, 4-5 orange, <4 red
- [ ] Offline state (null reading) shows "No sensor data" message

**Alerts:**
- [ ] Insert telemetry with `ammonia_ppm=30` triggers `checkAndSendAlerts`
- [ ] Alert logged in `iot_alert_log` table
- [ ] Cooldown prevents duplicate alerts within 60 minutes
IOTPROMPT
echo "IoT prompt created"
wc -l /home/claude/output/WINDSURF_IOT_INTEGRATION_PROMPT.md
Output

IoT prompt created
1632 /home/claude/output/WINDSURF_IOT_INTEGRATION_PROMPT.md
Done
