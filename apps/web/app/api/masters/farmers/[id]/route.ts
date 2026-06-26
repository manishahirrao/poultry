import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('farmers')
      .select(`
        *,
        employees!supervisor_farmers(id, name, phone),
        branches!line_farmers(id, branch_name, branch_type),
        farms!linked_farm_farmers(id, farm_name, village, district)
      `)
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json(
        { error: 'Farmer not found / किसान नहीं मिला' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data,
      error: null,
      meta: { total: 1 }
    });
  } catch (error) {
    console.error('Error fetching farmer:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch farmer / किसान प्राप्त करने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
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
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized / अनधिकृत' },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: existingFarmer } = await supabase
      .from('farmers')
      .select('id')
      .eq('id', params.id)
      .eq('integrator_id', user.id)
      .single();

    if (!existingFarmer) {
      return NextResponse.json(
        { error: 'Farmer not found or unauthorized / किसान नहीं मिला या अनधिकृत' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('farmers')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({
      data: { success: true },
      error: null,
      meta: { total: 0 }
    });
  } catch (error) {
    console.error('Error deleting farmer:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete farmer / किसान हटाने में विफल',
        data: null 
      },
      { status: 500 }
    );
  }
}
