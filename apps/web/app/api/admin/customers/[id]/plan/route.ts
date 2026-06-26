import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// PATCH { plan: 'PULSE_FARM'|'PULSE_PRO'|'PULSE_INTEL', expires_at?: string }
// Auth: admin role required (check customer.role === 'admin')
// Logs to admin_audit_log: { admin_id, action: 'plan_change', target_customer_id, old_plan, new_plan }
// Returns: updated customer record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    const phone = user?.phone;
    if (userError || !user || !phone) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get admin customer
    const { data: adminData } = await supabase
      .from('customers')
      .select('id, role')
      .eq('phone', phone)
      .single();
    const admin = adminData as { id: string; role: string } | null;

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: admin role required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { plan, expires_at } = body;

    if (!plan) {
      return NextResponse.json(
        { error: 'plan is required' },
        { status: 400 }
      );
    }

    // Validate plan value
    const validPlans = ['PULSE_FARM', 'PULSE_PRO', 'PULSE_INTEL'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan value' },
        { status: 400 }
      );
    }

    // Get target customer
    const { data: targetCustomerData } = await supabase
      .from('customers')
      .select('id, plan, subscription_expires_at')
      .eq('id', id)
      .single();
    const targetCustomer = targetCustomerData as { id: string; plan: string; subscription_expires_at: string | null } | null;

    if (!targetCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: any = { plan };
    if (expires_at) {
      updateData.subscription_expires_at = expires_at;
    }

    // Update customer plan
    const { data: updatedCustomerData, error: updateError } = await (supabase.from('customers') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    const updatedCustomer = updatedCustomerData as { id: string; plan: string; subscription_expires_at: string | null } | null;

    if (updateError) {
      console.error('Plan update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update plan' },
        { status: 500 }
      );
    }

    // Log to admin_audit_log
    const { error: logError } = await (supabase.from('admin_audit_log') as any)
      .insert({
        admin_id: admin.id,
        action: 'plan_change',
        target_customer_id: id,
        old_plan: targetCustomer.plan,
        new_plan: plan,
        metadata: {
          old_expires_at: targetCustomer.subscription_expires_at,
          new_expires_at: expires_at,
        },
        created_at: new Date().toISOString(),
      });

    if (logError) {
      console.error('Audit log error:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
    });

  } catch (error) {
    console.error('Admin plan update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
