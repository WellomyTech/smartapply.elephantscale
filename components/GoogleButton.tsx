<<<<<<< HEAD
'use client'
import { Button } from '@/components/ui/button'
=======
import React from "react"
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369

export default function GoogleButton() {
  const handleLogin = () => {
    const params = new URLSearchParams({
<<<<<<< HEAD
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/social-auth/callback?provider=google`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleLogin}>
      Continue with Google
    </Button>
=======
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
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
  )
}
