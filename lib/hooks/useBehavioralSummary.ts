// lib/hooks/useBehavioralSummary.ts
"use client";
import useSWR from "swr";
import { useAuth } from "@/components/AuthProvider";

type TopicKey = "communication" | "leadership" | "team_player";
type Range = "7d" | "30d" | "90d";
export type BehavioralSummaryResponse = {
  range: Range;
  topics: Record<TopicKey, { latest: number|null; avg: number|null; delta7d: number|null }>;
};

const PUBLIC_API = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, ""); // trim trailing /

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`Request failed: ${r.status}`);
  return r.json();
});

export function useBehavioralSummary(range: Range = "30d") {
  const { user } = useAuth();
  const email = user?.email;
  const path = `/api/behavioral/summary?range=${range}&user_email=${encodeURIComponent(email ?? "")}`;
  const key = email ? (PUBLIC_API ? `${PUBLIC_API}${path}` : path) : null;
  return useSWR<BehavioralSummaryResponse>(key, fetcher, { revalidateOnFocus: false });
}
