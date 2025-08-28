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
    })
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  }

  const linkedinLogin = () => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID || '',
      redirect_uri: `${window.location.origin}/api/social-auth/callback?provider=linkedin`,
      scope: 'r_liteprofile r_emailaddress',
    })
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params}`
  }

  return (
    <div className="space-y-3">
      <Button variant="outline" className="w-full" onClick={googleLogin}>
        Continue with Google
      </Button>
      <Button className="w-full" onClick={linkedinLogin}>
        Continue with LinkedIn
      </Button>
    </div>
  )
}
