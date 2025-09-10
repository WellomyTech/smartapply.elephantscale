'use client'
export const dynamic = 'force-dynamic'

import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2, Check, X, ExternalLink, Sparkles, Target, CheckCircle, XCircle, Download, ArrowLeft, FileText, Eye } from 'lucide-react'
import { useEffect, useState } from 'react'
import DashboardButton from '@/components/DashboardButton'
import { StatusBar, useStatusBar } from '@/components/ui/status-bar'

import { useEntitlement } from '@/hooks/useEntitlement'
import PricingModal from '@/components/PricingButtons'

function safeJsonArray(val: any): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  try {
    const arr = JSON.parse(val)
    if (Array.isArray(arr)) return arr
    return []
  } catch {
    return []
  }
}

type SkillsMatchItem = {
  skill?: string
  Skill?: string
  name?: string
  in_job?: boolean
  in_resume?: boolean
  [k: string]: any
}

export default function JobInfoPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE as string
  const router = useRouter()
  const params = useParams()
  const { user, isLoading, logout } = useAuth()

  const emailParam = Array.isArray(params.email) ? params.email[0] : (params.email as string | undefined)
  const reportParam = Array.isArray(params.report_id) ? params.report_id[0] : (params.report_id as string | undefined)

  const [resumeText, setResumeText] = useState<string | null>(null)
  const [coverLetterText, setCoverLetterText] = useState<string | null>(null)

  const [jobData, setJobData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSkills, setShowSkills] = useState(false)

  // workedOn[i] corresponds to gaps[i]
  const [workedOn, setWorkedOn] = useState<boolean[]>([])
  const [generating, setGenerating] = useState(false)

  const [downloadingResume, setDownloadingResume] = useState(false)
  const [downloadingCover, setDownloadingCover] = useState(false)

  const { isLoading: entLoading, isPremium } = useEntitlement()
  const [showPaywall, setShowPaywall] = useState(false)
  const { status, showStatus, hideStatus } = useStatusBar()

  useEffect(() => {
    if (!reportParam || !emailParam || !API_URL) return
    fetch(`${API_URL}user-dashboard?user_email=${emailParam}&report_id=${reportParam}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.report) {
          const report = { ...data.report }
          try {
            if (typeof report.skills_match === 'string') report.skills_match = JSON.parse(report.skills_match)
          } catch {}
          try {
            if (typeof report.gaps === 'string') report.gaps = JSON.parse(report.gaps)
          } catch {}
          setJobData(report)
          localStorage.setItem('report_id', report.id || report.report_id || (reportParam as string))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [reportParam, emailParam, API_URL])

  // put this near your other useEffects
useEffect(() => {
  if (!jobData) return
  if (jobData.updated_resume) setResumeText(String(jobData.updated_resume))
  if (jobData.cover_letter)   setCoverLetterText(String(jobData.cover_letter))
}, [jobData?.updated_resume, jobData?.cover_letter])

  // initialize workedOn to gaps length
  useEffect(() => {
    if (!jobData) return
    const gaps = safeJsonArray(jobData.gaps)
    setWorkedOn(Array(gaps.length).fill(false))
  }, [jobData?.gaps])

  if (isLoading || loading || !jobData) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) {
    router.replace('/')
    return null
  }

  const fallbackResume = `Your resume will appear here.`
  const fallbackCover = `Your cover letter will appear here.`

  const handleLogout = () => {
    logout()
    localStorage.clear()
  }

  // ---- helpers
  const normalizeSkillName = (item: SkillsMatchItem): string =>
    (item.skill ?? item.Skill ?? item.name ?? '').toString()

  const jobMeta = (
    <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/30 p-8 mb-8 shadow-xl">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl backdrop-blur-sm">
          <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            {jobData?.job_title || 'Unknown Title'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
            {jobData?.job_company || 'Unknown Company'}
          </p>
        </div>
      </div>
      {jobData?.job_link && (
        <a
          className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg border border-blue-200/50 dark:border-blue-700/50 transition-all duration-200 font-medium"
          href={jobData.job_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="h-4 w-4" /> View Job Posting
        </a>
      )}
    </div>
  )

  const gaps = safeJsonArray(jobData.gaps)
  const skills_match: SkillsMatchItem[] = Array.isArray(jobData.skills_match) ? jobData.skills_match : []

  // -------------------------------------------
  // GENERATE RESUME: send selected skills in payload
  // -------------------------------------------
  async function handleGenerateResume() {
    if (!user?.email || !jobData) return

    // user-affirmed skills: map by gaps indices
    const selectedSkills = gaps.filter((_, idx) => workedOn[idx] === true)

    if (selectedSkills.length === 0) {
      showStatus('Please select at least one skill you have worked on.', 'warning')
      return
    }

    const email = localStorage.getItem('user_email') || user.email || ''

    const form = new FormData()
    form.append('user_email', email)

    // Preferred modern API field
    //form.append('selected_skills', JSON.stringify(selectedSkills))
    // Backward-compatible CSV (keep if your API still expects it)
    form.append('additional_skills', selectedSkills.join(', '))

    if (jobData.id || jobData.report_id) {
      form.append('report_id', String(jobData.id || jobData.report_id))
    }

    setGenerating(true)
    showStatus('Generating your personalized resume and cover letter...', 'loading')
    try {
      const res = await fetch(`${API_URL}generate-resume`, {
        method: 'POST',
        body: form,
        headers: { accept: 'application/json' },
      })
      const data = await res.json()
      if (data?.updated_resume) {
        localStorage.setItem('generated_resume', data.updated_resume)
        if (data.cover_letter) localStorage.setItem('generated_cover_letter', data.cover_letter)
        showStatus('Resume and cover letter generated successfully!', 'success')
        setTimeout(() => router.push('/job-kit/result'), 1200)
      } else {
        showStatus('No resume generated. Please try again.', 'error')
      }
    } catch (err) {
      console.error(err)
      showStatus('Failed to generate resume. Please try again.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  const downloadResumeDocx = async () => {
    const API_KEY = process.env.NEXT_PUBLIC_API_BASE as string
    const reportId = localStorage.getItem('report_id')
    if (!reportId) {
      showStatus('No report ID found', 'error')
      return
    }

    setDownloadingResume(true)

    const loadingMessages = [
      'Preparing resume download',
      'Fetching optimized document',
      'Processing file',
      'Starting download',
    ]

    let idx = 0
    showStatus(loadingMessages[0], 'loading')
    const ticker = setInterval(() => {
      idx = (idx + 1) % loadingMessages.length
      showStatus(loadingMessages[idx], 'loading')
    }, 800)

    try {
      const response = await fetch(`${API_KEY}download-resume-docx?report_id=${reportId}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${jobData?.job_title || 'resume'}_optimized.docx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
      clearInterval(ticker)
      showStatus('Resume downloaded successfully!', 'success')
    } catch (error) {
      clearInterval(ticker)
      showStatus('Failed to download resume', 'error')
    } finally {
      setDownloadingResume(false)
    }
  }

  const downloadCoverLetterDocx = async () => {
    const coverLetter = localStorage.getItem('generated_cover_letter')
    if (!coverLetter) {
      showStatus('No cover letter found. Please generate one first.', 'warning')
      return
    }
    setDownloadingCover(true)
    showStatus('Preparing your cover letter download...', 'loading')
    const formData = new FormData()
    formData.append('cover_letter_text', coverLetter)
    try {
      const response = await fetch(`${API_URL}generate-cover-letter-pdf`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) throw new Error('Failed to generate cover letter DOCX')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'cover_letter.docx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      showStatus('Cover letter downloaded successfully!', 'success')
    } catch (err) {
      console.error(err)
      showStatus('Cover letter download failed. Please try again.', 'error')
    } finally {
      setDownloadingCover(false)
    }
  }

  // ---- Views ---------------------------------------------------------------

  if (showSkills) {
    return (
      <>
        <StatusBar message={status.message} type={status.type} visible={status.visible} onClose={hideStatus} />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {jobMeta}
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/30 p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg">
                  <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Skills Comparison
                </h3>
              </div>

              <div className="overflow-x-auto bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/30 dark:border-gray-700/30">
                <table className="w-full table-auto border-collapse">
                  <thead className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">Skill</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-white">In Job</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-white">In Resume</th>
                      <th className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-white">Have You Worked On It?</th>
                    </tr>
                  </thead>
                  {/* <tbody>
                    {Array.isArray(skills_match) &&
                      skills_match
                        .map((raw) => {
                          // normalize item shape
                          const skill = normalizeSkillName(raw)
                          const in_job = !!(raw.in_job ?? false)
                          const in_resume = !!(raw.in_resume ?? false)
                          return { skill, in_job, in_resume }
                        })
                        // OPTIONAL: show only items that exist in gaps (keeps table clean)
                        .filter((it) => it.skill && gaps.includes(it.skill))
                        .map((it, _rowIdx) => {
                          const skill = it.skill
                          const gapIdx = gaps.indexOf(skill) // anchor radios to gaps index
                          const showRadio = gapIdx !== -1

                          return (
                            <tr key={`${skill}-${gapIdx}`} className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                {skill || 'Unknown Skill'}
                              </td>

                              <td className="px-6 py-4 text-center">
                                {it.in_job ? (
                                  <div className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                  </div>
                                )}
                              </td>

                              <td className="px-6 py-4 text-center">
                                {it.in_resume ? (
                                  <div className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                  </div>
                                )}
                              </td>

                              <td className="px-6 py-4 text-center">
                                {showRadio ? (
                                  <div className="flex justify-center gap-4">
                                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700/50 cursor-pointer transition-colors">
                                      <input
                                        type="radio"
                                        name={`worked-${gapIdx}`}
                                        checked={workedOn[gapIdx] === true}
                                        onChange={() =>
                                          setWorkedOn((arr) => {
                                            const copy = [...arr]
                                            copy[gapIdx] = true
                                            return copy
                                          })
                                        }
                                        className="form-radio h-4 w-4 text-emerald-600 border-emerald-300 focus:ring-emerald-500"
                                      />
                                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Yes</span>
                                    </label>

                                    <label className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/70 rounded-lg border border-gray-200 dark:border-gray-700/50 cursor-pointer transition-colors">
                                      <input
                                        type="radio"
                                        name={`worked-${gapIdx}`}
                                        checked={workedOn[gapIdx] === false}
                                        onChange={() =>
                                          setWorkedOn((arr) => {
                                            const copy = [...arr]
                                            copy[gapIdx] = false
                                            return copy
                                          })
                                        }
                                        className="form-radio h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                                      />
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">No</span>
                                    </label>
                                  </div>
                                ) : null}
                              </td>
                            </tr>
                          )
                        })}
                  </tbody> */}
                  <tbody>
                    {gaps.map((gapSkill, idx) => {
                      const match = skills_match.find(
                        (s) => normalizeSkillName(s).toLowerCase() === gapSkill.toLowerCase()
                      )
                      const in_resume =
                        (match?.in_resume?.toString().toLowerCase() === 'yes')

                      return (
                        <tr
                          key={`${gapSkill}-${idx}`}
                          className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          {/* Skill name */}
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {gapSkill}
                          </td>

                          {/* In Job: always green tick */}
                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                          </td>

                          {/* In Resume: ✅ only if in_resume === "Yes" */}
                          <td className="px-6 py-4 text-center">
                            {in_resume ? (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                              </div>
                            ) : (
                              <div className="inline-flex items-center justify-center w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                              </div>
                            )}
                          </td>

                          {/* Have you worked on it? */}
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-4">
                              <label className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-700/50 cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  name={`worked-${idx}`}
                                  checked={workedOn[idx] === true}
                                  onChange={() =>
                                    setWorkedOn((arr) => {
                                      const copy = [...arr]
                                      copy[idx] = true
                                      return copy
                                    })
                                  }
                                  className="form-radio h-4 w-4 text-emerald-600 border-emerald-300 focus:ring-emerald-500"
                                />
                                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Yes</span>
                              </label>

                              <label className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/70 rounded-lg border border-gray-200 dark:border-gray-700/50 cursor-pointer transition-colors">
                                <input
                                  type="radio"
                                  name={`worked-${idx}`}
                                  checked={workedOn[idx] === false}
                                  onChange={() =>
                                    setWorkedOn((arr) => {
                                      const copy = [...arr]
                                      copy[idx] = false
                                      return copy
                                    })
                                  }
                                  className="form-radio h-4 w-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                                />
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">No</span>
                              </label>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>

                </table>
              </div>

              <div className="mt-8 flex justify-center">
                <Button
                  size="lg"
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleGenerateResume}
                  disabled={generating}
                >
                  {generating ? (
                    <>
                      <Loader2 className="animate-spin mr-3 h-5 w-5" />
                      Generating Resume...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-3 h-5 w-5" />
                      Generate Resume and Cover Letter
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (jobData?.updated_resume && jobData?.cover_letter) {
    return (
      <>
        <StatusBar message={status.message} type={status.type} visible={status.visible} onClose={hideStatus} />
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {jobMeta}

            <div className="flex justify-center mt-4 mb-8">
              <Button
                size="lg"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => {
                  !isPremium ? setShowPaywall(true) : setShowSkills(true)
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Reselect/Add Skills
              </Button>
              <PricingModal open={showPaywall} onOpenChange={setShowPaywall} />
            </div>

                    <div className="grid lg:grid-cols-2 gap-8">
          {/* Resume Card */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-white/20 shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI-Optimized Resume</h2>
                  <p className="text-blue-100 text-sm">Tailored for your target role</p>
                </div>
              </div>
            </div>
            <CardContent className="flex flex-col h-[600px] p-0">
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 h-full">
                  <pre className="text-sm whitespace-pre-wrap break-words leading-relaxed font-mono">
                    {resumeText || fallbackResume}
                  </pre>
                </div>
              </div>
              <div className="p-6 pt-0 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>Optimized with AI for maximum ATS compatibility</span>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
                  onClick={downloadResumeDocx} 
                  disabled={!resumeText || downloadingResume} 
                  aria-busy={downloadingResume}
                >
                  {downloadingResume ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Preparing Download...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download Resume (.docx)
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cover Letter Card */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-white/20 shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Personalized Cover Letter</h2>
                  <p className="text-emerald-100 text-sm">Crafted to highlight your strengths</p>
                </div>
              </div>
            </div>
            <CardContent className="flex flex-col h-[600px] p-0">
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 h-full">
                  <pre className="text-sm whitespace-pre-wrap break-words leading-relaxed font-mono">
                    {coverLetterText || fallbackCover}
                  </pre>
                </div>
              </div>
              <div className="p-6 pt-0 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>Personalized messaging that resonates with employers</span>
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
                  onClick={downloadCoverLetterDocx} 
                  disabled={!coverLetterText || downloadingCover} 
                  aria-busy={downloadingCover}
                >
                  {downloadingCover ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Preparing Download...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download Cover Letter (.docx)
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
            {/* <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/30 p-8 shadow-xl flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg">
                    <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Resume
                  </h2>
                </div>
                <div className="flex-1 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-6 overflow-y-auto border border-gray-200/30 dark:border-gray-700/30 min-h-[400px]">
                  <pre className="text-sm whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300 leading-relaxed">
                    {jobData.updated_resume}
                  </pre>
                </div>
                <Button
                  className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  onClick={downloadResumeDocx}
                  disabled={downloadingResume}
                >
                  {downloadingResume ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Preparing download…
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Resume (.docx)
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/30 p-8 shadow-xl flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                    <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Cover Letter
                  </h2>
                </div>
                <div className="flex-1 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-6 overflow-y-auto border border-gray-200/30 dark:border-gray-700/30 min-h-[400px]">
                  <pre className="text-sm whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300 leading-relaxed">
                    {jobData.cover_letter}
                  </pre>
                </div>
                <Button
                  className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                  onClick={downloadCoverLetterDocx}
                  disabled={downloadingCover}
                >
                  {downloadingCover ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Preparing download…
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download Cover Letter (.docx)
                    </>
                  )}
                </Button>
              </div>
            </div> */}
          </div>
        </main>
      </>
    )
  }

  // default view (no generated docs yet)
  return (
    <>
      <StatusBar message={status.message} type={status.type} visible={status.visible} onClose={hideStatus} />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {jobMeta}
          <div className="flex flex-col items-center gap-6 mt-10">
            <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/30 p-8 shadow-xl text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl">
                  <Target className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Optimize Your Application?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Resume and cover letter not found for this job. Let's analyze the skills match and generate personalized documents.
              </p>
              <Button
                size="lg"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setShowSkills(true)}
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Continue to Skills Match
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

//  'use client'
// export const dynamic = 'force-dynamic'

// import { useRouter, useParams } from 'next/navigation'
// import { useAuth } from '@/components/AuthProvider'
// import { Card, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { LogOut, Loader2, Check, X, ExternalLink, Sparkles, Target, CheckCircle, XCircle, Download, ArrowLeft } from 'lucide-react'
// import { useEffect, useState } from 'react'
// import DashboardButton from '@/components/DashboardButton'
// import { StatusBar, useStatusBar } from '@/components/ui/status-bar'

// import { useEntitlement } from "@/hooks/useEntitlement"
// import PricingModal from "@/components/PricingButtons"

// function safeJsonArray(val: any): string[] {
//   if (!val) return []
//   if (Array.isArray(val)) return val
//   try {
//     const arr = JSON.parse(val)
//     if (Array.isArray(arr)) return arr
//     return []
//   } catch {
//     return []
//   }
// }

// export default function JobInfoPage() {
//   const API_URL = process.env.NEXT_PUBLIC_API_BASE
//   const router = useRouter()
//   const params = useParams()
//   const { user, isLoading, logout } = useAuth()

//   const email = Array.isArray(params.email) ? params.email[0] : params.email
//   const report_id = Array.isArray(params.report_id) ? params.report_id[0] : params.report_id

//   const [jobData, setJobData] = useState<any | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [showSkills, setShowSkills] = useState(false)
//   const [workedOn, setWorkedOn] = useState<boolean[]>([])
//   const [generating, setGenerating] = useState(false)

//   const [downloadingResume, setDownloadingResume] = useState(false)
//   const [downloadingCover, setDownloadingCover] = useState(false)

//   const {
//     isLoading: entLoading,
//     isPremium,
//     canGenerate,
//     freeRemain,
//   } = useEntitlement()
//   const [showPaywall, setShowPaywall] = useState(false)
//   const [isGenerating, setIsGenerating] = useState(false)
//   const [isDownloading, setIsDownloading] = useState(false)
//   const { status, showStatus, hideStatus } = useStatusBar()
//   const [downloadProgress, setDownloadProgress] = useState(0)

//   useEffect(() => {
//     if (!report_id || !email) return
//     fetch(`${API_URL}user-dashboard?user_email=${email}&report_id=${report_id}`)
//       .then((res) => res.json())
//       .then((data) => {
//         if (data?.report) {
//           let report = { ...data.report };
//           try {
//             if (typeof report.skills_match === "string") { report.skills_match = JSON.parse(report.skills_match) }
//           } catch {}
//           try {
//             if (typeof report.gaps === "string") { report.gaps = JSON.parse(report.gaps) }
//           } catch {}
//           setJobData(report);
//           localStorage.setItem('report_id', report.id || report.report_id || (report_id as string))
//         }
//         setLoading(false)
//       })
//       .catch(() => setLoading(false))
//   }, [report_id, email, API_URL])

// useEffect(() => {
//   if (!jobData) return;
//   const gaps = safeJsonArray(jobData.gaps);
//   setWorkedOn(Array(gaps.length).fill(false));
// }, [jobData?.gaps])

//   if (isLoading || loading || !jobData) {
//     return (
//       <div className="min-h-[60vh] grid place-items-center">
//         <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
//       </div>
//     )
//   }

//   if (!user) {
//     router.replace('/')
//     return null
//   }

//   const handleLogout = () => {
//     logout()
//     localStorage.clear()
//   }

//   // async function handleGenerateResume() {
//   //   if (!user?.email || !jobData) return

//   //   const gaps = safeJsonArray(jobData.gaps)
//   //   const selectedSkills = gaps
//   //     .map((skill, idx) => workedOn[idx] ? skill : null)
//   //     .filter(Boolean) as string[]

//   //   if (selectedSkills.length === 0) {
//   //     showStatus("Please select at least one skill you have worked on.", "warning")
//   //     return
//   //   }

//   //   const jobInfoToSend = jobData.job_link ? jobData.job_link : jobData.job_description
//   //   const email = localStorage.getItem('user_email') || ''

//   //   const form = new FormData()
//   //   form.append('user_email', email)
//   //   form.append('additional_skills', selectedSkills.join(', '))
//   //   //form.append('job_description', jobInfoToSend)
//   //   if (jobData.id || jobData.report_id) {
//   //     form.append('report_id', (jobData.id || jobData.report_id).toString())
//   //   }

//   //   setGenerating(true)
//   //   showStatus("Generating your personalized resume and cover letter...", "loading")
//   //   try {
//   //     const res = await fetch(`${API_URL}generate-resume`, {
//   //       method: 'POST',
//   //       body: form,
//   //       headers: { accept: 'application/json' }
//   //     })
//   //     const data = await res.json()
//   //     if (data.updated_resume) {
//   //       localStorage.setItem('generated_resume', data.updated_resume)
//   //       if (data.cover_letter) localStorage.setItem('generated_cover_letter', data.cover_letter)
//   //       showStatus("Resume and cover letter generated successfully!", "success")
//   //       setTimeout(() => router.push('/job-kit/result'), 1500)
//   //     } else {
//   //       showStatus("No resume generated. Please try again.", "error")
//   //     }
//   //   } catch (err) {
//   //     showStatus("Failed to generate resume. Please try again.", "error")
//   //     console.error(err)
//   //   } finally {
//   //     setGenerating(false)
//   //   }
//   // }

//   async function handleGenerateResume() {
//   if (!user?.email || !jobData) return;

//   const gaps = safeJsonArray(jobData.gaps);

//   // skills user marked "Yes"
//   const selectedSkills = gaps.filter((_, idx) => workedOn[idx] === true);

//   if (selectedSkills.length === 0) {
//     showStatus("Please select at least one skill you have worked on.", "warning");
//     return;
//   }

//   const email = localStorage.getItem('user_email') || '';

//   const form = new FormData();
//   form.append('user_email', email);

//   // ✅ send as JSON array (preferred by APIs)
//   form.append('selected_skills', JSON.stringify(selectedSkills));

//   // (optional) keep your old CSV field for compatibility
//   form.append('additional_skills', selectedSkills.join(', '));

//   if (jobData.id || jobData.report_id) {
//     form.append('report_id', String(jobData.id || jobData.report_id));
//   }

//   setGenerating(true);
//   showStatus("Generating your personalized resume and cover letter...", "loading");
//   try {
//     const res = await fetch(`${API_URL}generate-resume`, {
//       method: 'POST',
//       body: form,
//       headers: { accept: 'application/json' }
//     });
//     const data = await res.json();
//     if (data.updated_resume) {
//       localStorage.setItem('generated_resume', data.updated_resume);
//       if (data.cover_letter) localStorage.setItem('generated_cover_letter', data.cover_letter);
//       showStatus("Resume and cover letter generated successfully!", "success");
//       setTimeout(() => router.push('/job-kit/result'), 1500);
//     } else {
//       showStatus("No resume generated. Please try again.", "error");
//     }
//   } catch (err) {
//     console.error(err);
//     showStatus("Failed to generate resume. Please try again.", "error");
//   } finally {
//     setGenerating(false);
//   }
// }


//   const downloadResumeDocx = async () => {
//     const API_KEY = process.env.NEXT_PUBLIC_API_BASE
//     const reportId = localStorage.getItem("report_id")
//     if (!reportId) {
//       showStatus("No report ID found", "error")
//       return
//     }
    
//     setDownloadingResume(true)
    
//     // Dynamic loading messages for download
//     const loadingMessages = [
//       'Preparing resume download',
//       'Fetching optimized document',
//       'Processing file',
//       'Starting download'
//     ]
    
//     let messageIndex = 0
//     showStatus(loadingMessages[0], 'loading')
    
//     const messageInterval = setInterval(() => {
//       messageIndex = (messageIndex + 1) % loadingMessages.length
//       showStatus(loadingMessages[messageIndex], 'loading')
//     }, 800)

//     try {
//       const response = await fetch(`${API_KEY}download-resume-docx?report_id=${reportId}`)
//       const blob = await response.blob()
//       const url = window.URL.createObjectURL(blob)
//       const a = document.createElement('a')
//       a.href = url
//       a.download = `${jobData?.job_title || 'resume'}_optimized.docx`
//       document.body.appendChild(a)
//       a.click()
//       window.URL.revokeObjectURL(url)
//       document.body.removeChild(a)
//       clearInterval(messageInterval)
//       showStatus('Resume downloaded successfully!', 'success')
//     } catch (error) {
//       clearInterval(messageInterval)
//       showStatus('Failed to download resume', 'error')
//     } finally {
//       setDownloadingResume(false)
//     }
//   }

//   const downloadCoverLetterDocx = async () => {
//     const coverLetter = localStorage.getItem('generated_cover_letter')
//     if (!coverLetter) {
//       showStatus("No cover letter found. Please generate one first.", "warning")
//       return
//     }
//     setDownloadingCover(true)
//     showStatus("Preparing your cover letter download...", "loading")
//     const formData = new FormData()
//     formData.append('cover_letter_text', coverLetter)
//     try {
//       const response = await fetch(`${API_URL}generate-cover-letter-pdf`, {
//         method: 'POST',
//         body: formData,
//       })
//       if (!response.ok) {
//         throw new Error('Failed to generate cover letter DOCX')
//       }
//       const blob = await response.blob()
//       const url = window.URL.createObjectURL(blob)
//       const a = document.createElement('a')
//       a.href = url
//       a.download = 'cover_letter.docx'
//       document.body.appendChild(a)
//       a.click()
//       a.remove()
//       window.URL.revokeObjectURL(url)
//       showStatus("Cover letter downloaded successfully!", "success")
//     } catch (err) {
//       showStatus('Cover letter download failed. Please try again.', "error")
//       console.error(err)
//     } finally {
//       setDownloadingCover(false)
//     }
//   }

//   const jobMeta = (
//     <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/30 p-8 mb-8 shadow-xl">
//       <div className="flex items-start gap-4 mb-4">
//         <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl backdrop-blur-sm">
//           <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
//         </div>
//         <div className="flex-1">
//           <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
//             {jobData?.job_title || 'Unknown Title'}
//           </h2>
//           <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">{jobData?.job_company || 'Unknown Company'}</p>
//         </div>
//       </div>
//       {jobData?.job_link && (
//         <a
//           className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded-lg border border-blue-200/50 dark:border-blue-700/50 transition-all duration-200 font-medium"
//           href={jobData.job_link}
//           target="_blank"
//           rel="noopener noreferrer"
// >
//           <ExternalLink className="h-4 w-4" /> View Job Posting
//         </a>
//       )}
//     </div>
//   )

//   const gaps = safeJsonArray(jobData.gaps)
//   const skills_match = Array.isArray(jobData.skills_match) ? jobData.skills_match : []

//   if (showSkills) {
//     return (
//       <>
//         <StatusBar
//           message={status.message}
//           type={status.type}
//           visible={status.visible}
//           onClose={hideStatus}
//         />
//         <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
//             {jobMeta}
//             <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/30 p-8 shadow-xl">
//               <div className="flex items-center gap-3 mb-6">
//                 <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-lg">
//                   <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
//                 </div>
//                 <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Skills Comparison</h3>
//               </div>
//               <div className="overflow-x-auto bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-200/30 dark:border-gray-700/30">
//                 <table className="w-full table-auto border-collapse">
//                   <thead className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm">
//                     <tr>
//                       <th className="px-6 py-4 text-left font-semibold text-gray-900 dark:text-white">Skill</th>
//                       <th className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-white">In Job</th>
//                       <th className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-white">In Resume</th>
//                       <th className="px-6 py-4 text-center font-semibold text-gray-900 dark:text-white">Have You Worked On It?</th>
//                     </tr>
//                   </thead>
//                   <tbody>

// {Array.isArray(skills_match) && skills_match
//   .filter(({ in_job }: any) => in_job)
//   .map(({ skill, in_job, in_resume }: any) => {
//     const gapIdx = gaps.indexOf(skill);          // <— anchor to gaps
//     const showRadio = gapIdx !== -1;             // only show radio if it's a gap

//     return (
//       <tr key={skill} className="border-b ...">
//         {/* ...other cells... */}
//         <td className="px-6 py-4 text-center">
//           {showRadio ? (
//             <div className="flex justify-center gap-4">
//               <label className="inline-flex items-center gap-2 px-3 py-2 ...">
//                 <input
//                   type="radio"
//                   name={`worked-${gapIdx}`}
//                   checked={workedOn[gapIdx] === true}
//                   onChange={() =>
//                     setWorkedOn(arr => {
//                       const copy = [...arr];
//                       copy[gapIdx] = true;
//                       return copy;
//                     })
//                   }
//                   className="form-radio h-4 w-4 ..."
//                 />
//                 <span className="text-sm font-medium ...">Yes</span>
//               </label>

//               <label className="inline-flex items-center gap-2 px-3 py-2 ...">
//                 <input
//                   type="radio"
//                   name={`worked-${gapIdx}`}
//                   checked={workedOn[gapIdx] === false}
//                   onChange={() =>
//                     setWorkedOn(arr => {
//                       const copy = [...arr];
//                       copy[gapIdx] = false;
//                       return copy;
//                     })
//                   }
//                   className="form-radio h-4 w-4 ..."
//                 />
//                 <span className="text-sm font-medium ...">No</span>
//               </label>
//             </div>
//           ) : null}
//         </td>
//       </tr>
//     );
//   })}

//                   </tbody>
//                 </table>
//               </div>
//               <div className="mt-8 flex justify-center">
//                 <Button 
//                   size="lg" 
//                   className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
//                   onClick={handleGenerateResume} 
//                   disabled={generating}
//                 >
//                   {generating ? (
//                     <>
//                       <Loader2 className="animate-spin mr-3 h-5 w-5" /> 
//                       Generating Resume...
//                     </>
//                   ) : (
//                     <>
//                       <Sparkles className="mr-3 h-5 w-5" />
//                       Generate Resume and Cover Letter
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </main>
//       </>
//     )
//   }

//   if (jobData?.updated_resume && jobData?.cover_letter) {
//     return (
//       <>
//         <StatusBar
//           message={status.message}
//           type={status.type}
//           visible={status.visible}
//           onClose={hideStatus}
//         />
//         <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
//             {jobMeta}
//             <div className="flex justify-center mt-4 mb-8">
//               <Button
//                 size="lg"
//                 className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
//                 onClick={() => { !isPremium ? setShowPaywall(true) : setShowSkills(true) }}
//               >
//                 <ArrowLeft className="mr-2 h-4 w-4" />
//                 Reselect/Add Skills
//               </Button>
//               <PricingModal open={showPaywall} onOpenChange={setShowPaywall} />
//             </div>
//             <div className="grid md:grid-cols-2 gap-8">
//               <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/30 p-8 shadow-xl flex flex-col">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="p-2 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-lg">
//                     <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
//                   </div>
//                   <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Resume</h2>
//                 </div>
//                 <div className="flex-1 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-6 overflow-y-auto border border-gray-200/30 dark:border-gray-700/30 min-h-[400px]">
//                   <pre className="text-sm whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300 leading-relaxed">{jobData.updated_resume}</pre>
//                 </div>
//                 <Button 
//                   className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50" 
//                   onClick={downloadResumeDocx} 
//                   disabled={downloadingResume}
//                 >
//                   {downloadingResume ? (
//                     <>
//                       <Loader2 className="animate-spin mr-2 h-4 w-4" /> 
//                       Preparing download…
//                     </>
//                   ) : (
//                     <>
//                       <Download className="mr-2 h-4 w-4" />
//                       Download Resume (.docx)
//                     </>
//                   )}
//                 </Button>
//               </div>
//               <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/30 p-8 shadow-xl flex flex-col">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
//                     <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
//                   </div>
//                   <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Cover Letter</h2>
//                 </div>
//                 <div className="flex-1 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl p-6 overflow-y-auto border border-gray-200/30 dark:border-gray-700/30 min-h-[400px]">
//                   <pre className="text-sm whitespace-pre-wrap break-words text-gray-700 dark:text-gray-300 leading-relaxed">{jobData.cover_letter}</pre>
//                 </div>
//                 <Button 
//                   className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50" 
//                   onClick={downloadCoverLetterDocx} 
//                   disabled={downloadingCover}
//                 >
//                   {downloadingCover ? (
//                     <>
//                       <Loader2 className="animate-spin mr-2 h-4 w-4" /> 
//                       Preparing download…
//                     </>
//                   ) : (
//                     <>
//                       <Download className="mr-2 h-4 w-4" />
//                       Download Cover Letter (.docx)
//                     </>
//                   )}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </main>
//       </>
//     )
//   }

//   return (
//     <>
//       <StatusBar
//         message={status.message}
//         type={status.type}
//         visible={status.visible}
//         onClose={hideStatus}
//       />
//       <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 px-4 py-8">
//         <div className="max-w-5xl mx-auto">
//           {jobMeta}
//           <div className="flex flex-col items-center gap-6 mt-10">
//             <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/30 p-8 shadow-xl text-center">
//               <div className="flex justify-center mb-4">
//                 <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl">
//                   <Target className="h-8 w-8 text-amber-600 dark:text-amber-400" />
//                 </div>
//               </div>
//               <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Ready to Optimize Your Application?</h3>
//               <p className="text-gray-600 dark:text-gray-400 mb-6">Resume and cover letter not found for this job. Let's analyze the skills match and generate personalized documents.</p>
//               <Button 
//                 size="lg" 
//                 className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
//                 onClick={() => setShowSkills(true)}
//               >
//                 <Sparkles className="mr-2 h-5 w-5" />
//                 Continue to Skills Match
//               </Button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </>
//   )
// }
