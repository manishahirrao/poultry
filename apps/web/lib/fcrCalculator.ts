/**
 * FlockIQ - FCR Calculator
 * Pure TypeScript module for FCR calculations (deterministic, no side effects)
 * Requirements: REQ-014 §14.2, §14.10, TASK-032
 * 
 * This module provides comprehensive FCR (Feed Conversion Ratio) calculation functions
 * for poultry flock management. It includes breed-specific FCR benchmarks, feed allocation
 * recommendations, and forecasting capabilities.
 * 
 * Features:
 * - FCR calculation from feed logs and weight logs
 * - Breed-specific FCR benchmarks with interpolation
 * - Feed allocation recommendations based on target weight gain
 * - FCR forecasting using linear regression
 * - Feed-water ratio deviation detection
 * - DOC weight lookup by breed
 * - Portfolio-level FCR calculation (weighted average across batches)
 */

/**
 * FCR calculation result
 * Contains FCR value, totals, and status indicators
 */
export interface FcrCalculationResult {
  fcr: number; // Feed Conversion Ratio (kg feed / kg weight gain)
  totalFeedKg: number; // Total feed consumed
  totalWeightGainKg: number; // Total weight gained
  colorStatus: 'green' | 'amber' | 'red'; // Visual status indicator
  deviationFromStandard: number; // Deviation from breed standard FCR
}

/**
 * Feed log entry structure
 * Records daily feed consumption data
 */
export interface FeedLogEntry {
  date: string; // ISO date string
  morningFeedKg: number; // Morning feed quantity in kg
  eveningFeedKg: number; // Evening feed quantity in kg
  waterLitres: number; // Water consumption in litres
  feedBrand: string; // Feed brand name
  feedRefusalKg: number; // Feed refusal quantity in kg
}

/**
 * Weight log entry structure
 * Records periodic weight measurements
 */
export interface WeightLogEntry {
  date: string; // ISO date string
  avgWeightKg: number; // Average weight per bird in kg
  sampleSize: number; // Number of birds in the sample
}

/**
 * Calculate FCR from total feed consumed and total weight gained
 * Formula: FCR = total_feed_kg / total_weight_gain_kg
 * 
 * @param totalFeedKg - Total feed consumed in kg
 * @param totalWeightGainKg - Total weight gained in kg
 * @returns FCR value (returns 0 if weight gain is <= 0 to avoid division by zero)
 */
export function calculateFCR(totalFeedKg: number, totalWeightGainKg: number): number {
  if (totalWeightGainKg <= 0) {
    return 0; // Avoid division by zero
  }
  return totalFeedKg / totalWeightGainKg;
}

/**
 * Calculate total weight gain from weight logs and DOC weight
 * Formula: (current_avg_weight - doc_weight) × current_bird_count
 * 
 * @param currentAvgWeightKg - Current average weight per bird in kg
 * @param docWeightKg - DOC (Day-Old Chick) weight in kg
 * @param currentBirdCount - Current number of birds
 * @returns Total weight gained in kg
 */
export function calculateTotalWeightGain(
  currentAvgWeightKg: number,
  docWeightKg: number,
  currentBirdCount: number
): number {
  const weightGainPerBird = currentAvgWeightKg - docWeightKg;
  return weightGainPerBird * currentBirdCount;
}

/**
 * Calculate FCR with breed standard comparison
 * Returns FCR value with color-coded status based on breed standard
 * 
 * Color status logic:
 * - Green: FCR < breed standard (excellent)
 * - Amber: breed standard <= FCR <= breed standard + 0.3 (acceptable)
 * - Red: FCR > breed standard + 0.3 (needs improvement)
 * 
 * @param totalFeedKg - Total feed consumed in kg
 * @param currentAvgWeightKg - Current average weight per bird in kg
 * @param docWeightKg - DOC weight in kg
 * @param currentBirdCount - Current number of birds
 * @param breedStandardFCR - Breed standard FCR for current age
 * @returns FCR calculation result with status indicators
 */
