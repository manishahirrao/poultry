import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { FarmHeader } from '@/components/farms/detail/FarmHeader';
import { FarmDetailTabs } from '@/components/farms/detail/FarmDetailTabs';
import EnvironmentScoreCard from '@/components/dashboard/iot/EnvironmentScoreCard';
import { LatestSensorReading } from '@/types/iot';

async function getFarmData(farmId: string, integratorId: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // Return null when Supabase is not configured
    return null;
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

  // Fetch farm with RLS check
  const { data: farm, error: farmError } = await supabase
    .from('farms')
    .select('*')
    .eq('id', farmId)
    .eq('integrator_id', integratorId)
    .single();

  if (farmError || !farm) {
    return null;
  }

  // Fetch active batch
  const { data: batches } = await supabase
    .from('batches')
    .select('*')
    .eq('farm_id', farmId)
    .eq('status', 'growing')
    .single();

  // Fetch latest sensor reading for IoT environment monitoring
  let sensorReading: LatestSensorReading | null = null;
  try {
    const { data: reading } = await supabase
      .from('mv_latest_sensor_readings')
      .select('*')
      .eq('farm_id', farmId)
      .maybeSingle();
    sensorReading = reading;
  } catch (error) {
    // Materialized view might not exist yet, or query failed
    // This is not critical for farm detail page functionality
    console.warn('Failed to fetch sensor reading:', error);
  }

  return { farm, batch: batches, sensorReading };
}

async function getIntegratorId() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
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

export default async function FarmDetailPage({
  params,
}: {
  params: Promise<{ farmId: string }>;
}) {
  const { farmId } = await params;
  const integratorId = await getIntegratorId();
  
  if (!integratorId) {
    return null; // Will be handled by middleware
  }

  const data = await getFarmData(farmId, integratorId);

  if (!data) {
    notFound();
  }

  const { farm, batch, sensorReading } = data;

  return (
    <div className="p-6 space-y-6">
      <FarmHeader farm={farm} batch={batch} />
      
      {/* Environment Monitoring Card */}
      <EnvironmentScoreCard
        reading={sensorReading}
        farmName={farm.name}
      />
      
      <FarmDetailTabs farm={farm} batch={batch} />
    </div>
  );
}
