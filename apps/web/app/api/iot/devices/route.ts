import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

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
