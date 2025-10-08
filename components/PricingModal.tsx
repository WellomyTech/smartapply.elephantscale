"use client";

import { useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CREDITS_CONFIG, PLANS, TOP_UPS } from "@/lib/pricing";

type SelectItem = { kind: "plan" | "topup"; id: string; priceId: string };

export default function PricingModal({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSelect?: (item: SelectItem) => void;
}) {
  const handleSelect = useCallback(
    (item: SelectItem) => {
      if (onSelect) onSelect(item);
      else console.log("selected:", item);
    },
    [onSelect]
  );

  const fmtPrice = (cents: number) =>
    (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 });

  const perCredit = (priceCents: number, credits: number) =>
    `≈ ${(priceCents / 100 / credits).toFixed(2)} / credit`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl">You’ve exhausted your free credits</DialogTitle>
          <DialogDescription>Choose a plan—or buy credit packs.</DialogDescription>
        </DialogHeader>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((p) => (
            <Card key={p.id} className="relative shadow-sm">
              {p.badge && (
                <span className="absolute right-3 top-3 text-xs rounded-full bg-slate-900 text-white px-2 py-0.5">
                  {p.badge}
                </span>
              )}
              <CardHeader className="pb-2">
                <div className="text-sm text-slate-600">{p.label}</div>
                <div className="text-2xl font-bold">
                  {fmtPrice(p.priceCents)} <span className="text-sm font-medium text-slate-500">{p.periodLabel}</span>
                </div>
                <div className="text-xs text-slate-500">{perCredit(p.priceCents, p.credits)}</div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <ul className="list-disc list-inside text-slate-700 space-y-1">
                  <li>{p.credits} credits</li>
                  {"expiresInDays" in p && p.expiresInDays ? <li>Expires in {p.expiresInDays} days</li> : null}
                  {p.type === "recurring" && p.rolloverCap ? (
                    <li>Rollover up to {p.rolloverCap} credits</li>
                  ) : null}
                  <li>Use credits on any service</li>
                </ul>
                <Button className="w-full mt-3" onClick={() => handleSelect({ kind: "plan", id: p.id, priceId: p.priceId })}>
                  Choose
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center my-2">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="px-3 text-xs text-slate-500">Or buy credit packs (PAYG)</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* PAYG packs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TOP_UPS.map((t) => (
            <Card key={t.id} className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="text-sm text-slate-600">{t.label}</div>
                <div className="text-xl font-bold">{fmtPrice(t.priceCents)} <span className="text-sm text-slate-500">one-time</span></div>
                <div className="text-xs text-slate-500">{perCredit(t.priceCents, t.credits)}</div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => handleSelect({ kind: "topup", id: t.id, priceId: t.priceId })}>
                  Buy pack
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Credits legend */}
        <div className="mt-4">
          <div className="text-xs font-medium text-slate-500 mb-2">Credits legend</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            {Object.entries(CREDITS_CONFIG).map(([key, cfg]) => (
              <div key={key} className="rounded-md border border-slate-200 px-3 py-2 text-sm flex items-center justify-between bg-white">
                <span className="text-slate-700">{cfg.label}</span>
                <span className="text-slate-500">{cfg.credits} cr</span>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}