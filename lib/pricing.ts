export const CREDITS_CONFIG = {
  resume:     { label: "Customize Resume",              credits: 2 },
  behavioral: { label: "Behavioral Interview Practice", credits: 3 },
  technical:  { label: "Technical Interview Practice",  credits: 4 },
  scan:       { label: "Recruiter Application Scan",    credits: 1 },
} as const;

export const PLANS = [
  {
    id: "starter_pass",
    label: "7-Day Starter Pass",
    badge: "Low commitment",
    type: "one_time" as const,
    priceId: process.env.NEXT_PUBLIC_PRICE_STARTER ?? "price_starter_7d",
    priceCents: 900,
    credits: 12,
    periodLabel: " / 7 days",
    expiresInDays: 7,
  },
  {
    id: "monthly_credits",
    label: "Monthly Credits",
    badge: "Most popular",
    type: "recurring" as const,
    priceId: process.env.NEXT_PUBLIC_PRICE_MONTHLY ?? "price_monthly",
    priceCents: 1900,
    credits: 30,
    periodLabel: " / mo",
    rolloverCap: 60,
  },
  {
    id: "quarterly_value",
    label: "Quarterly Value",
    badge: "Best value",
    type: "recurring" as const,
    priceId: process.env.NEXT_PUBLIC_PRICE_QUARTERLY ?? "price_quarterly",
    priceCents: 3900,
    credits: 75,
    periodLabel: " / 3 mo",
    rolloverCap: 150,
  },
] as const;

export const TOP_UPS = [
  { id: "pack_2", label: "2 credits", priceId: process.env.NEXT_PUBLIC_PRICE_PACK_2 ?? "price_pack_2", priceCents: 200, credits: 2 },
  { id: "pack_4", label: "4 credits", priceId: process.env.NEXT_PUBLIC_PRICE_PACK_4 ?? "price_pack_4", priceCents: 300, credits: 4 },
  { id: "pack_6", label: "6 credits", priceId: process.env.NEXT_PUBLIC_PRICE_PACK_6 ?? "price_pack_6", priceCents: 400, credits: 6 },
] as const;