export function calculateFCRWithStandard(
  totalFeedKg: number,
  currentAvgWeightKg: number,
  docWeightKg: number,
  currentBirdCount: number,
  breedStandardFCR: number
): FcrCalculationResult {
  const totalWeightGainKg = calculateTotalWeightGain(currentAvgWeightKg, docWeightKg, currentBirdCount);
  const fcr = calculateFCR(totalFeedKg, totalWeightGainKg);
  
  // Determine color status based on breed standard (Cobb 500 day 35 standard: < 1.7 green, 1.7-2.0 amber, > 2.0 red)
  let colorStatus: 'green' | 'amber' | 'red';
  if (fcr < breedStandardFCR) {
    colorStatus = 'green';
  } else if (fcr <= breedStandardFCR + 0.3) {
    colorStatus = 'amber';
  } else {
    colorStatus = 'red';
  }
  
  const deviationFromStandard = fcr - breedStandardFCR;
  
  return {
    fcr,
    totalFeedKg,
    totalWeightGainKg,
    colorStatus,
    deviationFromStandard,
  };
}

// Calculate FCR from feed logs and weight logs
export function calculateFCRFromLogs(
  feedLogs: FeedLogEntry[],
  weightLogs: WeightLogEntry[],
  docWeightKg: number,
  currentBirdCount: number,
  breedStandardFCR: number
): FcrCalculationResult | null {
  if (feedLogs.length === 0 || weightLogs.length === 0) {
    return null;
  }
  
  // Calculate total feed consumed
  const totalFeedKg = feedLogs.reduce((sum, log) => {
    return sum + log.morningFeedKg + log.eveningFeedKg - log.feedRefusalKg;
  }, 0);
  
  // Get latest weight
  const latestWeightLog = weightLogs[weightLogs.length - 1];
  const currentAvgWeightKg = latestWeightLog.avgWeightKg;
  
  return calculateFCRWithStandard(
    totalFeedKg,
    currentAvgWeightKg,
    docWeightKg,
    currentBirdCount,
    breedStandardFCR
  );
}

// Check feed-water ratio for deviation alert
export function checkFeedWaterRatio(
  waterLitres: number,
  totalFeedKg: number
): { isDeviated: boolean; ratio: number; alertType: 'low' | 'high' | 'normal' } {
  if (totalFeedKg <= 0) {
    return { isDeviated: false, ratio: 0, alertType: 'normal' };
  }
  
  const ratio = waterLitres / totalFeedKg;
  
  // Standard ratio for broilers: 1.8 to 3.5
  if (ratio < 1.8) {
    return { isDeviated: true, ratio, alertType: 'low' };
  } else if (ratio > 3.5) {
    return { isDeviated: true, ratio, alertType: 'high' };
  }
  
  return { isDeviated: false, ratio, alertType: 'normal' };
}

/**
 * Get breed standard FCR for a specific age and breed
 * Uses interpolation between known data points for ages not in the lookup table
 * 
 * Supported breeds: Cobb 500, Ross 308, Vencobb, Hubbard
 * Default fallback: Cobb 500 standards
 * 
 * @param breed - Poultry breed name
 * @param ageDays - Current age in days
 * @returns Breed standard FCR for the given age and breed
 */
export function getBreedStandardFCR(breed: string, ageDays: number): number {
  // Default to Cobb 500 standards if breed not specified
  const standards: Record<string, Record<number, number>> = {
    'Cobb 500': {
      28: 1.65,
      35: 1.75,
      42: 1.85,
    },
    'Ross 308': {
      28: 1.60,
      35: 1.70,
      42: 1.80,
    },
    'Vencobb': {
      28: 1.70,
      35: 1.80,
      40: 1.90,
    },
    'Hubbard': {
      28: 1.68,
      35: 1.78,
      41: 1.88,
    },
  };
  
  const breedStandards = standards[breed] || standards['Cobb 500'];
  
  // Find the closest age standard
  const ages = Object.keys(breedStandards).map(Number).sort((a, b) => a - b);
  
  if (ages.length === 0) return 1.75; // Default fallback
  
  // If exact match, return it
  if (breedStandards[ageDays]) {
    return breedStandards[ageDays];
  }
  
  // Interpolate between nearest ages
  for (let i = 0; i < ages.length - 1; i++) {
    if (ageDays >= ages[i] && ageDays < ages[i + 1]) {
      const lowerAge = ages[i];
      const upperAge = ages[i + 1];
      const lowerFCR = breedStandards[lowerAge];
      const upperFCR = breedStandards[upperAge];
      const ratio = (ageDays - lowerAge) / (upperAge - lowerAge);
      return lowerFCR + (upperFCR - lowerFCR) * ratio;
    }
  }
  
  // If beyond highest age, use highest
  if (ageDays >= ages[ages.length - 1]) {
    return breedStandards[ages[ages.length - 1]];
  }
  
  // If below lowest age, use lowest
  return breedStandards[ages[0]];
}

