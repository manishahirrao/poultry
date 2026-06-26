import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import DayBook from '@/components/accounts/reports/DayBook';

export const metadata: Metadata = {
  title: 'Day Book — FlockIQ',
  description: 'View all vouchers for a specific date in chronological order with running balance.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DayBookPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/accounts/reports/daybook');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/accounts/reports/daybook');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Day Book</h1>
          <p className="mt-2 text-gray-600">
            View all vouchers for a specific date in chronological order with running balance
          </p>
        </div>

        <DayBook />
      </div>
    </div>
  );
}
