// FlockIQ - Batch ROI Optimizer Calculator
// Pure TypeScript module for ROI calculations (deterministic, no side effects)
// Requirements: REQ-003 §3.1–3.4, Design Spec §3.6, TASK-011

// Mortality risk model: industry standard for broiler by age
const MORTALITY_RATE_BY_AGE_DAYS: Record<number, number> = {
  35: 0.003, // 0.3% per day at day 35
  42: 0.004,
  49: 0.005,
  56: 0.007,
  60: 0.009, // increases significantly after 56 days
};

// Weight gain per day (kg/day) - standard for Cobb/Ross breeds in UP
// NOTE: This is a fallback value. Actual weight gain should be calculated from weight_logs (TASK-039)
const WEIGHT_GAIN_PER_DAY_FALLBACK = 0.06;

// Feed Conversion Ratio (FCR) after day 35: kg feed per 1 kg weight gain
// NOTE: This is a fallback value. Actual FCR should be retrieved from feed_logs (TASK-032)
const FCR_AFTER_DAY_35_FALLBACK = 2.2;

// Input types
export interface RoiCalculatorInputs {
  flockSize: number;
  ageDays: number;
  avgWeightKg: number;
  feedCostPerKg: number;
  overheadCostPerBirdPerDay: number;
  actualFCR?: number; // Optional: actual FCR from feed_logs (TASK-032)
  actualWeightGainPerDay?: number; // Optional: actual weight gain from weight_logs (TASK-039)
}

// Forecast data
export interface PriceForecast {
  p10: number;
  p50: number;
  p90: number;
}

// Scenario types
export type ScenarioType = 'today' | '+3d' | '+7d' | '+14d';

// Sell vs Hold matrix row
export interface SellHoldRow {
  scenario: ScenarioType;
  projectedPrice: { p10: number; p50: number; p90: number };
  revenue: { pessimistic: number; base: number; optimistic: number };
  feedCost: number;
  mortalityCost: number;
  overheadCost: number;
  netProfit: { pessimistic: number; base: number; optimistic: number };
  roi: number;
  isOptimal: boolean;
}

// Calculator result
export interface RoiCalculatorResult {
  breakEvenPrice: number;
  sellHoldMatrix: SellHoldRow[];
  optimalScenario: ScenarioType;
  profitWaterfall: ProfitWaterfallData[];
}

// Profit waterfall data
export interface ProfitWaterfallData {
  category: string;
  pessimistic: number;
  base: number;
  optimistic: number;
}

// Get mortality rate for a given age (interpolates between known data points)
function getMortalityRate(ageDays: number): number {
  const ages = Object.keys(MORTALITY_RATE_BY_AGE_DAYS).map(Number).sort((a, b) => a - b);
  
  // If age is exactly at a known point, return that rate
  if (MORTALITY_RATE_BY_AGE_DAYS[ageDays] !== undefined) {
    return MORTALITY_RATE_BY_AGE_DAYS[ageDays];
  }
  
  // Find the range and interpolate
  for (let i = 0; i < ages.length - 1; i++) {
    if (ageDays >= ages[i] && ageDays < ages[i + 1]) {
      const lowerAge = ages[i];
      const upperAge = ages[i + 1];
      const lowerRate = MORTALITY_RATE_BY_AGE_DAYS[lowerAge];
      const upperRate = MORTALITY_RATE_BY_AGE_DAYS[upperAge];
      const ratio = (ageDays - lowerAge) / (upperAge - lowerAge);
      return lowerRate + (upperRate - lowerRate) * ratio;
    }
  }
  
  // If age is beyond the highest known point, use the highest rate
  if (ageDays >= ages[ages.length - 1]) {
    return MORTALITY_RATE_BY_AGE_DAYS[ages[ages.length - 1]];
  }
  
  // If age is below the lowest known point, use the lowest rate
  return MORTALITY_RATE_BY_AGE_DAYS[ages[0]];
}