// Get DOC weight for breed
export function getDocWeightKg(breed: string): number {
  const docWeights: Record<string, number> = {
    'Cobb 500': 0.042, // 42g
    'Ross 308': 0.043, // 43g
    'Vencobb': 0.040, // 40g
    'Hubbard': 0.041, // 41g
  };
  
  return docWeights[breed] || 0.042; // Default to Cobb 500
}

/**
 * Feed allocation recommendation result
 * Contains daily feed allocation breakdown and calculation details
 */
export interface FeedAllocationRecommendation {
  totalFeedKg: number; // Total recommended feed for the day
  morningFeedKg: number; // Morning feed allocation (50% of total)
  eveningFeedKg: number; // Evening feed allocation (50% of total)
  targetWeightGainPerBirdKg: number; // Expected weight gain per bird
  flockSize: number; // Current flock size
  recommendedFCR: number; // Recommended FCR for this age
  ageDays: number; // Current age in days
  breed: string; // Poultry breed
  calculationBasis: string; // Human-readable calculation explanation
}

/**
 * Calculate daily feed allocation recommendation
 * Formula: target_weight_gain_per_bird × flock_size × recommended_FCR_for_age
 * 
 * This function calculates the optimal daily feed allocation based on:
 * - Breed-specific weight curves
 * - Current flock age and size
 * - Breed standard FCR for the current age
 * - Optional actual weight for more accurate recommendations
 * 
 * @param breed - Poultry breed name
 * @param ageDays - Current age in days
 * @param flockSize - Current number of birds
 * @param currentAvgWeightKg - Optional actual weight for more accurate recommendations
 * @returns Feed allocation recommendation with morning/evening split
 */
