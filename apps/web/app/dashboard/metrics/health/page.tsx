import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import HealthTrackingClient from './HealthTrackingClient';

async function getIntegratorId() {

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

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.phone) {
    return null;
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('id, district')
    .eq('phone', user.phone)
    .single();

  return customer || null;
}

async function getFarms(integratorId: string) {
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

  const { data: farms, error } = await supabase
    .from('farms')
    .select(`
      id,
      name,
      district,
      status,
      active_batch:batches(
        id,
        batch_number,
        birds_placed,
        current_bird_count,
        placement_date
      )
    `)
    .eq('integrator_id', integratorId)
    .eq('status', 'active')
    .order('name');

  if (error) {
    console.error('Error fetching farms:', error);
    return [];
  }

  return farms;
}

export default async function HealthTrackingPage() {
  const customer = await getIntegratorId();
  
  if (!customer) {
    // If customer lookup fails, show empty state instead of redirecting to login
    console.warn('Customer lookup failed, showing empty state');
    return (
      <div className="py-8 md:py-12 lg:py-16 px-6">
        <HealthTrackingClient 
          farms={[]}
          integratorId=""
          integratorDistrict=""
        />
      </div>
    );
  }

  const farms = await getFarms(customer.id);

  // Transform farms data
  const transformedFarms = farms.map((farm: any) => ({
    id: farm.id,
    name: farm.name,
    district: farm.district,
    status: farm.status,
    activeBatch: farm.active_batch && farm.active_batch.length > 0 ? {
      id: farm.active_batch[0].id,
      batchNumber: farm.active_batch[0].batch_number,
      birdsPlaced: farm.active_batch[0].birds_placed,
      birdsAlive: farm.active_batch[0].current_bird_count ?? farm.active_batch[0].birds_placed ?? 0,
      placementDate: farm.active_batch[0].placement_date,
    } : undefined,
  }));

  return (
    <div className="py-8 md:py-12 lg:py-16 px-6">
      <HealthTrackingClient 
        farms={transformedFarms}
        integratorId={customer.id}
        integratorDistrict={customer.district}
      />
    </div>
  );
}
