import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import StockTransferForm from '@/components/inventory/StockTransferForm';
import { colors, spacing, typography } from '@poultrypulse/ui/src/tokens';

export const metadata: Metadata = {
  title: 'Stock Transfer — FlockIQ',
  description: 'Transfer stock between farms and branches with automated tracking and challan generation.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function StockTransferPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/inventory/transfers');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/inventory/transfers');
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.neutral50, fontFamily: "'Space Grotesk', 'Noto Sans Devanagari', sans-serif" }}>
      <div className="py-8 md:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#2B1D15]" style={{ ...typography.heading1, color: colors.neutral900 }}>
              Stock Transfer
            </h1>
            <p className="mt-2 text-base text-[#4A3528]" style={{ ...typography.bodyBase, color: colors.neutral700 }}>
              Transfer feed, medicine, and other inventory between farms and branches with automated tracking
            </p>
          </div>

          {/* Stock Transfer Form */}
          <StockTransferForm />
        </div>
      </div>
    </div>
  );
}
