'use client';

import useSWR from 'swr';
import { useMemo } from 'react';

export type MandiSlug = 'gorakhpur' | 'deoria' | 'kushinagar' | 'basti' | 'maharajganj';

export interface PredictionRow {
  id: string;
  mandi: MandiSlug;
  predicted_at: string;
  p10: number;
  p50: number;
  p90: number;
  sell_signal: 'SELL_NOW' | 'HOLD' | 'CAUTION';
  actual_price: number | null;
  confidence: number;
  drivers: string[];
}

interface UsePredictionsOptions {
  mandi?: MandiSlug;
  days?: number;
  fallbackData?: PredictionRow[];
  enabled?: boolean;
}

const fetcher = async (url: string): Promise<PredictionRow[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch predictions: ${response.statusText}`);
  }
  return response.json();
};

/**
 * SWR hook for fetching price predictions with 10-minute refresh interval
 * 
 * Features:
 * - Auto-refreshes every 10 minutes (600000ms)
 * - Revalidates on window focus
 * - Uses fallback data from SSR to prevent loading flash
 * - Error boundary shows stale data banner instead of error state
 */
export function usePredictions(options: UsePredictionsOptions = {}) {
  const { mandi, days = 30, fallbackData, enabled = true } = options;

  // Build query parameters
  const params = new URLSearchParams();
  if (mandi) params.append('mandi', mandi);
  if (days) params.append('days', days.toString());
  
  const queryString = params.toString();
  const url = queryString ? `/api/data/predictions?${queryString}` : '/api/data/predictions';

  const { data, error, isLoading, isValidating, mutate } = useSWR<PredictionRow[]>(
    enabled ? url : null,
    fetcher,
    {
      refreshInterval: 600000, // 10 minutes
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Avoid duplicate requests within 5 seconds
      fallbackData: fallbackData,
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Don't retry on 404 or 403 errors
        if (error.status === 404 || error.status === 403) return;
        
        // Retry up to 3 times with exponential backoff
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), Math.min(1000 * 2 ** retryCount, 30000));
      },
    }
  );

  // Determine if data is stale (> 24 hours old)
  const isStale = useMemo(() => {
    if (!data || data.length === 0) return false;
    const latestPrediction = data[0];
    const lastUpdated = new Date(latestPrediction.predicted_at).getTime();
    const now = Date.now();
    return now - lastUpdated > 86_400_000; // 24 hours in milliseconds
  }, [data]);

  // Get latest prediction for a specific mandi
  const getLatestPrediction = (targetMandi: MandiSlug): PredictionRow | null => {
    if (!data) return null;
    return data.find((p) => p.mandi === targetMandi) || null;
  };

  // Get predictions grouped by mandi
  const getPredictionsByMandi = useMemo(() => {
    if (!data) return {};
    return data.reduce((acc, prediction) => {
      if (!acc[prediction.mandi]) {
        acc[prediction.mandi] = [];
      }
      acc[prediction.mandi].push(prediction);
      return acc;
    }, {} as Record<MandiSlug, PredictionRow[]>);
  }, [data]);

  return {
    data: data || [],
    error,
    isLoading,
    isValidating,
    isStale,
    mutate,
    getLatestPrediction,
    getPredictionsByMandi,
  };
}

/**
 * Hook for fetching prediction history for a specific mandi
 */
export function usePredictionHistory(mandi: MandiSlug, days: number = 30) {
  const url = `/api/data/predictions/history?mandi=${mandi}&days=${days}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<PredictionRow[]>(
    url,
    fetcher,
    {
      refreshInterval: 600000, // 10 minutes
      revalidateOnFocus: true,
    }
  );

  return {
    data: data || [],
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

/**
 * Hook for fetching latest predictions across all mandis
 */
export function useLatestPredictions(mandis: MandiSlug[] = ['gorakhpur', 'deoria', 'kushinagar', 'basti', 'maharajganj']) {
  const mandiParams = mandis.join(',');
  const url = `/api/data/predictions/latest?mandis=${mandiParams}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<PredictionRow[]>(
    url,
    fetcher,
    {
      refreshInterval: 600000, // 10 minutes
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  // Deduplicate to get only latest per mandi
  const latestByMandi = useMemo(() => {
    if (!data) return {};
    const latest = new Map<MandiSlug, PredictionRow>();
    data.forEach((prediction) => {
      if (!latest.has(prediction.mandi)) {
        latest.set(prediction.mandi, prediction);
      }
    });
    return Object.fromEntries(latest);
  }, [data]);

  return {
    data: data || [],
    latestByMandi,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
