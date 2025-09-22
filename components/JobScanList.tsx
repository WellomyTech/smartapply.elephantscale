'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { FileText, Loader2, Pencil, Download } from 'lucide-react'
import { StatusBar, useStatusBar } from "@/components/ui/status-bar"

// at the top
import { formatLocalFromUTC, timeAgoFromUTC } from '@/lib/dates'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'


interface Report {
  id: number
  job_title?: string
  job_company?: string
  created_at?: string
  applied?: boolean        // <-- Add this
  r_interview?: boolean    // <-- Add this
  has_updated_resume?: number | boolean // <-- Add this
}

interface JobScanListProps {
  reports: Report[]
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE

async function postJobStatus(reportId: number, applied?: boolean, r_interview?: boolean) {
  try {
    const params = new URLSearchParams()
    params.append('report_id', String(reportId))
    if (typeof applied === 'boolean') params.append('applied', String(applied))
    if (typeof r_interview === 'boolean') params.append('r_interview', String(r_interview))

    await fetch(`${API_URL}update-job-status`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
  } catch (err) {
    console.error('Failed to update job status', err)
  }
}

export default function JobScanList({ reports }: JobScanListProps) {
  const router = useRouter()
  const { status, showStatus, hideStatus } = useStatusBar()

  // Track applied and interview states in localStorage
  const [appliedMap, setAppliedMap] = useState<{ [id: number]: boolean }>({})
  const [interviewMap, setInterviewMap] = useState<{ [id: number]: boolean }>({})

  React.useEffect(() => {
    // Prefer localStorage, else use API response
    const appliedLS = JSON.parse(localStorage.getItem('applied_jobs') || '{}')
    const interviewLS = JSON.parse(localStorage.getItem('interview_jobs') || '{}')

    // If localStorage is empty, use API response
    if (Object.keys(appliedLS).length === 0 && reports.length > 0) {
      const initialApplied: { [id: number]: boolean } = {}
      reports.forEach(r => {
        if (typeof r.applied === 'boolean') initialApplied[r.id] = r.applied
      })
      setAppliedMap(initialApplied)
    } else {
      setAppliedMap(appliedLS)
    }

    if (Object.keys(interviewLS).length === 0 && reports.length > 0) {
      const initialInterview: { [id: number]: boolean } = {}
      reports.forEach(r => {
        if (typeof r.r_interview === 'boolean') initialInterview[r.id] = r.r_interview
      })
      setInterviewMap(initialInterview)
    } else {
      setInterviewMap(interviewLS)
    }
  }, [reports])

  // Save to localStorage when changed
  React.useEffect(() => {
    localStorage.setItem('applied_jobs', JSON.stringify(appliedMap))
  }, [appliedMap])
  React.useEffect(() => {
    localStorage.setItem('interview_jobs', JSON.stringify(interviewMap))
  }, [interviewMap])

  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatingId, setGeneratingId] = useState<number | string | null>(null)
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  // async function fetchResumeInfo(reportId: number) {
  //   setLoading(True)
  //   try {
  //     const userEmail = localStorage.getItem('user_email')
  //     const res = await fetch(`${API_URL}user-dashboard?user_email=${userEmail}&report_id=${reportId}`)
  //     const data = await res.json()
  //     if (data?.report) {
  //       setSelectedReport(data.report)
  //       setIsModalOpen(true)
  //     } else {
  //       alert('No data found!')
  //     }
  //   } catch (err) {
  //     console.error('Error fetching resume info:', err)
  //     alert('Failed to fetch data')
  //   } finally {
  //     setLoading(False)
  //   }
  // }

  const handleInterview = async (reportId: number, jobTitle?: string, companyName?: string) => {
    setGeneratingId(reportId)
    try {
      const response = await fetch(`${API_URL}generate-interview-questions`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ report_id: String(reportId) }),
      })
      if (!response.ok) throw new Error('Failed to generate questions')

      localStorage.setItem('report_id', String(reportId))
      localStorage.setItem('job_title', jobTitle || '')
      localStorage.setItem('company_name', companyName || '')

