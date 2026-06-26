// PoultryPulse AI — Health Checklist Sync Utility
// File: apps/mobile/src/lib/healthChecklistSync.ts
// Version: v1.0 | May 2026
// TASK-036: Offline sync for health checklists

import { getDatabase } from './database';
import { HealthChecklist } from '../database/schema';
import { Q } from '@nozbe/watermelondb';
import NetInfo from '@react-native-community/netinfo';

/**
 * Sync pending health checklists to Supabase
 * Called when network connection is restored
 */
export async function syncPendingHealthChecklists(): Promise<{
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

    // Get all unsynced health checklists
    const unsyncedChecklists = await db.get<HealthChecklist>('health_checklists')
      .query(Q.where('synced', false))
      .fetch();

    for (const checklist of unsyncedChecklists) {
      try {
        // Convert to API format
        const apiData = checklist.toApiFormat();

        // Send to Supabase (you'll need to implement the actual API call)
        const response = await fetch('https://your-api.com/api/v2/health/checklist', {
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
            await checklist.update((record: HealthChecklist) => {
              record.synced = true;
              record.syncedAt = new Date();
            });
          });
          results.synced++;
        } else {
          results.failed++;
          results.errors.push(`Failed to sync checklist ${checklist.id}`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`Error syncing checklist ${checklist.id}: ${error}`);
      }
    }
  } catch (error) {
    results.errors.push(`Sync error: ${error}`);
  }

  return results;
}

/**
 * Save health checklist locally for offline submission
 */
export async function saveHealthChecklistLocally(checklistData: {
  batchId: string;
  logDate: string;
  birdBehaviour: string;
  appetite: string;
  droppings: string;
  respiratory: string;
  waterConsumption: string;
  notes?: string;
}): Promise<HealthChecklist> {
  const db = await getDatabase();
  return await db.write(async () => {
    const checklist = await db.get<HealthChecklist>('health_checklists').create((record) => {
      record.batchId = checklistData.batchId;
      record.logDate = checklistData.logDate;
      record.birdBehaviour = checklistData.birdBehaviour;
      record.appetite = checklistData.appetite;
      record.droppings = checklistData.droppings;
      record.respiratory = checklistData.respiratory;
      record.waterConsumption = checklistData.waterConsumption;
      record.notes = checklistData.notes || '';
      record.synced = false;
      record.createdAt = new Date();
      record.syncedAt = new Date(0); // Not synced yet
    });
    return checklist;
  });
}

/**
 * Get pending sync count for UI display
 */
export async function getPendingSyncCount(): Promise<number> {
  const db = await getDatabase();
  const pendingChecklists = await db.get<HealthChecklist>('health_checklists')
    .query(Q.where('synced', false))
    .fetch();
  return pendingChecklists.length;
}

/**
 * Setup network listener for auto-sync
 */
export function setupAutoSync(): () => void {
  const unsubscribe = NetInfo.addEventListener(async (state) => {
    if (state.isConnected) {
      await syncPendingHealthChecklists();
    }
  });
  return unsubscribe;
}

async function getAuthToken(): Promise<string> {
  // Implement your auth token retrieval logic
  // This might come from AsyncStorage, SecureStore, or your auth context
  return '';
}
