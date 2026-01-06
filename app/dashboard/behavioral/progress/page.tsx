"use client";

import Link from "next/link";

export default function BehavioralProgressIndex() {
  const cards = [
    {
      href: "/dashboard/behavioral/progress/communication",
      title: "Communication",
    },
    { href: "/dashboard/behavioral/progress/leadership", title: "Leadership" },
    {
      href: "/dashboard/behavioral/progress/team_player",
      title: "team_player",
    },
  ];
  return (
    <main className="p-6 md:p-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Behavioral Progress</h1>
      <p className="text-slate-600 mb-6">
        Track your progress across topics and drill into sub-skills.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border bg-white dark:bg-slate-900 p-5 hover:shadow transition"
          >
            <div className="text-lg font-semibold">{c.title}</div>
            <div className="text-sm text-slate-500 mt-1">
              View detailed charts
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
