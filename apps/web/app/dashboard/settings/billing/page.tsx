'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BillingPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the settings page with billing tab
    router.replace('/dashboard/settings?tab=billing');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
    </div>
  );
}
