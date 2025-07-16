// app/linkedin/callback/page.tsx
'use client'
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function LinkedInCallback() {
  const router = useRouter()
  const { setUser } = useAuth()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (!code) {
      router.replace('/?error=login')
      return
    }

    fetch('/api/linkedin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setUser(data.user)
          router.replace('/dashboard')
        } else {
          router.replace('/?error=login')
        }
      })
      .catch(() => {
        router.replace('/?error=login')
      })
  }, [router, setUser])

  return <p className="p-8 text-center">Finishing sign-in…</p>
}
