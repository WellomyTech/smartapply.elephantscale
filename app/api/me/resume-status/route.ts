import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const email = req.headers.get("x-user-email") || url.searchParams.get("user_email") || "";
  if (!email) {
    return NextResponse.json({ hasResume: false, error: "missing_email" }, { status: 401, headers: { "Cache-Control": "no-store" } });
  }
  const API = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/?$/, "/") || "";
  try {
    const resp = await fetch(`${API}user-dashboard?user_email=${encodeURIComponent(email)}`, {
      cache: "no-store",
      headers: { "Accept": "application/json" },
    });
    if (!resp.ok) {
      return NextResponse.json({ hasResume: false, error: `upstream_${resp.status}` }, { status: resp.status, headers: { "Cache-Control": "no-store" } });
    }
    const data: any = await resp.json();
    const has = typeof data?.has_resume !== "undefined" ? (data.has_resume === 1 || data.has_resume === true) : !!data?.hasResume || !!data?.uploaded;
    return NextResponse.json({ hasResume: has, raw: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ hasResume: false, error: "network" }, { status: 200, headers: { "Cache-Control": "no-store" } });
  }
}
