// FlockIQ — Indian Currency Formatter Utility
// File: apps/web/lib/formatCurrency.ts
// Version: v1.0 | May 2026
// Task Reference: UI-10
// Design Reference: 13_full_platform_tasks_master.md §UI-10

export type Locale = 'hi' | 'en';

interface FormatINROptions {
  locale?: Locale;
  compact?: boolean;
}

/**
 * Format Indian currency with proper Indian numbering system
 * Examples:
 * - 50000    → "₹50,000"
 * - 150000   → hi: "₹1.5 लाख" | en: "₹1.5 L"
 * - 1200000  → hi: "₹12 लाख"  | en: "₹12 L"
 * - 10000000 → hi: "₹1 करोड़" | en: "₹1 Cr"
 */
export function formatINR(amount: number, options: FormatINROptions = {}): string {
  const { locale = 'hi', compact = false } = options;

  if (amount < 100000) {
    // Below lakh threshold - always show with commas
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  if (amount < 10000000) {
    // 1 lakh to 99.99 lakh
    const lakhs = amount / 100000;
    const suffix = locale === 'hi' ? ' लाख' : ' L';
    
    if (lakhs % 1 === 0) {
      return `₹${Math.floor(lakhs)}${suffix}`;
    }
    return `₹${lakhs.toFixed(1).replace(/\.0$/, '')}${suffix}`;
  }

  // 1 crore and above
  const crores = amount / 10000000;
  const suffix = locale === 'hi' ? ' करोड़' : ' Cr';
  
  if (crores % 1 === 0) {
    return `₹${Math.floor(crores)}${suffix}`;
  }
  return `₹${crores.toFixed(1).replace(/\.0$/, '')}${suffix}`;
}

/**
 * Format price per kilogram
 * Example: 168 → "₹168/kg"
 */
export function formatKgPrice(price: number): string {
  return `₹${price.toFixed(0)}/kg`;
}

/**
 * Format price band (P10 to P90)
 * Example: p10=161, p90=175 → "₹161–₹175/kg"
 */
export function formatPriceBand(p10: number, p90: number): string {
  return `₹${p10.toFixed(0)}–₹${p90.toFixed(0)}/kg`;
}

/**
 * Format annual loss estimate
 * Calculates and formats annual loss based on birds and batches
 */
export function formatLossCalc(birds: number, batches: number, locale: Locale = 'hi'): string {
  // Simplified loss calculation: birds * batches * average loss per bird
  const avgLossPerBird = 150; // ₹150 average loss per bird
  const totalLoss = birds * batches * avgLossPerBird;
  return formatINR(totalLoss, { locale });
}

/**
 * Format ROI (Return on Investment)
 * Returns "₹X" per ₹1 invested
 */
export function formatROI(potentialLoss: number, planCost: number): string {
  const roi = potentialLoss / planCost;
  return `₹${roi.toFixed(0)}`;
}
