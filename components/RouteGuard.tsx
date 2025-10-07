'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  children: React.ReactNode
  requireResume?: boolean
}

export default function RouteGuard({ children, requireResume }: Props) {
  const router = useRouter()
  const [ok, setOk] = useState(!requireResume)

  useEffect(() => {
    let cancelled = false
    async function check() {
      try {
        const email = typeof window !== 'undefined' ? localStorage.getItem('user_email') || '' : ''
        const resp = await fetch(`/api/me/resume-status${email ? `?user_email=${encodeURIComponent(email)}` : ''}`, {
          cache: 'no-store',
          headers: email ? { 'x-user-email': email } : undefined,
          credentials: 'same-origin',
        })
        if (resp.status === 401) {
          if (!cancelled) router.replace('/')
          return
        }
        const data = await resp.json()
        const has = !!data?.hasResume
        if (requireResume && !has) {
          if (!cancelled) router.replace('/upload?from=guard=1&next=/job-suggestions')
          return
        }
        if (!cancelled) setOk(true)
      } catch {
        if (!cancelled && requireResume) router.replace('/upload?from=guard=1&err=guard')
      }
    }
    check()
    return () => { cancelled = true }
  }, [router, requireResume])

  if (!ok) return null
  return <>{children}</>
}
