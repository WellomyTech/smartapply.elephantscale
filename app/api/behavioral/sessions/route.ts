import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  // TODO: persist to DB (scored later via webhook or async job)
  // For now, echo back
  return NextResponse.json({ ok: true, received: body });
}