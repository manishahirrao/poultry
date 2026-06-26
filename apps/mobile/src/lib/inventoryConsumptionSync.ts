// PoultryPulse AI — Inventory Consumption Sync
// File: apps/mobile/src/lib/inventoryConsumptionSync.ts
// Version: v1.0 | June 2026
// Design Reference: Architecture v1.0 §4.3
// Task: TASK-050

import { getDatabase } from './database';
import { InventoryConsumption } from '../database/schema';
import { supabase } from './supabase';
import NetInfo from '@react-native-community/netinfo';
import { Q } from '@nozbe/watermelondb';

/**
 * Sync unsynced inventory consumption records to Supabase
 * This function should be called when network is available
 */
export const syncInventoryConsumption = async (): Promise<void> => {
  try {
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      console.log('No network connection, skipping inventory consumption sync');
      return;
    }

    const database = await getDatabase();
    const consumptionCollection = database.get<InventoryConsumption>('inventory_consumptions');
    
    // Fetch all unsynced consumption records
    const unsyncedRecords = await consumptionCollection
      .query(Q.where('synced', false))
      .fetch();

    if (unsyncedRecords.length === 0) {
      console.log('No unsynced inventory consumption records');
      return;
    }

    console.log(`Syncing ${unsyncedRecords.length} inventory consumption records`);

    // Sync each record
    for (const record of unsyncedRecords) {
      try {
        const apiData = record.toApiFormat();
        
        // Insert into Supabase inventory_movements table
        const { error } = await supabase
          .from('inventory_movements')
          .insert({
            inventory_item_id: apiData.inventory_item_id,
            batch_id: apiData.batch_id,
            movement_type: apiData.movement_type,
            quantity: apiData.quantity,
            unit_cost: apiData.unit_cost,
            total_cost: apiData.total_cost,
            reason: apiData.reason,
            performed_by: (await supabase.auth.getUser()).data.user?.id,
          });

        if (error) {
          console.error('Error syncing inventory consumption record:', error);
          continue;
        }

        // Mark as synced in local database
        await database.write(async () => {
          await record.update((rec: any) => {
            rec.synced = true;
            rec.syncedAt = new Date();
          });
        });

        console.log(`Synced inventory consumption record: ${record.id}`);
      } catch (error) {
        console.error('Error syncing individual inventory consumption record:', error);
      }
    }

    console.log('Inventory consumption sync completed');
  } catch (error) {
    console.error('Error in inventory consumption sync:', error);
  }
};

/**
 * Fetch inventory items from Supabase and cache locally
 * This should be called periodically to keep local cache updated
 */
export const syncInventoryItems = async (): Promise<void> => {
  try {
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      console.log('No network connection, skipping inventory items sync');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user, skipping inventory items sync');
      return;
    }

    // Fetch inventory items from Supabase
    const { data: inventoryItems, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('customer_id', user.id)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching inventory items:', error);
      return;
    }

    if (!inventoryItems || inventoryItems.length === 0) {
      console.log('No inventory items to sync');
      return;
    }

    const database = await getDatabase();
    const inventoryCollection = database.get('inventory_items');

    // Update local cache
    await database.write(async () => {
      for (const item of inventoryItems) {
        const existingRecords = await inventoryCollection
          .query(Q.where('id', item.id))
          .fetch();

        if (existingRecords.length > 0) {
          // Update existing record
          await existingRecords[0].update((record: any) => {
            record.name = item.name;
            record.category = item.category;
            record.sku = item.sku;
            record.description = item.description;
            record.unit = item.unit;
            record.minStockAlertLevel = item.min_stock_alert_level;
            record.currentStock = item.current_stock;
            record.avgCostPerUnit = item.avg_cost_per_unit;
            record.qrCode = item.qr_code;
            record.isActive = item.is_active;
            record.updatedAt = new Date(item.updated_at);
            record.cachedAt = new Date();
          });
        } else {
          // Create new record
          await inventoryCollection.create((record: any) => {
            record.id = item.id;
            record.name = item.name;
            record.category = item.category;
            record.sku = item.sku;
            record.description = item.description;
            record.unit = item.unit;
            record.minStockAlertLevel = item.min_stock_alert_level;
            record.currentStock = item.current_stock;
            record.avgCostPerUnit = item.avg_cost_per_unit;
            record.qrCode = item.qr_code;
            record.isActive = item.is_active;
            record.createdAt = new Date(item.created_at);
            record.updatedAt = new Date(item.updated_at);
            record.cachedAt = new Date();
          });
        }
      }
    });

    console.log(`Synced ${inventoryItems.length} inventory items`);
  } catch (error) {
    console.error('Error in inventory items sync:', error);
  }
};

/**
 * Get count of unsynced inventory consumption records
 */
export const getUnsyncedInventoryConsumptionCount = async (): Promise<number> => {
  try {
    const database = await getDatabase();
    const consumptionCollection = database.get<InventoryConsumption>('inventory_consumptions');
    
    const unsyncedRecords = await consumptionCollection
      .query(Q.where('synced', false))
      .fetch();

    return unsyncedRecords.length;
  } catch (error) {
    console.error('Error getting unsynced inventory consumption count:', error);
    return 0;
  }
};
