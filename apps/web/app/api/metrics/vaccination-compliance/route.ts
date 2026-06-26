import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { searchParams } = new URL(request.url);
    const integratorId = searchParams.get('integrator_id');

    if (!integratorId) {
      return NextResponse.json({ error: 'Missing integrator_id' }, { status: 400 });
    }

    // Get session and verify user owns this integrator account
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', user.phone)
      .single();

    if (!customer) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (customer.id !== integratorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get today's date in IST
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000;
    const todayIST = new Date(now.getTime() + istOffset).toISOString().split('T')[0];

    // Fetch vaccinations with farm information
    const { data: vaccinations, error: vaccinationsError } = await supabase
      .from('vaccinations')
      .select(`
        id,
        vaccine_name,
        due_date,
        status,
        notes,
        farms!inner(
          id,
          name,
          integrator_id
        )
      `)
      .eq('farms.integrator_id', integratorId)
      .order('due_date');

    if (vaccinationsError) {
      console.error('Error fetching vaccinations:', vaccinationsError);
      return NextResponse.json({ error: 'Failed to fetch vaccinations' }, { status: 500 });
    }

    // Transform data and calculate overdue status
    const vaccinationData = vaccinations.map((vaccination: any) => {
      const dueDate = vaccination.due_date.split('T')[0];
      const isOverdue = vaccination.status === 'pending' && dueDate < todayIST;
      const daysOverdue = isOverdue
        ? Math.floor((new Date(todayIST).getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        farmId: vaccination.farms.id,
        farmName: vaccination.farms.name,
        vaccine: vaccination.vaccine_name,
        dueDate: dueDate,
        status: isOverdue ? 'overdue' : vaccination.status,
        daysOverdue,
        notes: vaccination.notes,
      };
    });

    return NextResponse.json(vaccinationData);
  } catch (error) {
    console.error('Error in vaccination compliance API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
