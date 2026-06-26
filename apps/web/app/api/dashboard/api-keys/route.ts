import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Auth check: Supabase session check, PULSE_INTEL only
async function checkAuth(request: NextRequest) {
  const supabase = await createClient();
  if (!supabase) {
    return { authorized: false, error: 'Database connection failed' };
  }
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user?.phone) {
    return { authorized: false, error: 'Unauthorized' };
  }

  // Fetch customer profile for plan check
  const { data: customerData } = await supabase
    .from('customers')
    .select('id, plan')
    .eq('phone', user.phone)
    .single();
  const customer = customerData as { id: string; plan: string } | null;

  if (!customer) {
    return { authorized: false, error: 'Customer not found' };
  }

  // PULSE_INTEL only
  if (customer.plan !== 'PULSE_INTEL') {
    return { authorized: false, error: 'Upgrade required' };
  }

  return { authorized: true, customer: customer! };
}

// GET - Returns masked current API key + metadata
export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }
    
    // Fetch API key from database
    const { data: apiKeyRaw, error } = await supabase
      .from('api_keys')
      .select('key_prefix, created_at, expires_at, last_used, usage_count')
      .eq('customer_id', auth.customer!.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    const apiKeyData = apiKeyRaw as { key_prefix: string; created_at: string; expires_at: string; last_used: string | null; usage_count: number } | null;

    if (error || !apiKeyData) {
      // Return empty state if no key exists
      return NextResponse.json({
        hasKey: false,
        key: null,
        metadata: null,
      });
    }

    // Mask the key (show last 4 chars)
    const maskedKey = `pp_live_${'X'.repeat(24)}${apiKeyData.key_prefix.slice(-4)}`;

    return NextResponse.json({
      hasKey: true,
      key: maskedKey,
      metadata: {
        created_at: apiKeyData.created_at,
        expires_at: apiKeyData.expires_at,
        last_used: apiKeyData.last_used,
        usage_count: apiKeyData.usage_count,
      },
    });

  } catch (error) {
    console.error('API key fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Generate new API key (invalidates old)
export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth.authorized) {
      return NextResponse.json(
        { error: auth.error },
        { status: auth.error === 'Unauthorized' ? 401 : 403 }
      );
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Rate limit: max 3 key rotations per day
    const { data: recentKeys } = await supabase
      .from('api_keys')
      .select('created_at')
      .eq('customer_id', auth.customer!.id)
      .gte('created_at', new Date(Date.now() - 86_400_000).toISOString());

    if (recentKeys && recentKeys.length >= 3) {
      return NextResponse.json(
        { error: 'Rate limit exceeded: Maximum 3 key rotations per day' },
        { status: 429 }
      );
    }

    // Generate new API key
    const newKeyPrefix = `pp_live_${generateRandomString(32)}`;
    const expiresAt = new Date(Date.now() + 365 * 86_400_000); // 1 year from now

    // Invalidate old keys
    await (supabase.from('api_keys') as any)
      .update({ is_active: false })
      .eq('customer_id', auth.customer!.id)
      .eq('is_active', true);

    // Insert new key
    const { data: newKeyRaw, error: insertError } = await (supabase.from('api_keys') as any)
      .insert({
        customer_id: auth.customer!.id,
        key_prefix: newKeyPrefix,
        key_hash: await hashKey(newKeyPrefix), // In production, use bcrypt
        expires_at: expiresAt.toISOString(),
        is_active: true,
        usage_count: 0,
      })
      .select('key_prefix, created_at, expires_at')
      .single();
    const newKeyData = newKeyRaw as { key_prefix: string; created_at: string; expires_at: string } | null;

    if (insertError || !newKeyData) {
      console.error('API key creation error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create API key' },
        { status: 500 }
      );
    }

    // Return the full key (only time it's shown)
    return NextResponse.json({
      success: true,
      key: newKeyData.key_prefix,
      metadata: {
        created_at: newKeyData.created_at,
        expires_at: newKeyData.expires_at,
      },
    });

  } catch (error) {
    console.error('API key creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to generate random string
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to hash key (simplified - use bcrypt in production)
async function hashKey(key: string): Promise<string> {
  // In production, use bcrypt: await bcrypt.hash(key, 10)
  // For now, return a simple hash
  return Buffer.from(key).toString('base64');
}
