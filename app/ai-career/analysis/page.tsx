"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { FileText, TrendingUp, ArrowRight, Clock, Target, ArrowLeft, User, LogOut, Sparkles, Brain } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useAuth } from '@/components/AuthProvider'

export default function AnalysisSelection() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const resumeData = useAppStore((state) => state.resumeData)
  const setAnalysisType = useAppStore((state) => state.setAnalysisType)

  useEffect(() => {
    if (!user) {
      router.replace("/")
    } else if (!resumeData) {
      router.replace("/upload")
    }
  }, [user, resumeData, router])

  const handleQuickAnalysis = () => {
    setAnalysisType("quick")
    router.push("/ai-career/report")
  }

  const handleDetailedAnalysis = () => {
    setAnalysisType("detailed")
    router.push("/ai-career/psychometric")
  }

  const handleBack = () => {
    router.push("/upload")
  }

  const handleSignOut = () => {
    logout()
  }

  if (!user || !resumeData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Back to Upload"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <div className="mr-3">
                  <img
                    src={'/elephant-logo.png'}
                    alt="ElephantScale logo"
                    className="w-30 h-10 object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user!.name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-6">
            <Brain className="w-4 h-4 mr-2" />
            Step 2 of 3 - Choose Analysis Type
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analysis Type
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the type of career analysis that best fits your needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Quick Analysis Option */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="p-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Quick Report</h3>

              <div className="flex items-center justify-center mb-6">
                <Clock className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-600 font-medium">5-10 minutes</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="ml-3 text-gray-700">Resume-based career path analysis</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="ml-3 text-gray-700">3 AI-proof career recommendations</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="ml-3 text-gray-700">Skills gap analysis</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="ml-3 text-gray-700">Market viability scores</span>
                </li>
              </ul>

              <button
                onClick={handleQuickAnalysis}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Generate Quick Report
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>

          {/* Detailed Analysis Option */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-purple-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative">
            <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-bl-2xl text-sm font-semibold">
              RECOMMENDED
            </div>

            <div className="p-8 pt-12">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">
                Detailed Report with Psychometric Analysis
              </h3>

              <div className="flex items-center justify-center mb-6">
                <Target className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-600 font-medium">15-20 minutes</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="ml-3 text-gray-700">Everything in Quick Report</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="ml-3 text-gray-700">Industry-specific psychometric assessment</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="ml-3 text-gray-700">Personality-matched career paths</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="ml-3 text-gray-700">Alternative career suggestions</span>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <span className="ml-3 text-gray-700">Detailed action plan</span>
                </li>
              </ul>

              <button
                onClick={handleDetailedAnalysis}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Psychometric Assessment
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Resume Summary */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <FileText className="w-6 h-6 mr-3 text-blue-600" />
            Resume Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <span className="text-sm font-semibold text-blue-700 block mb-2">Industry</span>
              <span className="text-lg font-bold text-gray-900">{resumeData.industry}</span>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <span className="text-sm font-semibold text-green-700 block mb-2">Experience</span>
              <span className="text-lg font-bold text-gray-900">{resumeData.experience}</span>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <span className="text-sm font-semibold text-purple-700 block mb-2">Current Role</span>
              <span className="text-lg font-bold text-gray-900">{resumeData.currentRole}</span>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <span className="text-sm font-semibold text-orange-700 block mb-2">Education</span>
              <span className="text-lg font-bold text-gray-900">{resumeData.education}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
