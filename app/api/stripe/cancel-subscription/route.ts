import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'email_required' }, { status: 400 })

    // Locate the customer
    const customers = await stripe.customers.list({ email, limit: 1 })
    const customer = customers.data[0]
    if (!customer) return NextResponse.json({ error: 'customer_not_found' }, { status: 404 })

    // Find active subscription(s)
    const subs = await stripe.subscriptions.list({ customer: customer.id, status: 'active', limit: 3 })
    if (subs.data.length === 0) return NextResponse.json({ ok: true, message: 'no_active_subscription' })

    // Mark cancel at period end for all active subs
    await Promise.all(
      subs.data.map((s) => stripe.subscriptions.update(s.id, { cancel_at_period_end: true }))
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'cancel_failed' }, { status: 500 })
  }
}