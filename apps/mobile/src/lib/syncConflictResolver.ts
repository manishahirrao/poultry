// PoultryPulse AI — Sync Conflict Resolution
// File: apps/mobile/src/lib/syncConflictResolver.ts
// Version: v1.0 | June 2026
// TASK-055: Sync conflict resolution with last-write-wins logic

import { supabase } from './supabase';
import { getDatabase } from './database';
import { Q } from '@nozbe/watermelondb';

export interface SyncConflict {
  id: string;
  recordType: string;
  localRecordId: string;
  serverRecordId: string | null;
  conflictType: 'duplicate' | 'version_mismatch' | 'data_mismatch';
  localCreatedAt: Date;
  serverCreatedAt: Date | null;
  localData: any;
  serverData: any;
  resolution: 'local_wins' | 'server_wins' | 'manual' | null;
  resolvedAt: Date | null;
  resolvedBy: string | null;
  notes: string;
}

/**
 * Check for conflicts before syncing a record
 * Uses last-write-wins strategy based on created_at timestamp
 */
export async function checkAndResolveConflict(
  recordType: string,
  localRecord: any,
  tableName: string,
  uniqueFields: string[]
): Promise<{ shouldSync: boolean; conflictLogged: boolean }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { shouldSync: false, conflictLogged: false };
    }

    // Build query to check for existing records with same unique fields
    let query = supabase.from(tableName).select('*');
    
    uniqueFields.forEach((field, index) => {
      if (index === 0) {
        query = query.eq(field, localRecord[field]);
      } else {
        query = query.eq(field, localRecord[field]);
      }
    });

    const { data: existingRecords, error } = await query;
    
    if (error || !existingRecords || existingRecords.length === 0) {
      // No existing record, safe to sync
      return { shouldSync: true, conflictLogged: false };
    }

    // Found existing record(s), check for conflicts
    const serverRecord = existingRecords[0];
    const localCreatedAt = new Date(localRecord.created_at || localRecord.createdAt);
    const serverCreatedAt = new Date(serverRecord.created_at);

    // Last-write-wins: compare timestamps
    if (localCreatedAt > serverCreatedAt) {
      // Local record is newer, it wins
      console.log(`Conflict resolved: Local record wins (${recordType})`);
      
      // Log the conflict for audit purposes
      await logConflict({
        recordType,
        localRecordId: localRecord.id,
        serverRecordId: serverRecord.id,
        conflictType: 'version_mismatch',
        localCreatedAt,
        serverCreatedAt,
        localData: localRecord,
        serverData: serverRecord,
        resolution: 'local_wins',
        resolvedAt: new Date(),
        resolvedBy: user.id,
        notes: 'Auto-resolved by last-write-wins: local record is newer',
      });
      
      // Update server record with local data
      const { error: updateError } = await supabase
        .from(tableName)
        .update(localRecord)
        .eq('id', serverRecord.id);
      
      if (updateError) {
        console.error('Error updating server record in conflict resolution:', updateError);
        return { shouldSync: false, conflictLogged: true };
      }
      
      return { shouldSync: false, conflictLogged: true }; // Don't insert, we updated
    } else if (serverCreatedAt > localCreatedAt) {
      // Server record is newer, it wins
      console.log(`Conflict resolved: Server record wins (${recordType})`);
      
      // Log the conflict for audit purposes
      await logConflict({
        recordType,
        localRecordId: localRecord.id,
        serverRecordId: serverRecord.id,
        conflictType: 'version_mismatch',
        localCreatedAt,
        serverCreatedAt,
        localData: localRecord,
        serverData: serverRecord,
        resolution: 'server_wins',
        resolvedAt: new Date(),
        resolvedBy: user.id,
        notes: 'Auto-resolved by last-write-wins: server record is newer',
      });
      
      // Update local record with server data
      const db = await getDatabase();
      const localCollection = db.get(recordType);
      const localRecords = await localCollection
        .query(Q.where('id', localRecord.id))
        .fetch();
      
      if (localRecords.length > 0) {
        await db.write(async () => {
          await localRecords[0].update((record: any) => {
            // Update fields from server record
            Object.keys(serverRecord).forEach(key => {
              if (record[key] !== undefined && key !== 'id') {
                record[key] = serverRecord[key];
              }
            });
            record.synced = true;
            record.syncedAt = new Date();
          });
        });
      }
      
      return { shouldSync: false, conflictLogged: true }; // Don't insert, we updated local
    } else {
      // Same timestamp, check data mismatch
      const dataMismatch = checkDataMismatch(localRecord, serverRecord);
      
      if (dataMismatch) {
        console.log(`Conflict detected: Data mismatch (${recordType})`);
        
        // Log the conflict for manual review
        await logConflict({
          recordType,
          localRecordId: localRecord.id,
          serverRecordId: serverRecord.id,
          conflictType: 'data_mismatch',
          localCreatedAt,
          serverCreatedAt,
          localData: localRecord,
          serverData: serverRecord,
          resolution: 'manual',
          resolvedAt: null,
          resolvedBy: null,
          notes: 'Data mismatch with same timestamp - requires manual review',
        });
        
        // For now, use server version (conservative approach)
        return { shouldSync: false, conflictLogged: true };
      }
      
      // No actual conflict, records are identical
      return { shouldSync: false, conflictLogged: false };
    }
  } catch (error) {
    console.error('Error in conflict resolution:', error);
    // On error, allow sync to proceed (optimistic approach)
    return { shouldSync: true, conflictLogged: false };
  }
}

