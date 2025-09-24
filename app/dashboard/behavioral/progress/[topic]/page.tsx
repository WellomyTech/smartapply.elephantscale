"use client";

import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useBehavioralSubskills } from "@/lib/hooks/useBehavioralSubskills";

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