export function calculateFeedAllocation(
  breed: string,
  ageDays: number,
  flockSize: number,
  currentAvgWeightKg?: number
): FeedAllocationRecommendation {
  // Get breed standards for weight curve
  const weightCurve: Record<string, Record<number, number>> = {
    'Cobb 500': { 7: 0.18, 14: 0.45, 21: 0.85, 28: 1.35, 35: 1.85, 42: 2.20 },
    'Ross 308': { 7: 0.19, 14: 0.48, 21: 0.90, 28: 1.42, 35: 1.95, 42: 2.30 },
    'Vencobb': { 7: 0.16, 14: 0.40, 21: 0.78, 28: 1.25, 35: 1.72, 40: 2.00 },
    'Hubbard': { 7: 0.17, 14: 0.42, 21: 0.82, 28: 1.30, 35: 1.78, 41: 2.10 },
  };
  
  const breedWeightCurve = weightCurve[breed] || weightCurve['Cobb 500'];
  const recommendedFCR = getBreedStandardFCR(breed, ageDays);
  
  // Calculate target weight gain per bird for next day
  // Find current weight and next day's target weight
  const ages = Object.keys(breedWeightCurve).map(Number).sort((a, b) => a - b);
  let currentWeight = currentAvgWeightKg;
  let nextDayWeight = 0;
  
  // If current weight not provided, estimate from age
  if (!currentWeight) {
    for (let i = 0; i < ages.length - 1; i++) {
      if (ageDays >= ages[i] && ageDays < ages[i + 1]) {
        const lowerAge = ages[i];
        const upperAge = ages[i + 1];
        const lowerWeight = breedWeightCurve[lowerAge];
        const upperWeight = breedWeightCurve[upperAge];
        const ratio = (ageDays - lowerAge) / (upperAge - lowerAge);
        currentWeight = lowerWeight + (upperWeight - lowerWeight) * ratio;
        break;
      }
    }
    // If beyond highest age, use highest
    if (!currentWeight && ageDays >= ages[ages.length - 1]) {
      currentWeight = breedWeightCurve[ages[ages.length - 1]];
    }
    // If below lowest age, use lowest
    if (!currentWeight) {
      currentWeight = breedWeightCurve[ages[0]];
    }
  }
  
  // Calculate next day's target weight
  const nextAge = ageDays + 1;
  for (let i = 0; i < ages.length - 1; i++) {
    if (nextAge >= ages[i] && nextAge < ages[i + 1]) {
      const lowerAge = ages[i];
      const upperAge = ages[i + 1];
      const lowerWeight = breedWeightCurve[lowerAge];
      const upperWeight = breedWeightCurve[upperAge];
      const ratio = (nextAge - lowerAge) / (upperAge - lowerAge);
      nextDayWeight = lowerWeight + (upperWeight - lowerWeight) * ratio;
      break;
    }
  }
  if (!nextDayWeight && nextAge >= ages[ages.length - 1]) {
    nextDayWeight = breedWeightCurve[ages[ages.length - 1]];
  }
  if (!nextDayWeight) {
    nextDayWeight = breedWeightCurve[ages[0]];
  }
  
  const targetWeightGainPerBirdKg = Math.max(0, nextDayWeight - currentWeight);
  
  // Calculate total feed needed
  const totalFeedKg = targetWeightGainPerBirdKg * flockSize * recommendedFCR;
  
  // Split morning/evening (50/50 split)
  const morningFeedKg = totalFeedKg / 2;
  const eveningFeedKg = totalFeedKg / 2;
  
  return {
    totalFeedKg: Math.round(totalFeedKg * 10) / 10, // Round to 1 decimal
    morningFeedKg: Math.round(morningFeedKg * 10) / 10,
    eveningFeedKg: Math.round(eveningFeedKg * 10) / 10,
    targetWeightGainPerBirdKg: Math.round(targetWeightGainPerBirdKg * 100) / 100,
    flockSize,
    recommendedFCR,
    ageDays,
    breed,
    calculationBasis: `${flockSize.toLocaleString()} पक्षी × ${targetWeightGainPerBirdKg.toFixed(3)} kg/पक्षी (Day ${ageDays} मानक)`,
  };
}

// FCR forecast result
export interface FcrForecastResult {
  forecastFCR: number;
  confidence: number;
  trend: 'improving' | 'stable' | 'deteriorating';
  projectionData: Array<{ day: number; forecastFCR: number }>;
}

