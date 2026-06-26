import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import SupervisorReportForm from '@/components/broiler/SupervisorReportForm';

export const metadata: Metadata = {
  title: 'Supervisor Report Entry — FlockIQ',
  description: 'Mobile-optimised form for supervisors to submit field reports with GPS and photo attachments.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SupervisorReportEntryPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/broiler/supervisor/report-entry');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/broiler/supervisor/report-entry');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Supervisor Report Entry</h1>
          <p className="mt-2 text-gray-600">
            Submit field reports with GPS location and photo attachments
          </p>
        </div>

        <SupervisorReportForm />
      </div>
    </div>
  );
}
