import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ChickAllocationForm from '@/components/broiler/ChickAllocationForm';
import { FlockIQTokens } from '@/lib/design-tokens';

export const metadata: Metadata = {
  title: 'Chick Allocation — FlockIQ',
  description: 'Allocate chicks to farms from approved shed readiness records with automatic batch creation.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ChickAllocationPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/broiler/integration/chick-alloc');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/broiler/integration/chick-alloc');
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: FlockIQTokens.contentBg }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Chick Allocation
          </h1>
          <p className="mt-3 text-base text-gray-600 leading-relaxed">
            Allocate chicks to farms from approved shed readiness records with automatic batch creation
          </p>
        </div>

        {/* Main Form */}
        <ChickAllocationForm />
      </div>
    </div>
  );
}
