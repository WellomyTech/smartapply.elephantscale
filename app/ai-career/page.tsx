"use client"

import { useRouter } from "next/navigation"
import { useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import {
  Linkedin,
  Brain,
  TrendingUp,
  Shield,
  Users,
  Sparkles,
  Zap,
  Target,
  CheckCircle,
  ArrowRight,
  Briefcase,
} from "lucide-react"
import LinkedInLoginButton from '@/components/LinkedInButton'
import GoogleButton from '@/components/GoogleButton'
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard')
    }
  }, [isLoading, user, router])

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-primary-600" />,
      title: "AI-Powered Analysis",
      description:
        "Advanced AI algorithms analyze your resume and career trajectory to identify optimal paths forward.",
    },
    {
      icon: <Shield className="w-8 h-8 text-primary-600" />,
      title: "AI-Proof Career Paths",
      description: "Discover careers that leverage uniquely human skills and are resilient to automation.",
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary-600" />,
      title: "Data-Driven Insights",
      description: "Real-time labor market data ensures recommendations are current and actionable.",
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: "Psychometric Assessment",
      description: "Optional in-depth personality analysis for more personalized career recommendations.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="mr-3">
                  <img
                    src={'/elephant-logo.png'}
                    alt="ElephantScale logo"
                    className="w-30 h-10 object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-1">
                <a
                  href="#features"
                  className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50"
                >
                  How It Works
                </a>
                <button
                  onClick={() => router.push("/testing")}
                  className="text-gray-600 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50"
                >
                  Test Parser
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 opacity-70"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-8">
              <Zap className="w-4 h-4 mr-2" />
              AI-Powered Career Intelligence
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
              <span className="block bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Your Future
              </span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Starts Here
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-12 leading-relaxed">
              Discover AI-proof career paths with personalized insights. Transform your professional journey with
              data-driven recommendations tailored just for you.
            </p>

        <div className="flex justify-center">
          <Card className="max-w-md w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-white/20 shadow-2xl">
            <CardContent className="p-8 space-y-6 text-center">
              <div className="space-y-2">
                
                <h2 className="text-2xl font-bold">Get Started</h2>
                <p className="text-muted-foreground">
                  Sign in to unlock your career potential
                </p>
              </div>

              <div className="space-y-4">
                <LinkedInLoginButton />
                <GoogleButton />
                <p className="text-xs text-muted-foreground">
                  🔒 Secure OAuth 2.0 authentication with LinkedIn & Google
                </p>
              </div>
            </CardContent>
          </Card>
        </div>


            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>100% Secure</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>AI-Powered Analysis</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>Instant Results</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Powerful Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything you need for
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                career success
              </span>
            </h2>
            <p className="max-w-2xl mx-auto text-xl text-gray-600">
              Our comprehensive platform combines cutting-edge AI with proven career development methodologies.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-8 bg-white rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>

                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-4">
              <Target className="w-4 h-4 mr-2" />
              Simple Process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How ElephantScale
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Transforms Careers
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-1/3 w-1/3 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 transform -translate-y-1/2"></div>
            <div className="hidden md:block absolute top-1/2 right-1/3 w-1/3 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 transform -translate-y-1/2"></div>

            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Resume</h3>
                <p className="text-gray-600">
                  Connect with LinkedIn and upload your resume for comprehensive AI-powered analysis.
                </p>
              </div>
            </div>

            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Choose Analysis</h3>
                <p className="text-gray-600">
                  Select between quick resume analysis or detailed psychometric assessment.
                </p>
              </div>
            </div>

            <div className="text-center relative">
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Get Report</h3>
                <p className="text-gray-600">Receive your personalized career path report with actionable insights.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/90 to-purple-600/90"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-white/5 rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to discover
            <span className="block bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text text-transparent">
              your future?
            </span>
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of professionals who have transformed their careers with AI-powered insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              //onClick={handleLinkedInLogin}
              className="group px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center"
            >
              <Linkedin className="w-6 h-6 mr-3" />
              Get Started Now
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            <button
              onClick={() => router.push("/testing")}
              className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/30 hover:bg-white/30 transition-all duration-300 flex items-center"
            >
              Try Parser Demo
              <Zap className="w-5 h-5 ml-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-8 md:mb-0">
              <div className="mr-3">
                  <img
                    src={'/elephant-logo.png'}
                    alt="ElephantScale logo"
                    className="w-30 h-10 object-contain"
                  />
                </div>
            </div>

            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm mb-2">© 2025 ElephantScale. All rights reserved.</p>
              <p className="text-gray-500 text-sm">AI-Powered Career Intelligence Platform</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
