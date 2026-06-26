// FlockIQ — Widget Data Hook with Offline Cache
// File: apps/web/hooks/useWidgetData.ts
// Version: v1.0 | May 2026
// Task Reference: FlockIQ_Dashboard_Tasks_v1.md TASK-004
// Requirements Reference: REQ-001 §1.9, REQ-011 §11.5

import useSWR, { SWRConfiguration, mutate } from 'swr';

// TypeScript Interfaces

interface WidgetDataResult<T> {
  data: T | null;
  isLoading: boolean;
  isStale: boolean;
  refresh: () => Promise<void>;
  error: Error | null;
}

interface WidgetDataOptions {
  ttlMs?: number;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  dedupingInterval?: number;
}

// Cache Storage Utilities - SWR in-memory cache (not localStorage per SEC-004)

const cacheTimestamps = new Map<string, number>();

function getLastFetchedTime(cacheKey: string): number {
  return cacheTimestamps.get(cacheKey) || 0;
}

function setLastFetchedTime(cacheKey: string): void {
  cacheTimestamps.set(cacheKey, Date.now());
}

function getCachedFallback<T>(cacheKey: string): T | null {
  // SWR manages its own in-memory cache
  // This is a placeholder for any additional cache logic if needed
  return null;
}

// Main Hook - SWR-based data fetching with instant cache hydration and staleness detection

export function useWidgetData<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  options: WidgetDataOptions = {}
): WidgetDataResult<T> {
  const {
    ttlMs = 24 * 60 * 60 * 1000, // Default 24h TTL
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    dedupingInterval = 60000, // 1 minute deduping
  } = options;

  // SWR configuration
  const swrConfig: SWRConfiguration = {
    revalidateOnFocus,
    revalidateOnReconnect,
    dedupingInterval,
    onSuccess: (data) => {
      // Update timestamp on successful fetch
      setLastFetchedTime(cacheKey);
    },
    onError: (error) => {
      console.error(`Widget data fetch error for ${cacheKey}:`, error);
    },
  };

  // SWR hook
  const { data, error, isValidating, mutate: swrMutate } = useSWR<T>(
    cacheKey,
    fetchFn,
    swrConfig
  );

  // Calculate staleness
  const isStale = data
    ? (Date.now() - getLastFetchedTime(cacheKey)) > ttlMs
    : false;

  // Loading state: only true when there's zero cached data
  const isLoading = !data && !error && isValidating;

  // Manual refresh function
  const refresh = async (): Promise<void> => {
    await swrMutate();
  };

  return {
    data: data ?? null,
    isLoading,
    isStale,
    refresh,
    error: error || null,
  };
}

// Utility Hooks for Common Patterns

// Hook for dashboard summary data
// Uses the aggregated API endpoint from TASK-003
export function useDashboardSummary(customerId: string, districts?: string[]) {
  const districtParam = districts?.join(',') || '';
  const cacheKey = `/api/v2/dashboard/summary?districts=${districtParam}&customer=${customerId}`;

  return useWidgetData(
    async () => {
      const response = await fetch(
        `/api/v2/dashboard/summary?districts=${districtParam}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store', // SWR handles caching
        }
      );

      if (!response.ok) {
        throw new Error(`Dashboard summary fetch failed: ${response.statusText}`);
      }

      return response.json();
    },
    cacheKey,
    {
      ttlMs: 5 * 60 * 1000, // 5-minute TTL for dashboard data
      revalidateOnReconnect: true,
    }
  );
}

// Hook for alert data with real-time updates
// Shorter TTL for time-sensitive alerts
export function useAlerts(district: string) {
  const cacheKey = `/api/v1/alerts?district=${district}`;

  return useWidgetData(
    async () => {
      const response = await fetch(`/api/v1/alerts?district=${district}`);
      if (!response.ok) {
        throw new Error(`Alerts fetch failed: ${response.statusText}`);
      }
      return response.json();
    },
    cacheKey,
    {
      ttlMs: 2 * 60 * 1000, // 2-minute TTL for alerts
      revalidateOnFocus: true, // Refresh when user returns to tab
    }
  );
}

// Hook for price forecast data
// Medium TTL for price predictions
export function usePriceForecast(district: string) {
  const cacheKey = `/api/v1/forecast?district=${district}`;

  return useWidgetData(
    async () => {
      const response = await fetch(`/api/v1/forecast?district=${district}`);
      if (!response.ok) {
        throw new Error(`Forecast fetch failed: ${response.statusText}`);
      }
      return response.json();
    },
    cacheKey,
    {
      ttlMs: 30 * 60 * 1000, // 30-minute TTL for forecasts
      revalidateOnReconnect: true,
    }
  );
}

// Global Refresh Utility - Refresh all widget data at once

export function refreshAllWidgets(): Promise<void> {
  mutate(() => true, undefined, { revalidate: true });
  return Promise.resolve();
}

// Prefetching Utility - Prefetch data before it's needed (e.g., on hover)

export function prefetchWidgetData<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>
): void {
  mutate(cacheKey, fetchFn, false);
}
