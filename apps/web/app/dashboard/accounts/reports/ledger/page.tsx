import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import LedgerStatement from '@/components/accounts/reports/LedgerStatement';

export const metadata: Metadata = {
  title: 'Ledger Statement — FlockIQ',
  description: 'View all transactions for a specific ledger account with running balance.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LedgerStatementPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/accounts/reports/ledger');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/accounts/reports/ledger');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ledger Statement</h1>
          <p className="mt-2 text-gray-600">
            View all transactions for a specific ledger account with running balance
          </p>
        </div>

        <LedgerStatement />
      </div>
    </div>
  );
}
