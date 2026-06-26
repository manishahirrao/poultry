import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { PLTab } from '@/components/farms/detail/tabs/PLTab';

async function getBatchData(farmId: string, batchId: string, integratorId: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Return mock data when Supabase is not configured
    return {
      id: 'mock-batch-1',
      farm_id: farmId,
      batch_number: 24,
      placement_date: '2026-05-10',
      breed: 'Ross 308',
      birds_placed: 12500,
      birds_alive: 12450,
      mortality: 0.4,
      target_harvest_weight: 2100,
      current_avg_weight: 1680,
    };
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Fetch batch with RLS check
  const { data: batch, error } = await supabase
    .from('batches')
    .select('*')
    .eq('id', batchId)
    .eq('farm_id', farmId)
    .single();

  if (error || !batch) {
    return null;
  }

  return batch;
}

async function getIntegratorId() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return 'mock-integrator-1';
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.phone) {
    return null;
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('phone', user.phone)
    .single();

  return customer?.id || null;
}

export default async function PLPage({
  params,
}: {
  params: Promise<{ farmId: string; batchId: string }>;
}) {
  const { farmId, batchId } = await params;
  const integratorId = await getIntegratorId();
  
  if (!integratorId) {
    return null;
  }

  const batch = await getBatchData(farmId, batchId, integratorId);

  if (!batch) {
    notFound();
  }

  return <PLTab farmId={farmId} batchId={batchId} />;
}
