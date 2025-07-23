// Creates a Stripe Checkout Session and returns { url }.
// • Logs every request/response when DEBUG_LOG_CHECKOUT=true
// • Accepts POST { priceId: string, email?: string }

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import type Stripe from 'stripe'

function reqEnv(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`Missing env: ${key}`)
  return v
}

interface Body {
  priceId?: string
  email?: string
}

export async function POST(req: NextRequest) {
  let body: Body
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const priceId = body.priceId
  if (!priceId?.startsWith('price_')) {
    return NextResponse.json({ error: 'Missing priceId' }, { status: 400 })
  }

  const origin =
    process.env.NEXT_PUBLIC_BASE_URL ||
    req.headers.get('origin') ||
    'http://localhost:3000'

  const params: Stripe.Checkout.SessionCreateParams = {
    mode:
      priceId === reqEnv('NEXT_PUBLIC_PRICE_MONTHLY')
        ? 'subscription'
        : 'payment',
    customer_email: body.email || undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { user_email: body.email || '' },
    success_url: `${origin}/job-kit?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/job-info?canceled=1`,
    payment_method_types: ['card'],
    allow_promotion_codes: true,
  }

  if (process.env.DEBUG_LOG_CHECKOUT === 'true') {
    console.log('➡️  Creating session with', params)
  }

  try {
    const session = await stripe.checkout.sessions.create(params)

    if (process.env.DEBUG_LOG_CHECKOUT === 'true') {
      console.log('✅ Stripe session:', session.id)
    }

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('❌ Stripe error', err?.message || err)
    return NextResponse.json(
      { error: 'Stripe checkout failed', detail: err?.message },
      { status: 500 },
    )
  }
}