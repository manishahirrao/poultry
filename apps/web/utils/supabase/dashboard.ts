// Client-side compatible - uses browser client for client components
import { createClient } from '@/utils/supabase/client';

export type MandiSlug = 'gorakhpur' | 'deoria' | 'kushinagar' | 'basti' | 'maharajganj';

export interface PredictionRow {
  id: string;
  mandi: MandiSlug;
  predicted_at: string;
  p10: number;
  p50: number;
  p90: number;
  sell_signal: 'SELL_NOW' | 'HOLD' | 'CAUTION';
  actual_price: number | null;
  confidence: number;
  drivers: string[];
}

export interface AccuracyMetrics {
  directional_accuracy_30d: number;
  mape_30d: number;
  conformal_coverage_30d: number;
  prediction_count_30d: number;
  last_updated: string;
}

export interface AlertRow {
  id: string;
  type: 'HPAI' | 'WEATHER' | 'PRICE_WARNING' | 'POLICY';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  title_hi: string;
  body: string;
  body_hi: string;
  district: string;
  expires_at: string;
  created_at: string;
  external_url: string | null;
}

// --- Predictions ---

export async function getLatestPredictions(
  mandis: MandiSlug[] = ['gorakhpur','deoria','kushinagar','basti','maharajganj']
): Promise<PredictionRow[]> {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data: rawData, error } = await supabase
    .from('predictions')
    .select('*')
    .in('mandi', mandis)
    .order('predicted_at', { ascending: false })
    .limit(mandis.length * 2);

  const data = rawData as PredictionRow[] | null;

  if (error || !data || data.length === 0) {
    return [];
  }

  const latestByMandi = new Map<string, PredictionRow>();
  for (const row of data) {
    if (!latestByMandi.has(row.mandi)) {
      latestByMandi.set(row.mandi, row as PredictionRow);
    }
  }
  return Array.from(latestByMandi.values());
}

export async function getPredictionHistory(
  mandi: MandiSlug,
  days: number = 30
): Promise<PredictionRow[]> {
  const supabase = createClient();

  if (!supabase) {
    return [];
  }

  const from = new Date(Date.now() - days * 86_400_000).toISOString();

  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('mandi', mandi)
    .gte('predicted_at', from)
    .order('predicted_at', { ascending: true });

  if (error || !data) return [];
  return data as PredictionRow[];
}

// --- Accuracy ---

export async function getAccuracyMetrics(): Promise<AccuracyMetrics> {
  const supabase = await createClient();

  if (!supabase) {
    return {
      directional_accuracy_30d: 0,
      mape_30d: 0,
      conformal_coverage_30d: 0,
      prediction_count_30d: 0,
      last_updated: new Date().toISOString(),
    };
  }

  const { data: rawData, error } = await supabase
    .from('mv_accuracy_dashboard')
    .select('*')
    .single();
  const data = rawData as Partial<AccuracyMetrics> | null;

  if (error || !data) {
    return {
      directional_accuracy_30d: 0,
      mape_30d: 0,
      conformal_coverage_30d: 0,
      prediction_count_30d: 0,
      last_updated: new Date().toISOString(),
    };
  }

  return { ...data } as AccuracyMetrics;
}

// --- Alerts ---

export async function getActiveAlerts(district: string): Promise<AlertRow[]> {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .or(`district.eq.${district},district.eq.all`)
    .gt('expires_at', new Date().toISOString())
    .order('severity', { ascending: true })
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data || data.length === 0) {
    return [];
  }
  return data as AlertRow[];
}

// --- Admin: Model Registry ---

export async function getModelRegistry() {
  const supabase = createClient();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from('model_registry')
    .select('*')
    .order('promoted_at', { ascending: false })
    .limit(10);

  return data ?? [];
}

// --- Admin: Customer list (service_role only) ---

