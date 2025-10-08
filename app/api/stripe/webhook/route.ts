import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { lookupByPriceId } from '@/lib/pricing-server'
import { creditDeposit, isProcessed, markProcessed } from '@/lib/credits'

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_BASE

export async function POST(req: NextRequest) {
  const raw = await req.text() // raw body string for signature verification
  const sig = req.headers.get('stripe-signature') || ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('❌ Stripe webhook signature check failed:', err)
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const idempotencyKey = `cs_${session.id}`
        if (await isProcessed(idempotencyKey)) return NextResponse.json({ ok: true })

        const priceIdFromMetadata = session.metadata?.priceId
        let priceId = priceIdFromMetadata || undefined
        if (!priceId && (session as any).line_items) {
          const li = (session as any).line_items?.data?.[0]
          priceId = li?.price?.id
        }
        if (!priceId) {
          console.warn('checkout.session.completed without priceId')
          await markProcessed(idempotencyKey)
          return NextResponse.json({ ok: true })
        }

        const catalogItem = lookupByPriceId(priceId)
        if (!catalogItem) {
          console.warn('Unknown priceId in checkout.session.completed', priceId)
          await markProcessed(idempotencyKey)
          return NextResponse.json({ ok: true })
        }

        const email =
          session.metadata?.user_email ||
          session.customer_details?.email ||
          session.customer_email || ''

        const source = catalogItem.kind === 'plan' ? catalogItem.planId : catalogItem.packId
        const deposit: any = {
          userIdOrEmail: email || 'unknown',
          credits: catalogItem.credits,
          source,
          priceId,
        }
        if ('expiresInDays' in catalogItem && catalogItem.expiresInDays)
          deposit.expiresInDays = catalogItem.expiresInDays
        if ('rolloverCap' in catalogItem && catalogItem.rolloverCap)
          deposit.rolloverCap = catalogItem.rolloverCap
        await creditDeposit(deposit)

        if (BACKEND_BASE && session.mode === 'subscription' && email) {
          try {
            const payload = new URLSearchParams({ user_email: email, is_premium: 'true' })
            await fetch(`${BACKEND_BASE}update-premium`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: payload,
            })
          } catch (e) {
            console.warn('FastAPI update-premium failed (non-fatal)', e)
          }
        }

        await markProcessed(idempotencyKey)
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const idempotencyKey = `inv_${invoice.id}`
        if (await isProcessed(idempotencyKey)) return NextResponse.json({ ok: true })

        const line = invoice.lines?.data?.[0] as any
        const priceId = line?.price?.id as string | undefined
        if (!priceId) {
          console.warn('invoice.payment_succeeded missing priceId')
          await markProcessed(idempotencyKey)
          return NextResponse.json({ ok: true })
        }

        const catalogItem = lookupByPriceId(priceId)
        if (!catalogItem) {
          console.warn('Unknown priceId in invoice.payment_succeeded', priceId)
          await markProcessed(idempotencyKey)
          return NextResponse.json({ ok: true })
        }

        // Attempt to read subscription metadata if available; otherwise fall back
        const invAny = invoice as any
        const metaEmail = invAny?.subscription_details?.metadata?.user_email || invAny?.subscription?.metadata?.user_email
        const userEmail = metaEmail || invoice.customer_email || (invAny.customer?.email as string) || ''

        const source = catalogItem.kind === 'plan' ? catalogItem.planId : catalogItem.packId
        const deposit: any = {
          userIdOrEmail: userEmail || 'unknown',
          credits: catalogItem.credits,
          source,
          priceId,
        }
        if ('rolloverCap' in catalogItem && catalogItem.rolloverCap)
          deposit.rolloverCap = catalogItem.rolloverCap
        await creditDeposit(deposit)

        if (BACKEND_BASE && userEmail) {
          try {
            const payload = new URLSearchParams({ user_email: userEmail, is_premium: 'true' })
            await fetch(`${BACKEND_BASE}update-premium`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: payload,
            })
          } catch (e) {
            console.warn('FastAPI update-premium failed (non-fatal)', e)
          }
        }

        await markProcessed(idempotencyKey)
        break
      }
      default:
        break
    }
  } catch (e) {
    console.error('Webhook handler error', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
