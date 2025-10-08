"use client";

import { useEffect, useState } from "react";
import PricingModal from "@/components/PricingModal";

export default function PricingDemoPage() {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(true), []);
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <PricingModal open={open} onOpenChange={setOpen} />
    </main>
  );
}
