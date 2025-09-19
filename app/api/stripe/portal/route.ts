import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
})

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'email_required' }, { status: 400 })

    // Find/create Stripe customer by email
    const list = await stripe.customers.list({ email, limit: 1 })
    const customer = list.data[0]
    if (!customer) {
      return NextResponse.json({ error: 'customer_not_found' }, { status: 404 })
    }

    const origin = req.headers.get('origin') || process.env.PUBLIC_BASE_URL || 'http://localhost:3000'
    const session = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${origin}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    return NextResponse.json({ error: 'portal_create_failed' }, { status: 500 })
  }
}