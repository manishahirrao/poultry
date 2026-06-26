import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const employeeGroupSchema = z.object({
  group_name: z.string().min(1, 'Group name is required'),
  group_name_hi: z.string().optional(),
  description: z.string().optional(),
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

    // Default employee groups
    const defaultGroups = [
      { id: '1', group_name: 'Farm Manager', group_name_hi: 'फार्म मैनेजर', description: 'Manages farm operations' },
      { id: '2', group_name: 'Field Supervisor', group_name_hi: 'फील्ड सुपरवाइजर', description: 'Supervises field activities' },
      { id: '3', group_name: 'Office Staff', group_name_hi: 'ऑफिस स्टाफ', description: 'Office administrative staff' },
      { id: '4', group_name: 'Driver', group_name_hi: 'ड्राइवर', description: 'Vehicle drivers' },
      { id: '5', group_name: 'Other', group_name_hi: 'अन्य', description: 'Other staff categories' },
    ];

    return NextResponse.json({
      data: defaultGroups,
      error: null,
      meta: { total: defaultGroups.length }
    });
  } catch (error) {
    console.error('Error fetching employee groups:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch employee groups / कर्मचारी समूह प्राप्त करने में विफल',
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
    const validatedData = employeeGroupSchema.parse(body);

    return NextResponse.json({
      data: { 
        id: crypto.randomUUID(),
        ...validatedData,
        created_at: new Date().toISOString(),
      },
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

    console.error('Error creating employee group:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create employee group / कर्मचारी समूह बनाने में विफल',
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
        { error: 'Employee group ID is required / कर्मचारी समूह आईडी आवश्यक है' },
        { status: 400 }
      );
    }

    const validatedData = employeeGroupSchema.parse(updateData);

    return NextResponse.json({
      data: {
        id,
        ...validatedData,
        updated_at: new Date().toISOString(),
      },
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

    console.error('Error updating employee group:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update employee group / कर्मचारी समूह अपडेट करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
