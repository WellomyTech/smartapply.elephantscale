// app/page.tsx
'use client'
export const dynamic = 'force-dynamic'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import  LinkedInButton  from "@/components/LinkedInButton"
import { useAuth } from "@/components/AuthProvider"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // If already signed in, redirect to dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="font-semibold text-xl text-gray-900">Smart Job Kit Generator</div>
            <div className="flex items-center space-x-4">
              {user && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photo || "/placeholder.svg"} alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="max-w-2xl w-full space-y-6">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">Smart Job Kit Generator</h1>
            <p className="text-xl text-gray-600">
              Generate personalized resumes and cover letters tailored to any job posting using AI.
            </p>
          </div>

          {/* Login Card */}
          <Card className="rounded-2xl border p-8 bg-white shadow-lg">
            <CardContent className="flex flex-col items-center space-y-6 p-0">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900">Get Started</h2>
                <p className="text-gray-600">
                  Sign in with your LinkedIn account to begin generating your job application materials.
                </p>
              </div>
              <div className="w-full max-w-sm">
                <LinkedInButton />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
