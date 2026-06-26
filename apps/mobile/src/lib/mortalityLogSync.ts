// PoultryPulse AI — Mortality Log Sync Utility
// File: apps/mobile/src/lib/mortalityLogSync.ts
// Version: v1.0 | May 2026
// TASK-038: Offline sync for mortality logs

import { getDatabase } from './database';
import { MortalityLog } from '../database/schema';
import { Q } from '@nozbe/watermelondb';
import NetInfo from '@react-native-community/netinfo';

/**
 * Sync pending mortality logs to Supabase
 * Called when network connection is restored
 */
export async function syncPendingMortalityLogs(): Promise<{
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

    // Get all unsynced mortality logs
    const unsyncedLogs = await db.get<MortalityLog>('mortality_logs')
      .query(Q.where('synced', false))
      .fetch();

    for (const log of unsyncedLogs) {
      try {
        // Convert to API format
        const apiData = log.toApiFormat();

        // Send to Supabase (you'll need to implement the actual API call)
        const response = await fetch('https://your-api.com/api/v2/mortality/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${await getAuthToken()}`,
          },
          body: JSON.stringify({ record: apiData }),
        });

        if (response.ok) {
          // Mark as synced
          await db.write(async () => {
            await log.update((record: MortalityLog) => {
              record.synced = true;
              record.syncedAt = new Date();
            });
          });
          results.synced++;
        } else {
          results.failed++;
          results.errors.push(`Failed to sync mortality log ${log.id}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Error syncing mortality log ${log.id}: ${error}`);
      }
    }
  } catch (error) {
    results.errors.push(`Sync error: ${error}`);
  }

  return results;
}

/**
 * Save mortality log locally for offline submission
 */
export async function saveMortalityLogLocally(mortalityData: {
  batchId: string;
  logDate: string;
  count: number;
  cause: string;
  ageAtDeathDays: number;
  photoUrl?: string;
  notes?: string;
}): Promise<MortalityLog> {
  const db = await getDatabase();
  return await db.write(async () => {
    const log = await db.get<MortalityLog>('mortality_logs').create((record) => {
      record.batchId = mortalityData.batchId;
      record.logDate = mortalityData.logDate;
      record.count = mortalityData.count;
      record.cause = mortalityData.cause;
      record.ageAtDeathDays = mortalityData.ageAtDeathDays;
      record.photoUrl = mortalityData.photoUrl || '';
      record.notes = mortalityData.notes || '';
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
export async function getPendingMortalitySyncCount(): Promise<number> {
  const db = await getDatabase();
  const pendingLogs = await db.get<MortalityLog>('mortality_logs')
    .query(Q.where('synced', false))
    .fetch();
  return pendingLogs.length;
}

/**
 * Setup network listener for auto-sync
 */
export function setupMortalityAutoSync(): () => void {
  const unsubscribe = NetInfo.addEventListener(async (state) => {
    if (state.isConnected) {
      await syncPendingMortalityLogs();
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

async function getAuthToken(): Promise<string> {
  // Implement your auth token retrieval logic
  // This might come from AsyncStorage, SecureStore, or your auth context
  return '';
}
