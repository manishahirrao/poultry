// PoultryPulse AI — WatermelonDB Initialization
// File: apps/mobile/src/lib/database.ts
// Version: v1.0 | May 2026
// Design Reference: Architecture v1.0 §4.3, TRD v1.0 §5.3

import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

/**
 * Initialize WatermelonDB with SQLite adapter
 */
export const initializeDatabase = async (): Promise<Database> => {
  const adapter = new SQLiteAdapter({
    schema: {
      version: 1,
      tables: {},
    },
    dbName: 'PoultryPulseDB',
    // Enable WAL mode for better performance
    jsi: true,
  });

  const database = new Database({
    adapter,
    modelClasses: [
      require('../database/schema').CachedPrediction,
      require('../database/schema').CachedAlert,
      require('../database/schema').HealthChecklist,
      require('../database/schema').MortalityLog,
      require('../database/schema').InventoryItem,
      require('../database/schema').InventoryConsumption,
      require('../database/schema').FeedLog,
    ],
  });

  // WAL mode is enabled by jsi: true option
  return database;
};

/**
 * Get singleton database instance
 */
let databaseInstance: Database | null = null;

export const getDatabase = async (): Promise<Database> => {
  if (!databaseInstance) {
    databaseInstance = await initializeDatabase();
  }
  return databaseInstance;
};
