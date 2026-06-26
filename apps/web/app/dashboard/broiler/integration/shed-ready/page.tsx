import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import ShedReadyForm from '@/components/broiler/ShedReadyForm';
import { colors } from '@/lib/tokens';

export const metadata: Metadata = {
  title: 'Shed Ready — FlockIQ',
  description: 'Mark sheds as ready for chick placement with comprehensive readiness checklist.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ShedReadyPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard/broiler/integration/shed-ready');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard/broiler/integration/shed-ready');
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.neutral50 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.neutral900, fontFamily: "'Plus Jakarta Sans', system-ui", fontWeight: 800, letterSpacing: '-0.02em' }}>
            Shed Readiness
          </h1>
          <p className="text-lg md:text-xl max-w-3xl" style={{ color: colors.neutral700, fontFamily: "'Plus Jakarta Sans', system-ui", lineHeight: 1.7 }}>
            Mark sheds as ready for chick placement with comprehensive readiness checklist
          </p>
        </div>

        {/* Main Content */}
        <ShedReadyForm />
      </div>
    </div>
  );
}
