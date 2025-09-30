import { NextRequest, NextResponse } from "next/server";

type Topic = "communication" | "leadership" | "team_player";

const SUBSKILLS: Record<Topic, string[]> = {
  communication: [
    "clarity",
    "concision",
    "active_listening",
    "audience_adaptation",
    "structure_flow",
    "tone_presence",
  ],
  leadership: [
    "ownership_accountability",
    "influence",
    "decision_quality",
    "risk_management",
    "outcomes_impact",
    "learning_mindset",
    "vision",
    "delegation"
  ],
  team_player: [
    "collaboration",
    "conflict_resolution",
    "empathy_inclusion",
    "communication_support",
    "reliability_followthrough",
    "feedback_practice",
    "outcomes_team_impact",
    "adaptibility",
  ],
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const topic = (searchParams.get("topic") || "communication") as Topic;
  const range = (searchParams.get("range") || "30d") as "7d" | "30d" | "90d";

  const keys = SUBSKILLS[topic] || [];
  const now = new Date();
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;

  const seriesDates = Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toISOString().slice(0, 10);
  });

  const subskills = Object.fromEntries(
    keys.map((k) => [
      k,
      {
        latest: null as number | null,
        avg: null as number | null,
        delta7d: null as number | null,
        series: seriesDates.map((t) => ({ t, v: null as number | null })),
      },
    ])
  );

  return NextResponse.json({
    topic,
    overall: { latest: null, avg: null, delta7d: null },
    range,
    subskills,
  });
}