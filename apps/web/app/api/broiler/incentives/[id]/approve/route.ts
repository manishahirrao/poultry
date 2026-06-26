import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const approveSchema = z.object({
  approved: z.boolean(),
});

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not initialized' },
        { status: 500 }
      );
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = approveSchema.parse(body);

    // First, get the incentive record to verify ownership
    const { data: incentive, error: fetchError } = await supabase
      .from('supervisor_incentives')
      .select('*')
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (fetchError || !incentive) {
      return NextResponse.json(
        { error: 'Incentive not found / प्रोत्साहन नहीं मिला' },
        { status: 404 }
      );
    }

    // Update the incentive status
    const { data: updatedIncentive, error: updateError } = await supabase
      .from('supervisor_incentives')
      .update({
        status: validatedData.approved ? 'approved' : 'pending',
        approved_by: validatedData.approved ? user.id : null,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json({
      data: updatedIncentive,
      error: null,
      meta: { total: 1 }
    });
  } catch (error: any) {
    console.error('Error approving incentive:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error / सत्यापन त्रुटि',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to approve incentive / प्रोत्साहन स्वीकृत करने में विफल',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
