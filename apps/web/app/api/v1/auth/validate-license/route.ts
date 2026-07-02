import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const body = await request.json();
    const { key_code, phone } = body;

    const { data, error } = await supabase.from('license_keys').select('*').eq('key_code', key_code).single();

    if (error || !data) {
      return NextResponse.json({ error: 'License key not found' }, { status: 404 });
    }

    if (data.is_used) {
      return NextResponse.json({ error: 'This license key has already been used' }, { status: 400 });
    }
    
    // Auto-lock feature: If the license has an assigned_phone, ensure it matches the user's phone
    if (data.assigned_phone && data.assigned_phone !== phone) {
      return NextResponse.json({ error: 'This license key is registered to a different phone number' }, { status: 403 });
    }

    return NextResponse.json({
      status: 'valid',
      plan: data.plan_name
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
