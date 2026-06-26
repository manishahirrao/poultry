import { SupabaseClient } from '@supabase/supabase-js';
import { AnomalyFlag } from '@poultrypulse/types';

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
