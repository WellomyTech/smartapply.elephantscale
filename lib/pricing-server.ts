// Authoritative server-side catalog for Stripe Price IDs → mode/credits.
// Throws on missing env vars to avoid misconfiguration in production.

export type CatalogItem =
  | {
      kind: 'plan'
      planId: 'starter_pass' | 'monthly_credits' | 'quarterly_value'
      priceId: string
      mode: 'payment' | 'subscription'
      credits: number
      expiresInDays?: number
      rolloverCap?: number
    }
  | {
      kind: 'topup'
      packId: 'pack_2' | 'pack_4' | 'pack_6'
      priceId: string
      mode: 'payment'
      credits: number
    }

function reqEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}

const PRICE_STARTER = reqEnv('NEXT_PUBLIC_PRICE_STARTER')
const PRICE_MONTHLY = reqEnv('NEXT_PUBLIC_PRICE_MONTHLY')
const PRICE_QUARTERLY = reqEnv('NEXT_PUBLIC_PRICE_QUARTERLY')
const PRICE_PACK_2 = reqEnv('NEXT_PUBLIC_PRICE_PACK_2')
const PRICE_PACK_4 = reqEnv('NEXT_PUBLIC_PRICE_PACK_4')
const PRICE_PACK_6 = reqEnv('NEXT_PUBLIC_PRICE_PACK_6')

export const CATALOG: CatalogItem[] = [
  {
    kind: 'plan',
    planId: 'starter_pass',
    priceId: PRICE_STARTER,
    mode: 'payment',
    credits: 12,
    expiresInDays: 7,
  },
  {
    kind: 'plan',
    planId: 'monthly_credits',
    priceId: PRICE_MONTHLY,
    mode: 'subscription',
    credits: 30,
    rolloverCap: 60,
  },
  {
    kind: 'plan',
    planId: 'quarterly_value',
    priceId: PRICE_QUARTERLY,
    mode: 'subscription',
    credits: 75,
    rolloverCap: 150,
  },
  { kind: 'topup', packId: 'pack_2', priceId: PRICE_PACK_2, mode: 'payment', credits: 2 },
  { kind: 'topup', packId: 'pack_4', priceId: PRICE_PACK_4, mode: 'payment', credits: 4 },
  { kind: 'topup', packId: 'pack_6', priceId: PRICE_PACK_6, mode: 'payment', credits: 6 },
]

export function lookupByPriceId(priceId: string): CatalogItem | undefined {
  return CATALOG.find((i) => i.priceId === priceId)
}

export function isSubscriptionPrice(priceId: string): boolean {
  const item = lookupByPriceId(priceId)
  return item?.mode === 'subscription'
}
