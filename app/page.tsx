'use client'
export const dynamic = 'force-dynamic'  // ← add this

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'

export default function LinkedInCallback() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const router = useRouter()
  const { setUser } = useAuth()

  useEffect(() => {
    if (!code) return

    fetch('/api/linkedin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setUser(data.user)
          router.push('/dashboard')
        } else {
          router.push('/?error=login')
        }
      })
      .catch(() => router.push('/?error=login'))
  }, [code, router, setUser])

  return <p className="p-8 text-center">Finishing sign-in…</p>
}
