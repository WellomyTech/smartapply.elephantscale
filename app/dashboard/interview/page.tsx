"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Target,
  Brain,
  MessageSquare,
  Mic,
  ListChecks,
  ShieldCheck,
  FileText,
  ArrowRight,
} from "lucide-react";
import InterviewScanList from "@/components/InterviewScanList";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const API_URL = process.env.NEXT_PUBLIC_API_BASE;

export default function InterviewPage() {
  const router = useRouter();
  const t = useTranslations("interview");
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      setError(null);
      try {
        const userEmail =
          localStorage.getItem("user_email") ||
          localStorage.getItem("userEmail");
        if (!userEmail) {
          setError(t("errors.noEmail"));
          setLoading(false);
          return;
        }
        const res = await fetch(
          `${API_URL}user-dashboard?user_email=${encodeURIComponent(userEmail)}`
        );
        const data = await res.json();
        if (Array.isArray(data?.reports)) {
          setReports(
            data.reports.map((r: any) => ({
              ...r,
              job_title: r.job_title || "Untitled role",
              job_company: r.job_company || "—",
            }))
          );
        } else {
          setReports([]);
        }
      } catch {
        setError(t("errors.fetchFailed"));
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* New global header */}
      <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50 px-6 py-6 text-center shadow-sm">
        {/* <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 border border-slate-200 text-slate-700">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          <span className="text-xs font-medium">Technical Interview Dashboard</span>
        </div> */}
        <h1 className="mt-3 text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 bg-clip-text text-transparent">
          {t("header.title")}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {t("header.subtitle")}
        </p>
      </div>

      {reports.length === 0 ? (
        <>
          {/* Primary CTA */}
          <Card className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl border-2 border-slate-200/50 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300 mb-4">
                <div className="p-2 rounded-lg bg-blue-100/70 dark:bg-blue-900/30">
                  <Target className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {t("empty.ctaTitle")}
                </h2>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                {t("empty.ctaBody")}
              </p>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={() => router.push("/job-kit")}
              >
                <div className="flex items-center gap-2 justify-center w-full">
                  <Sparkles className="h-5 w-5" />
                  {t("common.startJobScan")}
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* What you get */}
          <Card className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl border-2 border-slate-200/50 dark:border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                {t("what.title")}
              </h3>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3 w-fit">
                    <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t("what.items.qa.title")}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t("what.items.qa.body")}
                  </p>
                </div>

                <div className="flex flex-col p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-3 w-fit">
                    <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t("what.items.behavioral.title")}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t("what.items.behavioral.body")}
                  </p>
                </div>

                <div className="flex flex-col p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-3 w-fit">
                    <ListChecks className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t("what.items.bank.title")}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t("what.items.bank.body")}
                  </p>
                </div>

                <div className="flex flex-col p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-3 w-fit">
                    <Mic className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t("what.items.modes.title")}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t("what.items.modes.body")}
                  </p>
                </div>

                <div className="flex flex-col p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
                  <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-900/30 mb-3 w-fit">
                    <FileText className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t("what.items.templates.title")}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t("what.items.templates.body")}
                  </p>
                </div>

                <div className="flex flex-col p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 mb-3 w-fit">
                    <ShieldCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t("what.items.ats.title")}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t("what.items.ats.body")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How it works */}
          <Card className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl border-2 border-slate-200/50 dark:border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                {t("how.title")}
              </h3>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("how.steps.1.title")}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t("how.steps.1.body")}
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-3">
                    <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("how.steps.2.title")}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t("how.steps.2.body")}
                  </p>
                </div>

                <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-3">
                    <ListChecks className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {t("how.steps.3.title")}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t("how.steps.3.body")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pro tips */}
          <Card className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl shadow-xl border-2 border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-4">
                {t("tips.title")}
              </h3>
              <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  {t("tips.items.1")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  {t("tips.items.2")}
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  {t("tips.items.3")}
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Final CTA */}
          <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-semibold mb-2">
                {t("final.title")}
              </h3>
              <p className="mb-4 opacity-90">
                {t("final.body")}
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-green-700 hover:bg-white/90 font-semibold"
                onClick={() => router.push("/job-kit")}
              >
                <div className="flex items-center gap-2">
                  {t("common.startJobScan")}
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Button>
            </CardContent>
          </Card>
        </>
      ) : (
        <InterviewScanList reports={reports} />
      )}
    </div>
  );
}
