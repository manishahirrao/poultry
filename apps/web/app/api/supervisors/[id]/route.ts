// FlockIQ — Supervisor Management API (Delete)
// File: apps/web/app/api/supervisors/[id]/route.ts
// Version: v1.0 | June 2026
// Task: TASK-045

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * DELETE /api/supervisors/:id
 * Delete a supervisor (soft delete by setting is_active = false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    const { id: supervisorId } = await params;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // supervisorId already destructured above

    // Soft delete by setting is_active = false
    const { error: updateError } = await supabase
      .from('supervisors')
      .update({ is_active: false })
      .eq('id', supervisorId)
      .eq('customer_id', user.id); // Ensure user owns this supervisor

    if (updateError) {
      console.error('Error deleting supervisor:', updateError);
      return NextResponse.json({ error: 'Failed to delete supervisor' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Supervisor deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/supervisors/:id:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
