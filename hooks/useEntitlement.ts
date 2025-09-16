'use client'

import useSWR from 'swr'
import { useAuth } from '@/components/AuthProvider'

const MAX_FREE = 1
const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then(r => r.json())

export function useEntitlement() {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE

  const { user } = useAuth()

  /* build the URL **only** when we have a defined e-mail */
  // inside useEntitlement.ts
const key = user?.email
  ? `${API_URL}user-dashboard?user_email=${encodeURIComponent(user.email)}`
  : null   // SWR waits until we have an e-mail

  const { data, error, isLoading, mutate } = useSWR(key, fetcher, {
    revalidateOnFocus: false,
  })

  const isPremium   = data?.is_premium ?? false
  const freeUsed    = data?.free_used  ?? 0
  const freeRemain  = Math.max(0, MAX_FREE - freeUsed)
  const canGenerate = isPremium || freeUsed < MAX_FREE

  return { isLoading, error, isPremium, freeUsed, freeRemain, canGenerate, mutate }
}