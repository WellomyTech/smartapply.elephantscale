'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, CheckCircle2, Circle, Briefcase, Building2 } from 'lucide-react'
import { StatusBar, useStatusBar } from "@/components/ui/status-bar"
import { formatLocalFromUTC, timeAgoFromUTC } from '@/lib/dates'

interface Report {
  id: number
  job_title?: string
  job_company?: string
  created_at?: string
  applied?: boolean
  r_interview?: boolean
}

interface InterviewScanListProps {
  reports: Report[]
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE

// Light gradient helper classes
const softCardBg =
  'bg-gradient-to-br from-white via-indigo-50/60 to-sky-50/60 dark:from-slate-900/60 dark:via-slate-800/50 dark:to-slate-900/60'
const softRing = 'ring-1 ring-slate-200/70 hover:ring-slate-300/80 dark:ring-slate-700/50 dark:hover:ring-slate-600/60'

function initials(name?: string) {
  if (!name) return '•'
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map(p => p[0]?.toUpperCase() ?? '').join('') || '•'
}

export default function InterviewScanList({ reports }: InterviewScanListProps) {
  const router = useRouter()
  const { status, showStatus, hideStatus } = useStatusBar()
  const [generatingId, setGeneratingId] = useState<number | string | null>(null)
  const [generatingType, setGeneratingType] = useState<'technical' | 'behavioral' | null>(null)

  // Sort reports by created_at descending
  const sortedReports = [...reports].sort((a, b) => {
    if (!a.created_at || !b.created_at) return 0
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  // Handler for interview generation
  const handleGenerateInterview = async (report: Report, type: 'technical' | 'behavioral') => {
    setGeneratingId(report.id)
    setGeneratingType(type)
    try {
      const response = await fetch(`${API_URL}generate-interview-questions`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          report_id: String(report.id),
          type, // Pass interview type to backend
        }),
      })
      if (!response.ok) throw new Error('Failed to generate questions')
      localStorage.setItem('report_id', String(report.id))
      localStorage.setItem('job_title', report.job_title || '')
      localStorage.setItem('company_name', report.job_company || '')
      localStorage.setItem('interview_type', type)
      router.push(`/interview?report_id=${report.id}&type=${type}`)
    } catch (err) {
      showStatus('Error generating questions. Please try again.', 'error')
    } finally {
      setGeneratingId(null)
      setGeneratingType(null)
    }
  }

  return (
    <div className="mt-8 space-y-3">
      <StatusBar
        message={status.message}
        type={status.type}
        visible={status.visible}
        onClose={hideStatus}
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedReports.map((report) => (
          <Card
            key={report.id}
            className={`${softCardBg} ${softRing} border-0 shadow-lg hover:shadow-xl rounded-2xl transition-all duration-200`}
          >
            <CardContent className="p-6">
              {/* Header: Avatar + Title/Company */}
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-200 via-sky-200 to-purple-200 text-indigo-800 flex items-center justify-center font-bold shadow-sm">
                    {initials(report.job_company || report.job_title)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center shadow ${report.applied ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                    {report.applied ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 text-slate-400" />
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-100">
                      <Briefcase className="h-4 w-4 text-indigo-500" />
                      {report.job_title || 'Untitled role'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                      <Building2 className="h-3.5 w-3.5" />
                      {report.job_company || '—'}
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-slate-500">
                    {report.created_at ? (
                      <>
                        Generated: {formatLocalFromUTC(report.created_at)}
                        <span className="ml-2 opacity-70">({timeAgoFromUTC(report.created_at)})</span>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="my-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                    report.applied
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                  title={report.applied ? 'You marked this job as applied' : 'Not applied yet'}
                >
                  {report.applied ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                  {report.applied ? 'Applied' : 'Not Applied'}
                </span>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                    report.r_interview
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                  title={report.r_interview ? 'Interview received' : 'No interview yet'}
                >
                  {report.r_interview ? (
                    <CheckCircle2 className="w-4 h-4 text-purple-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-400" />
                  )}
                  {report.r_interview ? 'Interview Received' : 'No Interview'}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-5 grid gap-2">
                <Button
                  variant="outline"
                  className="w-full font-semibold border-indigo-200 bg-white/80 hover:bg-indigo-50 text-indigo-700"
                  onClick={() => {
                    localStorage.setItem('report_id', String(report.id))
                    localStorage.setItem('job_title', report.job_title || '')
                    localStorage.setItem('company_name', report.job_company || '')
                    router.push(`/QA?report_id=${report.id}`)
                  }}
                >
                  Interview Q&A
                </Button>

                <Button
                  className="w-full font-semibold text-white bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 shadow-sm"
                  onClick={() => handleGenerateInterview(report, 'technical')}
                  disabled={generatingId === report.id && generatingType === 'technical'}
                >
                  {generatingId === report.id && generatingType === 'technical' ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Technical…
                    </span>
                  ) : (
                    'Technical Interview'
                  )}
                </Button>

                {/* If you enable behavioral generation later, keep soft, light colors */}
                {/* <Button
                  className="w-full font-semibold text-white bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 shadow-sm"
                  onClick={() => handleGenerateInterview(report, 'behavioral')}
                  disabled={generatingId === report.id && generatingType === 'behavioral'}
                >
                  {generatingId === report.id && generatingType === 'behavioral' ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating Behavioral…
                    </span>
                  ) : (
                    'Behavioral Interview'
                  )}
                </Button> */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sortedReports.length === 0 && (
        <div className="text-muted-foreground text-center py-12 text-lg">
          No job scans found. Start applying and prepare for your interviews!
        </div>
      )}
    </div>
  )
}
