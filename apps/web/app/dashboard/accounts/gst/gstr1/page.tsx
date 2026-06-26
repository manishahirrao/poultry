import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import GSTR1Report from '@/components/accounts/reports/GSTR1Report';

export const metadata: Metadata = {
  title: 'GSTR1 Report — FlockIQ',
  description: 'View GSTR1 report for GST filing with invoice details, tax breakdown, and HSN summary.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function GSTR1Page() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/accounts/gst/gstr1');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/accounts/gst/gstr1');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16 space-y-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">GSTR1 Report</h1>
          <p className="mt-2 text-gray-600">
            View outward supplies for GST filing with invoice details, tax breakdown, and HSN summary
          </p>
        </div>

        <GSTR1Report />
      </div>
    </div>
  );
}
