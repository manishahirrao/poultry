// Reports Index Page - FR-01 (Navigation Hub)
// Reference: 15_integrator_farms_tasks_master.md, 14_integrator_farms_design_master.md
//
// This page serves as the reports navigation hub displaying:
// - Quick stats (closed batches, active batches, total farms)
// - Available report types with descriptions
// - Links to batch reports, farm comparison, financial summaries, and metrics dashboard
// - All batches table with report generation links
// - Empty state when no batches exist
//
// Server-side rendered with RLS protection

import React from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, TrendingUp, IndianRupee, Activity } from 'lucide-react'
import { AlertTriangle as Warning } from 'lucide-react';
import { ReportsPageClient } from './ReportsPageClient';

async function getIntegratorId() {


  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not configured properly');
    return null;
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user?.phone) {
    return null;
  }

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('phone', user.phone)
    .single();

  return customer?.id || null;
}

async function getFarms(integratorId: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not configured properly');
    return [];
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: farms, error } = await supabase
    .from('farms')
    .select('id, name, district, status')
    .eq('integrator_id', integratorId)
    .order('name');

  if (error) {
    console.error('Error fetching farms:', error);
    return [];
  }

  return farms || [];
}

async function getBatches(integratorId: string) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Supabase environment variables are not configured properly');
    return [];
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: batches, error } = await supabase
    .from('batches')
    .select(`
      id,
      batch_number,
      status,
      placement_date,
      closed_at,
      farm:farms(id, name)
    `)
    .in('farm_id', (
      await supabase.from('farms').select('id').eq('integrator_id', integratorId)
    ).data?.map(f => f.id) || [])
    .order('placement_date', { ascending: false });

  if (error) {
    console.error('Error fetching batches:', error);
    return [];
  }

  return batches || [];
}

export default async function ReportsPage() {
  const integratorId = await getIntegratorId();
  
  if (!integratorId) {
    // If integratorId lookup fails, show empty state instead of redirecting to login
    console.warn('Integrator ID lookup failed, showing empty state');
  }

  const farms = await getFarms(integratorId);
  const batches = await getBatches(integratorId);

  const closedBatches = batches.filter(b => b.status === 'closed');
  const activeBatches = batches.filter(b => b.status === 'active');

  return (
    <ReportsPageClient
      farms={farms}
      batches={batches}
      closedBatches={closedBatches}
      activeBatches={activeBatches}
    />
  );
}
