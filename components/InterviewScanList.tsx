'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, CheckCircle2, Circle } from 'lucide-react'
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
      <h2 className="text-3xl font-extrabold text-gradient bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-8 text-center tracking-tight">
        Interview Dashboard
      </h2>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {sortedReports.map((report) => (
          <Card
            key={report.id}
            className="border-0 shadow-xl rounded-xl bg-gradient-to-br from-white via-indigo-50 to-purple-100 hover:scale-[1.02] transition-transform"
          >
            <CardContent className="p-7 flex flex-col gap-5">
              {/* Job Info */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl font-bold text-indigo-700">{report.job_title || 'Untitled role'}</span>
                  <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-sm text-indigo-600 font-semibold">
                    {report.job_company || '—'}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Generated: {report.created_at ? formatLocalFromUTC(report.created_at) : ''}
                  {report.created_at && (
                    <span className="ml-2 opacity-70">({timeAgoFromUTC(report.created_at)})</span>
                  )}
                </div>
              </div>
              {/* Status Badges */}
              <div className="flex gap-3 mt-2">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${report.applied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {report.applied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-gray-400" />}
                  {report.applied ? 'Applied' : 'Not Applied'}
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${report.r_interview ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                  {report.r_interview ? <CheckCircle2 className="w-4 h-4 text-purple-500" /> : <Circle className="w-4 h-4 text-gray-400" />}
                  {report.r_interview ? 'Interview Received' : 'No Interview'}
                </span>
              </div>
              {/* Actions */}
              <div className="flex flex-col gap-2 mt-4">
                <Button
                  variant="outline"
                  className="w-full font-semibold border-indigo-300 hover:bg-indigo-50"
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
                  className="w-full font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
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
                {/* <Button
                  className="w-full font-semibold bg-pink-500 hover:bg-pink-600 text-white"
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
