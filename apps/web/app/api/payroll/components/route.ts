import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { z } from 'zod';

const payrollComponentSchema = z.object({
  componentName: z.string(),
  componentType: z.enum(['earning', 'deduction', 'statutory']),
  isTaxable: z.boolean().default(true),
  isPfApplicable: z.boolean().default(false),
  displayOrder: z.number().default(0),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) throw new Error('Failed to create supabase client');

    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: components, error } = await supabase
      .from('payroll_components')
      .select('*')
      .eq('integrator_id', user.id)
      .order('display_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: components });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    if (!supabase) throw new Error('Failed to create supabase client');

    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = payrollComponentSchema.parse(body);

    const { data: component, error } = await supabase
      .from('payroll_components')
      .insert({
        integrator_id: user.id,
        component_name: validatedData.componentName,
        component_type: validatedData.componentType,
        is_taxable: validatedData.isTaxable,
        is_pf_applicable: validatedData.isPfApplicable,
        display_order: validatedData.displayOrder,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: component });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
