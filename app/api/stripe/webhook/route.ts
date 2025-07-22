import { stripe } from '@/lib/stripe'
import { NextResponse } from 'next/server'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  /* 1️⃣ raw body for signature verification */
  const rawBody = await req.arrayBuffer()

  /* 2️⃣ signature sent by Stripe */
  const sig = req.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(rawBody),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('❌  Invalid webhook signature', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  /* 3️⃣ handle the event(s) you care about */
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    // TODO: mark free_used / add credits, etc.
  }

  return NextResponse.json({ received: true })
}