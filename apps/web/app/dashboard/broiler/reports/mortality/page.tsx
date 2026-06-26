import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import MortalityReport from '@/components/broiler/reports/MortalityReport';

export const metadata: Metadata = {
  title: 'Mortality Report — FlockIQ',
  description: 'View mortality report for all batches with death statistics and cause breakdown.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MortalityReportPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/broiler/reports/mortality');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/broiler/reports/mortality');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mortality Report</h1>
          <p className="mt-2 text-gray-600">
            View mortality report for all batches with death statistics and cause breakdown
          </p>
        </div>

        <MortalityReport />
      </div>
    </div>
  );
}