/**
 * Check if two records have data mismatch
 */
function checkDataMismatch(localRecord: any, serverRecord: any): boolean {
  const fieldsToCompare = [
    'batch_id', 'log_date', 'count', 'cause', 'morning_feed_kg', 
    'evening_feed_kg', 'water_litres', 'feed_brand', 'bird_behaviour',
    'appetite', 'droppings', 'respiratory', 'quantity', 'reason'
  ];
  
  for (const field of fieldsToCompare) {
    if (localRecord[field] !== undefined && 
        serverRecord[field] !== undefined && 
        localRecord[field] !== serverRecord[field]) {
      return true;
    }
  }
  
  return false;
}

/**
 * Log a sync conflict to the sync_conflicts table
 */
async function logConflict(conflict: Omit<SyncConflict, 'id' | 'notes'> & { notes?: string }): Promise<void> {
  try {
    const { error } = await supabase
      .from('sync_conflicts')
      .insert({
        record_type: conflict.recordType,
        local_record_id: conflict.localRecordId,
        server_record_id: conflict.serverRecordId,
        conflict_type: conflict.conflictType,
        local_created_at: conflict.localCreatedAt.toISOString(),
        server_created_at: conflict.serverCreatedAt?.toISOString() || null,
        local_data: conflict.localData,
        server_data: conflict.serverData,
        resolution: conflict.resolution,
        resolved_at: conflict.resolvedAt?.toISOString() || null,
        resolved_by: conflict.resolvedBy,
        notes: conflict.notes || '',
      });
    
    if (error) {
      console.error('Error logging conflict:', error);
    }
  } catch (error) {
    console.error('Error in logConflict:', error);
  }
}

/**
 * Get unresolved conflicts for admin review
 */
export async function getUnresolvedConflicts(): Promise<SyncConflict[]> {
  try {
    const { data: conflicts, error } = await supabase
      .from('sync_conflicts')
      .select('*')
      .is('resolution', null)
      .order('local_created_at', { ascending: false });
    
    if (error || !conflicts) {
      return [];
    }
    
    return conflicts.map(conflict => ({
      id: conflict.id,
      recordType: conflict.record_type,
      localRecordId: conflict.local_record_id,
      serverRecordId: conflict.server_record_id,
      conflictType: conflict.conflict_type,
      localCreatedAt: new Date(conflict.local_created_at),
      serverCreatedAt: conflict.server_created_at ? new Date(conflict.server_created_at) : null,
      localData: conflict.local_data,
      serverData: conflict.server_data,
      resolution: conflict.resolution,
      resolvedAt: conflict.resolved_at ? new Date(conflict.resolved_at) : null,
      resolvedBy: conflict.resolved_by,
      notes: conflict.notes,
    }));
  } catch (error) {
    console.error('Error getting unresolved conflicts:', error);
    return [];
  }
}

/**
 * Manually resolve a conflict
 */
export async function resolveConflict(
  conflictId: string,
  resolution: 'local_wins' | 'server_wins',
  resolvedBy: string,
  notes?: string
): Promise<boolean> {
  try {
    const { data: conflict } = await supabase
      .from('sync_conflicts')
      .select('*')
      .eq('id', conflictId)
      .single();
    
    if (!conflict) {
      return false;
    }
    
    // Apply resolution based on choice
    if (resolution === 'local_wins') {
      // Update server with local data
      const tableName = getTableNameFromRecordType(conflict.record_type);
      const { error: updateError } = await supabase
        .from(tableName)
        .update(conflict.local_data)
        .eq('id', conflict.server_record_id);
      
      if (updateError) {
        console.error('Error applying local_wins resolution:', updateError);
        return false;
      }
    }
    // If server_wins, we keep server data as-is
    
    // Mark conflict as resolved
    const { error: updateError } = await supabase
      .from('sync_conflicts')
      .update({
        resolution,
        resolved_at: new Date().toISOString(),
        resolved_by: resolvedBy,
        notes: notes || 'Manually resolved by admin',
      })
      .eq('id', conflictId);
    
    if (updateError) {
      console.error('Error marking conflict as resolved:', updateError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error resolving conflict:', error);
    return false;
  }
}

/**
 * Map record type to database table name
 */
function getTableNameFromRecordType(recordType: string): string {
  const mapping: Record<string, string> = {
    'health_checklist': 'health_checklists',
    'mortality_log': 'mortality_logs',
    'feed_log': 'feed_logs',
    'inventory_consumption': 'inventory_movements',
  };
  
  return mapping[recordType] || recordType + 's';
}
