import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { Database } from '@poultrypulse/types';



const DocumentUpdateSchema = z.object({
  doc_name: z.string().min(1).max(200).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().max(500).optional(),
}).strict();

// GET /api/farms/[farmId]/documents/[docId]
// Returns document details + signed download URL (60s expiry)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ farmId: string; docId: string }> }
) {
  try {
    const { farmId, docId } = await params;



    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: doc, error } = await supabase
      .from('documents')
      .select('*')
      .eq('doc_id', docId)
      .eq('farm_id', farmId)
      .is('deleted_at', null)
      .single();

    if (error || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const typedDoc = doc as Database['public']['Tables']['documents']['Row'] | null;

    // Generate signed URL (60 seconds)
    const { data: signedUrl } = await supabase.storage
      .from('farm-documents')
      .createSignedUrl(typedDoc?.file_path || '', 60);

    // Log download audit
    await (supabase.from('document_audit_log') as any).insert({
      doc_id: docId,
      farm_id: farmId,
      action: 'download',
      performed_by: user.id,
    });

    return NextResponse.json({
      success: true,
      doc,
      download_url: signedUrl?.signedUrl || null,
    });

  } catch (error) {
    console.error('Document GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/farms/[farmId]/documents/[docId]
// Rename document or update tags/notes
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ farmId: string; docId: string }> }
) {
  try {
    const { farmId, docId } = await params;



    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validation = DocumentUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 });
    }

    const { data: updatedDoc, error } = await (supabase.from('documents') as any)
      .update({ ...validation.data, updated_at: new Date().toISOString() } as any)
      .eq('doc_id', docId)
      .eq('farm_id', farmId)
      .is('deleted_at', null)
      .select()
      .single();

    if (error || !updatedDoc) {
      return NextResponse.json({ error: 'Document not found or update failed' }, { status: 404 });
    }

    // Log rename audit
    await (supabase.from('document_audit_log') as any).insert({
      doc_id: docId,
      farm_id: farmId,
      action: 'rename',
      performed_by: user.id,
    });

    return NextResponse.json({ success: true, doc: updatedDoc });

  } catch (error) {
    console.error('Document PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/farms/[farmId]/documents/[docId]
// Soft delete (sets deleted_at)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ farmId: string; docId: string }> }
) {
  try {
    const { farmId, docId } = await params;



    const supabase = await createClient();
    if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { error } = await (supabase.from('documents') as any)
      .update({ deleted_at: new Date().toISOString() } as any)
      .eq('doc_id', docId)
      .eq('farm_id', farmId);

    if (error) {
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }

    // Log delete audit
    await (supabase.from('document_audit_log') as any).insert({
      doc_id: docId,
      farm_id: farmId,
      action: 'delete',
      performed_by: user.id,
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Document DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
