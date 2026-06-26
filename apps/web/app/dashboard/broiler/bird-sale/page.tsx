import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import BirdSaleForm from '@/components/broiler/BirdSaleForm';

export const metadata: Metadata = {
  title: 'Bird Sale / Harvest — FlockIQ',
  description: 'Record bird sales and generate payment vouchers',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BirdSalePage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/broiler/bird-sale');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?redirect=/dashboard/broiler/bird-sale');
  }

  return (
    <div className="py-8 md:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <BirdSaleForm />
      </div>
    </div>
  );
}
