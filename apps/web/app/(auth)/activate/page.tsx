import { Suspense } from 'react';
import { ActivationForm } from './_components/ActivationForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Activate License — FlockIQ',
  description: 'Enter your phone number and license key to activate your FlockIQ software.',
};

export default function ActivatePage() {
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
              "The most powerful tool for tracking batches, forecasting prices, and managing farm health."
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
            <h2 className="font-sora font-bold text-[1.75rem] text-neutral-900 mb-2 leading-[1.12] tracking-tight">Activate Software</h2>
            <p className="font-jakarta text-neutral-500 text-[0.9375rem] leading-[1.55]">
              Enter the License Key provided by your sales agent.
            </p>
          </div>
          <Suspense fallback={<div>Loading form...</div>}>
            <ActivationForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
