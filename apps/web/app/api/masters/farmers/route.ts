import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const farmerSchema = z.object({
  full_name: z.string().min(1, 'Farmer name is required'),
  name_hi: z.string().optional(),
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number'),
  alternate_phone: z.string().regex(/^[0-9]{10}$/, 'Invalid alternate phone').optional().or(z.literal('')),
  village: z.string().optional(),
  tehsil: z.string().optional(),
  district: z.string().optional(),
  state: z.string().default('Uttar Pradesh'),
  bank_account: z.string().optional(),
  bank_ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC').optional().or(z.literal('')),
  bank_name: z.string().optional(),
  aadhar_number: z.string().regex(/^\d{12}$/, 'Invalid Aadhar number').optional().or(z.literal('')),
  linked_farm_ids: z.array(z.string().uuid()).optional(),
  supervisor_id: z.string().uuid().nullable().optional(),
  line_id: z.string().uuid().nullable().optional(),
  notes: z.string().optional(),
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
    const district = searchParams.get('district');
    const supervisorId = searchParams.get('supervisor_id');
    const lineId = searchParams.get('line_id');

    let query = supabase
      .from('farmers')
      .select(`
        *,
        employees!supervisor_farmers(id, name, phone),
        branches!line_farmers(id, branch_name, branch_type),
        farms!linked_farm_farmers(id, farm_name, village)
      `)
      .eq('integrator_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (district) {
      query = query.eq('district', district);
    }
    if (supervisorId) {
      query = query.eq('supervisor_id', supervisorId);
    }
    if (lineId) {
      query = query.eq('line_id', lineId);
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
    console.error('Error fetching farmers:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch farmers / किसानों को प्राप्त करने में विफल',
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
    const validatedData = farmerSchema.parse(body);

    // Generate farmer code
    const { data: existingFarmers } = await supabase
      .from('farmers')
      .select('farmer_code')
      .eq('integrator_id', user.id);

    const farmerCount = (existingFarmers?.length || 0) + 1;
    const farmerCode = `FMR-${String(farmerCount).padStart(3, '0')}`;

    const { data, error } = await supabase
      .from('farmers')
      .insert({
        integrator_id: user.id,
        farmer_code: farmerCode,
        full_name: validatedData.full_name,
        name_hi: validatedData.name_hi || null,
        phone: validatedData.phone,
        alternate_phone: validatedData.alternate_phone || null,
        village: validatedData.village || null,
        tehsil: validatedData.tehsil || null,
        district: validatedData.district || null,
        state: validatedData.state,
        bank_account: validatedData.bank_account || null,
        bank_ifsc: validatedData.bank_ifsc || null,
        bank_name: validatedData.bank_name || null,
        aadhar_number: validatedData.aadhar_number || null,
        linked_farm_ids: validatedData.linked_farm_ids || [],
        supervisor_id: validatedData.supervisor_id,
        line_id: validatedData.line_id,
        notes: validatedData.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
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

    console.error('Error creating farmer:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create farmer / किसान बनाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Farmer ID is required / किसान आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const validatedData = farmerSchema.parse(updateData);

    // Verify ownership
    const { data: existingFarmer } = await supabase
      .from('farmers')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingFarmer) {
      return NextResponse.json(
        { error: 'Farmer not found or unauthorized / किसान नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('farmers')
      .update({
        full_name: validatedData.full_name,
        name_hi: validatedData.name_hi || null,
        phone: validatedData.phone,
        alternate_phone: validatedData.alternate_phone || null,
        village: validatedData.village || null,
        tehsil: validatedData.tehsil || null,
        district: validatedData.district || null,
        state: validatedData.state,
        bank_account: validatedData.bank_account || null,
        bank_ifsc: validatedData.bank_ifsc || null,
        bank_name: validatedData.bank_name || null,
        aadhar_number: validatedData.aadhar_number || null,
        linked_farm_ids: validatedData.linked_farm_ids || [],
        supervisor_id: validatedData.supervisor_id,
        line_id: validatedData.line_id,
        notes: validatedData.notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
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

    console.error('Error updating farmer:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update farmer / किसान अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
