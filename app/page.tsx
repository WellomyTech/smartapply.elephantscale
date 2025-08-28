// app/page.tsx
'use client'
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import LinkedInLoginButton from '@/components/LinkedInButton'
import GoogleButton from '@/components/GoogleButton'
import { Briefcase, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-[70vh] grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Briefcase className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Smart Job Kit Generator</h1>
            <p className="text-muted-foreground">
              Create personalized job application materials with AI assistance.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-full">
              <LinkedInLoginButton />
            </div>
            <div className="w-full">
              <GoogleButton />
            </div>
            <p className="text-xs text-muted-foreground">
              Secure OAuth 2.0 authentication with LinkedIn & Google
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
