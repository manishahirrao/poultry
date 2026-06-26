import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import TrialBalance from '@/components/accounts/reports/TrialBalance';

export const metadata: Metadata = {
  title: 'Trial Balance — FlockIQ',
  description: 'View trial balance with account hierarchy, opening balances, transactions, and closing balances as on a specific date.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TrialBalancePage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/accounts/reports/trial-balance');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/accounts/reports/trial-balance');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trial Balance</h1>
          <p className="mt-2 text-gray-600">
            View trial balance with account hierarchy, opening balances, transactions, and closing balances
          </p>
        </div>

        <TrialBalance />
      </div>
    </div>
  );
}
