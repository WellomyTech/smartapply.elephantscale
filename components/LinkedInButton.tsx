'use client'
import { Button } from '@/components/ui/button'

export default function LinkedInLoginButton() {
  const CLIENT_ID = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID
  const REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL}/api/social-auth/callback?provider=linkedin`
  const SCOPE = ['openid', 'profile', 'email'].join(' ')
  const loginUrl =
    `https://www.linkedin.com/oauth/v2/authorization` +
    `?response_type=code` +
    `&client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(SCOPE)}`

  return (
    <a href={loginUrl} className="w-full">
      <Button className="w-full">Continue with LinkedIn</Button>
    </a>
  )
}
