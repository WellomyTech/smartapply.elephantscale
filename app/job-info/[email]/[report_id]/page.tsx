'use client'
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

interface JobInfoPageProps {
  params: {
    email: string
    report_id: string
  }
}

export default function JobInfoPage({ params }: JobInfoPageProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()

  const { email, report_id } = params

  const [jobData, setJobData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!report_id || !email) return
    fetch(
      `${API_URL}user-dashboard?user_email=${email}&report_id=${report_id}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.report) {
          setJobData(data.report)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [report_id, email, API_URL])

  if (!isLoading && !user) {
    router.replace('/')
    return null
  }
  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    localStorage.clear()
  }

  // ✅ Download Resume DOCX
  const downloadResumeDocx = async () => {
    if (!report_id) return alert('No report ID found!')
    try {
      const response = await fetch(
        `${API_URL}download-custom-resume-docx?report_id=${report_id}`
      )
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resume.docx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to download resume!')
    }
  }

  // ✅ Download Cover Letter DOCX
  const downloadCoverLetterDocx = async () => {
    if (!report_id) return alert('No report ID found!')
    try {
      const response = await fetch(
        `${API_URL}download-custom-cover-docx?report_id=${report_id}`
      )
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'cover_letter.docx'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Failed to download cover letter!')
    }
  }

  return (
    <div className="min-h-screen bg-[#eef5ff] p-8">
      {/* Top Bar */}
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Job Info</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </header>

      {/* Job Info */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold">{jobData?.job_title}</h2>
        <p className="text-gray-600">{jobData?.job_company}</p>
        <p className="mt-3 text-gray-800 whitespace-pre-wrap">
          {jobData?.job_description}
        </p>
      </div>

      {/* Resume & Cover Letter Side by Side */}
      <main className="flex flex-row gap-8 w-full h-[calc(100vh-18rem)]">
        {/* Resume */}
        <Card className="flex-1 h-full flex flex-col shadow-lg">
          <CardContent className="flex flex-col h-full">
            <h2 className="text-2xl font-semibold mb-2">Resume</h2>
            <div className="flex-1 bg-gray-50 rounded-md p-4 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap break-words">
                {jobData?.updated_resume || 'No resume found'}
              </pre>
            </div>
            <Button className="mt-4" onClick={downloadResumeDocx}>
              Download Resume (.docx)
            </Button>
          </CardContent>
        </Card>

        {/* Cover Letter */}
        <Card className="flex-1 h-full flex flex-col shadow-lg">
          <CardContent className="flex flex-col h-full">
            <h2 className="text-2xl font-semibold mb-2">Cover Letter</h2>
            <div className="flex-1 bg-gray-50 rounded-md p-4 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap break-words">
                {jobData?.cover_letter || 'No cover letter found'}
              </pre>
            </div>
            <Button className="mt-4" onClick={downloadCoverLetterDocx}>
              Download Cover Letter (.docx)
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
