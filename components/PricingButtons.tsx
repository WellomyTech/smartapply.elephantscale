"use client";

import { useCallback, useState } from "react";
import PricingModal from "@/components/PricingModal";
import { PLANS } from "@/lib/pricing"; // TOP_UPS not needed here
import { useAuth } from "@/components/AuthProvider";

type SelectItem = { kind: "plan" | "topup"; id: string; priceId: string };

function getModeFor(item: SelectItem): "payment" | "subscription" {
  if (item.kind === "topup") return "payment";
  const plan = PLANS.find((p) => p.id === item.id);
  return plan?.type === "recurring" ? "subscription" : "payment";
}

export default function PricingButtons({
  label = "Buy credits",
  className = "inline-flex items-center rounded-md bg-slate-900 text-white px-3 py-2 text-sm hover:bg-slate-800",
}: {
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const onSelect = useCallback(
    async (item: SelectItem) => {
      try {
        const mode = getModeFor(item);
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            priceId: item.priceId,
            // server ignores mode, kept for backward compat if needed
            mode,
            quantity: 1,
            successUrl: `${
              window.location.origin
            }/pricing/success?plan=${encodeURIComponent(item.id)}`,
            cancelUrl: window.location.href,
            userEmail: user?.email ?? undefined,
          }),
        });
        if (!res.ok) {
          console.error("Checkout request failed", await res.text());
          return;
        }
        const { url } = await res.json();
        if (url) window.location.href = url;
      } catch (e) {
        console.error("Checkout error", e);
      }
    },
    [user?.email]
  );

  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>
        {label}
      </button>
      <PricingModal open={open} onOpenChange={setOpen} onSelect={onSelect} />
    </>
  );
}
