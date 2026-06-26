// Verify Razorpay signature after payment
// On successful verification:
//   1. Create/update subscription record in DB
//   2. Set plan_name, subscription_type, billing dates
//   3. For lifetime: set lifetime_start_date = today, lifetime_end_date = today + 5 years
//   4. Invalidate entitlements cache (user's next page load fetches fresh entitlements)
//   5. Return success + redirect URL to /dashboard?payment_success=1

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createHmac } from 'crypto'
import { z } from 'zod'
import Razorpay from 'razorpay'

const VerifySchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = VerifySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data

  // Verify Razorpay signature
  const generatedSignature = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (generatedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Initialize Razorpay
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  try {
    const order = await razorpay.orders.fetch(razorpay_order_id)
    const notes = order.notes as any
    const planName = notes.plan_name
    const billingType = notes.billing_type

    // Calculate subscription dates
    const now = new Date()
    const startDate = now
    let endDate: Date
    let billingPeriodMonths: number
    let nextRenewalDate: Date | null = null

    if (billingType === 'lifetime') {
      // Lifetime deal: 5 years from now
      endDate = new Date(now.getTime() + (5 * 365 * 24 * 60 * 60 * 1000))
      billingPeriodMonths = 60 // 5 years in months
    } else if (billingType === 'annual') {
      // Annual: 1 year from now
      endDate = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000))
      billingPeriodMonths = 12
      nextRenewalDate = endDate
    } else {
      // Monthly: 1 month from now
      endDate = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000))
      billingPeriodMonths = 1
      nextRenewalDate = endDate
    }

    // Prepare subscription data
    const subscriptionData: any = {
      user_id: user.id,
      plan_name: planName,
      subscription_type: billingType,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      billing_period_months: billingPeriodMonths,
      next_renewal_date: nextRenewalDate ? nextRenewalDate.toISOString() : null,
      razorpay_order_id: razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id,
      status: 'active',
      updated_at: new Date().toISOString(),
    }

    // For lifetime deals, add lifetime-specific dates
    if (billingType === 'lifetime') {
      subscriptionData.lifetime_start_date = startDate.toISOString()
      subscriptionData.lifetime_end_date = endDate.toISOString()
    }

    // Create/update subscription record
    const { error: subscriptionError } = await supabase!
      .from('subscriptions')
      .upsert(subscriptionData as any, {
        onConflict: 'user_id'
      })

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError)
      return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      redirectUrl: '/dashboard?payment_success=1' 
    })

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}
