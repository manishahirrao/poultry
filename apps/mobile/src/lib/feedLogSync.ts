// PoultryPulse AI — Feed Log Sync Utility
// File: apps/mobile/src/lib/feedLogSync.ts
// Version: v1.0 | June 2026
// TASK-032, TASK-055: Offline sync for feed logs

import { getDatabase } from './database';
import { FeedLog } from '../database/schema';
import { supabase } from './supabase';
import NetInfo from '@react-native-community/netinfo';
import { Q } from '@nozbe/watermelondb';

/**
 * Sync pending feed logs to Supabase
 * Called when network connection is restored
 */
export async function syncPendingFeedLogs(): Promise<{
  synced: number;
  failed: number;
  errors: string[];
}> {
  const results = {
    synced: 0,
    failed: 0,
    errors: [] as string[],
  };

  try {
    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return results;
    }

    // Get database instance
    const db = await getDatabase();

    // Get all unsynced feed logs
    const unsyncedLogs = await db.get<FeedLog>('feed_logs')
      .query(Q.where('synced', false))
      .fetch();

    for (const log of unsyncedLogs) {
      try {
        // Convert to API format
        const apiData = log.toApiFormat();

        // Send to Supabase
        const { error } = await supabase
          .from('feed_logs')
          .insert({
            batch_id: apiData.batch_id,
            log_date: apiData.log_date,
            morning_feed_kg: apiData.morning_feed_kg,
            evening_feed_kg: apiData.evening_feed_kg,
            water_litres: apiData.water_litres,
            feed_brand: apiData.feed_brand,
            feed_refusal_kg: apiData.feed_refusal_kg,
            notes: apiData.notes,
          });

        if (error) {
          results.failed++;
          results.errors.push(`Failed to sync feed log ${log.id}: ${error.message}`);
          continue;
        }

        // Mark as synced
        await db.write(async () => {
          await log.update((record: FeedLog) => {
            record.synced = true;
            record.syncedAt = new Date();
          });
        });
        results.synced++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Error syncing feed log ${log.id}: ${error}`);
      }
    }
  } catch (error) {
    results.errors.push(`Sync error: ${error}`);
  }

  return results;
}

/**
 * Save feed log locally for offline submission
 */
export async function saveFeedLogLocally(feedLogData: {
  batchId: string;
  logDate: string;
  morningFeedKg: number;
  eveningFeedKg: number;
  waterLitres: number;
  feedBrand: string;
  feedRefusalKg: number;
  notes?: string;
}): Promise<FeedLog> {
  const db = await getDatabase();
  return await db.write(async () => {
    const log = await db.get<FeedLog>('feed_logs').create((record) => {
      record.batchId = feedLogData.batchId;
      record.logDate = feedLogData.logDate;
      record.morningFeedKg = feedLogData.morningFeedKg;
      record.eveningFeedKg = feedLogData.eveningFeedKg;
      record.waterLitres = feedLogData.waterLitres;
      record.feedBrand = feedLogData.feedBrand;
      record.feedRefusalKg = feedLogData.feedRefusalKg;
      record.notes = feedLogData.notes || '';
      record.synced = false;
      record.createdAt = new Date();
      record.syncedAt = new Date(0); // Not synced yet
    });
    return log;
  });
}

/**
 * Get pending sync count for UI display
 */
export async function getPendingFeedLogSyncCount(): Promise<number> {
  const db = await getDatabase();
  const pendingLogs = await db.get<FeedLog>('feed_logs')
    .query(Q.where('synced', false))
    .fetch();
  return pendingLogs.length;
}

/**
 * Setup network listener for auto-sync
 */
export function setupFeedLogAutoSync(): () => void {
  const unsubscribe = NetInfo.addEventListener(async (state) => {
    if (state.isConnected) {
      await syncPendingFeedLogs();
    }
  });
  return unsubscribe;
}

// Helper functions
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
