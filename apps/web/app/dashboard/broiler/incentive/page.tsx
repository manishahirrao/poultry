import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import IncentiveCalculation from '@/components/broiler/IncentiveCalculation';

export const metadata: Metadata = {
  title: 'Incentive Calculation / प्रोत्साहन गणना — FlockIQ',
  description: 'Calculate supervisor incentives based on GC performance against target. / GC प्रदर्शन के आधार पर सुपरवाइजर प्रोत्साहन की गणना करें।',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function IncentiveCalculationPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/broiler/incentive');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/broiler/incentive');
  }

  return (
    <div className="min-h-screen bg-[#F4F7F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <IncentiveCalculation />
      </div>
    </div>
  );
}
