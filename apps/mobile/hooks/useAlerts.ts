// PoultryPulse AI — Alerts Hook
// File: apps/mobile/hooks/useAlerts.ts
// Version: v1.0 | May 2026
// Design Reference: Architecture v1.0 §4.3, TRD v1.0 §5.3
// Task: 10.9

import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Q } from '@nozbe/watermelondb';
import { getDatabase } from '../src/lib/database';
import { supabase } from '../src/lib/supabase';
import type { Alert, MandiSlug, AlertType } from '@poultrypulse/types';
import { CachedAlert } from '../src/database/schema';

interface UseAlertsOptions {
  mandi: MandiSlug;
  enabled?: boolean;
}

interface UseAlertsResult {
  alerts: Alert[];
  isLoading: boolean;
  error: Error | null;
  isOffline: boolean;
  refetch: () => Promise<void>;
}

/**
 * Alerts hook with Supabase Realtime and WatermelonDB persistence
 * - Subscribes to Supabase Realtime for live alerts
 * - Persists alerts in WatermelonDB for offline access
 * - Returns cached alerts immediately
 * - Syncs with server when online
 */
export function useAlerts({ mandi, enabled = true }: UseAlertsOptions): UseAlertsResult {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  /**
   * Load cached alerts from WatermelonDB
   */
  const loadCachedAlerts = async (): Promise<Alert[]> => {
    try {
      const database = await getDatabase();
      const cachedAlertsCollection = database.get('cached_alerts');
      
      const cached = await cachedAlertsCollection
        .query(Q.where('district', mandi))
        .fetch();

      return cached.map((record: any) => record.toAlert());
    } catch (err) {
      console.error('Error loading cached alerts:', err);
      return [];
    }
  };

  /**
   * Fetch fresh alerts from API
   */
  const fetchFreshAlerts = async (): Promise<Alert[]> => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('district', mandi)
        .gte('expires_at', new Date().toISOString())
        .order('issued_at', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      const alerts: Alert[] = data.map(item => ({
        id: item.id,
        type: item.type as AlertType,
        severity: item.severity as 'HIGH' | 'MEDIUM' | 'LOW',
        title_hi: item.title_hi,
        body_hi: item.body_hi,
        district: item.district as MandiSlug,
        issued_at: item.issued_at,
        expires_at: item.expires_at,
      }));

      // Cache the fresh alerts
      await cacheAlerts(alerts);

      return alerts;
    } catch (err) {
      console.error('Error fetching fresh alerts:', err);
      throw err;
    }
  };

  /**
   * Cache alerts in WatermelonDB
   */
  const cacheAlerts = async (freshAlerts: Alert[]) => {
    try {
      const database = await getDatabase();
      const cachedAlertsCollection = database.get('cached_alerts');

      await database.write(async () => {
        // Delete old cached alerts for this district
        const oldRecords = await cachedAlertsCollection
          .query(Q.where('district', mandi))
          .fetch();
        
        await database.batch(
          ...oldRecords.map(record => record.prepareMarkAsDeleted())
        );

        // Insert new cached alerts
        await database.batch(
          ...freshAlerts.map(alert =>
            cachedAlertsCollection.prepareCreate((record) => {
              const alertRecord = record as CachedAlert;
              alertRecord.predictionId = '';
              alertRecord.type = alert.type;
              alertRecord.severity = alert.severity;
              alertRecord.titleHi = alert.title_hi;
              alertRecord.bodyHi = alert.body_hi;
              alertRecord.district = alert.district;
              alertRecord.issuedAt = new Date(alert.issued_at);
              alertRecord.expiresAt = new Date(alert.expires_at);
              alertRecord.cachedAt = new Date();
            })
          )
        );
      });
    } catch (err) {
      console.error('Error caching alerts:', err);
    }
  };

  /**
   * Refetch alerts
   */
  const refetch = async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const networkState = await NetInfo.fetch();
      setIsOffline(!networkState.isConnected);

      if (networkState.isConnected) {
        const freshData = await fetchFreshAlerts();
        setAlerts(freshData);
      } else {
        const cachedData = await loadCachedAlerts();
        setAlerts(cachedData);
      }
    } catch (err) {
      setError(err as Error);
      const cachedData = await loadCachedAlerts();
      setAlerts(cachedData);
    } finally {
      setIsLoading(false);
    }
  };


  /**
   * Initial load and Supabase Realtime subscription
   */
  useEffect(() => {
    if (!enabled) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const networkState = await NetInfo.fetch();
        setIsOffline(!networkState.isConnected);

        // Load cached alerts first
        const cachedData = await loadCachedAlerts();
        setAlerts(cachedData);

        // Fetch fresh alerts if online
        if (networkState.isConnected) {
          try {
            const freshData = await fetchFreshAlerts();
            setAlerts(freshData);
          } catch (err) {
            console.error('Fetch alerts error:', err);
          }
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Subscribe to Supabase Realtime for live alerts
    const channel = supabase
      .channel(`alerts:${mandi}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
          filter: `district=eq.${mandi}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const newAlert: Alert = {
              id: payload.new.id,
              type: payload.new.type as AlertType,
              severity: payload.new.severity as 'HIGH' | 'MEDIUM' | 'LOW',
              title_hi: payload.new.title_hi,
              body_hi: payload.new.body_hi,
              district: payload.new.district as MandiSlug,
              issued_at: payload.new.issued_at,
              expires_at: payload.new.expires_at,
            };
            
            setAlerts(prev => [newAlert, ...prev]);
            await cacheAlerts([newAlert, ...alerts]);
          } else if (payload.eventType === 'UPDATE') {
            setAlerts(prev =>
              prev.map(alert =>
                alert.id === payload.new.id
                  ? {
                      ...alert,
                      title_hi: payload.new.title_hi,
                      body_hi: payload.new.body_hi,
                      severity: payload.new.severity,
                    }
                  : alert
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setAlerts(prev => prev.filter(alert => alert.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mandi, enabled]);

  return {
    alerts,
    isLoading,
    error,
    isOffline,
    refetch,
  };
}
