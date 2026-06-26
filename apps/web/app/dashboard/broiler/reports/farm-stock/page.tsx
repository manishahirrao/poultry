import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import FarmBalanceStockReport from '@/components/broiler/reports/FarmBalanceStockReport';

export const metadata: Metadata = {
  title: 'Farm Balance Stock — FlockIQ',
  description: 'View farm-wise stock balance report for feed, medicine, and other inventory.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FarmBalanceStockReportPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/broiler/reports/farm-stock');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/broiler/reports/farm-stock');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Farm Balance Stock</h1>
          <p className="mt-2 text-gray-600">
            View farm-wise stock balance report for feed, medicine, and other inventory
          </p>
        </div>

        <FarmBalanceStockReport />
      </div>
    </div>
  );
}
