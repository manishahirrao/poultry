import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { OnboardingForm } from './_components/OnboardingForm';

export const metadata: Metadata = {
  title: 'Complete Your Profile — FlockIQ',
  description: 'Set up your FlockIQ dashboard by completing your profile.',
};

export default async function OnboardingPage() {
  const supabase = await createClient();

  if (!supabase) {
    redirect('/login?redirect=/onboarding');
  }

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login?redirect=/onboarding');
  }

  // Verify the customer record exists (should have been created by activate)
  const { data: customer } = await supabase
    .from('customers')
    .select('id, name, district, poultry_type')
    .eq('id', user.id)
    .single();

  if (!customer) {
    // If no customer record exists, they haven't activated their license yet
    redirect('/activate');
  }

  // If they already have a name and district, they shouldn't be here
  if (customer.name && customer.district && customer.poultry_type) {
    redirect('/dashboard/overview');
  }

  return (
    <div className="min-h-screen flex">
      {/* Brand Panel — left 45% on desktop, hidden on mobile */}
      <div
        className="hidden lg:flex w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--hero-gradient)' }}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'url(/textures/grain.svg)', backgroundRepeat: 'repeat' }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">FlockIQ</h1>
            <p className="text-brand-100 text-lg">Intelligent Poultry Management</p>
          </div>
          <div>
            <blockquote className="text-2xl text-white font-medium leading-relaxed mb-4">
              "Tell us a bit about your operations so we can customize your price intelligence and alerts."
            </blockquote>
          </div>
        </div>
      </div>

      {/* Form Panel — right 55% on desktop, full-screen on mobile */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16 bg-white">
        <div className="lg:hidden mb-10 text-center">
          <h1 className="text-[2rem] font-bold text-brand-700 font-sora tracking-tight">FlockIQ</h1>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="font-sora font-bold text-[1.75rem] text-neutral-900 mb-2 leading-[1.12] tracking-tight">Complete Profile</h2>
            <p className="font-jakarta text-neutral-500 text-[0.9375rem] leading-[1.55]">
              Provide your details to personalize your dashboard.
            </p>
          </div>
          <Suspense fallback={<div>Loading form...</div>}>
            <OnboardingForm userId={user.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
