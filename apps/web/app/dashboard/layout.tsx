import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { LanguageProvider } from '@/providers/LanguageProvider';
import { EntitlementsWrapper } from '@/components/plans/EntitlementsWrapper';
import { GrandfatherBanner } from '@/components/plans/GrandfatherBanner';
import '@/styles/tokens.css';
import '@/styles/skeleton.css';
import '@/styles/animations.css';

export const metadata: Metadata = {
  title: 'Dashboard — FlockIQ',
  description: 'FlockIQ Dashboard - Price intelligence, accuracy metrics, alerts, and customer management for commercial poultry farmers.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/dashboard');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user?.id) {
    redirect('/login?redirect=/dashboard');
  }

  let customer: any = null;

  // Try to read from cookie cache set by middleware
  const cookieStore = await cookies();
  const sessionMetaCookie = cookieStore.get('flockiq_session_meta')?.value;
  let cachedMeta: any = null;
    if (sessionMetaCookie) {
      try { cachedMeta = JSON.parse(sessionMetaCookie); } catch (e) {}
    }

    if (cachedMeta && cachedMeta.customer) {
      customer = cachedMeta.customer;
    } else {
      // Fallback: Try phone first, then email as fallback
      if (user) {
        const { data } = await supabase
          .from('customers')
          .select('id, name, district, subscription_tier, subscription_status, subscription_end_date, poultry_type')
          .eq('id', user.id)
          .single();
        if (data) {
          // Map real columns to the shape the UI expects
          customer = {
            ...data,
            role: 'user',
            segment: 'S2',
            plan: data.subscription_tier ?? 'FLOCKIQ_PRO',
            subscription_expires_at: data.subscription_end_date
              ? new Date(data.subscription_end_date).toISOString()
              : new Date(Date.now() + 365 * 86400000).toISOString(),
          };
        }
      }
    }

    if (!customer) {
      // For local development, if a user logs in but has no customer record, 
      // treat them as an Admin so they can test the system without being blocked by /activate.
      if (process.env.NODE_ENV === 'development' && user) {
        customer = {
          id: user.id,
          name: 'Local Admin',
          segment: 'S5',
          role: 'admin',
          plan: 'PULSE_PRO',
          subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          district: 'gorakhpur',
        };
      } else {
        redirect('/activate');
      }
    }

    if (!customer.name || !customer.district || !customer.poultry_type) {
      redirect('/onboarding');
    }

  return (
    <LanguageProvider>
      <EntitlementsWrapper>
        <div className="flex h-screen bg-neutral-50 overflow-hidden">
          {/* Skip links */}
          <a
            href="#main-dashboard-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
                       focus:z-[100] focus:bg-brandGreen700 focus:text-white
                       focus:px-4 focus:py-2 focus:rounded-lg"
            suppressHydrationWarning
          >
            Main content पर जाएं
          </a>

          {/* Sidebar — server-rendered, client for interactivity */}
          <Sidebar customer={customer} />

          {/* Main content area */}
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <Suspense fallback={<div className="h-[60px] bg-white border-b border-[#E3EDE7]" />}>
              <TopHeader customer={customer} />
            </Suspense>
            <main
              id="main-dashboard-content"
              className="flex-1 overflow-y-auto overflow-x-hidden p-section-normal lg:p-section-generous"
              tabIndex={-1}
            >
              <div className="max-w-full">
                <Suspense fallback={null}>
                  <GrandfatherBanner />
                </Suspense>
                {children}
              </div>
            </main>

          </div>
        </div>
      </EntitlementsWrapper>
    </LanguageProvider>
  );
}
