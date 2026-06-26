/**
 * Price Alerts API Route
 * 
 * This API handles CRUD operations for user-configured price alerts.
 * Alerts can be triggered by:
 * - Price rising above a threshold (above_price)
 * - Price dropping below a threshold (below_price)
 * - Sell signal activation (signal_sell)
 * 
 * Routes:
 * - POST /api/price-intelligence/alerts - Create a new alert
 * - GET /api/price-intelligence/alerts - Fetch user's active alerts
 * - DELETE /api/price-intelligence/alerts?id={alertId} - Deactivate an alert
 * 
 * Database table: price_alerts
 * RLS enabled: Users can only access their own alerts
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

// Schema for alert creation payload validation
const AlertSchema = z.object({
  mandiId: z.string().min(1).max(50),
  alertType: z.enum(['above_price', 'below_price', 'signal_sell']),
  thresholdRs: z.number().min(50).max(500).optional(),
  notifyWhatsApp: z.boolean(),
  notifyEmail: z.boolean(),
  notifyInApp: z.boolean(),
})

/**
 * POST - Create a new price alert
 * 
 * Request body:
 * {
 *   mandiId: string,
 *   alertType: 'above_price' | 'below_price' | 'signal_sell',
 *   thresholdRs?: number (required for above_price/below_price),
 *   notifyWhatsApp: boolean,
 *   notifyEmail: boolean,
 *   notifyInApp: boolean
 * }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  // ── 1. Auth check ──────────────────────────────────────────────────────────
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── 2. Parse + validate request body ───────────────────────────────────────
  const body = await req.json()
  const params = AlertSchema.safeParse(body)
  if (!params.success) {
    return NextResponse.json({ error: 'Invalid parameters', details: params.error.flatten() }, { status: 400 })
  }

  const { mandiId, alertType, thresholdRs, notifyWhatsApp, notifyEmail, notifyInApp } = params.data

  // ── 3. Validate threshold for price-based alerts ─────────────────────────
  if (alertType !== 'signal_sell' && (thresholdRs === undefined || thresholdRs === null)) {
    return NextResponse.json({ error: 'Threshold required for price-based alerts' }, { status: 400 })
  }

  // ── 4. Insert alert into database ───────────────────────────────────────────
  const { error } = await supabase
    .from('price_alerts')
    .insert({
      user_id: user.id,
      mandi_id: mandiId,
      alert_type: alertType,
      threshold_rs: alertType !== 'signal_sell' ? thresholdRs : null,
      notify_whatsapp: notifyWhatsApp,
      notify_email: notifyEmail,
      notify_inapp: notifyInApp,
      is_active: true,
    } as any)

  if (error) {
    console.error('[Alert API] Failed to create alert:', error)
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
  }

  // ── 5. Return success response ──────────────────────────────────────────────
  return NextResponse.json({ success: true, message: 'Alert created successfully' })
}

/**
 * GET - Fetch user's active alerts
 * 
 * Query params:
 * - mandi (optional): Filter alerts by mandi ID
 * 
 * Returns: { alerts: Alert[] }
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const mandiId = req.nextUrl.searchParams.get('mandi')

  // Fetch alerts for this user (optionally filtered by mandi)
  const { data, error } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false }) as any

  if (error) {
    console.error('[Alert API] Failed to fetch alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }

  // Filter by mandi if specified
  const alerts = mandiId 
    ? data.filter((a: any) => a.mandi_id === mandiId)
    : data

  return NextResponse.json({ alerts })
}

/**
 * DELETE - Deactivate an alert (soft delete)
 * 
 * Query params:
 * - id (required): Alert ID to deactivate
 * 
 * Note: This is a soft delete - sets is_active to false
 * The alert record remains in the database for audit purposes
 */
export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  
  if (!supabase) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  }

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const alertId = req.nextUrl.searchParams.get('id')
  if (!alertId) {
    return NextResponse.json({ error: 'Alert ID required' }, { status: 400 })
  }

  // Soft delete by setting is_active to false
  const { error } = await (supabase as any)
    .from('price_alerts')
    .update({ is_active: false } as any)
    .eq('id', alertId)
    .eq('user_id', user.id);

  if (error) {
    console.error('[Alert API] Failed to delete alert:', error)
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 })
  }

  return NextResponse.json({ success: true, message: 'Alert deactivated successfully' })
}
