import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ProfitLoss from '@/components/accounts/reports/ProfitLoss';

export const metadata: Metadata = {
  title: 'Profit & Loss — FlockIQ',
  description: 'View profit and loss statement with income, expenses, and net profit for a specific period.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ProfitLossPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/accounts/reports/pl');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/accounts/reports/pl');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profit & Loss</h1>
          <p className="mt-2 text-gray-600">
            View profit and loss statement with income, expenses, and net profit
          </p>
        </div>

        <ProfitLoss />
      </div>
    </div>
  );
}
