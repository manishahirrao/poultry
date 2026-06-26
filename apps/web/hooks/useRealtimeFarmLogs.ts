'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useSWRConfig } from 'swr';

interface DailyLogPayload {
  id: string;
  batch_id: string;
  farm_id: string;
  log_date: string;
  deaths_today: number;
  cumulative_mortality_pct: number | null;
  feed_consumed_kg: number;
  fcr: number | null;
  avg_weight_g: number | null;
  health_issue: boolean;
  created_at: string;
}

/**
 * Subscribes to daily_logs INSERT events for this integrator's farms.
 * On new log: mutates farm_metrics_summary SWR cache (removes farm from "pending" list).
 * Also: if mortality_pct in new log > threshold → triggers Realtime notification.
 * 
 * @param integratorId - The integrator's customer ID
 * @param farmIds - Array of farm IDs to filter logs for (optional, fetched on mount)
 */
export function useRealtimeFarmLogs(integratorId: string, farmIds?: string[]) {
  const { mutate } = useSWRConfig();
  const supabase = createClient();

  useEffect(() => {
    if (!integratorId) return;

    const channel = supabase?.channel(`farm-logs:${integratorId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'daily_logs',
          // Note: Supabase Realtime filter on joined table not supported;
          // filter by farm_ids if provided, otherwise client-side filtering
          ...(farmIds && farmIds.length > 0
            ? { filter: `farm_id=in.(${farmIds.join(',')})` }
            : {}),
        },
        (payload) => {
          const log = payload.new as DailyLogPayload;
          
          // Revalidate portfolio metrics SWR
          mutate((key) => typeof key === 'string' && key.includes('/api/metrics'));
          mutate((key) => typeof key === 'string' && key.includes('/api/farms'));
          
          // Revalidate specific farm metrics
          mutate((key) => typeof key === 'string' && key.includes(`/api/farms/${log.farm_id}`));
          
          // Check for high mortality and trigger notification
          if (log.cumulative_mortality_pct && log.cumulative_mortality_pct > 3) {
            showMortalityAlert(log);
          }
        }
      )
      .subscribe();

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [integratorId, farmIds, mutate]);
}

function showMortalityAlert(log: DailyLogPayload) {
  // Create toast notification for high mortality
  const toast = document.createElement('div');
  
  toast.className = `
    fixed top-4 right-4 z-50
    bg-red-50 shadow-lg rounded-xl p-4 border-l-4 border-red-500
    max-w-sm animate-slide-in
    flex items-start gap-3
  `;
  
  toast.innerHTML = `
    <div class="flex-shrink-0">
      <span class="text-red-500 text-xl" aria-hidden="true">⚠️</span>
    </div>
    <div class="flex-1 min-w-0">
      <p class="font-semibold text-sm text-neutral-900">High Mortality Alert</p>
      <p class="text-xs text-neutral-600 mt-1">
        Mortality rate: ${log.cumulative_mortality_pct}% — investigate करें
      </p>
      <p class="text-[10px] text-neutral-400 mt-1">${new Date(log.created_at).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}</p>
    </div>
    <button 
      class="flex-shrink-0 text-neutral-400 hover:text-neutral-600 transition-colors"
      aria-label="Close notification"
      onclick="this.parentElement.remove()"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  `;
  
  document.body.appendChild(toast);
  
  // Auto-remove after 8 seconds (longer for critical alerts)
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 8000);
}
