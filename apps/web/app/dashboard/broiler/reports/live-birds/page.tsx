import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import FarmLiveBirdsReport from '@/components/broiler/reports/FarmLiveBirdsReport';

export const metadata: Metadata = {
  title: 'Farm Live Birds Report — FlockIQ',
  description: 'View live birds report for all active farms with harvest readiness indicators.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FarmLiveBirdsReportPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/broiler/reports/live-birds');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/broiler/reports/live-birds');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Farm Live Birds Report</h1>
          <p className="mt-2 text-gray-600">
            View live birds report for all active farms with harvest readiness indicators
          </p>
        </div>

        <FarmLiveBirdsReport />
      </div>
    </div>
  );
}