// Calculate revenue for a scenario
function calculateRevenue(
  flockSize: number,
  avgWeightKg: number,
  pricePerKg: number,
  holdDays: number,
  ageAtSale: number,
  actualWeightGainPerDay?: number
): number {
  const weightGainPerDay = actualWeightGainPerDay || WEIGHT_GAIN_PER_DAY_FALLBACK;
  const adjustedWeight = avgWeightKg + (weightGainPerDay * holdDays);
  const mortalityRate = getMortalityRate(ageAtSale);
  const survivingBirds = flockSize * (1 - mortalityRate * holdDays);
  return survivingBirds * adjustedWeight * pricePerKg;
}

// Calculate feed cost for holding period
function calculateFeedCost(
  flockSize: number,
  feedCostPerKg: number,
  holdDays: number,
  actualFCR?: number,
  actualWeightGainPerDay?: number
): number {
  // Use actual FCR if provided, otherwise use fallback
  const fcrToUse = actualFCR || FCR_AFTER_DAY_35_FALLBACK;
  const weightGainPerDay = actualWeightGainPerDay || WEIGHT_GAIN_PER_DAY_FALLBACK;
  const dailyFeedPerBird = weightGainPerDay * fcrToUse;
  return dailyFeedPerBird * feedCostPerKg * flockSize * holdDays;
}

// Calculate mortality cost for holding period
function calculateMortalityCost(
  flockSize: number,
  avgWeightKg: number,
  pricePerKg: number,
  holdDays: number,
  ageAtSale: number
): number {
  const mortalityRate = getMortalityRate(ageAtSale);
  const birdsLost = flockSize * mortalityRate * holdDays;
  const avgBirdValue = avgWeightKg * pricePerKg;
  return birdsLost * avgBirdValue;
}

// Calculate overhead cost for holding period
function calculateOverheadCost(
  flockSize: number,
  overheadCostPerBirdPerDay: number,
  holdDays: number
): number {
  return overheadCostPerBirdPerDay * flockSize * holdDays;
}

// Calculate break-even price
export function calculateBreakEvenPrice(inputs: RoiCalculatorInputs, actualFCR?: number): number {
  const { flockSize, avgWeightKg, feedCostPerKg, overheadCostPerBirdPerDay, ageDays, actualWeightGainPerDay } = inputs;
  
  // Use actual FCR if provided, otherwise use fallback
  const fcrToUse = actualFCR || FCR_AFTER_DAY_35_FALLBACK;
  const weightGainPerDay = actualWeightGainPerDay || WEIGHT_GAIN_PER_DAY_FALLBACK;
  const dailyFeedPerBird = weightGainPerDay * fcrToUse;
  
  // Total feed cost to date (assuming age days of feeding)
  const feedCostToDate = dailyFeedPerBird * feedCostPerKg * flockSize * ageDays;
  const overheadCostToDate = overheadCostPerBirdPerDay * flockSize * ageDays;
  const totalCostToDate = feedCostToDate + overheadCostToDate;
  
  // Break-even price per kg
  return totalCostToDate / (flockSize * avgWeightKg);
}

