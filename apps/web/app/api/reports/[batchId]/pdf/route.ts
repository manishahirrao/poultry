import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Simple in-memory rate limiting (for production, use Redis/Upstash)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(integratorId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 5;

  const record = rateLimitStore.get(integratorId);

  if (!record || now > record.resetTime) {
    // Create new window
    rateLimitStore.set(integratorId, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  try {
    const { batchId } = await params;
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

    // Get session and integrator ID
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.phone) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('id, role')
      .eq('phone', user.phone)
      .single();

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Check rate limit
    if (!checkRateLimit(customer.id)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 5 PDF downloads per hour. Please try again later.' },
        { status: 429 }
      );
    }

    // Fetch batch with farm
    const { data: batch, error } = await supabase
      .from('batches')
      .select(`
        *,
        farm:farms (
          id,
          name,
          integrator_id
        )
      `)
      .eq('id', batchId)
      .single();

    if (error || !batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // RLS check: verify integrator owns this farm or is admin
    if (batch.farm?.integrator_id !== customer.id && customer.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 404 });
    }

    // Generate PDF by calling the report page with print=true
    const reportUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/reports/integrator?batchId=${batchId}&print=true`;

    return NextResponse.json({
      downloadUrl: reportUrl,
      filename: `batch-${(batch as any).batch_number}-report.pdf`,
      message: 'PDF generation initiated. In production, this would use Puppeteer to render the page as PDF.'
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF. Please try again later.' },
      { status: 500 }
    );
  }
}
