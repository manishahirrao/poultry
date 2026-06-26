import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const vehicleSchema = z.object({
  vehicle_number: z.string().min(1, 'Vehicle number is required'),
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  capacity_kg: z.number().min(0, 'Capacity must be positive'),
  owner_name: z.string().min(1, 'Owner name is required'),
  owner_phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  rc_number: z.string().optional(),
  insurance_expiry: z.string().optional(),
  is_owned: z.boolean().default(false),
  remarks: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not initialized' },
        { status: 500 }
      );
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isActive = searchParams.get('is_active');

    let query = supabase
      .from('vehicles')
      .select('*')
      .eq('integrator_id', user.id)
      .order('vehicle_number', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      data: data || [],
      error: null,
      meta: {
        total: count || 0,
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch vehicles / वाहन प्राप्त करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not initialized' },
        { status: 500 }
      );
    }
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = vehicleSchema.parse(body);

    // Generate vehicle code
    const { data: lastVehicle } = await supabase
      .from('vehicles')
      .select('vehicleCode')
      .eq('integrator_id', user.id)
      .order('vehicleCode', { ascending: false })
      .limit(1)
      .single();

    let sequence = 1;
    if (lastVehicle) {
      const lastSequence = parseInt(lastVehicle.vehicleCode.replace('VEH-', ''));
      sequence = lastSequence + 1;
    }

    const vehicleCode = `VEH-${sequence.toString().padStart(4, '0')}`;

    const { data, error } = await supabase
      .from('vehicles')
      .insert({
        integrator_id: user.id,
        vehicleCode,
        vehicle_number: validatedData.vehicle_number.toUpperCase(),
        vehicle_type: validatedData.vehicle_type,
        capacity_kg: validatedData.capacity_kg,
        owner_name: validatedData.owner_name,
        owner_phone: validatedData.owner_phone,
        rc_number: validatedData.rc_number || null,
        insurance_expiry: validatedData.insurance_expiry || null,
        is_owned: validatedData.is_owned,
        remarks: validatedData.remarks || null,
        is_active: true,
        created_by: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      data,
      error: null,
      meta: { total: 1 }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error / सत्यापन त्रुटि',
          details: error.errors,
          data: null 
        },
        { status: 400 }
      );
    }

    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create vehicle / वाहन बनाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
