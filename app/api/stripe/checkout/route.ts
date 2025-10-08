// Creates a Stripe Checkout Session and returns { url }.
// Authoritative server: infers mode/credits from server catalog and ignores client-provided mode.

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { lookupByPriceId } from '@/lib/pricing-server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { priceId, quantity = 1, successUrl, cancelUrl, userEmail } = await req.json()

    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 })
    }

    const catalogItem = lookupByPriceId(priceId)
    if (!catalogItem) {
      return NextResponse.json({ error: 'Unknown priceId' }, { status: 400 })
    }

    const origin =
      req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const mode = catalogItem.mode

    // Base metadata stored on the checkout session
    const baseMeta: Record<string, string> = {
      priceId,
      itemKind: catalogItem.kind,
      ...(catalogItem.kind === 'plan'
        ? { planId: catalogItem.planId }
        : { packId: catalogItem.packId }),
      ...(userEmail ? { user_email: String(userEmail) } : {}),
    }

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity }],
      success_url: successUrl || `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/pricing/cancel`,
      allow_promotion_codes: true,
      customer_email: userEmail || undefined,
      metadata: baseMeta,
      ...(mode === 'subscription'
        ? { subscription_data: { metadata: baseMeta } as any }
        : {}),
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('[stripe/checkout] error', err)
    return NextResponse.json({ error: 'Checkout create failed' }, { status: 500 })
  }
}