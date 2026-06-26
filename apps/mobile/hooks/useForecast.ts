// PoultryPulse AI — Forecast Hook
// File: apps/mobile/hooks/useForecast.ts
// Version: v1.0 | May 2026
// Design Reference: Architecture v1.0 §4.3, TRD v1.0 §5.3
// Task: 10.8

import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Q } from '@nozbe/watermelondb';
import { getDatabase } from '../src/lib/database';
import { supabase } from '../src/lib/supabase';
import type { PredictionResult, MandiSlug } from '@poultrypulse/types';
import { CachedPrediction } from '../src/database/schema';

interface UseForecastOptions {
  mandi: MandiSlug;
  enabled?: boolean;
}

interface UseForecastResult {
  data: PredictionResult | null;
  isLoading: boolean;
  error: Error | null;
  isOffline: boolean;
  isStale: boolean;
  refetch: () => Promise<void>;
}

/**
 * Stale-while-revalidate hook for forecast data
 * - Returns cached data immediately if available
 * - Fetches fresh data in background if online
 * - Uses WatermelonDB for offline caching
 * - Detects offline status
 */
export function useForecast({ mandi, enabled = true }: UseForecastOptions): UseForecastResult {
  const [data, setData] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isStale, setIsStale] = useState(false);

  /**
   * Load cached prediction from WatermelonDB
   */
  const loadCachedPrediction = async (): Promise<PredictionResult | null> => {
    try {
      const database = await getDatabase();
      const cachedPredictionsCollection = database.get('cached_predictions');
      
      const cached = await cachedPredictionsCollection
        .query(Q.where('mandi', mandi))
        .fetch();

      if (cached.length > 0) {
        const latest = cached[0] as any;
        const prediction = latest.toPredictionResult();
        
        // Check staleness (data older than 6 hours is stale)
        const cachedAt = new Date(latest.cachedAt);
        const now = new Date();
        const hoursSinceCache = (now.getTime() - cachedAt.getTime()) / (1000 * 60 * 60);
        setIsStale(hoursSinceCache > 6);
        
        return prediction;
      }
      
      return null;
    } catch (err) {
      console.error('Error loading cached prediction:', err);
      return null;
    }
  };

  /**
   * Fetch fresh prediction from API
   */
  const fetchFreshPrediction = async (): Promise<PredictionResult | null> => {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('mandi', mandi)
        .order('predicted_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      if (!data) return null;

      const prediction: PredictionResult = {
        p10: data.p10,
        p50: data.p50,
        p90: data.p90,
        drivers: data.drivers || [],
        confidence: data.confidence,
        model_version: data.model_version,
        staleness_flag: data.staleness_flag || false,
        predicted_at: data.predicted_at,
      };

      // Cache the fresh prediction
      await cachePrediction(prediction);

      return prediction;
    } catch (err) {
      console.error('Error fetching fresh prediction:', err);
      throw err;
    }
  };

  /**
   * Cache prediction in WatermelonDB
   */
  const cachePrediction = async (prediction: PredictionResult) => {
    try {
      const database = await getDatabase();
      const cachedPredictionsCollection = database.get('cached_predictions');

      await database.write(async () => {
        // Delete old cached predictions for this mandi
        const oldRecords = await cachedPredictionsCollection
          .query(Q.where('mandi', mandi))
          .fetch();
        
        await database.batch(
          ...oldRecords.map(record => record.prepareMarkAsDeleted())
        );

        // Insert new cached prediction
        await cachedPredictionsCollection.create((record) => {
          const predictionRecord = record as CachedPrediction;
          predictionRecord.mandi = mandi;
          predictionRecord.p10 = prediction.p10;
          predictionRecord.p50 = prediction.p50;
          predictionRecord.p90 = prediction.p90;
          predictionRecord.confidence = prediction.confidence;
          predictionRecord.modelVersion = prediction.model_version;
          predictionRecord.stalenessFlag = prediction.staleness_flag;
          predictionRecord.driversJson = JSON.stringify(prediction.drivers);
          predictionRecord.predictedAt = new Date(prediction.predicted_at);
          predictionRecord.cachedAt = new Date();
        });
      });
    } catch (err) {
      console.error('Error caching prediction:', err);
    }
  };

  /**
   * Refetch forecast data
   */
  const refetch = async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const networkState = await NetInfo.fetch();
      setIsOffline(!networkState.isConnected);

      if (networkState.isConnected) {
        // Fetch fresh data if online
        const freshData = await fetchFreshPrediction();
        if (freshData) {
          setData(freshData);
          setIsStale(false);
        }
      } else {
        // Load cached data if offline
        const cachedData = await loadCachedPrediction();
        if (cachedData) {
          setData(cachedData);
        }
      }
    } catch (err) {
      setError(err as Error);
      // Try to load cached data on error
      const cachedData = await loadCachedPrediction();
      if (cachedData) {
        setData(cachedData);
      }
    } finally {
      setIsLoading(false);
    }
  };


  /**
   * Initial load with stale-while-revalidate pattern
   */
  useEffect(() => {
    if (!enabled) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const networkState = await NetInfo.fetch();
        setIsOffline(!networkState.isConnected);

        // Load cached data first (immediate)
        const cachedData = await loadCachedPrediction();
        if (cachedData) {
          setData(cachedData);
        }

        // Then fetch fresh data in background if online
        if (networkState.isConnected) {
          try {
            const freshData = await fetchFreshPrediction();
            if (freshData) {
              setData(freshData);
              setIsStale(false);
            }
          } catch (err) {
            console.error('Background fetch error:', err);
          }
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [mandi, enabled]);

  return {
    data,
    isLoading,
    error,
    isOffline,
    isStale,
    refetch,
  };
}
