"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ApplicationOptionsPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const queryUrl = sp.get("url") || sp.get("linkedin_url") || "";

  const safeDecode = (u: string) => {
    try {
      return decodeURIComponent(u);
    } catch {
      return u;
    }
  };

  const getJobFromSession = () => {
    if (typeof window === "undefined") return null as any;
    try {
      const raw = sessionStorage.getItem("applicationJob");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null as any;
    }
  };

  const getLinkedInUrl = () => {
    const q = queryUrl?.trim();
    if (q) return safeDecode(q);
    if (typeof window !== "undefined") {
      const st: any = window.history?.state || {};
      const s1 = st?.job?.linkedin_url || st?.linkedin_url || "";
      if (s1) return safeDecode(String(s1));
      const ses = getJobFromSession();
      const sesUrl = ses?.linkedin_url || ses?.profileUrl || ses?.url;
      if (sesUrl) return String(sesUrl);
    }
    return "";
  };

  // Navigate to Job Kit instead of resume-builder
  const handleCustomize = () => router.push("/job-kit");
  const handleProceed = () => {
    const url = getLinkedInUrl();
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-brand-blue/10 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-10">
      <div className="w-full max-w-3xl text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-brand-blue">
          How would you like to continue?
        </h1>

        <div className="grid grid-cols-1 gap-5">
          {/* Customize Resume card */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleCustomize}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleCustomize()}
            className="cursor-pointer rounded-2xl border bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-0.5 p-6 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <div className="max-w-md mx-auto">
              <Button
                onClick={handleCustomize}
                className="w-full py-5 text-lg rounded-xl text-white font-medium bg-brand-blue hover:bg-brand-blue/90 shadow-md hover:shadow-lg transition-all duration-200"
              >
                Customize Resume
              </Button>
            </div>
          </div>

          {/* Proceed to Apply card */}
          <div
            role="button"
            tabIndex={0}
            onClick={handleProceed}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleProceed()}
            className="cursor-pointer rounded-2xl border bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-0.5 p-6 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <div className="max-w-md mx-auto">
              <Button
                onClick={handleProceed}
                className="w-full h-12 text-base rounded-xl text-white bg-brand-blue hover:bg-brand-blue/90 shadow-md transition-all duration-200 hover:brightness-105 hover:-translate-y-[1px] hover:shadow-lg"
              >
                Skip & Proceed to Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
