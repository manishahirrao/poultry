import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import FeedTransferReport from '@/components/broiler/reports/FeedTransferReport';

export const metadata: Metadata = {
  title: 'Feed Transfer Report — FlockIQ',
  description: 'View feed transfer report with farm-to-farm and farm-to-branch transfer details.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FeedTransferReportPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/broiler/reports/feed-transfer');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/broiler/reports/feed-transfer');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Feed Transfer Report</h1>
          <p className="mt-2 text-gray-600">
            View feed transfer report with farm-to-farm and farm-to-branch transfer details
          </p>
        </div>

        <FeedTransferReport />
      </div>
    </div>
  );
}
