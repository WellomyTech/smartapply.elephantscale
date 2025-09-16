'use client'
import React, { useEffect, useState } from 'react'
import JobScanList from '@/components/JobScanList'
import InterviewScanList from '@/components/InterviewScanList'

const API_URL = process.env.NEXT_PUBLIC_API_BASE

export default function InterviewPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchReports() {
      setLoading(true)
      setError(null)
      try {
        const userEmail =
          localStorage.getItem('user_email') || localStorage.getItem('userEmail')
        if (!userEmail) {
          setError('User email not found!')
          setLoading(false)
          return
        }
        const res = await fetch(`${API_URL}user-dashboard?user_email=${encodeURIComponent(userEmail)}`)
        const data = await res.json()
        if (Array.isArray(data?.reports)) {
          // Show all job scans, ensure job_title/company fallback
          setReports(
            data.reports.map((r: any) => ({
              ...r,
              job_title: r.job_title || 'Untitled role',
              job_company: r.job_company || '—',
            }))
          )
        } else {
          setReports([])
        }
      } catch (err) {
        setError('Failed to fetch reports')
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        Loading job scans...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12 text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      {/* <h1 className="text-2xl font-bold mb-4">Job Applications</h1> */}
      {reports.length === 0 ? (
        <div className="text-muted-foreground">No job scans found.</div>
      ) : (
        <InterviewScanList reports={reports} />
      )}
    </div>
  )
}