// PoultryPulse AI — WatermelonDB Schema
// File: apps/mobile/src/database/schema.ts
// Version: v1.0 | May 2026
// Design Reference: Architecture v1.0 §4.3, TRD v1.0 §5.3
// TASK-036: Added HealthChecklist model for offline support

import { Model, Q } from '@nozbe/watermelondb';
import { field, date, children, text } from '@nozbe/watermelondb/decorators';

/**
 * Cached Prediction Model
 * Stores ML predictions locally for offline access
 */
export class CachedPrediction extends Model {
  static table = 'cached_predictions';

  static associations = {
    alerts: { type: 'has_many' as const, foreignKey: 'prediction_id' },
  };

  @field('mandi') mandi!: string;
  @field('p10') p10!: number;
  @field('p50') p50!: number;
  @field('p90') p90!: number;
  @field('confidence') confidence!: number;
  @field('model_version') modelVersion!: string;
  @field('staleness_flag') stalenessFlag!: boolean;
  @field('drivers_json') driversJson!: string; // JSON string of PriceDriver[]
  @date('predicted_at') predictedAt!: Date;
  @date('cached_at') cachedAt!: Date;

  // Computed property to get drivers as array
  get drivers(): any[] {
    return JSON.parse(this.driversJson);
  }

  // Convert to PredictionResult type
  toPredictionResult(): any {
    return {
      p10: this.p10,
      p50: this.p50,
      p90: this.p90,
      drivers: this.drivers,
      confidence: this.confidence,
      model_version: this.modelVersion,
      staleness_flag: this.stalenessFlag,
      predicted_at: this.predictedAt.toISOString(),
    };
  }
}

/**
 * Cached Alert Model
 * Stores alerts locally for offline access
 */
export class CachedAlert extends Model {
  static table = 'cached_alerts';

  @field('prediction_id') predictionId!: string;
  @field('type') type!: string;
  @field('severity') severity!: string;
  @field('title_hi') titleHi!: string;
  @field('body_hi') bodyHi!: string;
  @field('district') district!: string;
  @date('issued_at') issuedAt!: Date;
  @date('expires_at') expiresAt!: Date;
  @date('cached_at') cachedAt!: Date;

  // Convert to Alert type
  toAlert(): any {
    return {
      id: this.id,
      type: this.type as any,
      severity: this.severity as any,
      title_hi: this.titleHi,
      body_hi: this.bodyHi,
      district: this.district as any,
      issued_at: this.issuedAt.toISOString(),
      expires_at: this.expiresAt.toISOString(),
    };
  }
}

/**
 * Health Checklist Model - TASK-036
 * Stores health checklists locally for offline submission
 */
export class HealthChecklist extends Model {
  static table = 'health_checklists';

  @field('batch_id') batchId!: string;
  @field('log_date') logDate!: string;
  @field('bird_behaviour') birdBehaviour!: string;
  @field('appetite') appetite!: string;
  @field('droppings') droppings!: string;
  @field('respiratory') respiratory!: string;
  @field('water_consumption') waterConsumption!: string;
  @text('notes') notes!: string;
  @field('synced') synced!: boolean;
  @date('created_at') createdAt!: Date;
  @date('synced_at') syncedAt!: Date;

  // Convert to API format
  toApiFormat() {
    return {
      batch_id: this.batchId,
      log_date: this.logDate,
      bird_behaviour: this.birdBehaviour,
      appetite: this.appetite,
      droppings: this.droppings,
      respiratory: this.respiratory,
      water_consumption: this.waterConsumption,
      notes: this.notes || null,
    };
  }
}

/**
 * Mortality Log Model - TASK-038
 * Stores mortality logs locally for offline submission
 */
export class MortalityLog extends Model {
  static table = 'mortality_logs';

  @field('batch_id') batchId!: string;
  @field('log_date') logDate!: string;
  @field('count') count!: number;
  @field('cause') cause!: string;
  @field('age_at_death_days') ageAtDeathDays!: number;
  @text('photo_url') photoUrl!: string;
  @text('notes') notes!: string;
  @field('synced') synced!: boolean;
  @date('created_at') createdAt!: Date;
  @date('synced_at') syncedAt!: Date;

  // Convert to API format
  toApiFormat() {
    return {
      batch_id: this.batchId,
      log_date: this.logDate,
      count: this.count,
      cause: this.cause,
      age_at_death_days: this.ageAtDeathDays,
      photo_url: this.photoUrl || null,
      notes: this.notes || null,
    };
  }
}

/**
 * Inventory Item Model - TASK-050
 * Stores inventory items locally for offline QR scan resolution
 */
export class InventoryItem extends Model {
  static table = 'inventory_items';

  @text('name') name!: string;
  @field('category') category!: string; // 'feed', 'medicine', 'vaccine', 'consumable'
  @text('sku') sku!: string;
  @text('description') description!: string;
  @field('unit') unit!: string;
  @field('min_stock_alert_level') minStockAlertLevel!: number;
  @field('current_stock') currentStock!: number;
  @field('avg_cost_per_unit') avgCostPerUnit!: number;
  @text('qr_code') qrCode!: string;
  @field('is_active') isActive!: boolean;
  @date('created_at') createdAt!: Date;
  @date('updated_at') updatedAt!: Date;
  @date('cached_at') cachedAt!: Date;
}

/**
 * Inventory Consumption Model - TASK-050
 * Stores inventory consumption entries locally for offline submission
 */
export class InventoryConsumption extends Model {
  static table = 'inventory_consumptions';

  @text('inventory_item_id') inventoryItemId!: string;
  @text('batch_id') batchId!: string;
  @field('quantity') quantity!: number;
  @text('unit') unit!: string;
  @text('reason') reason!: string;
  @text('shed_id') shedId!: string;
  @field('synced') synced!: boolean;
  @date('created_at') createdAt!: Date;
  @date('synced_at') syncedAt!: Date;

  // Convert to API format
  toApiFormat() {
    return {
      inventory_item_id: this.inventoryItemId,
      batch_id: this.batchId,
      movement_type: 'consumption',
      quantity: this.quantity,
      unit_cost: null,
      total_cost: null,
      reason: this.reason,
      performed_by: null, // Will be set by sync function
    };
  }
}

/**
 * Feed Log Model - TASK-032, TASK-055
 * Stores daily feed logs locally for offline submission
 */
export class FeedLog extends Model {
  static table = 'feed_logs';

  @text('batch_id') batchId!: string;
  @field('log_date') logDate!: string;
  @field('morning_feed_kg') morningFeedKg!: number;
  @field('evening_feed_kg') eveningFeedKg!: number;
  @field('water_litres') waterLitres!: number;
  @text('feed_brand') feedBrand!: string;
  @field('feed_refusal_kg') feedRefusalKg!: number;
  @text('notes') notes!: string;
  @field('synced') synced!: boolean;
  @date('created_at') createdAt!: Date;
  @date('synced_at') syncedAt!: Date;

  // Convert to API format
  toApiFormat() {
    return {
      batch_id: this.batchId,
      log_date: this.logDate,
      morning_feed_kg: this.morningFeedKg,
      evening_feed_kg: this.eveningFeedKg,
      water_litres: this.waterLitres,
      feed_brand: this.feedBrand,
      feed_refusal_kg: this.feedRefusalKg,
      notes: this.notes || null,
    };
  }
}
