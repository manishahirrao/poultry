import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import SupervisorTravelReport from '@/components/broiler/reports/SupervisorTravelReport';

export const metadata: Metadata = {
  title: 'Supervisor Travel Report — FlockIQ',
  description: 'View supervisor travel report with km travelled and allowance calculations.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SupervisorTravelReportPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/broiler/reports/travel');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/broiler/reports/travel');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Supervisor Travel Report</h1>
          <p className="mt-2 text-gray-600">
            View supervisor travel report with km travelled and allowance calculations
          </p>
        </div>

        <SupervisorTravelReport />
      </div>
    </div>
  );
}
