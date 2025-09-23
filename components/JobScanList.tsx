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
import { FileText, Loader2, Pencil, Download, Cpu, User, Trash2 } from 'lucide-react'
import { StatusBar, useStatusBar } from "@/components/ui/status-bar"
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

// NEW: archive helper for single/multiple ids
async function archiveReports(reportIds: number[]) {
  const params = new URLSearchParams()
  params.append('report_ids', reportIds.join(','))
  params.append('delete_original', 'true')
  const res = await fetch(`${API_URL}archive-reports`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Archive failed: ${res.status} ${txt}`)
  }
  return res.json().catch(() => null)
}

export default function JobScanList({ reports }: JobScanListProps) {
  const router = useRouter()
  const { status, showStatus, hideStatus } = useStatusBar()

  // Track applied and interview states in localStorage
  const [appliedMap, setAppliedMap] = useState<{ [id: number]: boolean }>({})
  const [interviewMap, setInterviewMap] = useState<{ [id: number]: boolean }>({})

  // Tabs: all | applied | interview
  const [activeTab, setActiveTab] = useState<'all' | 'applied' | 'interview'>('all')

  // NEW: selection + archiving state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [archiving, setArchiving] = useState(false)

  // NEW: locally hide archived rows (without refetch)
  const [hiddenIds, setHiddenIds] = useState<Set<number>>(new Set())

  React.useEffect(() => {
    // Prefer localStorage, else use API response
    const appliedLS = JSON.parse(localStorage.getItem('applied_jobs') || '{}')
    const interviewLS = JSON.parse(localStorage.getItem('interview_jobs') || '{}')

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

  const handleBehavioral = (reportId: number, jobTitle?: string, companyName?: string) => {
    localStorage.setItem('report_id', String(reportId))
    localStorage.setItem('job_title', jobTitle || '')
    localStorage.setItem('company_name', companyName || '')
    router.push('/dashboard/behavioral')
  }

  const handleMarkAsApplied = (reportId: number) => {
    setAppliedMap(prev => {
      const updated = { ...prev, [reportId]: true }
      postJobStatus(reportId, true, interviewMap[reportId])
      showStatus('Job status updated', 'success')
      return updated
    })
  }

  const handleUnmarkAsApplied = (reportId: number) => {
    setAppliedMap(prev => {
      const updated = { ...prev, [reportId]: false }
      postJobStatus(reportId, false, false)
      showStatus('Job status updated', 'success')
      return updated
    })
    setInterviewMap(prev => ({ ...prev, [reportId]: false }))
  }

  const handleInterviewCheckbox = (reportId: number, checked: boolean) => {
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

  function formatDateTime(dateString?: string) {
    return formatLocalFromUTC(dateString)
  }

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

  // Base (exclude locally archived)
  const baseReports = reports.filter(r => !hiddenIds.has(r.id))

  // Sort latest first
  const sortedReports = [...baseReports].sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  // Counts and filtered list based on tab
  const counts = {
    all: sortedReports.length,
    applied: sortedReports.filter(r => (appliedMap[r.id] ?? !!r.applied)).length,
    interview: sortedReports.filter(r => (interviewMap[r.id] ?? !!r.r_interview)).length,
  }

  const filteredReports = sortedReports.filter(r => {
    const isApplied = appliedMap[r.id] ?? (typeof r.applied === 'boolean' ? r.applied : false)
    const isInterview = interviewMap[r.id] ?? (typeof r.r_interview === 'boolean' ? r.r_interview : false)
    if (activeTab === 'applied') return isApplied
    if (activeTab === 'interview') return isInterview
    return true
  })

  // Selection helpers
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const areAllVisibleSelected = filteredReports.length > 0 &&
    filteredReports.every(r => selectedIds.has(r.id))
  const toggleSelectAllVisible = () => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (areAllVisibleSelected) {
        filteredReports.forEach(r => next.delete(r.id))
      } else {
        filteredReports.forEach(r => next.add(r.id))
      }
      return next
    })
  }

  // Archive handlers
  const doArchive = async (ids: number[]) => {
    if (ids.length === 0) return
    setArchiving(true)
    try {
      await archiveReports(ids)
      setHiddenIds(prev => {
        const next = new Set(prev)
        ids.forEach(id => next.add(id))
        return next
      })
      setSelectedIds(prev => {
        const next = new Set(prev)
        ids.forEach(id => next.delete(id))
        return next
      })
      showStatus(`Archived ${ids.length} ${ids.length === 1 ? 'scan' : 'scans'}`, 'success')
    } catch (e) {
      showStatus('Failed to archive. Try again.', 'error')
    } finally {
      setArchiving(false)
    }
  }

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

        {/* Tabs + bulk actions */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {/* Left: tabs */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={activeTab === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveTab('all')}
            >
              All Applications ({counts.all})
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'applied' ? 'default' : 'outline'}
              onClick={() => setActiveTab('applied')}
            >
              Applied ({counts.applied})
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'interview' ? 'default' : 'outline'}
              onClick={() => setActiveTab('interview')}
            >
              Interview Scheduled ({counts.interview})
            </Button>
          </div>

          {/* Right: bulk actions */}
          <div className="ml-auto flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={areAllVisibleSelected}
                onChange={toggleSelectAllVisible}
              />
              Select all in view
            </label>
            <Button
              size="sm"
              variant="destructive"
              disabled={selectedIds.size === 0 || archiving}
              onClick={() => {
                const ids = Array.from(selectedIds)
                if (ids.length === 0) return
                const ok = window.confirm(`Archive ${ids.length} ${ids.length === 1 ? 'selected scan' : 'selected scans'}?`)
                if (!ok) return
                doArchive(ids)
              }}
            >
              {archiving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete Selected
            </Button>
          </div>
        </div>



        {/* Empty state per tab */}
        {filteredReports.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No applications in this view yet.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {filteredReports.map((report) => {
              const canDownload = report.has_updated_resume === 1 || report.has_updated_resume === true
              const isSelected = selectedIds.has(report.id)
              return (
                <div key={report.id} className="group w-full">
                  <div className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl flex flex-col gap-3 transition-all duration-300 border-2 border-blue-100 dark:border-slate-700 hover:border-blue-400 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-md p-6">
                    {/* Top: selection + Job title + company */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {/* NEW: row checkbox */}
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={isSelected}
                          onChange={() => toggleSelect(report.id)}
                          aria-label={`Select ${report.job_title || 'job'}`}
                        />
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

                    {/* Middle: Status + Actions */}
                    <div className="mt-2 flex items-center gap-4">
                      {/* Left: Applied/Interview status */}
                      <div className="flex items-center gap-4">
                        {appliedMap[report.id] ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
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
                            </TooltipTrigger>
                            <TooltipContent side="top" align="start" className="text-xs">
                              Click to mark as not applied
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs px-3 py-1"
                                onClick={() => handleMarkAsApplied(report.id)}
                              >
                                Mark as Applied
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="start" className="text-xs">
                              Mark this job as applied
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {appliedMap[report.id] && (
                          <label className="flex items-center gap-1 text-xs cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!interviewMap[report.id]}
                              onChange={e => handleInterviewCheckbox(report.id, e.target.checked)}
                            />
                            Interview Scheduled
                          </label>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="ml-auto flex flex-wrap gap-2 sm:flex-nowrap sm:justify-end">
                        {canDownload ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                aria-label="Download"
                                onClick={() => handleDownload(report.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="end" className="text-xs">
                              Download resume
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex">
                                <Button variant="outline" size="icon" aria-label="Download" disabled>
                                  <Download className="h-4 w-4" />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="end" className="text-xs">
                              Please Generate Resume First
                            </TooltipContent>
                          </Tooltip>
                        )}

                        <Tooltip>
                          <TooltipTrigger asChild>
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
                          </TooltipTrigger>
                          <TooltipContent side="top" align="end" className="text-xs">
                            Edit Job Details and Documents
                          </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label="Behavioral interview"
                              onClick={() => handleBehavioral(report.id, report.job_title, report.job_company)}
                            >
                              <User className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="end" className="text-xs">
                            Behavioral Interview Prep
                          </TooltipContent>
                        </Tooltip>

                        {canDownload ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                aria-label="Technical interview"
                                onClick={() => handleInterview(report.id, report.job_title, report.job_company)}
                                disabled={generatingId === report.id}
                              >
                                {generatingId === report.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Cpu className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="end" className="text-xs">
                              {generatingId === report.id ? 'Generating questions…' : 'Technical Interview Prep'}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  aria-label="Technical interview (disabled)"
                                  disabled
                                  className="opacity-60 cursor-not-allowed"
                                >
                                  <Cpu className="h-4 w-4" />
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top" align="end" className="text-xs">
                              First Generate Resume then use this Interview Module
                            </TooltipContent>
                          </Tooltip>
                        )}

                        {/* NEW: per-row archive */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              aria-label="Delete this scan"
                              onClick={() => {
                                const ok = window.confirm('Delete this scan?')
                                if (!ok) return
                                doArchive([report.id])
                              }}
                              disabled={archiving}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" align="end" className="text-xs">
                            Delete this scan
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

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
