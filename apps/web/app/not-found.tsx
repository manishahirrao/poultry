// FlockIQ — 404 Not Found Page
// File: apps/web/app/not-found.tsx
// Version: v1.0 | May 2026
// Task Reference: C-12
// Requirements: Helpful 404 page with navigation options

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 py-section-vertical">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Error code */}
        <h1 className="font-sora font-extrabold text-[clamp(5rem,12vw,8rem)] leading-none tracking-[-0.05em] text-brand-700">404</h1>
        <h2 className="font-sora font-bold text-[clamp(1.375rem,2vw+0.25rem,1.75rem)] leading-[1.15] tracking-[-0.025em] mt-4 text-neutral-900">
          Page Not Found
        </h2>
        <p className="font-jakarta text-[clamp(1rem,0.5vw+0.875rem,1.125rem)] text-neutral-600 mt-4 leading-[1.7] max-w-[55ch] mx-auto">
          The page you're looking for doesn't exist or has been moved.
          <br />
          Head back to the homepage or get in touch — we're happy to help.
        </p>

        {/* Navigation options */}
        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          <Link
            href="/"
            className="flex flex-col items-center rounded-2xl bg-white p-6 shadow-sm border border-neutral-200 transition-shadow hover:shadow-md"
          >
            <span className="font-sora font-bold text-[0.9375rem] text-neutral-900">Homepage</span>
            <span className="font-jakarta mt-1 text-sm text-neutral-500">Go back home</span>
          </Link>

          <Link
            href="/pricing"
            className="flex flex-col items-center rounded-2xl bg-white p-6 shadow-sm border border-neutral-200 transition-shadow hover:shadow-md"
          >
            <span className="font-sora font-bold text-[0.9375rem] text-neutral-900">Pricing</span>
            <span className="font-jakarta mt-1 text-sm text-neutral-500">View our plans</span>
          </Link>

          <a
            href="mailto:hello@flockiq.com"
            className="flex flex-col items-center rounded-2xl bg-white p-6 shadow-sm border border-neutral-200 transition-shadow hover:shadow-md"
          >
            <span className="font-sora font-bold text-[0.9375rem] text-neutral-900">Contact</span>
            <span className="font-jakarta mt-1 text-sm text-neutral-500">Get support</span>
          </a>
        </div>
      </div>
    </div>
  );
}
