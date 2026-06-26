import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Razorpay from 'razorpay'
import { z } from 'zod'

const OrderSchema = z.object({
  planName:        z.enum(['FLOCKIQ_FARM', 'FLOCKIQ_PRO']),
  billingType:     z.enum(['monthly', 'annual', 'lifetime']),
})

const PLAN_AMOUNTS: Record<string, Record<string, number>> = {
  FLOCKIQ_FARM: { monthly: 500000, annual: 5000000, lifetime: 15000000 },  // in paise (₹ × 100)
  FLOCKIQ_PRO:  { monthly: 800000, annual: 8000000, lifetime: 25000000 },
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  if (!supabase) return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = OrderSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  const { planName, billingType } = parsed.data
  const amountPaise = PLAN_AMOUNTS[planName][billingType]

  const planLabels = {
    FLOCKIQ_FARM: { monthly: 'FlockIQ FARM Monthly', annual: 'FlockIQ FARM Annual', lifetime: 'FlockIQ FARM Lifetime Deal (5 Years)' },
    FLOCKIQ_PRO:  { monthly: 'FlockIQ PRO Monthly',  annual: 'FlockIQ PRO Annual',  lifetime: 'FlockIQ PRO Lifetime Deal (5 Years)' },
  }

  const razorpay = new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })

  const order = await razorpay.orders.create({
    amount:   amountPaise,
    currency: 'INR',
    notes: {
      user_id:      user.id,
      plan_name:    planName,
      billing_type: billingType,
      description:  planLabels[planName][billingType],
    },
  })

  return NextResponse.json({ orderId: order.id, amount: amountPaise, currency: 'INR' })
}
