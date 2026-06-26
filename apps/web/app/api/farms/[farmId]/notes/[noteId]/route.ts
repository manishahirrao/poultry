import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// DELETE: Delete a note
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ farmId: string; noteId: string }> }
) {
  try {
    const { farmId, noteId } = await params;
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify farm belongs to this user
    const { data: farm } = await supabase
      .from('farms')
      .select('id')
      .eq('id', farmId)
      .eq('integrator_id', user.id)
      .single();

    if (!farm) {
      return NextResponse.json({ error: 'Farm not found' }, { status: 404 });
    }

    // Delete note from internal_notes table (GAP-018)
    const { error } = await (supabase.from('internal_notes') as any)
      .delete()
      .eq('id', noteId)
      .eq('farm_id', farmId);

    if (error) {
      console.error('Error deleting note:', error);
      return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Note DELETE Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
