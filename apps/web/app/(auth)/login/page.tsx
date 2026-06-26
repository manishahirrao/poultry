import { Suspense } from 'react';
import { LoginForm } from './_components/LoginForm';
import { LoginBrandPanel } from './_components/LoginBrandPanel';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Brand Panel — left 45% on desktop, hidden on mobile */}
      <div
        className="hidden lg:flex w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'var(--hero-gradient)' }}
      >
        {/* Subtle grain overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'url(/textures/grain.svg)', backgroundRepeat: 'repeat' }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col justify-between h-full">
          <LoginBrandPanel />
        </div>
      </div>

      {/* Form Panel — right 55% on desktop, full-screen on mobile */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 lg:px-16 bg-white">
        {/* Mobile-only logo */}
        <div className="lg:hidden mb-10">
          <h1 className="text-[1.75rem] font-bold text-brand-700 font-sora tracking-[-0.03em]">FlockIQ</h1>
        </div>

        <div className="w-full max-w-[400px]">
          <div className="mb-8">
            <h2 className="font-sora font-bold text-[1.75rem] text-neutral-900 mb-2 leading-[1.12] tracking-[-0.03em]">Welcome back</h2>
            <p className="font-jakarta text-neutral-500 text-[0.9375rem] leading-[1.55]">Sign in to your FlockIQ account</p>
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
