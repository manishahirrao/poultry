'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useSWRConfig } from 'swr';

interface AlertPayload {
  id: string;
  type: 'HPAI' | 'WEATHER' | 'PRICE_WARNING' | 'POLICY';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  title_hi: string;
  body: string;
  body_hi: string;
  district: string;
  expires_at: string;
  created_at: string;
  external_url: string | null;
}

export function useRealtimeAlerts(district: string) {
  const { mutate } = useSWRConfig();
  const supabase = createClient();

  useEffect(() => {
    if (!district) return;
    if (!supabase) return;

    const channel = supabase
      .channel(`alerts:${district}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `district=eq.${district}`,
        },
        (payload) => {
          const alert = payload.new as AlertPayload;
          
          // Create and show toast notification
          showAlertToast(alert);

          // Revalidate alerts SWR cache
          mutate((key) => typeof key === 'string' && key.includes('/api/alerts'));
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [district, mutate]);
}

function showAlertToast(alert: AlertPayload) {
  // Create toast element
  const toast = document.createElement('div');
  const borderColor = alert.severity === 'critical' ? 'border-red-500' : 'border-amber-400';
  const bgColor = alert.severity === 'critical' ? 'bg-red-50' : 'bg-amber-50';
  
  toast.className = `
    fixed top-4 right-4 z-50
    ${bgColor} shadow-lg rounded-xl p-4 border-l-4 ${borderColor}
    max-w-sm animate-slide-in
    flex items-start gap-3
  `;
  
  toast.innerHTML = `
    <div class="flex-shrink-0">
      ${alert.severity === 'critical' 
        ? '<span class="text-red-500 text-xl" aria-hidden="true">⚠️</span>'
        : '<span class="text-amber-500 text-xl" aria-hidden="true">🔔</span>'
      }
    </div>
    <div class="flex-1 min-w-0">
      <p class="font-semibold text-sm text-neutral-900">${alert.title_hi}</p>
      <p class="text-xs text-neutral-600 mt-1 line-clamp-2">${alert.body_hi}</p>
      <p class="text-[10px] text-neutral-400 mt-1">${new Date(alert.created_at).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}</p>
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
  
  // Auto-remove after 6 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 6000);
}
