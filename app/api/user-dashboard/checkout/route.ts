import { NextRequest, NextResponse } from 'next/server'

// const CLOUD_RUN_BASE =
//   process.env.CLOUD_RUN_DASHBOARD_URL ??
//   'https://api-705060578323.us-central1.run.app/user-dashboard'

  const API_URL = process.env.NEXT_PUBLIC_API_BASE   // e.g. https://api-7050…run.app/


export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get('user_email')
  if (!email) {
    return NextResponse.json({ error: 'missing user_email' }, { status: 400 })
  }

  const proxyUrl = `${API_URL}user-dashboard?user_email=${encodeURIComponent(email)}`
  try {
    const rsp = await fetch(proxyUrl, { cache: 'no-store' })
    if (!rsp.ok) {
      return NextResponse.json(
        { error: 'cloud-run error', status: rsp.status },
        { status: rsp.status },
      )
    }
    return NextResponse.json(await rsp.json())
  } catch (e) {
    return NextResponse.json({ error: 'proxy failed' }, { status: 500 })
  }
}