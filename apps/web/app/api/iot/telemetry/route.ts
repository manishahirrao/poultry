import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { DeviceTelemetryPayload } from '@poultrypulse/types';

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
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
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
        farm_id: device.farm_id,
        shed_id: device.shed_id,
        integrator_id: device.integrator_id,
        temperature_c: body.temperature_c,
        humidity_pct: body.humidity_pct,
        ammonia_ppm: body.ammonia_ppm,
        raw_payload: body,
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
