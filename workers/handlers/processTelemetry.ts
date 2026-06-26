import { SupabaseClient } from '@supabase/supabase-js';
import { DeviceTelemetryPayload, AnomalyFlag } from '@poultrypulse/types';

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