export async function getCustomerList(filters: {
  segment?: string;
  status?: string;
  district?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  // NOTE: This function should only be called from admin-gated server components
  // Uses anon key with RLS — admin policy allows SELECT on customers table
  const supabase = createClient();

  if (!supabase) {
    return { customers: [], total: 0, error: null };
  }

  const { page = 1, pageSize = 25 } = filters;
  const from = (page - 1) * pageSize;

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .range(from, from + pageSize - 1);

  if (filters.segment) query = query.eq('segment', filters.segment);
  if (filters.status) query = query.eq('status', filters.status);
  if (filters.district) query = query.eq('district', filters.district);
  if (filters.search) query = query.ilike('phone', `%${filters.search}%`);

  const { data, count, error } = await query;
  return { customers: data ?? [], total: count ?? 0, error };
}



// --- Batch Management (TASK-031) ---

export interface BatchRow {
  id: string;
  batch_id: string;
  customer_id: string;
  farm_id?: string;
  shed_id: string;
  doc_placement_date: string;
  doc_count: number;
  doc_supplier: string;
  breed: string;
  target_harvest_weight_kg: number;
  initial_feed_brand: string | null;
  initial_feed_type: string | null;
  batch_type?: 'broiler' | 'layer' | 'breeder' | 'hatchery';
  status: 'placement' | 'growing' | 'pre_harvest' | 'harvest_ready' | 'harvested';
  current_bird_count: number;
  created_at: string;
  updated_at: string;
  // Computed fields (from joins)
  age_days?: number;
  avg_weight_kg?: number | null;
  fcr?: number | null;
  mortality_pct?: number;
  sell_signal?: 'sell' | 'hold' | 'caution' | 'withdrawal';
  withdrawal_end_date?: string | null;
  net_profit?: number | null;
}

export interface WeightLogRow {
  id: string;
  batch_id: string;
  log_date: string;
  sample_size: number;
  avg_weight_kg: number;
  std_deviation: number;
}

export interface FeedLogRow {
  id: string;
  batch_id: string;
  log_date: string;
  morning_feed_kg: number;
  evening_feed_kg: number;
  water_litres: number | null;
  feed_brand: string;
  feed_refusal_kg: number;
}

export interface MedicationLogRow {
  id: string;
  batch_id: string;
  log_date: string;
  drug_name: string;
  withdrawal_days: number;
  withdrawal_end_date: string;
  is_antibiotic: boolean;
}

export async function getBatches(customerId: string): Promise<BatchRow[]> {
  const supabase = await createClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('customer_id', customerId)
    .order('doc_placement_date', { ascending: false });

  if (error || !data) {
    return [];
  }

  // Compute additional fields for each batch
  const batches = await Promise.all(
    (data as any[]).map(async (batch: any) => {
      const ageDays = Math.floor((Date.now() - new Date(batch.doc_placement_date).getTime()) / (1000 * 60 * 60 * 24));
      
      // Get latest weight log
      const { data: weightLog } = await supabase
        .from('weight_logs')
        .select('avg_weight_kg')
        .eq('batch_id', batch.id)
        .order('log_date', { ascending: false })
        .limit(1)
        .single();

      // Get latest feed log for FCR
      const { data: feedLogs } = await supabase
        .from('feed_logs')
        .select('morning_feed_kg, evening_feed_kg')
        .eq('batch_id', batch.id);
      
      // Calculate FCR (simplified)
      const totalFeed = (feedLogs as any[])?.reduce((sum: number, log: any) => 
        sum + (log.morning_feed_kg || 0) + (log.evening_feed_kg || 0), 0) || 0;
      const weightLogData = weightLog as any;
      const weightGain = weightLogData?.avg_weight_kg ? 
        (weightLogData.avg_weight_kg - 0.042) * batch.current_bird_count : 0;
      const fcr = weightGain > 0 ? totalFeed / weightGain : null;

      // Get mortality percentage
      const mortalityPct = ((batch.doc_count - batch.current_bird_count) / batch.doc_count) * 100;

      // Check for active withdrawal
      const { data: medicationLog } = await supabase
        .from('medication_logs')
        .select('withdrawal_end_date')
        .eq('batch_id', batch.id)
        .gte('withdrawal_end_date', new Date().toISOString())
        .limit(1)
        .single();

      const medicationLogData = medicationLog as any;
      // Get sell signal from price intelligence (simplified - would normally call TASK-003)
      const sellSignal = medicationLogData?.withdrawal_end_date ? 'withdrawal' : 'sell';

      return {
        ...batch,
        age_days: ageDays,
        avg_weight_kg: weightLogData?.avg_weight_kg || null,
        fcr,
        mortality_pct: mortalityPct,
        sell_signal: sellSignal as 'sell' | 'hold' | 'caution' | 'withdrawal',
        withdrawal_end_date: medicationLogData?.withdrawal_end_date || null,
      };
    })
  );

  return batches as BatchRow[];
}

export async function getBatchById(batchId: string): Promise<BatchRow | null> {
  const supabase = createClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('batches')
    .select('*')
    .eq('batch_id', batchId)
    .single();

  if (error || !data) return null;

  const batchData = data as any;
  // Compute additional fields (same logic as getBatches)
  const ageDays = Math.floor((Date.now() - new Date(batchData.doc_placement_date).getTime()) / (1000 * 60 * 60 * 24));
  
  const { data: weightLog } = await supabase
    .from('weight_logs')
    .select('avg_weight_kg')
    .eq('batch_id', batchData.id)
    .order('log_date', { ascending: false })
    .limit(1)
    .single();

  const { data: feedLogs } = await supabase
    .from('feed_logs')
    .select('morning_feed_kg, evening_feed_kg')
    .eq('batch_id', batchData.id);
  
  const totalFeed = (feedLogs as any[])?.reduce((sum: number, log: any) => 
    sum + (log.morning_feed_kg || 0) + (log.evening_feed_kg || 0), 0) || 0;
  const weightLogData = weightLog as any;
  const weightGain = weightLogData?.avg_weight_kg ? 
    (weightLogData.avg_weight_kg - 0.042) * batchData.current_bird_count : 0;
  const fcr = weightGain > 0 ? totalFeed / weightGain : null;

  const mortalityPct = ((batchData.doc_count - batchData.current_bird_count) / batchData.doc_count) * 100;

  const { data: medicationLog } = await supabase
    .from('medication_logs')
    .select('withdrawal_end_date')
    .eq('batch_id', batchData.id)
    .gte('withdrawal_end_date', new Date().toISOString())
    .limit(1)
    .single();

  const medicationLogData = medicationLog as any;
  const sellSignal = medicationLogData?.withdrawal_end_date ? 'withdrawal' : 'sell';

  return {
    ...batchData,
    age_days: ageDays,
    avg_weight_kg: weightLogData?.avg_weight_kg || null,
    fcr,
    mortality_pct: mortalityPct,
    sell_signal: sellSignal as 'sell' | 'hold' | 'caution' | 'withdrawal',
    withdrawal_end_date: medicationLogData?.withdrawal_end_date || null,
  } as BatchRow;
}

