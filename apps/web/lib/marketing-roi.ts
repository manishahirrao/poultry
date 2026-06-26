// FlockIQ — Marketing ROI Calculator
// Simple client-side ROI calculator for home page
// Task Reference: TASK-WEB-009
// Requirements: REQ-WEB-001 §W1.11, Design Spec §3.6

export interface MarketingRoiInputs {
  flockSize: number; // e.g., 25000
  avgWeightKg: number; // e.g., 2.0
  batchesPerYear: number; // e.g., 2
}

export interface MarketingRoiResult {
  annualRevenueGain: number;
  subscriptionCost: number;
  netRoi: number;
  roiMultiple: number;
  breakdown: {
    improvementPerBird: number;
    annualGainBeforeSubscription: number;
  };
}

// Get subscription cost based on flock size (PulsePro pricing)
function getSubscriptionCost(flockSize: number): number {
  if (flockSize < 25000) return 2000; // 10K–25K: ₹2,000/month
  if (flockSize < 50000) return 3500; // 25K–50K: ₹3,500/month
  return 5000; // 50K–1L: ₹5,000/month
}

// Calculate marketing ROI
export function calculateMarketingRoi(inputs: MarketingRoiInputs): MarketingRoiResult {
  const { flockSize, avgWeightKg, batchesPerYear } = inputs;
  
  // Conservative estimate: ₹1.50/bird improvement from better sell timing
  const improvementPerBird = 1.50;
  
  // Annual revenue gain from better sell timing
  const annualGainBeforeSubscription = flockSize * avgWeightKg * improvementPerBird * batchesPerYear;
  
  // Annual subscription cost
  const monthlySubscriptionCost = getSubscriptionCost(flockSize);
  const subscriptionCost = monthlySubscriptionCost * 12;
  
  // Net ROI
  const netRoi = annualGainBeforeSubscription - subscriptionCost;
  
  // ROI multiple
  const roiMultiple = subscriptionCost > 0 ? annualGainBeforeSubscription / subscriptionCost : 0;
  
  return {
    annualRevenueGain: annualGainBeforeSubscription,
    subscriptionCost,
    netRoi,
    roiMultiple,
    breakdown: {
      improvementPerBird,
      annualGainBeforeSubscription,
    },
  };
}

// Available flock size options for dropdown
export const FLOCK_SIZE_OPTIONS = [
  { value: 10000, label: '10,000' },
  { value: 15000, label: '15,000' },
  { value: 20000, label: '20,000' },
  { value: 25000, label: '25,000' },
  { value: 30000, label: '30,000' },
  { value: 40000, label: '40,000' },
  { value: 50000, label: '50,000' },
  { value: 75000, label: '75,000' },
  { value: 100000, label: '1,00,000' },
];

// Available average weight options for dropdown
export const AVG_WEIGHT_OPTIONS = [
  { value: 1.8, label: '1.8 kg' },
  { value: 2.0, label: '2.0 kg' },
  { value: 2.2, label: '2.2 kg' },
  { value: 2.4, label: '2.4 kg' },
  { value: 2.6, label: '2.6 kg' },
];

// Available sell frequency options for dropdown
export const SELL_FREQUENCY_OPTIONS = [
  { value: 2, label: '2 बार/महीना (2 times/month)' },
  { value: 3, label: '3 बार/महीना (3 times/month)' },
  { value: 4, label: '4 बार/महीना (4 times/month)' },
];
