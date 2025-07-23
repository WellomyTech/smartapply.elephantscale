import { stripe } from '@/lib/stripe'
import { NextRequest, NextResponse } from 'next/server'
import { start } from 'repl'
import Stripe from 'stripe'

const BACKEND_BASE = process.env.NEXT_PUBLIC_API_BASE

export async function POST(req: NextRequest) {

  // ...signature check code...

    const raw = await req.arrayBuffer()
  const sig = req.headers.get('stripe-signature') || ''
  let event

  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(raw),
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('❌ Stripe webhook signature check failed:', err)
    return NextResponse.json({ ok: false }, { status: 400 })
  }


  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    if (session.mode === 'subscription' && session.subscription) {
      // 1. Fetch the full subscription object
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

      // 2. Get details
      const planName = subscription.items.data[0]?.plan.nickname || 'Monthly'
      const amount = subscription.items.data[0]?.plan.amount || 0
      const currency = subscription.items.data[0]?.plan.currency || 'usd'
      const startDate = new Date(subscription.start_date * 1000).toISOString()
      const email =
      session.metadata?.user_email ||
      session.customer_details?.email ||
      session.customer_email || '';

      console.log('Metadata email:', session.metadata?.user_email);
      console.log('Customer details email:', session.customer_details?.email);
      console.log('Customer email:', session.customer_email);
      console.log('Planname',planName)
      console.log('amount',amount)
      console.log('curreny',currency)
      console.log('startdate',startDate)

      // 3. Compose the data payload
      const payload = {
        user_email: email,
        is_premium: 'true',
        //subscription_id: subscription.id,
        //plan_name: planName,
        //amount: amount / 100, // Stripe amounts are in cents!
        //currency,
        //start_date: startDate,
      }

      console.log('Payload',payload)

      // 4. Send to your FastAPI backend
     const updateRes =  await fetch(`${BACKEND_BASE}update-premium`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(payload),
      })
      const updateText = await updateRes.text()
        // Log the FastAPI response for debugging
        console.log('🔔 update-premium response:', updateRes.status, updateText)
        console.log('Payload',payload)
      } else {
        console.error('❗ No user email found in session for update-premium.')
      
    }
  }
  return NextResponse.json({ received: true })
}













// // /app/api/stripe/webhook/route.ts

// import { stripe } from '@/lib/stripe'
// import { NextRequest, NextResponse } from 'next/server'
// import type Stripe from 'stripe'

// const BACKEND_BASE = process.env.NEXT_PUBLIC_API_BASE

// export async function POST(req: NextRequest) {
//   const raw = await req.arrayBuffer()
//   const sig = req.headers.get('stripe-signature') || ''

//   let event: Stripe.Event
//   try {
//     event = stripe.webhooks.constructEvent(
//       Buffer.from(raw),
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET!,
//     )
//   } catch (err) {
//     console.error('❌  Stripe webhook signature check failed:', err)
//     return NextResponse.json({ ok: false }, { status: 400 })
//   }

//   if (event.type === 'checkout.session.completed') {
//     const session = event.data.object as Stripe.Checkout.Session

//     // --- 1. Log the entire Stripe session payload ---
//     console.log('✅ Stripe payment completed:', JSON.stringify(session, null, 2))

//     // --- 2. If it's a subscription, call update-premium ---
//     if (session.mode === 'subscription') {
//       // Retrieve the email from metadata or customer details
//       const email =
//         session.metadata?.user_email ||
//         session.customer_details?.email ||
//         session.customer_email || ''
//       if (email) {
//         // Call your FastAPI endpoint to update premium status
//         const updateRes = await fetch(`${BACKEND_BASE}update-premium`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//           body: new URLSearchParams({
//             user_email: email,
//             is_premium: 'true',
//           }),
//         })
//         const updateText = await updateRes.text()
//         // Log the FastAPI response for debugging
//         console.log('🔔 update-premium response:', updateRes.status, updateText)
//       } else {
//         console.error('❗ No user email found in session for update-premium.')
//       }
//     }
//   }

//   // ... (optional: handle other events)
//   return NextResponse.json({ received: true })
// }
