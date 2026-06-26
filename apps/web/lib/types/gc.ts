export interface GCCostInputs {
  docCostTotal:         number
  litterCostTotal:      number
  fixedOverheadAlloc:   number
  medicineCostTotal:    number
  vaccineCostTotal:     number
  electricityCostTotal: number
  waterCostTotal:       number
  labourCostTotal:      number
  miscCostTotal:        number
}

export interface GCBreakdown {
  docCost:         number
  feedCost:        number   // computed from feed_purchases
  medicineCost:    number
  vaccineCost:     number
  litterCost:      number
  electricityCost: number
  waterCost:       number
  labourCost:      number
  miscCost:        number
  fixedOverhead:   number
  totalCost:       number
  gcPerKg:         number   // total_cost / (live_birds × avg_weight_kg)
  liveKgs:         number   // live_birds × avg_weight_kg
  birdsAlive:      number
  avgWeightKg:     number
}

export interface GCSummary extends GCBreakdown {
  batchId:           string
  farmName:          string
  batchDay:          number
  targetSellPriceP50: number | null   // from forecast
  margin:            number | null    // targetSellPriceP50 - gcPerKg
  marginPct:         number | null
  estimatedProfit:   number | null   // margin × liveKgs
  industryBenchmarkGC: number        // 95 (hardcoded UP belt benchmark)
  vsIndustry:        number          // gcPerKg - industryBenchmarkGC (positive = above benchmark = worse)
}

export const INDUSTRY_BENCHMARK_GC_PER_KG = 95  // ₹/kg — UP belt broiler benchmark
export const GC_EXCELLENT_THRESHOLD = 88         // Below this = excellent performance
export const GC_GOOD_THRESHOLD = 100             // 88–100 = good
export const GC_WATCH_THRESHOLD = 112            // 100–112 = watch
// Above 112 = alert (approaching or exceeding typical sell price)

export function gcStatusColour(gcPerKg: number): string {
  if (gcPerKg <= GC_EXCELLENT_THRESHOLD) return '#16A34A'  // green
  if (gcPerKg <= GC_GOOD_THRESHOLD)      return '#65A30D'  // light green
  if (gcPerKg <= GC_WATCH_THRESHOLD)     return '#D97706'  // amber
  return '#DC2626'                                          // red
}

export function gcStatusLabel(gcPerKg: number): { en: string; hi: string } {
  if (gcPerKg <= GC_EXCELLENT_THRESHOLD) return { en: 'Excellent', hi: 'बेहतरीन' }
  if (gcPerKg <= GC_GOOD_THRESHOLD)      return { en: 'Good',      hi: 'अच्छा' }
  if (gcPerKg <= GC_WATCH_THRESHOLD)     return { en: 'Watch',     hi: 'ध्यान दें' }
  return { en: 'Alert — High Cost', hi: 'अलर्ट — उच्च लागत' }
}
