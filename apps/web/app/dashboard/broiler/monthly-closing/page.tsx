import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import MonthlyClosing from '@/components/broiler/MonthlyClosing';

export const metadata: Metadata = {
  title: 'Monthly Closing — FlockIQ',
  description: 'Generate payroll, review P&L, and close financial periods',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MonthlyClosingPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/broiler/monthly-closing');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?redirect=/dashboard/broiler/monthly-closing');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MonthlyClosing />
      </div>
    </div>
  );
}
