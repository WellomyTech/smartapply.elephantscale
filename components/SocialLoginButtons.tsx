<<<<<<< HEAD
'use client'
import { Button } from '@/components/ui/button'

export default function SocialLoginButtons() {
  const googleLogin = () => {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/api/social-auth/callback?provider=google`,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
=======
import React from "react"

export default function SocialLoginButtons() {
  // Add your Google and LinkedIn client IDs to .env as NEXT_PUBLIC_GOOGLE_CLIENT_ID, etc.
  const googleLogin = () => {
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      redirect_uri: `${window.location.origin}/api/social-auth/callback?provider=google`,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account"
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  const linkedinLogin = () => {
    const params = new URLSearchParams({
<<<<<<< HEAD
      response_type: 'code',
      client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/api/social-auth/callback?provider=linkedin`,
      scope: 'r_liteprofile r_emailaddress',
=======
      response_type: "code",
      client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || "",
      redirect_uri: `${window.location.origin}/api/social-auth/callback?provider=linkedin`,
      scope: "r_liteprofile r_emailaddress"
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
    })
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params}`
  }

  return (
<<<<<<< HEAD
    <div className="space-y-3">
      <Button variant="outline" className="w-full" onClick={googleLogin}>
        Continue with Google
      </Button>
      <Button className="w-full" onClick={linkedinLogin}>
        Continue with LinkedIn
      </Button>
=======
    <div className="space-y-4">
      <button className="w-full bg-white border rounded-xl py-2 flex items-center justify-center shadow-sm hover:bg-gray-100" onClick={googleLogin}>
        <img src="/google-logo.svg" alt="Google" className="h-5 mr-2" />
        Sign in with Google
      </button>
      <button className="w-full bg-[#0077b5] text-white rounded-xl py-2 flex items-center justify-center shadow-sm hover:bg-[#0a66c2]" onClick={linkedinLogin}>
        <img src="/linkedin-logo.svg" alt="LinkedIn" className="h-5 mr-2" />
        Sign in with LinkedIn
      </button>
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
    </div>
  )
}
