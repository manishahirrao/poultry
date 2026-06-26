import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import GSTR3BReport from '@/components/accounts/reports/GSTR3BReport';

export const metadata: Metadata = {
  title: 'GSTR3B Report — FlockIQ',
  description: 'View GSTR3B summary report for GST filing with outward supplies, ITC available, and net tax payable.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function GSTR3BPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/accounts/gst/gstr3b');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/accounts/gst/gstr3b');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">GSTR3B Report</h1>
          <p className="mt-2 text-gray-600">
            Monthly GST return summary with outward supplies, input tax credit, and net tax payable
          </p>
        </div>

        <GSTR3BReport />
      </div>
    </div>
  );
}