// Main calculator function
export function calculateSellHoldMatrix(
  inputs: RoiCalculatorInputs,
  forecast: PriceForecast
): RoiCalculatorResult {
  const { flockSize, avgWeightKg, feedCostPerKg, overheadCostPerBirdPerDay, ageDays, actualFCR, actualWeightGainPerDay } = inputs;
  
  // Calculate break-even price with actual FCR if available
  const breakEvenPrice = calculateBreakEvenPrice(inputs, actualFCR);
  
  // Define scenarios
  const scenarios: { scenario: ScenarioType; holdDays: number }[] = [
    { scenario: 'today', holdDays: 0 },
    { scenario: '+3d', holdDays: 3 },
    { scenario: '+7d', holdDays: 7 },
    { scenario: '+14d', holdDays: 14 },
  ];
  
  // Calculate matrix rows
  const sellHoldMatrix: SellHoldRow[] = scenarios.map(({ scenario, holdDays }) => {
    const ageAtSale = ageDays + holdDays;
    
    // Calculate revenues for P10, P50, P90
    const revenuePessimistic = calculateRevenue(flockSize, avgWeightKg, forecast.p10, holdDays, ageAtSale, actualWeightGainPerDay);
    const revenueBase = calculateRevenue(flockSize, avgWeightKg, forecast.p50, holdDays, ageAtSale, actualWeightGainPerDay);
    const revenueOptimistic = calculateRevenue(flockSize, avgWeightKg, forecast.p90, holdDays, ageAtSale, actualWeightGainPerDay);
    
    // Calculate costs
    const feedCost = calculateFeedCost(flockSize, feedCostPerKg, holdDays, actualFCR, actualWeightGainPerDay);
    const mortalityCostPessimistic = calculateMortalityCost(flockSize, avgWeightKg, forecast.p10, holdDays, ageAtSale);
    const mortalityCostBase = calculateMortalityCost(flockSize, avgWeightKg, forecast.p50, holdDays, ageAtSale);
    const mortalityCostOptimistic = calculateMortalityCost(flockSize, avgWeightKg, forecast.p90, holdDays, ageAtSale);
    const overheadCost = calculateOverheadCost(flockSize, overheadCostPerBirdPerDay, holdDays);
    
    // Calculate net profits
    const totalCost = feedCost + mortalityCostBase + overheadCost;
    const netProfitPessimistic = revenuePessimistic - feedCost - mortalityCostPessimistic - overheadCost;
    const netProfitBase = revenueBase - feedCost - mortalityCostBase - overheadCost;
    const netProfitOptimistic = revenueOptimistic - feedCost - mortalityCostOptimistic - overheadCost;
    
    // Calculate ROI
    const roi = totalCost > 0 ? (netProfitBase / totalCost) * 100 : 0;
    
    return {
      scenario,
      projectedPrice: {
        p10: forecast.p10,
        p50: forecast.p50,
        p90: forecast.p90,
      },
      revenue: {
        pessimistic: revenuePessimistic,
        base: revenueBase,
        optimistic: revenueOptimistic,
      },
      feedCost,
      mortalityCost: mortalityCostBase,
      overheadCost,
      netProfit: {
        pessimistic: netProfitPessimistic,
        base: netProfitBase,
        optimistic: netProfitOptimistic,
      },
      roi,
      isOptimal: false, // Will be set after finding max
    };
  });
  
  // Find optimal scenario (highest base net profit)
  const maxNetProfit = Math.max(...sellHoldMatrix.map(row => row.netProfit.base));
  sellHoldMatrix.forEach(row => {
    row.isOptimal = row.netProfit.base === maxNetProfit;
  });
  
  const optimalScenario = sellHoldMatrix.find(row => row.isOptimal)?.scenario || 'today';
  
  // Generate profit waterfall data
  const profitWaterfall: ProfitWaterfallData[] = [
    {
      category: 'Base Revenue (Today)',
      pessimistic: sellHoldMatrix[0].revenue.pessimistic,
      base: sellHoldMatrix[0].revenue.base,
      optimistic: sellHoldMatrix[0].revenue.optimistic,
    },
    {
      category: 'Price Gain/Loss from Waiting',
      pessimistic: sellHoldMatrix.find(row => row.isOptimal)!.revenue.pessimistic - sellHoldMatrix[0].revenue.pessimistic,
      base: sellHoldMatrix.find(row => row.isOptimal)!.revenue.base - sellHoldMatrix[0].revenue.base,
      optimistic: sellHoldMatrix.find(row => row.isOptimal)!.revenue.optimistic - sellHoldMatrix[0].revenue.optimistic,
    },
    {
      category: 'Feed Cost',
      pessimistic: -sellHoldMatrix.find(row => row.isOptimal)!.feedCost,
      base: -sellHoldMatrix.find(row => row.isOptimal)!.feedCost,
      optimistic: -sellHoldMatrix.find(row => row.isOptimal)!.feedCost,
    },
    {
      category: 'Mortality Risk Cost',
      pessimistic: -sellHoldMatrix.find(row => row.isOptimal)!.mortalityCost,
      base: -sellHoldMatrix.find(row => row.isOptimal)!.mortalityCost,
      optimistic: -sellHoldMatrix.find(row => row.isOptimal)!.mortalityCost,
    },
  ];
  
  return {
    breakEvenPrice,
    sellHoldMatrix,
    optimalScenario,
    profitWaterfall,
  };
}

// Check if trader offer is below break-even
export function isBelowBreakEven(traderOffer: number, inputs: RoiCalculatorInputs): boolean {
  const breakEvenPrice = calculateBreakEvenPrice(inputs, inputs.actualFCR);
  return traderOffer < breakEvenPrice;
}
