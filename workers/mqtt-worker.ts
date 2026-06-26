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
