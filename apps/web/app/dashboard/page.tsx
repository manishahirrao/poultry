import { Suspense } from 'react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { IntegrationDashboard } from '@/components/dashboard/overview/IntegrationDashboard';

export const revalidate = 600; // ISR: revalidate every 10 minutes

export const metadata: Metadata = {
  title: 'Dashboard Overview — FlockIQ',
  description: 'Integration company operations dashboard. View farm status, supervisor activity, live stock distribution, and financial snapshot.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  
  if (!supabase) {
    return null;
  }
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    // Redirect to login if not authenticated
    return null;
  }

  // Check user role from user metadata (customers table has no 'role' column)
  const userRole = user.user_metadata?.role || 'user';

  // For integration company role, show the new integration dashboard
  // For farmer role, redirect to the existing overview page
  if (userRole === 'integrator' || userRole === 'admin' || userRole === 'enterprise') {
    return (
      <div className="min-h-screen bg-pageBg">
        <Suspense fallback={<div className="p-6">Loading dashboard...</div>}>
          <IntegrationDashboard />
        </Suspense>
      </div>
    );
  }

  // For other roles, redirect to the existing overview page safely
  redirect('/dashboard/overview');
}
