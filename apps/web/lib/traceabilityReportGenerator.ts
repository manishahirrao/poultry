import { createClient } from '@supabase/supabase-js';
import QRCode from 'qrcode';

// @ts-ignore - process is available in Node.js environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// @ts-ignore - process is available in Node.js environment
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseKey;

export interface TraceabilityReportData {
  batchId: string;
  batchIdDisplay: string;
  farmDistrict: string;
  breed: string;
  harvestDate: string;
  docSupplier: string;
  docPlacementDate: string;
  docCount: number;
  totalFeedConsumed: number;
  feedBrands: string[];
  fcrAchieved: number;
  vaccinations: Array<{
    vaccineName: string;
    administeredDate: string;
    brand: string;
    status: string;
  }>;
  medications: Array<{
    drugName: string;
    logDate: string;
    isAntibiotic: boolean;
  }>;
  hasAntibiotics: boolean;
  mortalitySummary: {
    totalDeaths: number;
    cumulativeRate: number;
  };
  harvest: {
    birdsSold: number;
    averageWeight: number;
    totalWeight: number;
    buyerName: string;
    salePrice: number;
  };
  fssaiStatus: string;
  generatedDate: string;
  qrCodeUrl: string;
}

export async function generateTraceabilityReport(batchId: string): Promise<TraceabilityReportData> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase not configured. Cannot generate traceability report.');
  }

  const supabase = createClient(supabaseUrl!, supabaseKey!);

  // Fetch batch data
  const { data: batch, error: batchError } = await supabase
    .from('batches')
    .select('*')
    .eq('id', batchId)
    .single();

  if (batchError || !batch) {
    throw new Error('Batch not found');
  }

  // Fetch feed logs
  const { data: feedLogs } = await supabase
    .from('feed_logs')
    .select('total_feed_kg, feed_brand')
    .eq('batch_id', batchId);

  // Fetch vaccination schedules
  const { data: vaccinations } = await supabase
    .from('vaccination_schedules')
    .select('*')
    .eq('batch_id', batchId)
    .order('scheduled_day', { ascending: true });

  // Fetch medication logs
  const { data: medications } = await supabase
    .from('medication_logs')
    .select('*')
    .eq('batch_id', batchId)
    .order('log_date', { ascending: false });

  // Fetch mortality logs
  const { data: mortalityLogs } = await supabase
    .from('mortality_logs')
    .select('count')
    .eq('batch_id', batchId);

  // Calculate total feed consumed
  const totalFeedConsumed = feedLogs?.reduce((sum, log) => sum + (log.total_feed_kg || 0), 0) || 0;

  // Get unique feed brands
  const feedBrands = [...new Set(feedLogs?.map(log => log.feed_brand).filter(Boolean) || [])];

  // Calculate total deaths
  const totalDeaths = mortalityLogs?.reduce((sum, log) => sum + (log.count || 0), 0) || 0;
  const cumulativeRate = batch.doc_count > 0 ? (totalDeaths / batch.doc_count) * 100 : 0;

  // Check for antibiotics
  const hasAntibiotics = medications?.some(med => med.is_antibiotic) || false;

  // Generate QR code URL
  const qrCodeUrl = `https://poulse.ai/trace/${batch.batch_id}`;
  const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);

  // Determine FSSAI status
  const fssaiStatus = hasAntibiotics ? 'Non-Compliant (Antibiotic Used)' : 'Compliant';

  const reportData: TraceabilityReportData = {
    batchId: batch.id,
    batchIdDisplay: batch.batch_id,
    farmDistrict: (batch as any).district || 'Unknown',
    breed: batch.breed,
    harvestDate: batch.actual_harvest_date ? new Date(batch.actual_harvest_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }) : 'Not harvested',
    docSupplier: batch.doc_supplier || 'Unknown',
    docPlacementDate: new Date(batch.doc_placement_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }),
    docCount: batch.doc_count,
    totalFeedConsumed,
    feedBrands,
    fcrAchieved: batch.current_fcr || 0,
    vaccinations: vaccinations?.map(vac => ({
      vaccineName: vac.vaccine_name,
      administeredDate: vac.administered_date ? new Date(vac.administered_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }) : 'Not administered',
      brand: vac.brand || 'Unknown',
      status: vac.status
    })) || [],
    medications: medications?.map(med => ({
      drugName: med.drug_name,
      logDate: new Date(med.log_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      isAntibiotic: med.is_antibiotic || false
    })) || [],
    hasAntibiotics,
    mortalitySummary: {
      totalDeaths,
      cumulativeRate
    },
    harvest: {
      birdsSold: batch.birds_sold || 0,
      averageWeight: batch.actual_harvest_weight_kg || 0,
      totalWeight: (batch.birds_sold || 0) * (batch.actual_harvest_weight_kg || 0),
      buyerName: batch.buyer_name || 'Unknown',
      salePrice: batch.sale_price_per_kg || 0
    },
    fssaiStatus,
    generatedDate: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }),
    qrCodeUrl: qrCodeDataUrl
  };

  return reportData;
}

export function getABFreeBadge(hasAntibiotics: boolean): { text: string; color: string; icon: string } {
  if (hasAntibiotics) {
    return {
      text: 'AB Used',
      color: '#DC2626', // red-600
      icon: '🚫'
    };
  }
  return {
    text: 'AB-Free Eligible',
    color: '#16A34A', // green-600
    icon: '✅'
  };
}
