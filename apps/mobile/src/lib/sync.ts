// PoultryPulse AI — Offline Sync Service
// File: apps/mobile/src/lib/sync.ts
// Reference: Architecture v1.0 §4.3, TRD v1.0 §5.3
// Manages caching of ML predictions and alerts for offline use.

import { getDatabase } from './database';
import { supabase } from './supabase';
import type { PredictionResult, Alert } from '@poultrypulse/types';
import { Q } from '@nozbe/watermelondb';

/**
 * Cache a new prediction result locally for offline access.
 * Automatically purges predictions older than 7 days per TRD.
 */
export async function cachePrediction(mandi: string, prediction: PredictionResult): Promise<void> {
  const db = await getDatabase();
  
  await db.write(async () => {
    // 1. Check if we already have a recent prediction for this mandi today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existing = await db.get('cached_predictions')
      .query(
        Q.where('mandi', mandi),
        Q.where('predicted_at', Q.gte(today.getTime()))
      ).fetch();
      
    // 2. If existing, update it. Else create new.
    if (existing.length > 0) {
      await existing[0].update((record: any) => {
        record.p10 = prediction.p10;
        record.p50 = prediction.p50;
        record.p90 = prediction.p90;
        record.confidence = prediction.confidence;
        record.modelVersion = prediction.model_version;
        record.stalenessFlag = prediction.staleness_flag;
        record.driversJson = JSON.stringify(prediction.drivers);
        record.predictedAt = new Date(prediction.predicted_at);
        record.cachedAt = new Date();
      });
    } else {
      await db.get('cached_predictions').create((record: any) => {
        record.mandi = mandi;
        record.p10 = prediction.p10;
        record.p50 = prediction.p50;
        record.p90 = prediction.p90;
        record.confidence = prediction.confidence;
        record.modelVersion = prediction.model_version;
        record.stalenessFlag = prediction.staleness_flag;
        record.driversJson = JSON.stringify(prediction.drivers);
        record.predictedAt = new Date(prediction.predicted_at);
        record.cachedAt = new Date();
      });
    }
    
    // 3. Purge old records (> 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const staleRecords = await db.get('cached_predictions')
      .query(Q.where('cached_at', Q.lt(sevenDaysAgo.getTime())))
      .fetch();
      
    if (staleRecords.length > 0) {
      const recordsToDestroy = staleRecords.map(r => r.prepareDestroyPermanently());
      await db.batch(...recordsToDestroy);
    }
  });
}

/**
 * Get the latest cached prediction for a specific mandi.
 */
export async function getCachedPrediction(mandi: string): Promise<PredictionResult | null> {
  const db = await getDatabase();
  
  const records = await db.get('cached_predictions')
    .query(
      Q.where('mandi', mandi),
      Q.sortBy('predicted_at', Q.desc),
      Q.take(1)
    ).fetch();
    
  if (records.length === 0) return null;
  
  // Need to cast because of WatermelonDB types
  const record = records[0] as any;
  
  // If prediction is older than 24h, we flag it as stale
  // Even if it was true before, it is definitely stale now
  const now = new Date();
  const predictedAt = new Date(record.predictedAt);
  const hoursSince = (now.getTime() - predictedAt.getTime()) / (1000 * 60 * 60);
  
  const result = record.toPredictionResult();
  
  if (hoursSince > 24) {
    result.staleness_flag = true;
  }
  
  return result;
}

/**
 * Sync alerts from server and cache them locally.
 */
export async function syncAlerts(district: string): Promise<void> {
  try {
    // 1. Fetch from Supabase
    const { data: serverAlerts, error } = await supabase
      .from('disease_alerts')
      .select('*')
      .eq('district', district)
      .gt('expires_at', new Date().toISOString());
      
    if (error || !serverAlerts) return;
    
    // 2. Sync to local database
    const db = await getDatabase();
    
    await db.write(async () => {
      const alertCollection = db.get('cached_alerts');
      
      // Clear existing alerts for this district
      const existingAlerts = await alertCollection
        .query(Q.where('district', district))
        .fetch();
        
      const destroyOperations = existingAlerts.map(a => a.prepareDestroyPermanently());
      
      // Create new ones
      const createOperations = serverAlerts.map(alert => 
        alertCollection.prepareCreate((record: any) => {
          record.id = alert.id;
          record.predictionId = alert.prediction_id;
          record.type = alert.type;
          record.severity = alert.severity;
          record.titleHi = alert.title_hi;
          record.bodyHi = alert.body_hi;
          record.district = alert.district;
          record.issuedAt = new Date(alert.issued_at);
          record.expiresAt = new Date(alert.expires_at);
          record.cachedAt = new Date();
        })
      );
      
      await db.batch(...destroyOperations, ...createOperations);
    });
    
  } catch (err) {
    console.error("Failed to sync alerts:", err);
  }
}
