import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import PayrollReport from '@/components/broiler/reports/PayrollReport';

export const metadata: Metadata = {
  title: 'Payroll Report — FlockIQ',
  description: 'View payroll report for supervisors and employees with travel allowances and incentives.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PayrollReportPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/broiler/reports/payroll');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/broiler/reports/payroll');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payroll Report</h1>
          <p className="mt-2 text-gray-600">
            View payroll report for supervisors and employees with travel allowances and incentives
          </p>
        </div>

        <PayrollReport />
      </div>
    </div>
  );
}
