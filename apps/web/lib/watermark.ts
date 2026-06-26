import crypto from 'crypto'

interface TimelinePoint {
  date: string
  actual: number | null
  p50: number | null
  p10: number | null
  p90: number | null
  isForecast: boolean
}

interface WatermarkResult {
  data: TimelinePoint[]
  token: string
}

/**
 * Apply customer-specific watermarking to forecast data.
 *
 * Two techniques:
 * 1. Micro-perturbation: nudge P50 values by ±0.3% unique to this customer.
 *    This means two customers comparing screenshots will see slightly different numbers.
 *    ±0.3% on ₹168 = ±₹0.50 — within model error, invisible to humans.
 *
 * 2. Zero-width chars: NOT applied in this function (applied to text fields at render time).
 *    See ForecastDisclaimer component for text watermarking.
 */
export function applyWatermark(
  timeline: TimelinePoint[],
  userId: string
): WatermarkResult {
  // Generate deterministic but unique perturbation seed for this user + today
  const today   = new Date().toISOString().split('T')[0]
  const seedStr = `${userId}-${today}-flockiq-forecast`
  const hash    = crypto.createHash('sha256').update(seedStr).digest('hex')

  // Token shown in UI (first 8 chars of hash, uppercase)
  const token = `FQ-${hash.substring(0, 8).toUpperCase()}`

  // Perturbation factor: map hash bytes to a value in range [-0.003, +0.003]
  // Use bytes 8–15 of hash to avoid correlation with token bytes
  const perturbByte  = parseInt(hash.substring(8, 10), 16)   // 0–255
  const perturbFactor = ((perturbByte - 128) / 128) * 0.003  // -0.003 to +0.003

  const watermarked = timeline.map(point => ({
    ...point,
    // Nudge ALL price fields by the same factor (consistent perturbation)
    // Only apply to forecast data, not historical actuals (actuals must be exact)
    p50: point.p50 !== null && point.isForecast
      ? Math.round((point.p50 * (1 + perturbFactor)) * 100) / 100
      : point.p50,
    p10: point.p10 !== null && point.isForecast
      ? Math.round((point.p10 * (1 + perturbFactor)) * 100) / 100
      : point.p10,
    p90: point.p90 !== null && point.isForecast
      ? Math.round((point.p90 * (1 + perturbFactor)) * 100) / 100
      : point.p90,
  }))

  return { data: watermarked, token }
}

/**
 * Embed zero-width Unicode chars into a text string.
 * Used in text fields to invisibly encode the customer ID.
 *
 * Chars used:
 *   U+200B (zero-width space)
 *   U+200C (zero-width non-joiner)
 *   Sequence: 0=U+200B, 1=U+200C
 *   Encodes first 8 bits of userId hash in binary
 *
 * Called from ForecastDisclaimer and PriceDriversCard components.
 */
export function embedTextWatermark(text: string, userId: string): string {
  const hash      = crypto.createHash('sha256').update(userId).digest('hex')
  const bits      = parseInt(hash.substring(0, 2), 16).toString(2).padStart(8, '0')
  const zwChars   = bits.split('').map(b => b === '0' ? '\u200B' : '\u200C').join('')
  // Insert after first word for natural placement
  const firstSpace = text.indexOf(' ')
  if (firstSpace === -1) return text + zwChars
  return text.substring(0, firstSpace) + zwChars + text.substring(firstSpace)
}
