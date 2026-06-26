import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import DailyReport from '@/components/broiler/reports/DailyReport';

export const metadata: Metadata = {
  title: 'Daily Report — FlockIQ',
  description: 'View daily farm performance reports with birds, deaths, feed, and FCR metrics.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DailyReportPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/broiler/reports/daily');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/broiler/reports/daily');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Daily Report</h1>
          <p className="mt-2 text-gray-600">
            View daily farm performance reports with birds, deaths, feed, and FCR metrics
          </p>
        </div>

        <DailyReport />
      </div>
    </div>
  );
}
