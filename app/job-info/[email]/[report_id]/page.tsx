'use client'
export const dynamic = 'force-dynamic'

import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LogOut,
  Loader2,
  ExternalLink,
  Sparkles,
  Target,
  CheckCircle,
  XCircle,
  Download,
  ArrowLeft,
  FileText,
  Eye,
  X,
  PencilLine,
  Save,
  X as XIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
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

// Normalize CR/CRLF to LF so <pre> renders lines correctly
const normalizeNewlines = (s: string) => s.replace(/\r\n?/g, '\n')

export default function JobInfoPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE as string
  const router = useRouter()
  const params = useParams()
  const { user, isLoading, logout } = useAuth()

  const emailParam = Array.isArray(params.email) ? params.email[0] : (params.email as string | undefined)
  const reportParam = Array.isArray(params.report_id) ? params.report_id[0] : (params.report_id as string | undefined)

  const [resumeText, setResumeText] = useState<string | null>(null)
  const [coverLetterText, setCoverLetterText] = useState<string | null>(null)

  // Normalize for display BEFORE any early returns to keep hook order stable
  const resumeDisplay = useMemo(() => normalizeNewlines(resumeText ?? ''), [resumeText])
  const coverDisplay = useMemo(() => normalizeNewlines(coverLetterText ?? ''), [coverLetterText])

  // Editing state
  const [editingResume, setEditingResume] = useState(false)
  const [resumeDraft, setResumeDraft] = useState<string>('')
  const [editingCover, setEditingCover] = useState(false)
  const [coverDraft, setCoverDraft] = useState<string>('')

  const [jobData, setJobData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSkills, setShowSkills] = useState(false)

  // workedOn[i] corresponds to gaps[i]
  const [workedOn, setWorkedOn] = useState<boolean[]>([])
  const [generating, setGenerating] = useState(false)

  const [downloadingResume, setDownloadingResume] = useState(false)
  const [downloadingCover, setDownloadingCover] = useState(false)

  const [savingResume, setSavingResume] = useState(false)
  const [savingCover, setSavingCover] = useState(false)

  const { isLoading: entLoading, isPremium } = useEntitlement()
  const [showPaywall, setShowPaywall] = useState(false)
  const { status, showStatus, hideStatus } = useStatusBar()

  // Popup state
  const [showApplyConfirm, setShowApplyConfirm] = useState(false)
  const [submittingApplied, setSubmittingApplied] = useState(false)
  const [showInterviewChoice, setShowInterviewChoice] = useState(false)

  // Hard reload to dashboard helper
  function goToDashboardHardReload() {
    const url = `/dashboard/resume?ts=${Date.now()}`
    if (typeof window !== 'undefined') {
      window.location.assign(url)
    } else {
      router.push('/dashboard/resume')
    }
  }

  // ---- Robust job link resolution (normalized + fallback to localStorage)
  function normalizeUrlCandidate(raw?: string | null): string | null {
    if (!raw) return null
    const s = String(raw).trim()
    if (!s) return null
    if (/^https?:\/\//i.test(s)) return s
    return `https://${s}`
  }
  function isValidHttpUrl(u: string): boolean {
    try {
      const url = new URL(u)
      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }
  function resolveJobApplyLink(report: any | null): string | null {
    const candidates = [
      report?.job_link,
      report?.jobLink,
      report?.job_url,
      report?.jobUrl,
      typeof window !== 'undefined' ? localStorage.getItem('job_url') : null,
      typeof window !== 'undefined' ? localStorage.getItem('job_link') : null,
      typeof window !== 'undefined' ? localStorage.getItem('jobLink') : null,
    ] as (string | null | undefined)[]
    for (const c of candidates) {
      const n = normalizeUrlCandidate(c || null)
      if (n && isValidHttpUrl(n)) return n
    }
    return null
  }
  const [jobApplyLink, setJobApplyLink] = useState<string | null>(null)

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
          if (report?.id || report?.report_id || reportParam) {
            localStorage.setItem('report_id', String(report.id || report.report_id || reportParam))
          }
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [reportParam, emailParam, API_URL])

  // Keep job link in state to avoid SSR hydration diffs
  useEffect(() => {
    setJobApplyLink(resolveJobApplyLink(jobData))
  }, [jobData])

  // Populate in-page doc text from API result
  useEffect(() => {
    if (!jobData) return
    if (jobData.updated_resume) setResumeText(normalizeNewlines(String(jobData.updated_resume)))
    if (jobData.cover_letter) setCoverLetterText(normalizeNewlines(String(jobData.cover_letter)))
  }, [jobData?.updated_resume, jobData?.cover_letter, jobData])

  // initialize workedOn to gaps length
  useEffect(() => {
    if (!jobData) return
    const gaps = safeJsonArray(jobData.gaps)
    setWorkedOn(Array(gaps.length).fill(false))
  }, [jobData?.gaps, jobData])

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

  // Use normalized display strings for <pre>
  // (moved above; keep here commented to avoid duplicate hooks)
  // const resumeDisplay = useMemo(() => normalizeNewlines(resumeText ?? ''), [resumeText])
  // const coverDisplay = useMemo(() => normalizeNewlines(coverLetterText ?? ''), [coverLetterText])

  const handleLogout = () => {
    logout()
    localStorage.clear()
  }

  // ---- helpers
  const normalizeSkillName = (item: SkillsMatchItem): string =>
    (item.skill ?? item.Skill ?? item.name ?? '').toString()

  const gaps = safeJsonArray(jobData.gaps)
  const skills_match: SkillsMatchItem[] = Array.isArray(jobData.skills_match) ? jobData.skills_match : []

  // Top meta section
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
      
    </div>
  )

  // -------------------------------------------
  // GENERATE RESUME: send selected skills in payload
  // -------------------------------------------
  async function handleGenerateResume() {
    if (!user?.email || !jobData) return

    const selectedSkills = gaps.filter((_, idx) => workedOn[idx] === true)
    if (selectedSkills.length === 0) {
      showStatus('Please select at least one skill you have worked on.', 'warning')
      return
    }

    const email =
      (typeof window !== 'undefined' ? localStorage.getItem('user_email') : '') || (user as any).email || ''
    const rid = String(jobData.id || jobData.report_id || reportParam || '')

    const form = new FormData()
    form.append('user_email', email)
    form.append('additional_skills', selectedSkills.join(', '))
    if (rid) form.append('report_id', rid)

    setGenerating(true)
    showStatus('Generating your personalized resume and cover letter...', 'loading')

    try {
      const res = await fetch(`${API_URL}generate-resume`, {
        method: 'POST',
        body: form,
        headers: { accept: 'application/json' },
      })

      let data: any = null
      try {
        data = await res.json()
      } catch {
        // ignore JSON parse errors
      }

      if (!res.ok) {
        showStatus('Failed to generate resume. Please try again.', 'error')
        return
      }

      let updated = false

      // 1) Prefer immediate payload
      if (data?.updated_resume) {
        localStorage.setItem('generated_resume', data.updated_resume)
        if (data.cover_letter) localStorage.setItem('generated_cover_letter', data.cover_letter)

        setResumeText(String(data.updated_resume))
        setCoverLetterText(String(data.cover_letter || ''))
        setJobData((prev: any) => ({
          ...(prev || {}),
          updated_resume: data.updated_resume,
          cover_letter: data.cover_letter,
        }))
        updated = true
      }

      // 2) Fallback to re-fetch report
      if (!updated && email && rid) {
        try {
          const refRes = await fetch(
            `${API_URL}user-dashboard?user_email=${encodeURIComponent(email)}&report_id=${encodeURIComponent(rid)}`,
            { cache: 'no-store' }
          )
          if (refRes.ok) {
            const refData = await refRes.json()
            const report = refData?.report
            if (report) {
              setJobData(report)
              if (report.updated_resume) {
                setResumeText(String(report.updated_resume))
                setCoverLetterText(String(report.cover_letter || ''))
                updated = true
              }
            }
          }
        } catch {
          // ignore re-fetch errors
        }
      }

      // Ensure we switch back to the documents view
      setShowSkills(false)

      if (updated) {
        showStatus('Resume and cover letter generated successfully!', 'success')
      } else {
        showStatus('Finalizing your documents...', 'loading')
        try {
          if (typeof (router as any).refresh === 'function') {
            ;(router as any).refresh()
          }
        } finally {
          if (typeof window !== 'undefined') window.location.reload()
        }
      }
    } catch (err) {
      console.error(err)
      showStatus('Failed to generate resume. Please try again.', 'error')
    } finally {
      setGenerating(false)
    }
  }

  // Save edited content locally (and in-memory)
  async function saveEdits(which: 'resume' | 'cover') {
    const ridStr = String(
      jobData?.id ||
        jobData?.report_id ||
        reportParam ||
        (typeof window !== 'undefined' ? localStorage.getItem('report_id') : '') ||
        ''
    )
    const rid = Number(ridStr)
    if (!rid) {
      showStatus('Missing report ID. Please refresh and try again.', 'error')
      return
    }

    if (which === 'resume') {
      const next = normalizeNewlines((resumeDraft || '').trim())
      const cover = normalizeNewlines(((editingCover ? coverDraft : (coverLetterText || '')) || '').trim())

      setSavingResume(true)
      showStatus('Saving resume to server...', 'loading')
      const ok = await updateJobStatus({ reportId: rid, resume_text: next, cover_letter: cover })
      setSavingResume(false)

      if (ok) {
        setResumeText(next)
        setJobData((p: any) => ({ ...(p || {}), updated_resume: next }))
        localStorage.setItem('generated_resume', next)
        setEditingResume(false)
        showStatus('Resume saved successfully.', 'success')
      } else {
        showStatus('Failed to save resume. Please try again.', 'error')
      }
      return
    }

    const next = normalizeNewlines((coverDraft || '').trim())
    const resume = normalizeNewlines(((editingResume ? resumeDraft : (resumeText || '')) || '').trim())

    setSavingCover(true)
    showStatus('Saving cover letter to server...', 'loading')
    const ok = await updateJobStatus({ reportId: rid, resume_text: resume, cover_letter: next })
    setSavingCover(false)

    if (ok) {
      setCoverLetterText(next)
      setJobData((p: any) => ({ ...(p || {}), cover_letter: next }))
      localStorage.setItem('generated_cover_letter', next)
      setEditingCover(false)
      showStatus('Cover letter saved successfully.', 'success')
    } else {
      showStatus('Failed to save cover letter. Please try again.', 'error')
    }
  }

  const downloadResumeDocx = async () => {
    const text = (resumeText || '').trim()
    const reportId = localStorage.getItem('report_id')
    if (!text && !reportId) {
      showStatus('No resume content found', 'error')
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
      // Try: POST resume text directly if backend supports it
      if (text) {
        const fd = new FormData()
        fd.append('resume_text', text)
        if (reportId) fd.append('report_id', reportId)
        const tryPost = await fetch(`${API_URL}generate-resume-docx`, { method: 'POST', body: fd })
        if (tryPost.ok) {
          const blob = await tryPost.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${jobData?.job_title || 'resume'}_edited.docx`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          a.remove()
          clearInterval(ticker)
          showStatus('Resume downloaded successfully!', 'success')
          return
        }
      }

      // Fallback: server-side by report id
      if (!reportId) throw new Error('no_report_id')
      const response = await fetch(`${API_URL}download-custom-resume-docx?report_id=${reportId}`)
      if (!response.ok) throw new Error('Failed to download resume DOCX')
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
    const coverLetter = (coverLetterText || localStorage.getItem('generated_cover_letter') || '').trim()
    if (!coverLetter) {
      showStatus('No cover letter found. Please generate or edit first.', 'warning')
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

  // API: update-job-status (report_id, applied, r_interview)
  type UpdateJobStatusArgs = {
    reportId: number
    applied?: boolean
    r_interview?: boolean
    resume_text?: string
    cover_letter?: string
  }

  async function updateJobStatus(args: UpdateJobStatusArgs): Promise<boolean> {
    try {
      const params = new URLSearchParams()
      params.append('report_id', String(args.reportId))
      if (typeof args.applied === 'boolean') params.append('applied', String(args.applied))
      if (typeof args.r_interview === 'boolean') params.append('r_interview', String(args.r_interview))
      if (typeof args.resume_text === 'string') params.append('resume_text', args.resume_text)
      if (typeof args.cover_letter === 'string') params.append('cover_letter', args.cover_letter)

      const res = await fetch(`${API_URL}update-resume`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      })
      return res.ok
    } catch (err) {
      console.error('Failed to update job status', err)
      return false
    }
  }

  // Track "Did you apply?" locally and best-effort server update
  async function handleAppliedResponse(applied: boolean) {
    const ridStr = String(
      jobData?.id ||
        jobData?.report_id ||
        reportParam ||
        (typeof window !== 'undefined' ? localStorage.getItem('report_id') : '') ||
        ''
    )
    const rid = Number(ridStr)

    if (!rid) {
      showStatus('Missing report ID. Please refresh and try again.', 'error')
      return
    }

    if (applied) {
      setSubmittingApplied(true)
      showStatus('Saving your application status...', 'loading')
      const ok = await updateJobStatus({ reportId: rid, applied: true })
      setSubmittingApplied(false)

      if (ok) {
        if (ridStr) localStorage.setItem(`applied:${ridStr}`, 'yes')
        setShowApplyConfirm(false)
        showStatus('Great! We’ll track this application.', 'success')
        goToDashboardHardReload()
      } else {
        showStatus('Failed to update status. Please try again.', 'error')
      }
      return
    }

    const ok = await updateJobStatus({ reportId: rid, applied: false })
    if (ridStr) localStorage.setItem(`applied:${ridStr}`, 'no')
    setShowApplyConfirm(false)
    showStatus(
      ok ? 'Got it. You can update this later.' : 'Could not save status, but you can try again later.',
      ok ? 'warning' : 'error'
    )
  }

  // Open job link and show confirmation popup
  function handleApplyClick() {
    if (jobApplyLink) {
      window.open(jobApplyLink, '_blank', 'noopener,noreferrer')
    } else {
      showStatus('No job link found for this report.', 'warning')
    }
    setShowApplyConfirm(true)
  }

  // Handle interview type choice and navigate
  function handleInterviewChoice(type: 'technical' | 'behavioral') {
    const rid =
      String(jobData?.id || jobData?.report_id || reportParam || localStorage.getItem('report_id') || '')
    setShowInterviewChoice(false)

    if (type === 'technical') {
      if (rid) {
        router.push(`/interview?report_id=${encodeURIComponent(rid)}&type=technical`)
      } else {
        showStatus('Missing report id. Opening interview hub.', 'warning')
        router.push('/interview?type=technical')
      }
      return
    }
    router.push('/dashboard/behavioral')
  }

  // Reusable action buttons (Apply + Ready + Back)
  const ActionButtons = () => (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        onClick={handleApplyClick}
      >
        <ExternalLink className="mr-2 h-4 w-4" />
        Apply to Job Now
      </Button>

      <Button
        className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        onClick={() => setShowInterviewChoice(true)}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Ready for Interview
      </Button>

      <Button
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        onClick={goToDashboardHardReload}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      {showApplyConfirm && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowApplyConfirm(false)}
            aria-hidden="true"
          />
          <div
            className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2"
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-confirm-title"
          >
            <div className="rounded-xl border border-blue-200 bg-blue-50 shadow-2xl">
              <div className="px-5 py-4 flex items-start justify-between">
                <div>
                  <h4 id="apply-confirm-title" className="text-base font-semibold text-gray-900">
                    Did you apply?
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Let us know, and we’ll help you track your application.
                  </p>
                </div>
                <button
                  aria-label="Close"
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-black/5"
                  onClick={() => setShowApplyConfirm(false)}
                  disabled={submittingApplied}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-5 pb-4 flex items-center justify-end gap-6">
                <button
                  className="text-gray-700 hover:text-gray-900 font-medium disabled:opacity-60"
                  onClick={() => handleAppliedResponse(true)}
                  disabled={submittingApplied}
                >
                  {submittingApplied ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-gray-400/40 border-t-gray-600 rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Yes'
                  )}
                </button>
                <button
                  className="text-gray-700 hover:text-gray-900 font-medium disabled:opacity-60"
                  onClick={() => handleAppliedResponse(false)}
                  disabled={submittingApplied}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInterviewChoice && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowInterviewChoice(false)}
            aria-hidden="true"
          />
          <div
            className="absolute left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2"
            role="dialog"
            aria-modal="true"
            aria-labelledby="interview-choice-title"
          >
            <div className="rounded-xl border border-blue-200 bg-blue-50 shadow-2xl">
              <div className="px-5 py-4 flex items-start justify-between">
                <div>
                  <h4 id="interview-choice-title" className="text-base font-semibold text-gray-900">
                    Choose interview type
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">
                    Select how you want to prepare.
                  </p>
                </div>
                <button
                  aria-label="Close"
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-black/5"
                  onClick={() => setShowInterviewChoice(false)}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="px-5 pb-5 flex items-center justify-end gap-3">
                <Button
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-2 rounded-lg"
                  onClick={() => handleInterviewChoice('technical')}
                >
                  Technical Interview
                </Button>
                <Button
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold px-4 py-2 rounded-lg"
                  onClick={() => handleInterviewChoice('behavioral')}
                >
                  Behavioral Interview
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

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
                  <tbody>
                    {gaps.map((gapSkill, idx) => {
                      const match = skills_match.find(
                        (s) => normalizeSkillName(s).toLowerCase() === gapSkill.toLowerCase()
                      )
                      const in_resume = (match?.in_resume?.toString().toLowerCase() === 'yes')

                      return (
                        <tr
                          key={`${gapSkill}-${idx}`}
                          className="border-b border-gray-200/30 dark:border-gray-700/30 hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                            {gapSkill}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                          </td>

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
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">AI-Optimized Resume</h2>
                        <p className="text-blue-100 text-sm">Tailored for your target role</p>
                      </div>
                    </div>
                    {!editingResume ? (
                      <Button
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 text-white"
                        onClick={() => {
                          setResumeDraft(resumeDisplay || '')
                          setEditingResume(true)
                        }}
                      >
                        <PencilLine className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => saveEdits('resume')}
                          disabled={savingResume}
                        >
                          {savingResume ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button
                          variant="secondary"
                          className="bg-white/20 hover:bg-white/30 text-white"
                          onClick={() => {
                            setEditingResume(false)
                            setResumeDraft('')
                          }}
                        >
                          <XIcon className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <CardContent className="flex flex-col h-[600px] p-0">
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-0 h-full">
                      {!editingResume ? (
                        <pre className="p-6 text-sm whitespace-pre-wrap break-words leading-relaxed font-mono">
                          {resumeDisplay || fallbackResume}
                        </pre>
                      ) : (
                        <textarea
                          value={resumeDraft}
                          onChange={(e) => setResumeDraft(e.target.value)}
                          className="w-full h-full resize-none p-4 bg-transparent text-sm leading-relaxed font-mono outline-none"
                          placeholder="Edit your resume content..."
                        />
                      )}
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
                      disabled={downloadingResume}
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
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Personalized Cover Letter</h2>
                        <p className="text-emerald-100 text-sm">Crafted to highlight your strengths</p>
                      </div>
                    </div>
                    {!editingCover ? (
                      <Button
                        variant="secondary"
                        className="bg-white/20 hover:bg-white/30 text-white"
                        onClick={() => {
                          setCoverDraft(coverDisplay || '')
                          setEditingCover(true)
                        }}
                      >
                        <PencilLine className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => saveEdits('cover')}
                        >
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          className="bg-white/20 hover:bg-white/30 text-white"
                          onClick={() => {
                            setEditingCover(false)
                            setCoverDraft('')
                          }}
                        >
                          <XIcon className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <CardContent className="flex flex-col h-[600px] p-0">
                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-0 h-full">
                      {!editingCover ? (
                        <pre className="p-6 text-sm whitespace-pre-wrap break-words leading-relaxed font-mono">
                          {coverDisplay || fallbackCover}
                        </pre>
                      ) : (
                        <textarea
                          value={coverDraft}
                          onChange={(e) => setCoverDraft(e.target.value)}
                          className="w-full h-full resize-none p-4 bg-transparent text-sm leading-relaxed font-mono outline-none"
                          placeholder="Edit your cover letter content..."
                        />
                      )}
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
                      disabled={downloadingCover}
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

            {/* Success Message and Apply Button (both buttons always visible) */}
            <div className="mt-8 text-center space-y-6">
              <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200/30 backdrop-blur-sm rounded-2xl shadow-xl max-w-3xl mx-auto">
                <CardContent className="p-8">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">Documents Ready!</h3>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                    Your AI-optimized resume and cover letter are ready for download. These documents have been tailored specifically for your target role to maximize your chances of success.
                  </p>

                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-6 border border-green-200/50 dark:border-green-700/30">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {jobApplyLink
                        ? 'Ready to take the next step? Apply directly to the job posting:'
                        : 'No job link found. You can still apply using your downloaded documents.'}
                    </p>

                    <ActionButtons />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </>
    )
  }

  // default view (no generated docs yet)
  return (
    <>
      <StatusBar message={status.message} type={status.type} visible={status.visible} onClose={hideStatus} />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {jobMeta}

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
      </main>
    </>
  )
}




