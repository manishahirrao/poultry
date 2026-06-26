import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import BalanceSheet from '@/components/accounts/reports/BalanceSheet';

export const metadata: Metadata = {
  title: 'Balance Sheet — FlockIQ',
  description: 'View balance sheet with assets, liabilities, and equity as on a specific date.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BalanceSheetPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/accounts/reports/balance-sheet');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/accounts/reports/balance-sheet');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Balance Sheet</h1>
          <p className="mt-2 text-gray-600">
            View balance sheet with assets, liabilities, and equity
          </p>
        </div>

        <BalanceSheet />
      </div>
    </div>
  );
}
