import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import type { Database } from '@poultrypulse/types';



const VALID_DOC_TYPES = [
  'chick_invoice', 'feed_invoice', 'vaccination_cert', 'medicine_bill',
  'movement_permit', 'sale_invoice', 'lab_report', 'insurance',
  'batch_closure_report', 'other',
] as const;

const DocumentCreateSchema = z.object({
  doc_name: z.string().min(1).max(200),
  doc_type: z.enum(VALID_DOC_TYPES),
  batch_id: z.string().uuid().optional().nullable(),
  document_date: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

// GET /api/farms/[farmId]/documents
// Returns documents grouped by doc_type for the DocsTab
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ farmId: string }> }
) {
  try {
    const { farmId } = await params;



    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ success: true, documents: {}, total_count: 0 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('farm_id', farmId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Documents fetch error:', error);
      return NextResponse.json({ success: true, documents: {}, total_count: 0 });
    }

    // Group by doc_type
    const typedDocuments = (documents as Database['public']['Tables']['documents']['Row'][]) || [];
    const grouped: Record<string, typeof typedDocuments> = {};
    for (const doc of typedDocuments) {
      if (!grouped[doc.doc_type]) {
        grouped[doc.doc_type] = [];
      }
      grouped[doc.doc_type].push(doc);
    }

    return NextResponse.json({
      success: true,
      documents: grouped,
      total_count: documents?.length || 0,
    });

  } catch (error) {
    console.error('Documents GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/farms/[farmId]/documents
// Handles file upload to Supabase Storage + creates document record
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ farmId: string }> }
) {
  try {
    const { farmId } = await params;



    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = (formData as any).get('file') as File | null;
    const metaRaw = (formData as any).get('meta') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum 10MB allowed.' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/heif', 'image/heic'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: PDF, JPG, PNG, HEIF' }, { status: 400 });
    }

    const meta = metaRaw ? JSON.parse(metaRaw) : {};
    const validation = DocumentCreateSchema.safeParse(meta);
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.errors }, { status: 400 });
    }

    const docData = validation.data;

    // Get file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const filePath = `${farmId}/${docData.batch_id || 'farm'}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('farm-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'File upload failed' }, { status: 500 });
    }

    // Get farm's integrator_id
    const { data: farm } = await supabase
      .from('farms')
      .select('integrator_id')
      .eq('id', farmId)
      .single();

    // Create document record
    const { data: document, error: insertError } = await (supabase.from('documents') as any)
      .insert({
        farm_id: farmId,
        batch_id: docData.batch_id || null,
        integrator_id: (farm as any).integrator_id || user.id,
        doc_name: docData.doc_name,
        doc_type: docData.doc_type,
        file_path: filePath,
        file_size_bytes: file.size,
        file_ext: fileExt as any,
        document_date: docData.document_date || null,
        tags: docData.tags || null,
        notes: docData.notes || null,
        uploaded_by: user.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Document insert error:', insertError);
      // Clean up uploaded file
      await supabase.storage.from('farm-documents').remove([filePath]);
      return NextResponse.json({ error: 'Failed to create document record' }, { status: 500 });
    }

    // Log audit trail
    await (supabase.from('document_audit_log') as any).insert({
      doc_id: (document as any).doc_id,
      farm_id: farmId,
      action: 'upload',
      performed_by: user.id,
    });

    return NextResponse.json({ success: true, document });

  } catch (error) {
    console.error('Documents POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
