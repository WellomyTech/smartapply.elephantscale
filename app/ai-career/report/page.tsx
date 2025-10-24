"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  TrendingUp,
  Shield,
  Brain,
  Star,
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Target,
  Zap,
  BookOpen,
  Trophy,
  Briefcase,
  Clock,
  BarChart3,
  User,
  LogOut,
  Sparkles,
  XCircle,
} from "lucide-react"
import { useAppStore } from "@/lib/store"
import { useAuth } from '@/components/AuthProvider'
import { PremiumReportService } from '@/lib/premium-report-service'

export default function ReportGeneration() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const resumeData = useAppStore((state) => state.resumeData)
  const analysisType = useAppStore((state) => state.analysisType) || 'quick'
  const psychometricResults = useAppStore((state) => state.psychometricResults)

  const [isGenerating, setIsGenerating] = useState(true)
  const [reportData, setReportData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isLoading) return
    if (!user) { router.replace('/'); return }
    if (!resumeData) { router.replace('/upload'); return }

    const generate = async () => {
      try {
        setIsGenerating(true)
        setError(null)
        const data = await PremiumReportService.generatePremiumReport(
          resumeData,
          psychometricResults,
          analysisType
        )
        setReportData(data)
      } catch (e: any) {
        setError(e?.message || 'Failed to generate report')
      } finally {
        setIsGenerating(false)
      }
    }

    generate()
  }, [isLoading, user, resumeData, analysisType, psychometricResults, router])

  const handleSignOut = () => {
    logout()
  }

  const handleBack = () => {
    router.push("/ai-career/dashboard")
  }

  const generatePersonalityExplanation = (personalityType: string) => {
    const explanations: Record<string, string[]> = {
      "Strategic Leader": [
        "Your responses show strong leadership tendencies and strategic thinking capabilities",
        "You prefer to influence others through clear direction and vision-setting",
        "Your decision-making style combines data analysis with long-term strategic planning",
        "You thrive in environments where you can drive organizational success and innovation",
      ],
      "Analytical Thinker": [
        "Your assessment reveals a systematic approach to problem-solving and decision-making",
        "You consistently prefer data-driven analysis over intuitive decision-making",
        "Your attention to detail and methodical thinking style are key strengths",
        "You excel in environments that value precision, accuracy, and logical reasoning",
      ],
      "Creative Innovator": [
        "Your responses demonstrate a strong inclination toward innovation and creative problem-solving",
        "You embrace new ideas and technologies, often being an early adopter",
        "Your thinking style combines creativity with practical implementation",
        "You thrive in dynamic environments that encourage experimentation and boundary-pushing",
      ],
    }

    return (
      explanations[personalityType] || [
        "Your assessment reveals a unique combination of traits",
        "Your balanced approach draws from multiple methodologies",
        "Your adaptability allows you to excel in different environments",
        "Your diverse skill set makes you valuable in various roles",
      ]
    )
  }

  if (!user || !resumeData) {
    return null
  }

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Brain className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Generating Your Report</h2>
          <p className="text-lg text-gray-600 mb-8">
            Our AI is analyzing your profile and generating personalized career recommendations...
          </p>
          <div className="space-y-3 text-left">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-gray-700">Analyzing resume data</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
              <span className="text-gray-700">Processing market trends</span>
            </div>
            <div className="flex items-center">
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
              <span className="text-gray-700">Generating career recommendations</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-auto text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Could not generate report</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => router.refresh()} className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold">Try Again</button>
            <button onClick={() => router.push('/ai-career/analysis')} className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold">Back to Analysis</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      {/* <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Back to Dashboard"
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
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
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
      </nav> */}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Executive Summary */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold mb-6">
              <Trophy className="w-5 h-5 mr-2" />
              Premium Career Intelligence Report
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Career Analysis Report</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">{reportData.executiveSummary?.overview}</p>
          </div>

          {/* Key Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Market Value</h3>
              <p className="text-2xl font-bold text-green-600">
                ${reportData.marketPosition?.currentValue?.currentEstimate?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">Current Estimate</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Growth Potential</h3>
              <p className="text-2xl font-bold text-blue-600">
                {reportData.marketPosition?.currentValue?.improvementPotential}
              </p>
              <p className="text-sm text-gray-600">Salary Increase</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Market Position</h3>
              <p className="text-2xl font-bold text-purple-600">Strong</p>
              <p className="text-sm text-gray-600">Industry Ranking</p>
            </div>

            <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">AI Resistance</h3>
              <p className="text-2xl font-bold text-orange-600">
                {100 - (reportData.riskAssessment?.automationRisk?.score || 15)}%
              </p>
              <p className="text-sm text-gray-600">Future-Proof Score</p>
            </div>
          </div>

          {/* Key Findings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Zap className="w-6 h-6 text-yellow-500 mr-3" />
              Key Findings & Opportunities
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {reportData.executiveSummary?.keyFindings?.map((finding: string, index: number) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{finding}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Market Intelligence Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <BarChart3 className="w-8 h-8 text-blue-600 mr-4" />
            Market Intelligence & Salary Benchmarks
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Salary Benchmarks */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <DollarSign className="w-6 h-6 text-green-600 mr-2" />
                Salary Benchmarks
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">25th Percentile</span>
                  <span className="font-bold text-gray-900">
                    ${reportData.marketPosition?.salaryBenchmarks?.percentiles?.p25?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">50th Percentile (Median)</span>
                  <span className="font-bold text-gray-900">
                    ${reportData.marketPosition?.salaryBenchmarks?.percentiles?.p50?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">75th Percentile</span>
                  <span className="font-bold text-green-600">
                    ${reportData.marketPosition?.salaryBenchmarks?.percentiles?.p75?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">90th Percentile</span>
                  <span className="font-bold text-green-700">
                    ${reportData.marketPosition?.salaryBenchmarks?.percentiles?.p90?.toLocaleString()}
                  </span>
                </div>
                <div className="pt-4 border-t border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-semibold">YoY Growth</span>
                    <span className="font-bold text-green-600">
                      {reportData.marketPosition?.salaryBenchmarks?.growth}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Negotiation Intelligence */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Target className="w-6 h-6 text-blue-600 mr-2" />
                Negotiation Intelligence
              </h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-600">Salary Negotiation Room</span>
                  <p className="font-bold text-blue-600 text-lg">
                    {reportData.marketPosition?.negotiationInsights?.salaryNegotiationRoom}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Key Leverage Points</span>
                  <ul className="mt-2 space-y-1">
                    {reportData.marketPosition?.negotiationInsights?.keyLeveragePoints?.map(
                      (point: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700 flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          {point}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
                <div className="pt-4 border-t border-blue-200">
                  <span className="text-sm text-gray-600">Best Time to Negotiate</span>
                  <p className="font-semibold text-gray-900 text-sm">
                    {reportData.marketPosition?.negotiationInsights?.bestTimeToNegotiate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Paying Companies */}
          <div className="bg-gray-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Briefcase className="w-6 h-6 text-purple-600 mr-2" />
              Top Paying Companies in Your Field
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {reportData.marketPosition?.salaryBenchmarks?.companies?.map((company: string, index: number) => (
                <div key={index} className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <Briefcase className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{company}</p>
                  <p className="text-xs text-gray-600">Hiring Now</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Industry-specific Psychometric Assessment - detailed only */}
        {analysisType === "detailed" && reportData.industryFit && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Brain className="w-8 h-8 text-purple-600 mr-4" />
              Industry-specific Psychometric Assessment
            </h2>

            {reportData.psychometricInsights?.narrative && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6">
                <p className="text-gray-800">{reportData.psychometricInsights.narrative}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {reportData.industryFit?.fitByIndustry?.map((fit: any, idx: number) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-900">{fit.industry}</h4>
                    <span className="text-sm font-bold text-blue-600">{fit.fit}% Fit</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                      style={{ width: `${fit.fit}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{fit.rationale}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personality Analysis Section - Only for detailed reports */}
        {analysisType === "detailed" && reportData.personalityAnalysis && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
              <Brain className="w-8 h-8 text-purple-600 mr-4" />
              Your Personality Profile
            </h2>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {reportData.personalityAnalysis?.profile?.type || "Balanced Professional"}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {reportData.personalityAnalysis?.profile?.description ||
                      "A well-rounded professional with diverse strengths"}
                  </p>
                </div>
              </div>
            </div>

            {/* Top 3 Dominant Traits */}
            <div className="mb-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Your Dominant Traits</h4>
              <div className="grid md:grid-cols-3 gap-4">
                {reportData.personalityAnalysis?.profile?.dominantTraits
                  ?.slice(0, 3)
                  .map((trait: any, index: number) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <span className="text-white font-bold text-lg">{trait.score}%</span>
                      </div>
                      <h5 className="font-semibold text-gray-900 mb-2">{trait.trait}</h5>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${trait.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Personality Explanation */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Why You're a {reportData.personalityAnalysis?.profile?.type || "Balanced Professional"}
              </h4>
              <div className="space-y-3 text-gray-700">
                {generatePersonalityExplanation(reportData.personalityAnalysis?.profile?.type).map(
                  (explanation, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span>{explanation}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {/* Skills Intelligence Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <BookOpen className="w-8 h-8 text-purple-600 mr-4" />
            Skills Intelligence & ROI Analysis
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Current Skills Market Value */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="w-6 h-6 text-purple-600 mr-2" />
                Your Skills Market Value
              </h3>
              <div className="space-y-4">
                {reportData.skillsIntelligence?.currentSkills?.slice(0, 5).map((skill: any, index: number) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-purple-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">{skill.skill}</span>
                      <span className="text-sm font-bold text-purple-600">{skill.avgSalaryBoost}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Demand: {skill.demand}</span>
                      <span>{skill.jobs?.toLocaleString()} jobs</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Gap Analysis */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Target className="w-6 h-6 text-orange-600 mr-2" />
                Priority Skills to Develop
              </h3>
              <div className="space-y-4">
                {reportData.skillsIntelligence?.skillGaps?.slice(0, 4).map((gap: any, index: number) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-orange-200">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">{gap.skill}</span>
                      <span className="text-sm font-bold text-orange-600">{gap.salaryImpact}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Priority: {gap.priority}</span>
                      <span>{gap.timeToAcquire}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Learning ROI Calculator */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-6 h-6 text-green-600 mr-2" />
              Learning Investment ROI Calculator
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {reportData.skillsIntelligence?.skillsROI?.slice(0, 3).map((roi: any, index: number) => (
                <div key={index} className="bg-white rounded-xl p-4 text-center border border-green-200">
                  <h4 className="font-bold text-gray-900 mb-2">{roi.skill}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Investment:</span>
                      <span className="font-semibold">{roi.investmentCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Salary Boost:</span>
                      <span className="font-semibold text-green-600">{roi.currentValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ROI:</span>
                      <span className="font-bold text-green-700">{roi.roi}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payback:</span>
                      <span className="font-semibold">{roi.paybackPeriod}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Career Strategy & Timeline */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
            <Clock className="w-8 h-8 text-indigo-600 mr-4" />
            Strategic Career Roadmap
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* AI-Powered Strategies */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Brain className="w-6 h-6 text-indigo-600 mr-2" />
                AI-Powered Career Strategies
              </h3>
              <div className="space-y-4">
                {reportData.careerStrategy?.aiStrategies?.map((strategy: any, index: number) => (
                  <div key={index} className="bg-white rounded-xl p-4 border border-indigo-200">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm">{strategy.strategy}</h4>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          strategy.impact === "Very High"
                            ? "bg-green-100 text-green-700"
                            : strategy.impact === "High"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {strategy.impact}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{strategy.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>Timeline: {strategy.timeframe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Roadmap */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-6 h-6 text-green-600 mr-2" />
                90-Day Action Plan
              </h3>
              <div className="space-y-4">
                {Object.entries(reportData.careerStrategy?.timelineRoadmap || {})
                  .slice(0, 3)
                  .map(([period, actions]: [string, any], index: number) => (
                    <div key={index} className="bg-white rounded-xl p-4 border border-green-200">
                      <h4 className="font-semibold text-gray-900 mb-2">{period}</h4>
                      <ul className="space-y-1">
                        {actions.slice(0, 3).map((action: string, actionIndex: number) => (
                          <li key={actionIndex} className="text-sm text-gray-600 flex items-start">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Career Paths */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            {analysisType === "detailed" ? "Personality-Matched Career Paths" : "Recommended Career Paths"}
          </h2>
          <div className="space-y-6">
            {reportData.careerPaths?.map((path: any, index: number) => (
              <div
                key={index}
                className="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{path.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-1" />
                        {path.growthPotential} Growth
                      </span>
                      <span>{path.salaryRange}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{path.score}</div>
                    <div className="text-sm text-gray-500">Match Score</div>
                  </div>
                </div>

                {path.description && <p className="text-gray-700 mb-4">{path.description}</p>}

                {path.aiProofReason && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                      <Shield className="w-4 h-4 mr-2" />
                      Why This is AI-Proof
                    </h4>
                    <p className="text-green-700 text-sm">{path.aiProofReason}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {path.skills?.map((skill: string, skillIndex: number) => (
                        <span
                          key={skillIndex}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Next Steps</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {path.nextSteps?.slice(0, 3).map((step: string, stepIndex: number) => (
                        <li key={stepIndex} className="flex items-start">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI-Proof Skills */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Your AI-Proof Skills Profile</h2>
          <div className="space-y-4">
            {reportData.aiProofSkills?.map((skill: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{skill.skill}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${skill.strength}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-8">{skill.strength}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alternative Career Suggestions - detailed only */}
        {analysisType === "detailed" && reportData.alternativeCareers && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Alternative Career Suggestions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {reportData.alternativeCareers.map((alt: any, idx: number) => (
                <div key={idx} className="border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{alt.title}</h3>
                  </div>
                  <p className="text-gray-700 mb-3">Why: {alt.why}</p>
                  <h4 className="font-semibold text-gray-800 mb-2">Entry Plan</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {alt.entryPlan?.map((s: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Action Plan - detailed only */}
        {analysisType === "detailed" && reportData.actionPlanDetailed && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Detailed Action Plan</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {Object.entries(reportData.actionPlanDetailed)
                  .filter(([k]) => k !== 'resources')
                  .map(([period, items]: [string, any], idx: number) => (
                    <div key={idx} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{period}</h3>
                      <ul className="text-sm text-gray-700 space-y-2">
                        {items.map((it: string, i: number) => (
                          <li key={i} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5" />
                            {it}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Resources</h3>
                <ul className="space-y-3">
                  {reportData.actionPlanDetailed.resources?.map((r: any, i: number) => (
                    <li key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">{r.title}</div>
                        <div className="text-xs text-gray-500">{r.type}</div>
                      </div>
                      <a href={r.url} target="_blank" rel="noreferrer" className="text-blue-600 text-sm font-semibold">
                        Open
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 py-8">
          <p className="text-gray-500 text-sm">
            Generated by ElephantScale AI Career Partner • {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
