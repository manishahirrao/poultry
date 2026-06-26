import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { SalesDashboard } from '@/components/dashboard/sales/SalesDashboard';

export const metadata: Metadata = {
  title: 'Sales & P&L Dashboard — FlockIQ',
  description: 'Track sales revenue, profit, costs, and complete P&L overview across all farms.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SalesDashboardPage() {
  let customer;

  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/sales');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.phone) {
    redirect('/login?redirect=/dashboard/sales');
  }

  // Fetch customer profile
  const { data: customerData } = await supabase
    .from('customers')
    .select('id, name, segment, role, plan, district')
    .eq('phone', user.phone)
    .single();

  customer = customerData;
  if (!customer) redirect('/login');

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SalesDashboard customer={customer} />
      </div>
    </div>
  );
}
