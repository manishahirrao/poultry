import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import MonthlyPLReport from '@/components/broiler/reports/MonthlyPLReport';

export const metadata: Metadata = {
  title: 'Monthly P&L Report — FlockIQ',
  description: 'View monthly profit and loss report for integration business with revenue, costs, and margins.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MonthlyPLReportPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/broiler/reports/monthly-pl');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/broiler/reports/monthly-pl');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Monthly P&L Report</h1>
          <p className="mt-2 text-gray-600">
            View monthly profit and loss report for integration business with revenue, costs, and margins
          </p>
        </div>

        <MonthlyPLReport />
      </div>
    </div>
  );
}
