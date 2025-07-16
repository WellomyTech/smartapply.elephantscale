'use client'
export const dynamic = 'force-dynamic'   // force client‐only, no prerender

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function LinkedInCallback() {
  const router = useRouter()
  const { setUser } = useAuth()

  useEffect(() => {
    // 1️⃣ read the “code” query param from the real URL
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (!code) {
      // no code → back home with error
      router.replace('/?error=login')
      return
    }

    // 2️⃣ call your API to exchange and fetch user
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

  // simple loading state
  return <p className="p-8 text-center">Finishing sign-in…</p>
}
