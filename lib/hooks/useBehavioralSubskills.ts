// lib/hooks/useBehavioralSubskills.ts
"use client";
import useSWR from "swr";
import { useAuth } from "@/components/AuthProvider";

const PUBLIC_API = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/+$/, "");

const fetcher = (url: string) => fetch(url).then(r => {
  if (!r.ok) throw new Error(`Request failed: ${r.status}`);
  return r.json();
});

export function useBehavioralSubskills(
  topic: "communication" | "leadership" | "team_player",
  range: "7d" | "30d" | "90d" = "30d"
) {
  const { user } = useAuth();
  const email = user?.email;
  const path = `/api/behavioral/subskills?topic=${topic}&range=${range}&user_email=${encodeURIComponent(email ?? "")}`;
  const key = email ? (PUBLIC_API ? `${PUBLIC_API}${path}` : path) : null;
  return useSWR(key, fetcher, { revalidateOnFocus: false });
}
