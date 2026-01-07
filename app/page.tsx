// app/page.tsx
'use client'
export const dynamic = 'force-dynamic'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from '@/components/AuthProvider'
import LinkedInLoginButton from '@/components/LinkedInButton'
import GoogleButton from '@/components/GoogleButton'
import { Briefcase, Loader2, Sparkles, Zap, Target, Users, FileText, Mic, Brain, CheckCircle, ArrowRight, TrendingUp, Clock, Shield, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// Add custom animation styles
const floatingAnimation = `
@keyframes float1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -30px) scale(1.1); }
  50% { transform: translate(-20px, 20px) scale(0.9); }
  75% { transform: translate(40px, 10px) scale(1.05); }
}
@keyframes float2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(-40px, 30px) scale(1.15); }
  66% { transform: translate(25px, -25px) scale(0.95); }
}
@keyframes float3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  20% { transform: translate(35px, 35px) scale(1.1); }
  40% { transform: translate(-30px, -20px) scale(0.9); }
  60% { transform: translate(20px, -35px) scale(1.05); }
  80% { transform: translate(-25px, 25px) scale(1.15); }
}
@keyframes float4 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  30% { transform: translate(-35px, -30px) scale(1.1); }
  60% { transform: translate(40px, 20px) scale(0.95); }
}
@keyframes float5 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, 40px) scale(1.15); }
  50% { transform: translate(-35px, -25px) scale(0.9); }
  75% { transform: translate(25px, -30px) scale(1.05); }
}
@keyframes float2D1 {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(60px, -50px); }
  50% { transform: translate(-40px, 45px); }
  75% { transform: translate(50px, 35px); }
}
@keyframes float2D2 {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(-55px, 60px); }
  66% { transform: translate(45px, -45px); }
}
@keyframes float2D3 {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(50px, 55px); }
  40% { transform: translate(-60px, -35px); }
  60% { transform: translate(40px, -50px); }
  80% { transform: translate(-45px, 40px); }
}
@keyframes float2D4 {
  0%, 100% { transform: translate(0, 0); }
  30% { transform: translate(-50px, -60px); }
  60% { transform: translate(65px, 40px); }
}
@keyframes float2D5 {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(45px, 65px); }
  50% { transform: translate(-60px, -45px); }
  75% { transform: translate(55px, -50px); }
}
`

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
    <main className="min-h-screen bg-white dark:bg-slate-950 relative overflow-hidden">
      {/* Hero Section with Deep Blue Gradient Background - WellomyTech Style */}
      <section className="w-full px-6 lg:px-8 pt-20 pb-24 md:pt-32 md:pb-40 relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#1e40af] to-[#2563eb]" aria-label="Hero section">
        <style dangerouslySetInnerHTML={{ __html: floatingAnimation }} />
        {/* Animated Background Graphics - Enhanced Visibility with Random Movement */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60" style={{ zIndex: 0 }}>
          {/* Primary cyan orb - top left - floating animation */}
          <div 
            className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(34, 211, 238, 1) 0%, rgba(6, 182, 212, 0.7) 40%, transparent 70%)',
              animation: 'float1 8s ease-in-out infinite'
            }}
          />
          
          {/* Secondary blue orb - bottom right - floating animation */}
          <div 
            className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full mix-blend-screen filter blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.9) 0%, rgba(37, 99, 235, 0.7) 40%, transparent 70%)',
              animation: 'float2 10s ease-in-out infinite'
            }}
          />
          
          {/* Indigo accent orb - center - floating animation */}
          <div 
            className="absolute top-1/2 left-1/3 w-[400px] h-[400px] rounded-full mix-blend-screen filter blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.9) 0%, rgba(79, 70, 229, 0.7) 40%, transparent 70%)',
              animation: 'float3 12s ease-in-out infinite'
            }}
          />
          
          {/* Light cyan orb - right side - floating animation */}
          <div 
            className="absolute top-1/4 right-1/4 w-[350px] h-[350px] rounded-full mix-blend-screen filter blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(147, 197, 253, 0.8) 0%, rgba(96, 165, 250, 0.6) 40%, transparent 70%)',
              animation: 'float4 9s ease-in-out infinite'
            }}
          />
          
          {/* Teal accent orb - bottom left - floating animation */}
          <div 
            className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full mix-blend-screen filter blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(20, 184, 166, 0.8) 0%, rgba(14, 165, 233, 0.6) 40%, transparent 70%)',
              animation: 'float5 11s ease-in-out infinite'
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              <span className="text-xs font-medium text-white/90">Powered by AI</span>
            </div>
            
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[1.1]">
                Land your dream job
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed font-light">
                AI-powered resume builder, interview prep, and job matching—all in one platform
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* Key Features Section - White Background with Glowing Orbs */}
      <section className="w-full py-24 md:py-32 bg-white dark:bg-slate-950 relative overflow-hidden" aria-label="Key features">
        {/* Animated glowing orbs background - 2D random movement with spacing */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-10 left-[5%] w-32 h-32 rounded-full bg-blue-400 blur-xl" style={{ animation: 'float2D1 6s ease-in-out infinite' }} />
          <div className="absolute top-20 right-[8%] w-40 h-40 rounded-full bg-indigo-400 blur-2xl" style={{ animation: 'float2D2 8s ease-in-out infinite' }} />
          <div className="absolute bottom-32 left-[20%] w-36 h-36 rounded-full bg-cyan-400 blur-xl" style={{ animation: 'float2D3 10s ease-in-out infinite' }} />
          <div className="absolute top-[35%] right-[25%] w-28 h-28 rounded-full bg-blue-500 blur-2xl" style={{ animation: 'float2D4 7s ease-in-out infinite' }} />
          <div className="absolute bottom-[15%] right-[18%] w-44 h-44 rounded-full bg-indigo-500 blur-xl" style={{ animation: 'float2D5 9s ease-in-out infinite' }} />
        </div>
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                Everything you need to get hired
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light">
                Professional tools powered by AI to accelerate your job search
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
            <div className="group">
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center mb-6">
                  <FileText className="h-6 w-6 text-white dark:text-slate-900" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">AI Resume Builder</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Create ATS-optimized resumes and cover letters tailored to any job description in minutes.
                </p>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    ATS-friendly formatting
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Job-specific customization
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Cover letter generation
                  </li>
                </ul>
              </div>
            </div>

            <div className="group">
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center mb-6">
                  <Mic className="h-6 w-6 text-white dark:text-slate-900" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Interview Practice</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Practice with AI voice agents for both technical and behavioral interviews.
                </p>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Voice-powered practice
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Role-specific questions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Real-time feedback
                  </li>
                </ul>
              </div>
            </div>

            <div className="group">
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center mb-6">
                  <Target className="h-6 w-6 text-white dark:text-slate-900" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Smart Job Matching</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Get personalized job recommendations based on your skills and preferences.
                </p>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Skill-based matching
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Application tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Save & organize jobs
                  </li>
                </ul>
              </div>
            </div>

            <div className="group">
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center mb-6">
                  <Brain className="h-6 w-6 text-white dark:text-slate-900" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Job Kit Scanner</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Analyze job descriptions and identify skill gaps with AI-powered insights.
                </p>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Skills gap analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Match scoring
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Improvement tips
                  </li>
                </ul>
              </div>
            </div>

            <div className="group">
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center mb-6">
                  <Users className="h-6 w-6 text-white dark:text-slate-900" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Application Tracking</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Track all your applications and manage your job search in one place.
                </p>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Centralized dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Progress tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Save favorites
                  </li>
                </ul>
              </div>
            </div>

            <div className="group">
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
                <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-white dark:text-slate-900" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Document Library</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Access all your generated resumes, cover letters, and documents anytime.
                </p>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Version history
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Easy downloads
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400"></div>
                    Cloud storage
                  </li>
                </ul>
              </div>
            </div>
          </div>
          </div>
        </section>

      {/* How It Works Section - Darker Gray Background - NO ORBS for alternating effect */}
      <section className="w-full py-24 md:py-32 bg-slate-100 dark:bg-slate-900 relative overflow-hidden" aria-label="How it works">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                How it works
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-light">
                Get hired in four simple steps
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center">
                  <span className="text-2xl font-bold text-white dark:text-slate-900">1</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Upload resume</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Start with your existing resume or create from scratch
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center">
                  <span className="text-2xl font-bold text-white dark:text-slate-900">2</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Add job details</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Paste the job description you're applying for
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center">
                  <span className="text-2xl font-bold text-white dark:text-slate-900">3</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Get optimized docs</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Receive tailored resume and cover letter instantly
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center">
                  <span className="text-2xl font-bold text-white dark:text-slate-900">4</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Practice & apply</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Prepare with AI interview practice and apply
                </p>
              </div>
            </div>
          </div>
        </section>

      {/* Stats Section - White Background with Glowing Orbs */}
      <section className="w-full py-20 md:py-24 bg-white dark:bg-slate-950 relative overflow-hidden" aria-label="Stats">
        {/* Animated glowing orbs background - 2D random movement with spacing - BEHIND content */}
        <div className="absolute inset-0 pointer-events-none opacity-22 z-0">
          <div className="absolute top-12 left-[10%] w-36 h-36 rounded-full bg-blue-300 blur-2xl" style={{ animation: 'float2D2 7s ease-in-out infinite' }} />
          <div className="absolute top-16 right-[12%] w-40 h-40 rounded-full bg-indigo-300 blur-xl" style={{ animation: 'float2D3 9s ease-in-out infinite' }} />
          <div className="absolute bottom-16 left-[22%] w-32 h-32 rounded-full bg-cyan-300 blur-2xl" style={{ animation: 'float2D4 8s ease-in-out infinite' }} />
          <div className="absolute top-[45%] right-[28%] w-28 h-28 rounded-full bg-blue-400 blur-xl" style={{ animation: 'float2D5 7.5s ease-in-out infinite' }} />
        </div>
          <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
            {/* Glass card container for stats */}
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-3xl border border-white/20 dark:border-slate-700/20 shadow-xl p-12">
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">10x</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Faster applications</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">95%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">ATS pass rate</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-2">50k+</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Jobs landed</div>
              </div>
            </div>
            </div>
          </div>
        </section>

      {/* Final CTA Section - Light Blue Tint */}
      <section id="login" className="w-full py-24 md:py-32 scroll-mt-20 bg-gradient-to-br from-blue-50/30 to-indigo-50/20 dark:from-blue-950/20 dark:to-indigo-950/10" aria-label="Sign up">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
              Start landing interviews today
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-12 font-light">
              Join thousands of job seekers using SmartApply to get hired faster
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <GoogleButton />
              <LinkedInLoginButton />
            </div>
            
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-8">
              Free to start • No credit card required
            </p>
          </div>
        </section>
    </main>
  )
}
