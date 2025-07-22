"use client";

import { useState } from "react";

const PRICES = {
  //   FREE: "price_1RmKPwAgbqMxQURg228OXuAo",
  //   SINGLE: "price_1RmKPwAgbqMxQURghj5BpH18",
  //   MONTHLY: "price_1RmKPwAgbqMxQURg7r2KZF59",
  FREE: "price_1RnRGHAgbqMxQURgomfydKNz",
  SINGLE: "price_1RnR7bAgbqMxQURgkkJlS11x",
  MONTHLY: "price_1RnR7vAgbqMxQURgeHeQvG3i",
};

export default function PricingButtons() {
  const [loading, setLoading] = useState<string | null>(null);

  async function checkout(priceId: string) {
    setLoading(priceId);
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    });
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <div className="flex flex-col gap-4 my-6">
      {/* Free */}
      <button
        disabled={loading === PRICES.FREE}
        onClick={() => checkout(PRICES.FREE)}
        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
      >
        {loading === PRICES.FREE ? "Redirecting…" : "Try 1 resume free"}
      </button>

      {/* Single */}
      <button
        disabled={loading === PRICES.SINGLE}
        onClick={() => checkout(PRICES.SINGLE)}
        className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
      >
        {loading === PRICES.SINGLE ? "Redirecting…" : "Buy 1 credit – $7"}
      </button>

      {/* Monthly */}
      <button
        disabled={loading === PRICES.MONTHLY}
        onClick={() => checkout(PRICES.MONTHLY)}
        className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
      >
        {loading === PRICES.MONTHLY ? "Redirecting…" : "Unlimited – $29/mo"}
      </button>
    </div>
  );
}
