import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const companySchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  company_name_hi: z.string().optional(),
  gst_number: z.string().optional(),
  pan_number: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().default('Uttar Pradesh'),
  pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode').optional().or(z.literal('')),
  phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  logo_url: z.string().optional(),
  financial_year_start: z.number().min(1).max(12).default(4),
  currency_code: z.string().default('INR'),
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

    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('integrator_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      data,
      error: null,
      meta: { total: data?.length || 0 }
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch companies / कंपनियां प्राप्त करने में विफल',
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
    const validatedData = companySchema.parse(body);

    const { data, error } = await supabase
      .from('companies')
      .insert({
        integrator_id: user.id,
        company_name: validatedData.company_name,
        company_name_hi: validatedData.company_name_hi || null,
        gst_number: validatedData.gst_number || null,
        pan_number: validatedData.pan_number || null,
        address_line1: validatedData.address_line1 || null,
        address_line2: validatedData.address_line2 || null,
        city: validatedData.city || null,
        state: validatedData.state,
        pincode: validatedData.pincode || null,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        logo_url: validatedData.logo_url || null,
        financial_year_start: validatedData.financial_year_start,
        currency_code: validatedData.currency_code,
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

    console.error('Error creating company:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create company / कंपनी बनाने में विफल',
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
        { error: 'Company ID is required / कंपनी आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const validatedData = companySchema.parse(updateData);

    // Verify ownership
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('id', id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found or unauthorized / कंपनी नहीं मिली या अनधिकृत' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('companies')
      .update({
        company_name: validatedData.company_name,
        company_name_hi: validatedData.company_name_hi || null,
        gst_number: validatedData.gst_number || null,
        pan_number: validatedData.pan_number || null,
        address_line1: validatedData.address_line1 || null,
        address_line2: validatedData.address_line2 || null,
        city: validatedData.city || null,
        state: validatedData.state,
        pincode: validatedData.pincode || null,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        logo_url: validatedData.logo_url || null,
        financial_year_start: validatedData.financial_year_start,
        currency_code: validatedData.currency_code,
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

    console.error('Error updating company:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update company / कंपनी अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
