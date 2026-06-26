import { createClient } from '@/utils/supabase/server'
import crypto from 'crypto'

interface LogPredictionAccessParams {
  userId: string
  mandiId: string
  horizon: number
  request: Request
  watermarkToken: string
}

/**
 * Log prediction access for audit trail and watermarking purposes.
 * This is a fire-and-forget function - it should not block the main response.
 *
 * Logs to prediction_access_log table with:
 * - user_id
 * - mandi_id
 * - horizon (days requested)
 * - ip_hash (SHA-256 of IP, not raw IP)
 * - device_fingerprint (SHA-256 of User-Agent + Accept headers)
 * - watermark_token (unique watermark applied to this response)
 * - accessed_at (timestamp)
 */
export async function logPredictionAccess({
  userId,
  mandiId,
  horizon,
  request,
  watermarkToken,
}: LogPredictionAccessParams): Promise<void> {
  try {
    // Extract IP from request headers (use x-forwarded-for if available)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               'unknown'

    // Hash IP for privacy (SHA-256)
    const ipHash = crypto
      .createHash('sha256')
      .update(ip)
      .digest('hex')

    // Create device fingerprint from User-Agent + Accept headers
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const accept = request.headers.get('accept') || 'unknown'
    const deviceFingerprint = crypto
      .createHash('sha256')
      .update(`${userAgent}|${accept}`)
      .digest('hex')

    // Insert into prediction_access_log table
    const supabase = await createClient()
    if (!supabase) {
      throw new Error('Supabase client not available')
    }

    const { error } = await supabase
      .from('prediction_access_log')
      .insert({
        user_id: userId,
        mandi_id: mandiId,
        horizon: horizon,
        ip_hash: ipHash,
        device_fingerprint: deviceFingerprint,
        watermark_token: watermarkToken,
      } as any) // Type assertion needed until table types are generated

    if (error) {
      throw error
    }
  } catch (error) {
    // Silently fail - this is audit logging, not critical for user experience
    console.error('[Access log] Failed to log prediction access:', error)
  }
}
