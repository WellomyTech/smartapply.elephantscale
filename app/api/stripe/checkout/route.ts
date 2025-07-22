import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { priceId, email } = await req.json()

  if (!priceId) {
    return NextResponse.json({ error: 'Missing priceId' }, { status: 400 })
  }

  const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL

  // ① Create / fetch Stripe Customer (optional – you can skip until DB exists)
  let customer // …

  const session = await stripe.checkout.sessions.create({
    mode: priceId === 'price_1RmKPwAgbqMxQURg7r2KZF59' ? 'subscription' : 'payment',
    currency: 'usd',
    customer,           // if you create one
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${origin}/job-kit?payment=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/job-info?canceled=1`,
  })

  return NextResponse.json({ url: session.url })
}
