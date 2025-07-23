/* components/PricingButtons.tsx
   Modal that shows the two paid plans.
   ───────────────────────────────────────────────────────── */
'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

/* ── Pricing plan config ────────────────────────────── */
const PLANS = [
  {
    id: 'single',
    label: 'Single-use credit',
    priceId: process.env.NEXT_PUBLIC_PRICE_SINGLE ?? 'price_test_single',
    priceText: '$7',
    features: ['1 credit', 'No renewal'],
  },
  {
    id: 'monthly',
    label: 'Unlimited (monthly)',
    priceId: process.env.NEXT_PUBLIC_PRICE_MONTHLY ?? 'price_test_monthly',
    priceText: '$29 / mo',
    features: ['Unlimited credits', 'Cancel anytime'],
  },
] as const

type Plan = (typeof PLANS)[number]

/* ── Component ───────────────────────────────────────── */
export default function PricingModal(props: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { open, onOpenChange } = props
  const [busy, setBusy] = useState<string | null>(null)

  async function checkout(plan: Plan) {
    if (!plan.priceId) return
    setBusy(plan.id)

    try {
      const rsp = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.priceId }),
      })
      if (!rsp.ok) throw new Error('checkout failed')
      const { url } = await rsp.json()

      /* ── Debug flag: don’t redirect, just log ── */
      if (process.env.NEXT_PUBLIC_DEBUG_NO_REDIRECT === 'true') {
        console.log('🔗 Stripe URL (debug, no redirect):', url)
      } else {
        window.location.href = url
      }
    } catch (err) {
      console.error(err)
      setBusy(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>You’ve exhausted your free credits</DialogTitle>
          <DialogDescription>
            Choose one of the options below to keep generating.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          {PLANS.map((plan) => (
            <Card key={plan.id} className="shadow-sm">
              <CardHeader>
                <CardTitle>{plan.priceText}</CardTitle>
                <CardDescription>{plan.label}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <ul className="space-y-1 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-1">
                      <Check className="h-4 w-4 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>

                <Button
                  disabled={busy === plan.id}
                  onClick={() => checkout(plan)}
                  className="w-full mt-4"
                >
                  {busy === plan.id ? 'Redirecting…' : 'Choose'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}