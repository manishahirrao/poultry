import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import BatchReport from '@/components/broiler/reports/BatchReport';

export const metadata: Metadata = {
  title: 'Batch Report — FlockIQ',
  description: 'View batch-wise performance report with GC, mortality, and profitability metrics.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BatchReportPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/broiler/reports/batch');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/broiler/reports/batch');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Batch Report</h1>
          <p className="mt-2 text-gray-600">
            View batch-wise performance report with GC, mortality, and profitability metrics
          </p>
        </div>

        <BatchReport />
      </div>
    </div>
  );
}
