// app/page.tsx
'use client'
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import LinkedInLoginButton from '@/components/LinkedInButton'
import GoogleButton from '@/components/GoogleButton'
import { Briefcase, Loader2, Sparkles, Zap, Target, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const tApp = useTranslations('app')
  const tHome = useTranslations('home')
  const tAuth = useTranslations('auth')

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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{tApp('tagline')}</span>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {tApp('name')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              {tHome('heroSubtitle')}
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {tHome('heroDescription')}
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{tHome('features.resumeTitle')}</h3>
              <p className="text-sm text-muted-foreground">
                {tHome('features.resumeDescription')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{tHome('features.interviewTitle')}</h3>
              <p className="text-sm text-muted-foreground">
                {tHome('features.interviewDescription')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{tHome('features.matchingTitle')}</h3>
              <p className="text-sm text-muted-foreground">
                {tHome('features.matchingDescription')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Login Section */}
        <div className="flex justify-center">
          <Card className="max-w-md w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-white/20 shadow-2xl">
            <CardContent className="p-8 space-y-6 text-center">
              <div className="space-y-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">{tApp('getStarted')}</h2>
                <p className="text-muted-foreground">
                  {tApp('signinUnlock')}
                </p>
              </div>

              <div className="space-y-4">
                <LinkedInLoginButton />
                <GoogleButton />
                <p className="text-xs text-muted-foreground">
                  🔒 {tAuth('secureOAuth')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
