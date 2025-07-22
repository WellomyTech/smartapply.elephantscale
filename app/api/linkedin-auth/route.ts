import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { code } = await req.json()

  const REDIRECT_URI   = process.env.NEXT_PUBLIC_REDIRECT_URI as string
  const CLIENT_ID      = process.env.LINKEDIN_CLIENT_ID      as string
  const CLIENT_SECRET  = process.env.LINKEDIN_CLIENT_SECRET  as string
  const API_KEY = process.env.API_LINK

  // 1️⃣  Exchange authorization code for access token
  const tokenParams = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  })

  const tokenRes = await fetch(
    'https://www.linkedin.com/oauth/v2/accessToken',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: tokenParams.toString(),
    }
  )

  if (!tokenRes.ok) {
    const detail = await tokenRes.text()
    return NextResponse.json(
      { error: 'token_error', detail },
      { status: tokenRes.status }
    )
  }

  const { access_token } = await tokenRes.json()

  // 2️⃣  Fetch basic profile & email via OpenID Connect
  const userinfoRes = await fetch(
    'https://api.linkedin.com/v2/userinfo',
    { headers: { Authorization: `Bearer ${access_token}` } }
  )

  if (!userinfoRes.ok) {
    const detail = await userinfoRes.text()
    return NextResponse.json(
      { error: 'userinfo_error', detail },
      { status: userinfoRes.status }
    )
  }

  const userinfo = await userinfoRes.json()

  // 3️⃣  Fetch the localizedHeadline (current position)
  let headline = ''
  try {
    const meRes = await fetch(
      'https://api.linkedin.com/v2/me?projection=(localizedHeadline)',
      { headers: { Authorization: `Bearer ${access_token}` } }
    )
    if (meRes.ok) {
      const meData = await meRes.json()
      headline = meData.localizedHeadline ?? ''
    }
  } catch {
    // ignore errors, headline stays empty
  }

  // 4️⃣  Return merged user object
  return NextResponse.json({
    ok: true,
    user: {
      ...userinfo,
      headline,              // e.g. “Senior Software Engineer at TechCorp”
    },
  })
}