// Simple linear regression for FCR forecasting
export function forecastFCR(
  feedLogs: FeedLogEntry[],
  weightLogs: WeightLogEntry[],
  currentAgeDays: number,
  targetHarvestAge: number
): FcrForecastResult | null {
  if (feedLogs.length < 3 || weightLogs.length < 3) {
    return null; // Not enough data for forecasting
  }
  
  // Calculate FCR for each day from logs
  const fcrHistory: Array<{ day: number; fcr: number }> = [];
  
  // Sort logs by date
  const sortedFeedLogs = [...feedLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const sortedWeightLogs = [...weightLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Calculate cumulative feed and weight gain
  let cumulativeFeed = 0;
  let cumulativeWeightGain = 0;
  let docWeight = getDocWeightKg('Cobb 500'); // Default, should be passed as parameter
  
  for (let i = 0; i < Math.min(sortedFeedLogs.length, sortedWeightLogs.length); i++) {
    const feedLog = sortedFeedLogs[i];
    const weightLog = sortedWeightLogs[i];
    
    cumulativeFeed += feedLog.morningFeedKg + feedLog.eveningFeedKg - feedLog.feedRefusalKg;
    cumulativeWeightGain = (weightLog.avgWeightKg - docWeight) * 1000; // Assuming 1000 birds for calculation
    
    if (cumulativeWeightGain > 0) {
      const fcr = cumulativeFeed / cumulativeWeightGain;
      fcrHistory.push({
        day: i + 1, // Simplified day calculation
        fcr,
      });
    }
  }
  
  if (fcrHistory.length < 3) {
    return null;
  }
  
  // Simple linear regression: y = mx + b
  const n = fcrHistory.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  
  fcrHistory.forEach(point => {
    sumX += point.day;
    sumY += point.fcr;
    sumXY += point.day * point.fcr;
    sumXX += point.day * point.day;
  });
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Determine trend
  let trend: 'improving' | 'stable' | 'deteriorating';
  if (slope < -0.005) {
    trend = 'improving';
  } else if (slope > 0.005) {
    trend = 'deteriorating';
  } else {
    trend = 'stable';
  }
  
  // Calculate forecast at harvest
  const forecastFCR = slope * targetHarvestAge + intercept;
  
  // Generate projection data
  const projectionData: Array<{ day: number; forecastFCR: number }> = [];
  for (let day = currentAgeDays + 1; day <= targetHarvestAge; day++) {
    projectionData.push({
      day,
      forecastFCR: Math.max(0, slope * day + intercept),
    });
  }
  
  // Calculate confidence based on R-squared (simplified)
  const meanY = sumY / n;
  let ssTotal = 0;
  let ssResidual = 0;
  
  fcrHistory.forEach(point => {
    const predicted = slope * point.day + intercept;
    ssTotal += Math.pow(point.fcr - meanY, 2);
    ssResidual += Math.pow(point.fcr - predicted, 2);
  });
  
  const rSquared = ssTotal > 0 ? 1 - (ssResidual / ssTotal) : 0;
  const confidence = Math.max(0, Math.min(1, rSquared));
  
  return {
    forecastFCR: Math.max(0, forecastFCR),
    confidence,
    trend,
    projectionData,
  };
}

/**
 * EPEF (European Production Efficiency Factor) calculation result
 * Contains EPEF value and component breakdown
 */
export interface EpefCalculationResult {
  epef: number; // EPEF score (industry standard performance index)
  survivabilityPct: number; // Survival percentage
  liveWeightKg: number; // Average live weight per bird in kg
  fcr: number; // Feed Conversion Ratio
  ageDays: number; // Age in days
  colorStatus: 'green' | 'amber' | 'red'; // Visual status indicator
  performanceRating: 'excellent' | 'good' | 'fair' | 'poor'; // Performance rating
}

/**
 * Calculate EPEF (European Production Efficiency Factor)
 * Formula: EPEF = (Survivability% × Live Weight kg / (FCR × Age days)) × 100
 * where Survivability% = (1 - Mortality Rate/100) × 100
 * 
 * EPEF is an industry-standard performance index for broiler production.
 * Higher EPEF indicates better performance.
 * 
 * Performance benchmarks (typical for broilers):
 * - Excellent: EPEF > 300
 * - Good: EPEF 250-300
 * - Fair: EPEF 200-250
 * - Poor: EPEF < 200
 * 
 * @param mortalityRatePct - Mortality rate as percentage (e.g., 5 for 5%)
 * @param liveWeightKg - Average live weight per bird in kg
 * @param fcr - Feed Conversion Ratio
 * @param ageDays - Age of the flock in days
 * @returns EPEF calculation result with status indicators
 */
export function calculateEPEF(
  mortalityRatePct: number,
  liveWeightKg: number,
  fcr: number,
  ageDays: number
): EpefCalculationResult | null {
  // Validate inputs
  if (ageDays <= 0) {
    return null; // Age must be positive
  }
  if (fcr <= 0) {
    return null; // FCR must be positive
  }
  if (liveWeightKg <= 0) {
    return null; // Weight must be positive
  }
  if (mortalityRatePct < 0 || mortalityRatePct > 100) {
    return null; // Mortality rate must be between 0-100%
  }

  // Calculate survivability percentage
  const survivabilityPct = (1 - mortalityRatePct / 100) * 100;

  // Calculate EPEF using industry standard formula
  const epef = (survivabilityPct * liveWeightKg / (fcr * ageDays)) * 100;

  // Determine color status based on EPEF value
  let colorStatus: 'green' | 'amber' | 'red';
  let performanceRating: 'excellent' | 'good' | 'fair' | 'poor';

  if (epef >= 300) {
    colorStatus = 'green';
    performanceRating = 'excellent';
  } else if (epef >= 250) {
    colorStatus = 'green';
    performanceRating = 'good';
  } else if (epef >= 200) {
    colorStatus = 'amber';
    performanceRating = 'fair';
  } else {
    colorStatus = 'red';
    performanceRating = 'poor';
  }

  return {
    epef: Math.round(epef), // Round to nearest integer
    survivabilityPct: Math.round(survivabilityPct * 10) / 10, // Round to 1 decimal
    liveWeightKg: Math.round(liveWeightKg * 100) / 100, // Round to 2 decimals
    fcr: Math.round(fcr * 100) / 100, // Round to 2 decimals
    ageDays,
    colorStatus,
    performanceRating,
  };
}

/**
 * Calculate EPEF from batch data
 * Convenience function that calculates mortality rate from bird counts
 * 
 * @param birdsPlaced - Total birds placed at start
 * @param currentBirdCount - Current number of live birds
 * @param avgWeightKg - Average weight per bird in kg
 * @param fcr - Feed Conversion Ratio
 * @param ageDays - Age in days
 * @returns EPEF calculation result or null if inputs invalid
 */
export function calculateEPEFFromBatch(
  birdsPlaced: number,
  currentBirdCount: number,
  avgWeightKg: number,
  fcr: number,
  ageDays: number
): EpefCalculationResult | null {
  if (birdsPlaced <= 0) {
    return null;
  }

  // Calculate mortality rate
  const cumulativeDeaths = birdsPlaced - currentBirdCount;
  const mortalityRatePct = (cumulativeDeaths / birdsPlaced) * 100;

  return calculateEPEF(mortalityRatePct, avgWeightKg, fcr, ageDays);
}

/**
 * Portfolio batch data structure for portfolio-level calculations
 * Contains the minimum fields required for portfolio FCR calculation
 */
export interface PortfolioBatchData {
  feed_consumed_kg?: number;
  avg_weight_kg?: number;
  doc_weight_kg?: number;
  birds_alive?: number;
  birds_placed?: number;
  status?: 'active' | 'harvested' | 'closed';
  total_revenue?: number;
}

/**
 * Weight Uniformity calculation result
 * Contains uniformity percentage and classification
 */
export interface WeightUniformityResult {
  uniformityPct: number; // Percentage of birds within ±10% of mean weight
  avgWeightKg: number; // Average weight in kg
  stdDeviationKg: number; // Standard deviation in kg
  sampleSize: number; // Number of birds sampled
  classification: 'excellent' | 'good' | 'fair' | 'poor'; // Classification based on uniformity
  colorStatus: 'green' | 'amber' | 'red'; // Visual status indicator
}

/**
 * Calculate Weight Uniformity %
 * Formula: Percentage of birds within ±10% of mean weight
 * 
 * Weight uniformity is a measure of flock consistency.
 * Higher uniformity indicates more consistent growth and better management.
 * 
 * Industry benchmarks (typical for broilers):
 * - Excellent: Uniformity ≥ 85%
 * - Good: Uniformity 75-84%
 * - Fair: Uniformity 65-74%
 * - Poor: Uniformity < 65%
 * 
 * @param avgWeightKg - Average weight per bird in kg
 * @param stdDeviationKg - Standard deviation of weight in kg
 * @param sampleSize - Number of birds in the sample (minimum 30 recommended)
 * @returns Weight uniformity calculation result with status indicators
 */
export function calculateWeightUniformity(
  avgWeightKg: number,
  stdDeviationKg: number,
  sampleSize: number
): WeightUniformityResult | null {
  // Validate inputs
  if (avgWeightKg <= 0) {
    return null; // Weight must be positive
  }
  if (stdDeviationKg < 0) {
    return null; // Standard deviation cannot be negative
  }
  if (sampleSize < 10) {
    return null; // Sample size too small for reliable calculation
  }

  // Calculate the range for ±10% of mean weight
  const lowerBound = avgWeightKg * 0.9;
  const upperBound = avgWeightKg * 1.1;

  // Assuming normal distribution, calculate percentage within ±10%
  // Using empirical rule: ~68% within 1 std dev, ~95% within 2 std dev
  // We need to find how many std deviations correspond to ±10%
  const zScore = (0.1 * avgWeightKg) / stdDeviationKg;

  // Use error function approximation for normal distribution
  // Percentage within ±z standard deviations = erf(z/√2)
  const erf = (x: number): number => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  };

  const uniformityPct = erf(zScore / Math.sqrt(2)) * 100;

  // Determine classification and color status
  let classification: 'excellent' | 'good' | 'fair' | 'poor';
  let colorStatus: 'green' | 'amber' | 'red';

  if (uniformityPct >= 85) {
    classification = 'excellent';
    colorStatus = 'green';
  } else if (uniformityPct >= 75) {
    classification = 'good';
    colorStatus = 'green';
  } else if (uniformityPct >= 65) {
    classification = 'fair';
    colorStatus = 'amber';
  } else {
    classification = 'poor';
    colorStatus = 'red';
  }

  return {
    uniformityPct: Math.round(uniformityPct * 10) / 10, // Round to 1 decimal
    avgWeightKg: Math.round(avgWeightKg * 100) / 100, // Round to 2 decimals
    stdDeviationKg: Math.round(stdDeviationKg * 1000) / 1000, // Round to 3 decimals
    sampleSize,
    classification,
    colorStatus,
  };
}

/**
 * PEF (Production Efficiency Factor) calculation result
 * Contains PEF value and component breakdown
 */
export interface PefCalculationResult {
  pef: number; // PEF score (production efficiency index)
  survivabilityPct: number; // Survival percentage
  liveWeightKg: number; // Average live weight per bird in kg
  fcr: number; // Feed Conversion Ratio
  colorStatus: 'green' | 'amber' | 'red'; // Visual status indicator
  performanceRating: 'excellent' | 'good' | 'fair' | 'poor'; // Performance rating
}

/**
 * Calculate PEF (Production Efficiency Factor)
 * Formula: PEF = (Survivability% × Live Weight kg) / FCR
 * where Survivability% = (1 - Mortality Rate/100) × 100
 * 
 * PEF is a simplified version of EPEF that doesn't factor in age.
 * It's useful for comparing performance across different age groups.
 * 
 * Performance benchmarks (typical for broilers):
 * - Excellent: PEF > 250
 * - Good: PEF 200-250
 * - Fair: PEF 150-200
 * - Poor: PEF < 150
 * 
 * @param mortalityRatePct - Mortality rate as percentage (e.g., 5 for 5%)
 * @param liveWeightKg - Average live weight per bird in kg
 * @param fcr - Feed Conversion Ratio
 * @returns PEF calculation result with status indicators
 */
export function calculatePEF(
  mortalityRatePct: number,
  liveWeightKg: number,
  fcr: number
): PefCalculationResult | null {
  // Validate inputs
  if (fcr <= 0) {
    return null; // FCR must be positive
  }
  if (liveWeightKg <= 0) {
    return null; // Weight must be positive
  }
  if (mortalityRatePct < 0 || mortalityRatePct > 100) {
    return null; // Mortality rate must be between 0-100%
  }

  // Calculate survivability percentage
  const survivabilityPct = (1 - mortalityRatePct / 100) * 100;

  // Calculate PEF using formula
  const pef = (survivabilityPct * liveWeightKg) / fcr;

  // Determine color status based on PEF value
  let colorStatus: 'green' | 'amber' | 'red';
  let performanceRating: 'excellent' | 'good' | 'fair' | 'poor';

  if (pef >= 250) {
    colorStatus = 'green';
    performanceRating = 'excellent';
  } else if (pef >= 200) {
    colorStatus = 'green';
    performanceRating = 'good';
  } else if (pef >= 150) {
    colorStatus = 'amber';
    performanceRating = 'fair';
  } else {
    colorStatus = 'red';
    performanceRating = 'poor';
  }

  return {
    pef: Math.round(pef), // Round to nearest integer
    survivabilityPct: Math.round(survivabilityPct * 10) / 10, // Round to 1 decimal
    liveWeightKg: Math.round(liveWeightKg * 100) / 100, // Round to 2 decimals
    fcr: Math.round(fcr * 100) / 100, // Round to 2 decimals
    colorStatus,
    performanceRating,
  };
}

/**
 * Calculate PEF from batch data
 * Convenience function that calculates mortality rate from bird counts
 * 
 * @param birdsPlaced - Total birds placed at start
 * @param currentBirdCount - Current number of live birds
 * @param avgWeightKg - Average weight per bird in kg
 * @param fcr - Feed Conversion Ratio
 * @returns PEF calculation result or null if inputs invalid
 */
export function calculatePEFFromBatch(
  birdsPlaced: number,
  currentBirdCount: number,
  avgWeightKg: number,
  fcr: number
): PefCalculationResult | null {
  if (birdsPlaced <= 0) {
    return null;
  }

  // Calculate mortality rate
  const cumulativeDeaths = birdsPlaced - currentBirdCount;
  const mortalityRatePct = (cumulativeDeaths / birdsPlaced) * 100;

  return calculatePEF(mortalityRatePct, avgWeightKg, fcr);
}

/**
 * Portfolio KPI calculation result
 * Contains portfolio-level metrics across all batches
 */
export interface PortfolioKPIResult {
  portfolioFCR: number;
  portfolioMortality: number;
  totalBirds: number;
  totalBirdsPlaced: number;
  totalFeedKg: number;
  totalWeightGainKg: number;
  totalDeaths: number;
  batchCount: number;
  totalRevenue: number;
}

/**
 * Calculate Portfolio FCR using weighted average
 * Formula: SUM(feed_kg across all batches) / SUM(weight_gain_kg across all batches)
 * 
 * This function calculates portfolio-level FCR by aggregating feed consumption
 * and weight gain across all active batches, then computing the weighted average.
 * This is the correct method for portfolio-level FCR calculation (not simple average).
 * 
 * @param batches - Array of batch data with feed, weight, and bird count information
 * @returns Portfolio KPI result with FCR, mortality, aggregate metrics, and revenue
 */
export function calculatePortfolioKPI(batches: PortfolioBatchData[]): PortfolioKPIResult {
  let totalFeedKg = 0;
  let totalWeightGainKg = 0;
  let totalBirds = 0;
  let totalBirdsPlaced = 0;
  let totalDeaths = 0;
  let batchCount = 0;
  let totalRevenue = 0;

  for (const batch of batches) {
    const feedConsumed = batch.feed_consumed_kg || 0;
    const currentWeight = batch.avg_weight_kg || 0;
    const docWeight = batch.doc_weight_kg || 0.04; // Default to 40g if not specified
    const currentBirds = batch.birds_alive || 0;
    const birdsPlaced = batch.birds_placed || 0;
    const batchStatus = batch.status || 'active';
    const batchRevenue = batch.total_revenue || 0;

    totalFeedKg += feedConsumed;
    totalWeightGainKg += (currentWeight - docWeight) * currentBirds;
    totalBirds += currentBirds;
    totalBirdsPlaced += birdsPlaced;
    totalDeaths += (birdsPlaced - currentBirds) || 0;
    batchCount++;

    // Add revenue for harvested batches
    if (batchStatus === 'harvested' && batchRevenue > 0) {
      totalRevenue += batchRevenue;
    }
  }

  // Calculate portfolio FCR using weighted average
  const portfolioFCR = totalWeightGainKg > 0 ? totalFeedKg / totalWeightGainKg : 0;

  // Calculate portfolio mortality as total deaths / total placed
  const portfolioMortality = totalBirdsPlaced > 0 ? (totalDeaths / totalBirdsPlaced) * 100 : 0;

  return {
    portfolioFCR,
    portfolioMortality,
    totalBirds,
    totalBirdsPlaced,
    totalFeedKg,
    totalWeightGainKg,
    totalDeaths,
    batchCount,
    totalRevenue,
  };
}
