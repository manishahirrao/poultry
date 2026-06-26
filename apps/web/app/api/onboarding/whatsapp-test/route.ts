import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify session from Supabase
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's phone number from Supabase
    const { data: userData, error: dataError } = await supabase
      .from('customers')
      .select('phone')
      .eq('user_id', user.id)
      .single();

    if (dataError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Send test message via Twilio
    await sendWhatsAppNotification({
      to: userData.phone,
      message: `नमस्ते! यह FlockIQ का test message है। 🐔
कल सुबह 6:30 बजे आपका पहला price signal आएगा।
—FlockIQ Team`,
    });

    return NextResponse.json({
      success: true,
      message: 'Test message sent successfully',
    });
  } catch (error) {
    console.error('POST /api/onboarding/whatsapp-test error:', error);
    return NextResponse.json(
      { error: 'Failed to send test message' },
      { status: 500 }
    );
  }
}
