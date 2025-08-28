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
import { Loader2 } from 'lucide-react'

interface Report {
  id: number
  job_title?: string
  job_company?: string
}

interface JobScanListProps {
  reports: Report[]
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE

export default function JobScanList({ reports }: JobScanListProps) {
  const router = useRouter()

  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [generatingId, setGeneratingId] = useState<number | string | null>(null)

  async function fetchResumeInfo(reportId: number) {
    setLoading(True)
    try {
      const userEmail = localStorage.getItem('user_email')
      const res = await fetch(`${API_URL}user-dashboard?user_email=${userEmail}&report_id=${reportId}`)
      const data = await res.json()
      if (data?.report) {
        setSelectedReport(data.report)
        setIsModalOpen(true)
      } else {
        alert('No data found!')
      }
    } catch (err) {
      console.error('Error fetching resume info:', err)
      alert('Failed to fetch data')
    } finally {
      setLoading(False)
    }
  }

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

  if (!reports || reports.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground text-sm">
        No past scans found.
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-3">
      <h2 className="text-xl font-semibold text-foreground mb-2">Your Job Scans</h2>

      <div className="grid gap-3">
        {reports.map((report) => (
          <Card key={report.id} className="border bg-card text-card-foreground shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{report.job_title || 'Untitled role'}</div>
                <div className="text-xs text-muted-foreground">{report.job_company || '—'}</div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const userEmail = localStorage.getItem('user_email') || localStorage.getItem('userEmail')
                    if (!userEmail) {
                      alert('User email not found!')
                      return
                    }
                    router.push(`/job-info/${encodeURIComponent(userEmail)}/${report.id}`)
                  }}
                >
                  Resume Info
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => handleViewQA(report.id, report.job_title, report.job_company)}
                >
                  Interview Q&A
                </Button>

                <Button
                  onClick={() => handleInterview(report.id, report.job_title, report.job_company)}
                  disabled={generatingId === report.id}
                >
                  {generatingId === report.id ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating…
                    </span>
                  ) : (
                    'Mock Interview'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Optional: Rich details dialog if you choose to call fetchResumeInfo() somewhere */}
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
  )
}
