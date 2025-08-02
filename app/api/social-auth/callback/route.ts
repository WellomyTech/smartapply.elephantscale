import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const provider = url.searchParams.get("provider");
  const code = url.searchParams.get("code");

  // Use absolute URL for base
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  if (!provider || !code) {
    return NextResponse.redirect(`${baseUrl}/?error=missing_params`);
  }

  let user: any = {};
  let error: string | undefined;

  if (provider === "google") {
    // Exchange code for tokens
    const params = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${baseUrl}/api/social-auth/callback?provider=google`,
      grant_type: "authorization_code"
    });
    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });
    const tokens = await tokenResp.json();
    if (!tokens.access_token) {
      error = "google_token_failed";
    } else {
      // Fetch user profile
      const profileResp = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      user = await profileResp.json();
      user.provider = "google";
    }

    // Linkedin 

 } else if (provider === "linkedin") {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: `${baseUrl}/api/social-auth/callback?provider=linkedin`,
    client_id: process.env.LINKEDIN_CLIENT_ID!,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
  });
  const tokenResp = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });
  const tokens = await tokenResp.json();
  if (!tokens.access_token) {
    error = "linkedin_token_failed";
  } else {
    // Only fetch userinfo from OpenID Connect endpoint!
    const profileResp = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    });
    const profile = await profileResp.json();
    user = {
      id: profile.sub,
      name: profile.name || (
        profile.given_name && profile.family_name
          ? `${profile.given_name} ${profile.family_name}`
          : profile.given_name || ""
      ),
      email: profile.email ?? null,
      picture: profile.picture ?? null,
      provider: "linkedin",
    };
  }
}
  else {
    error = "invalid_provider";
  }

  // **Redirect on error (absolute URL)**
  if (error) {
    return NextResponse.redirect(`${baseUrl}/?error=${error}`);
  }

  // Serialize user object for redirect (base64 or url encode)
  const userParam = encodeURIComponent(Buffer.from(JSON.stringify(user)).toString("base64"));
  // **Redirect to social-auth-redirect with absolute URL**
  return NextResponse.redirect(`${baseUrl}/social-auth-redirect?user=${userParam}`);
}
