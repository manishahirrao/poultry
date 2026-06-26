'use client';

import { useEffect, useState } from 'react';
import { set as idbSet, get as idbGet, del as idbDel, keys as idbKeys } from 'idb-keyval';

interface DailyLogDraft {
  farmId: string;
  logDate: string;
  deaths_today: number;
  death_cause?: string;
  feed_consumed_kg: number;
  feed_type?: string;
  sample_birds?: number;
  sample_weight_kg?: number;
  water_litres?: number;
  temp_min_c?: number;
  temp_max_c?: number;
  humidity_pct?: number;
  health_issue?: boolean;
  health_symptoms?: string[];
  health_severity?: string;
  health_notes?: string;
  notes?: string;
}

/**
 * Detects online/offline status and auto-submits pending daily log drafts from IndexedDB.
 * On window.addEventListener('online'): checks idb-keyval for any 'daily-log-draft-*' keys.
 * For each key: attempts POST /api/farms/[farmId]/daily-log, deletes draft on success.
 * Ref: FR-FARM-004 offline mode requirement
 * 
 * @param isOnline - Current online status (from navigator.onLine or custom state)
 */
export function useOfflineDraftSync(isOnline: boolean = true) {
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Check for pending drafts on mount
    checkPendingDrafts();

    // Listen for online/offline events
    const handleOnline = () => {
      console.log('[OfflineDraftSync] Connection restored, syncing drafts...');
      syncPendingDrafts();
    };

    const handleOffline = () => {
      console.log('[OfflineDraftSync] Connection lost');
      checkPendingDrafts();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check for pending drafts without syncing
  async function checkPendingDrafts() {
    try {
      const allKeys = await idbKeys();
      const draftKeys = allKeys.filter(key => 
        typeof key === 'string' && key.startsWith('daily-log-draft-')
      );
      setPendingCount(draftKeys.length);
    } catch (error) {
      console.error('[OfflineDraftSync] Error checking pending drafts:', error);
    }
  }

  // Sync all pending drafts when online
  async function syncPendingDrafts() {
    if (!isOnline || syncing) return;

    setSyncing(true);
    try {
      const allKeys = await idbKeys();
      const draftKeys = allKeys.filter((key: unknown) => 
        typeof key === 'string' && key.startsWith('daily-log-draft-')
      );

      if (draftKeys.length === 0) {
        setPendingCount(0);
        setSyncing(false);
        return;
      }

      console.log(`[OfflineDraftSync] Found ${draftKeys.length} pending drafts, syncing...`);

      // Process drafts sequentially (not parallel to avoid rate limit)
      for (const key of draftKeys) {
        try {
          const draft = await idbGet<DailyLogDraft>(key);
          if (!draft) continue;

          // Extract farmId from key format: daily-log-draft-{farmId}-{date}
          const keyParts = (key as string).split('-');
          const farmId = keyParts[3];
          const logDate = keyParts[4];

          // Submit the draft
          const response = await fetch(`/api/farms/${farmId}/daily-log`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...draft,
              log_date: logDate,
            }),
          });

          if (response.ok) {
            // Delete draft on success
            await idbDel(key);
            console.log(`[OfflineDraftSync] Successfully synced draft for farm ${farmId}`);
          } else {
            console.error(`[OfflineDraftSync] Failed to sync draft for farm ${farmId}:`, response.statusText);
          }
        } catch (error) {
          console.error(`[OfflineDraftSync] Error processing draft ${key}:`, error);
        }
      }

      // Update pending count after sync attempt
      await checkPendingDrafts();
    } catch (error) {
      console.error('[OfflineDraftSync] Error syncing drafts:', error);
    } finally {
      setSyncing(false);
    }
  }

  return {
    syncing,
    pendingCount,
    syncPendingDrafts,
    checkPendingDrafts,
  };
}

/**
 * Save a daily log draft to IndexedDB
 * @param farmId - The farm ID
 * @param logDate - The log date (ISO string)
 * @param draft - The draft data
 */
export async function saveDailyLogDraft(
  farmId: string,
  logDate: string,
  draft: Partial<DailyLogDraft>
): Promise<void> {
  const key = `daily-log-draft-${farmId}-${logDate}`;
  await idbSet(key, { farmId, logDate, ...draft });
  console.log(`[OfflineDraftSync] Saved draft for farm ${farmId} on ${logDate}`);
}

/**
 * Load a daily log draft from IndexedDB
 * @param farmId - The farm ID
 * @param logDate - The log date (ISO string)
 * @returns The draft data or null if not found
 */
export async function loadDailyLogDraft(
  farmId: string,
  logDate: string
): Promise<DailyLogDraft | null> {
  const key = `daily-log-draft-${farmId}-${logDate}`;
  try {
    const draft = await idbGet<DailyLogDraft>(key);
    return draft || null;
  } catch (error) {
    console.error('[OfflineDraftSync] Error loading draft:', error);
    return null;
  }
}

/**
 * Delete a daily log draft from IndexedDB
 * @param farmId - The farm ID
 * @param logDate - The log date (ISO string)
 */
export async function deleteDailyLogDraft(
  farmId: string,
  logDate: string
): Promise<void> {
  const key = `daily-log-draft-${farmId}-${logDate}`;
  await idbDel(key);
  console.log(`[OfflineDraftSync] Deleted draft for farm ${farmId} on ${logDate}`);
}
