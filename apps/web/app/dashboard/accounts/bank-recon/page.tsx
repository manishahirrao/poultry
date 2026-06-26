import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import BankReconciliation from '@/components/accounts/BankReconciliation';

export const metadata: Metadata = {
  title: 'Bank Reconciliation — FlockIQ',
  description: 'Reconcile bank statements with ledger balances.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BankReconciliationPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/accounts/bank-recon');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/accounts/bank-recon');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Bank Reconciliation</h1>
          <p className="mt-2 text-gray-600">
            Reconcile bank statements with ledger balances
          </p>
        </div>

        <BankReconciliation />
      </div>
    </div>
  );
}
