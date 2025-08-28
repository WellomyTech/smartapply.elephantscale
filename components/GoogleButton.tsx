'use client'
import { Button } from '@/components/ui/button'

export default function GoogleButton() {
  const handleLogin = () => {
    const params = new URLSearchParams({
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
  )
}
