import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/utils/supabase/server';
import { getCustomerList } from '@/utils/supabase/dashboard';
import { CustomerTable } from '@/components/dashboard/customers/CustomerTable';

const customCubicBezier = [0.32, 0.72, 0, 1] as const;

export const metadata: Metadata = {
  title: 'Customer Management — FlockIQ',
  description: 'Admin-only customer management dashboard. View, filter, and manage customer accounts, subscriptions, and usage data.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; segment?: string; status?: string; district?: string; search?: string }>;
}) {
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
    .select('id, role')
    .eq('phone', user.phone)
    .single();

  // Admin only
  if (!customer || (customer as any).role !== 'admin') {
    redirect('/dashboard/403?required=admin');
  }

  // Parse search params
  const params = await searchParams;
  const page = parseInt(params.page || '1');
  const filters = {
    segment: params.segment,
    status: params.status,
    district: params.district,
    search: params.search,
    page,
    pageSize: 25,
  };

  // Fetch customer list
  const { customers, total, error: listError } = await getCustomerList(filters);

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8 md:space-y-12">
      {/* Page Header */}
      <div>
        <span className="inline-block mb-3 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-black/5 text-neutral-600">
          Admin
        </span>
        <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">Customer Management</h1>
        <p className="text-base text-neutral-600 mt-2">
          View, filter, and manage customer accounts, subscriptions, and usage data
        </p>
      </div>

      <CustomerTable
        customers={customers}
        total={total}
        currentPage={page}
        filters={filters}
      />
    </div>
  );
}