      router.push(`/interview?report_id=${reportId}`)
    } catch (err) {
      alert('Error generating questions. Please try again.')
    } finally {
      setGeneratingId(null)
    }
  }

  const handleViewQA = (reportId: number, jobTitle?: string, companyName?: string) => {
    localStorage.setItem('report_id', String(reportId))
    localStorage.setItem('job_title', jobTitle || '')
    localStorage.setItem('company_name', companyName || '')
    router.push(`/QA?report_id=${reportId}`)
  }

  // Handler for "Mark as Applied"
  const handleMarkAsApplied = (reportId: number) => {
    setAppliedMap(prev => {
      const updated = { ...prev, [reportId]: true }
      postJobStatus(reportId, true, interviewMap[reportId])
      showStatus('Job status updated', 'success')
      return updated
    })
  }

  // Handler for "Unmark as Applied"
  const handleUnmarkAsApplied = (reportId: number) => {
    setAppliedMap(prev => {
      const updated = { ...prev, [reportId]: false }
      // When unmarking applied, also clear interview flag
      postJobStatus(reportId, false, false)
      showStatus('Job status updated', 'success')
      return updated
    })
    // Reflect cleared interview flag locally
    setInterviewMap(prev => ({ ...prev, [reportId]: false }))
  }

  // Handler for Interview checkbox
  const handleInterviewCheckbox = (reportId: number, checked: boolean) => {
    // Only allow when Applied is true
    if (!appliedMap[reportId]) {
      showStatus('Please mark as Applied first.', 'warning')
      return
    }
    setInterviewMap(prev => {
      const updated = { ...prev, [reportId]: checked }
      postJobStatus(reportId, appliedMap[reportId], checked)
      showStatus('Job status updated', 'success')
      return updated
    })
  }

  // Helper to format date/time
  function formatDateTime(dateString?: string) {
    return formatLocalFromUTC(dateString)
  }

  // New: Download handler (same-page download)
  const handleDownload = async (reportId: number) => {
    try {
      showStatus('Preparing download…', 'info')
      const res = await fetch(`${API_URL}download-custom-resume-docx?report_id=${encodeURIComponent(reportId)}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume_${reportId}.docx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      showStatus('Download started', 'success')
    } catch (e) {
      showStatus('Failed to download resume', 'error')
    }
  }

  // Sort reports by created_at descending (latest first)
  const sortedReports = [...reports].sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <TooltipProvider>
      <div className="mt-8 space-y-3">
        <StatusBar
          message={status.message}
          type={status.type}
          visible={status.visible}
          onClose={hideStatus}
        />
        <h2 className="text-xl font-semibold text-foreground mb-2">Your Applications</h2>

        <div className="grid gap-8 md:grid-cols-2">
          {sortedReports.map((report) => {
            const canDownload = report.has_updated_resume === 1 || report.has_updated_resume === true
            return (
              <div key={report.id} className="group w-full">
                <div className="h-56 bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl flex flex-col justify-between transition-all duration-300 border-2 border-blue-100 dark:border-slate-700 hover:border-blue-400 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-md p-6">
                  {/* Top: Job title + company */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-6 w-6 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span className="text-lg font-semibold text-blue-700 dark:text-blue-300 break-words">
                        {report.job_title || 'Untitled role'}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground break-words">
                      {report.job_company || '—'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {report.created_at
                        ? <>Scanned: {formatLocalFromUTC(report.created_at)} <span className="opacity-70">({timeAgoFromUTC(report.created_at)})</span></>
                        : ''}
                    </div>
                  </div>
                  {/* Middle: Status */}
                  <div className="flex items-center gap-4 mt-2">
                    {/* Applied Button/Label */}
                    {appliedMap[report.id] ? (
                      <span
                        className="text-green-600 font-medium text-xs cursor-pointer transition-colors"
                        style={{ position: 'relative' }}
                        tabIndex={0}
                        onClick={() => handleUnmarkAsApplied(report.id)}
                        onKeyDown={e => { if (e.key === 'Enter') handleUnmarkAsApplied(report.id) }}
                        onMouseEnter={e => e.currentTarget.textContent = 'Mark as Not Applied'}
                        onMouseLeave={e => e.currentTarget.textContent = 'Applied'}
                        aria-label="Mark as not applied"
                      >
                        Applied
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs px-3 py-1"
                        onClick={() => handleMarkAsApplied(report.id)}
                      >
                        Mark as Applied
                      </Button>
                    )}

                    {/* Interview checkbox: only show when Applied is true */}
                    {appliedMap[report.id] && (
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!interviewMap[report.id]}
                          onChange={e => handleInterviewCheckbox(report.id, e.target.checked)}
                        />
                        Interview Received
                      </label>
                    )}
                  </div>
                  {/* Bottom: Actions */}
                  <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:justify-end w-full sm:w-auto mt-4">
                    {canDownload ? (
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label="Download"
                        onClick={() => handleDownload(report.id)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="inline-flex">
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label="Download"
                              disabled
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" align="end" className="text-xs">
                          Please generate resume first
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Edit resume info"
                      onClick={() => {
                        const userEmail =
                          localStorage.getItem('user_email') || localStorage.getItem('userEmail')
                        if (!userEmail) {
                          alert('User email not found!')
                          return
                        }
                        router.push(`/job-info/${encodeURIComponent(userEmail)}/${report.id}`)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Dialog unchanged below */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Resume Info</DialogTitle>
              <DialogDescription>Details from your previous scan.</DialogDescription>
            </DialogHeader>
            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
              </div>
            ) : selectedReport ? (
              <div className="space-y-3">
                <p><strong>Job Title:</strong> {selectedReport.job_title}</p>
                <p><strong>Company:</strong> {selectedReport.job_company}</p>
                <p className="text-sm"><strong>Description:</strong></p>
                <pre className="bg-muted rounded p-3 whitespace-pre-wrap break-words text-sm">
                  {selectedReport.job_description}
                </pre>
                <div className="grid gap-3">
                  <div>
                    <p className="font-medium text-sm">Skills Match</p>
                    <pre className="bg-muted rounded p-3 whitespace-pre-wrap break-words text-xs">
                      {JSON.stringify(selectedReport.skills_match, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Gaps</p>
                    <pre className="bg-muted rounded p-3 whitespace-pre-wrap break-words text-xs">
                      {JSON.stringify(selectedReport.gaps, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Bonus Points</p>
                    <pre className="bg-muted rounded p-3 whitespace-pre-wrap break-words text-xs">
                      {JSON.stringify(selectedReport.bonus_points, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="font-medium text-sm">Recommendations</p>
                    <pre className="bg-muted rounded p-3 whitespace-pre-wrap break-words text-xs">
                      {JSON.stringify(selectedReport.recommendations, null, 2)}
                    </pre>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )

}
