// app/page.tsx
'use client'
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import LinkedInLoginButton from '@/components/LinkedInButton'
import { Briefcase } from 'lucide-react'
import GoogleButton from '@/components/GoogleButton'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // If already signed in, redirect to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
    
  }, [isLoading, user, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full space-y-6 text-center">
        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
          <Briefcase className="h-8 w-8" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900">
          Smart Job Kit Generator
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600">
          Create personalized job application materials with AI assistance
        </p>

        {/* Login Button */}
        <div className="w-full">
          <LinkedInLoginButton />
        </div>
        <div>
      {/* other login buttons */}
          <GoogleButton />
        </div>

        {/* Footer Note */}
        <p className="text-sm text-gray-400">
          Secure OAuth 2.0 authentication with LinkedIn & Google
        </p>
      </div>
    </div>
  )
}
