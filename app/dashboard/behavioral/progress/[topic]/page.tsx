"use client";

import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useBehavioralSubskills } from "@/lib/hooks/useBehavioralSubskills";
import { useEffect, useMemo, useRef, useState } from "react";

const Radar = dynamic(() => import("@/components/behavioral/SubskillRadar"), {
  ssr: false,
});
const SeriesGrid = dynamic(
  () => import("@/components/behavioral/SubskillSeriesGrid"),
  {
    ssr: false,
  }
);

export default function TopicProgressPage() {
  const { topic } = useParams<{
    topic: "communication" | "leadership" | "team_player";
  }>();
  const sp = useSearchParams();
  const range = (sp.get("range") || "30d") as "7d" | "30d" | "90d";
  const { data, isLoading } = useBehavioralSubskills(topic, range);

  return (
    <main className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold capitalize">
          {topic} Progress
        </h1>
        <Link
          href="/dashboard/behavioral/progress"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          Back
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <RangeLink topic={topic} range="7d" current={range} />
        <RangeLink topic={topic} range="30d" current={range} />
        <RangeLink topic={topic} range="90d" current={range} />
      </div>

      {/* Sessions horizontal scroller */}
      {!isLoading && data ? (
        <SessionStrip
          topic={topic}
          sessions={(data as any)?.sessions ?? []}
        />
      ) : null}

      {isLoading || !data ? (
        <div className="text-slate-600">Loading…</div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
              <h3 className="font-semibold mb-3">Sub-skills (latest)</h3>
              <Radar data={data} />
            </div>
            <div className="rounded-xl border bg-white dark:bg-slate-900 p-4">
              <h3 className="font-semibold mb-3">Trends ({range})</h3>
              <SeriesGrid data={data} />
            </div>
          </div>
          {/* TODO: add session table when backend is ready */}
        </>
      )}
    </main>
  );
}

function RangeLink({
  topic,
  range,
  current,
}: {
  topic: string;
  range: "7d" | "30d" | "90d";
  current: string;
}) {
  const active = current === range;
  return (
    <Link
      href={`/dashboard/behavioral/progress/${topic}?range=${range}`}
      className={`px-3 py-1.5 rounded-lg text-sm border ${
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white border-slate-200 hover:bg-slate-50"
      }`}
    >
      {range}
    </Link>
  );
}

// Utility + scroller
type SessionLike = {
  id?: string | number;
  date?: string;
  timestamp?: string | number;
  createdAt?: string;
  updatedAt?: string;
  type?: string;
  topic?: string;
  grade?: string | number;
  score?: number;
};

function parseToDateLite(v: unknown): Date | null {
  if (v == null) return null;
  if (v instanceof Date && !isNaN(v.getTime())) return v;
  if (typeof v === "number" && !isNaN(v)) {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof v === "string") {
    const t = v.trim();
    if (/^\d+$/.test(t)) {
      const n = Number(t);
      const d = new Date(n < 1e12 ? n * 1000 : n);
      return isNaN(d.getTime()) ? null : d;
    }
    const n = Date.parse(t);
    if (!isNaN(n)) {
      const d = new Date(n);
      return isNaN(d.getTime()) ? null : d;
    }
  }
  return null;
}

function SessionStrip({
  topic,
  sessions,
}: {
  topic: "communication" | "leadership" | "team_player";
  sessions: SessionLike[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const items = useMemo(() => {
    const list = Array.isArray(sessions) ? sessions.slice() : [];
    // latest first
    list.sort((a, b) => {
      const ta =
        parseToDateLite(a.timestamp ?? a.date ?? a.createdAt ?? a.updatedAt)?.getTime() ??
        0;
      const tb =
        parseToDateLite(b.timestamp ?? b.date ?? b.createdAt ?? b.updatedAt)?.getTime() ??
        0;
      return tb - ta;
    });
    // fallback mock if empty
    if (list.length === 0) {
      return [
        { id: "mock-1", date: new Date().toISOString(), type: topic, grade: "B+" },
        {
          id: "mock-2",
          date: new Date(Date.now() - 86400000).toISOString(),
          type: topic,
          grade: "A-",
        },
        {
          id: "mock-3",
          date: new Date(Date.now() - 2 * 86400000).toISOString(),
          type: topic,
          grade: "B",
        },
      ] as SessionLike[];
    }
    return list;
  }, [sessions, topic]);

  const updateArrows = () => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => updateArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => updateArrows();
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [items.length]);

  const scrollByAmount = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amt = Math.max(280, Math.floor(el.clientWidth * 0.9));
    el.scrollBy({ left: dir === "left" ? -amt : amt, behavior: "smooth" });
  };

  const formatDate = (d: unknown) => {
    const dt = parseToDateLite(d);
    if (!dt) return "—";
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

  const cap = (s: string | undefined) =>
    s ? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "";

  return (
    <div className="relative">
      {canLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByAmount("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 m-1 rounded-full bg-white/90 dark:bg-slate-900/90 border shadow px-2 py-1"
        >
          ‹
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-smooth gap-4 py-2 px-1"
      >
        {items.map((s, i) => (
          <div
            key={String(s.id ?? i)}
            className="min-w-[250px] rounded-xl border bg-white dark:bg-slate-900 p-4"
          >
            <div className="text-sm text-slate-500">
              {formatDate(s.timestamp ?? s.date ?? s.createdAt ?? s.updatedAt)}
            </div>
            <div className="mt-1 font-semibold">
              {cap((s.type as string) ?? (s.topic as string) ?? topic)}
            </div>
            <div className="mt-2 text-slate-700 dark:text-slate-300">
              Grade: <span className="font-medium">{s.grade ?? s.score ?? "—"}</span>
            </div>
          </div>
        ))}
      </div>

      {canRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByAmount("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 m-1 rounded-full bg-white/90 dark:bg-slate-900/90 border shadow px-2 py-1"
        >
          ›
        </button>
      )}
    </div>
  );
}
