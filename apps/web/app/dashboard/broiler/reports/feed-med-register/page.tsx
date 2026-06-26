import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import FeedMedRegisterReport from '@/components/broiler/reports/FeedMedRegisterReport';

export const metadata: Metadata = {
  title: 'Feed/Med Register — FlockIQ',
  description: 'View feed and medicine allocation register with batch-wise consumption tracking.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function FeedMedRegisterReportPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/broiler/reports/feed-med-register');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/broiler/reports/feed-med-register');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Feed/Med Register</h1>
          <p className="mt-2 text-gray-600">
            View feed and medicine allocation register with batch-wise consumption tracking
          </p>
        </div>

        <FeedMedRegisterReport />
      </div>
    </div>
  );
}
