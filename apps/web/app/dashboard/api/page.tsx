import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { APIKeyManager } from '@/components/dashboard/api/APIKeyManager';
import { UsageChart } from '@/components/dashboard/api/UsageChart';
import { QuickStart } from '@/components/dashboard/api/QuickStart';
import { ApiPlayground } from '@/components/enterprise/ApiPlayground';

const customCubicBezier = [0.32, 0.72, 0, 1] as const;

export default async function APIAccessPage() {
  const supabase = await createClient();
  
  if (!supabase) {
    redirect('/?error=supabase_not_configured');
  }
  
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.phone) {
    redirect('/dashboard/403?required=authenticated');
  }

  // Fetch customer profile
  const { data: customer } = await supabase
    .from('customers')
    .select('id, plan')
    .eq('phone', user.phone)
    .single();

  // Access gate: PULSE_INTEL only
  if (!customer || (customer as any).plan !== 'PULSE_INTEL') {
    redirect('/dashboard/403?required=PULSE_INTEL');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8 md:space-y-12">
      {/* Page Header */}
      <div>
        <span className="inline-block mb-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-neutral-600">
          Developer
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">API Access</h1>
        <p className="text-base text-neutral-600 mt-2">
          Manage your API keys and monitor usage
        </p>
      </div>

      <APIKeyManager customerId={(customer as any).id} />
      <UsageChart customerId={(customer as any).id} />
      <QuickStart />
      
      {/* API Playground - Enterprise Feature */}
      {(customer as any).plan === 'PULSE_INTEL' && (
        <ApiPlayground apiKey={null} />
      )}
    </div>
  );
}
