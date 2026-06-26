// FlockIQ — Supervisor Access Control
// File: apps/web/lib/supervisorAccess.ts
// Version: v1.0 | June 2026
// Task: TASK-045

import { createClient } from '@/utils/supabase/server';

/**
 * Check if the current user is a supervisor
 */
export async function isSupervisor(userId: string): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;
  try {
    const { data, error } = await supabase
      .from('supervisors')
      .select('*')
      .eq('supervisor_user_id', userId)
      .eq('is_active', true)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('Error checking supervisor status:', error);
    return false;
  }
}

/**
 * Get supervisor's customer (farm owner) ID
 * Used to enforce data isolation - supervisors can only access their assigned customer's data
 */
export async function getSupervisorCustomerId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('supervisors')
      .select('customer_id')
      .eq('supervisor_user_id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data) return null;
    return data.customer_id;
  } catch (error) {
    console.error('Error getting supervisor customer ID:', error);
    return null;
  }
}

/**
 * Get supervisor's assigned sheds
 * Used to filter data by shed assignment
 */
export async function getSupervisorSheds(userId: string): Promise<string[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('supervisors')
      .select('assigned_sheds')
      .eq('supervisor_user_id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data) return [];
    return data.assigned_sheds || [];
  } catch (error) {
    console.error('Error getting supervisor sheds:', error);
    return [];
  }
}

/**
 * Supervisor access control configuration
 * Defines what supervisors can and cannot access
 */
export const SUPERVISOR_ACCESS_CONTROL = {
  // Features supervisors CANNOT access
  restricted: {
    priceForecasts: true,
    batchPnL: true,
    subscriptionDetails: true,
    otherSupervisorsData: true,
    customerSettings: true,
    billing: true,
    integrations: true,
  },
  
  // Features supervisors CAN access
  allowed: {
    healthChecklist: true,
    mortalityLog: true,
    feedLog: true,
    waterReading: true,
    batchStatusBoard: true,
    batchDetailDrawer: true, // But without P&L tab
    todayWork: true,
    myReports: true,
    account: true, // Limited version
  }
};

/**
 * Check if a feature is restricted for supervisors
 */
export function isFeatureRestrictedForSupervisors(feature: keyof typeof SUPERVISOR_ACCESS_CONTROL.restricted): boolean {
  return SUPERVISOR_ACCESS_CONTROL.restricted[feature] || false;
}

/**
 * Middleware function to check supervisor access
 * Use this in API routes to enforce access control
 */
export async function enforceSupervisorAccess(
  userId: string,
  feature: keyof typeof SUPERVISOR_ACCESS_CONTROL.restricted
): Promise<{ allowed: boolean; customerId?: string; sheds?: string[] }> {
  const supervisorCheck = await isSupervisor(userId);
  
  if (!supervisorCheck) {
    // Not a supervisor, allow access
    return { allowed: true };
  }

  // Is a supervisor, check if feature is restricted
  if (isFeatureRestrictedForSupervisors(feature)) {
    return { allowed: false };
  }

  // Feature is allowed, get supervisor's customer and sheds for data filtering
  const customerId = await getSupervisorCustomerId(userId);
  const sheds = await getSupervisorSheds(userId);

  return { 
    allowed: true, 
    customerId: customerId || undefined, 
    sheds: sheds.length > 0 ? sheds : undefined 
  };
}
