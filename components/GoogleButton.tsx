import React from "react"

export default function GoogleButton() {
  const handleLogin = () => {
    const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
    redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/social-auth/callback?provider=google`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
  });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  }

  return (
    <button
      className="w-full bg-white border rounded-xl py-2 flex items-center justify-center shadow-sm hover:bg-gray-100"
      onClick={handleLogin}
    >
      Sign in with Google
    </button>
  )
}
