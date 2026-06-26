import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import VoucherForm from '@/components/accounts/VoucherForm';

export const metadata: Metadata = {
  title: 'Employee Payment Voucher — FlockIQ',
  description: 'Create employee payment vouchers for salary and other payments.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EmployeeVoucherPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/accounts/vouchers/employee');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/accounts/vouchers/employee');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employee Payment Voucher</h1>
          <p className="mt-2 text-gray-600">
            Create employee payment vouchers for salary and other payments
          </p>
        </div>

        <VoucherForm voucherType="employee" />
      </div>
    </div>
  );
}
