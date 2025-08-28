 'use client'
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import DashboardButton from '@/components/DashboardButton'

export default function JobKitResultPage() {
  const API_KEY = process.env.NEXT_PUBLIC_API_BASE
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()

  const [jobLink, setJobLink] = useState<string | null>(null)
  const [resumeText, setResumeText] = useState<string | null>(null)
  const [coverLetterText, setCoverLetterText] = useState<string | null>(null)

  const [downloadingResume, setDownloadingResume] = useState(false)
  const [downloadingCover, setDownloadingCover] = useState(false)

  useEffect(() => {
    setJobLink(localStorage.getItem('jobLink') || null)
    setResumeText(localStorage.getItem('generated_resume') || null)
    setCoverLetterText(localStorage.getItem('generated_cover_letter') || null)
  }, [])

  if (!isLoading && !user) {
    router.replace('/')
    return null
  }
  if (isLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    localStorage.clear()
  }

  const fallbackResume = `Your resume will appear here.`
  const fallbackCover = `Your cover letter will appear here.`

  const downloadResumePdf = async () => {
    const latex = localStorage.getItem('latex_resume')
    if (!latex) {
      alert('No LaTeX resume found!')
      return
    }

    const response = await fetch('https://latex.ytotech.com/builds/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler: 'pdflatex',
        resources: [{ content: latex, main: true, file: 'resume.tex' }],
      }),
    })

    if (!response.ok) {
      alert('PDF generation failed')
      return
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resume.pdf'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadResumeDocx = async () => {
    const API_KEY = process.env.NEXT_PUBLIC_API_BASE
    const reportId = localStorage.getItem('report_id')

    if (!reportId) {
      alert('No report_id found in localStorage!')
      return
    }

    setDownloadingResume(true)
    try {
      const response = await fetch(`${API_KEY}download-custom-resume-docx?report_id=${reportId}`)
      if (!response.ok) {
        alert('Failed to generate/download resume DOCX')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resume.docx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Resume download failed!')
      console.error(err)
    } finally {
      setDownloadingResume(false)
    }
  }

  const downloadCoverLetterDocx = async () => {
    const coverLetter = localStorage.getItem('generated_cover_letter')
    if (!coverLetter) {
      alert('No cover letter found in localStorage!')
      return
    }

    setDownloadingCover(true)
    const formData = new FormData()
    formData.append('cover_letter_text', coverLetter)

    try {
      const response = await fetch(`${API_KEY}generate-cover-letter-pdf`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error('Failed to generate cover letter DOCX')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'cover_letter.docx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Cover letter download failed!')
      console.error(err)
    } finally {
      setDownloadingCover(false)
    }
  }

  return (
    <main className="px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Generated Resume &amp; Cover Letter</h1>
        <div className="flex gap-2">
          <DashboardButton />
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full md:h-[calc(100vh-13rem)]">
        <Card className="flex-1 flex flex-col">
          <CardContent className="flex flex-col h-full p-6">
            <h2 className="text-xl font-semibold mb-2">Resume</h2>
            <div className="flex-1 bg-muted rounded-md p-4 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap break-words">{resumeText || fallbackResume}</pre>
            </div>
            <Button className="mt-4" onClick={downloadResumeDocx} disabled={!resumeText || downloadingResume} aria-busy={downloadingResume}>
              {downloadingResume ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Preparing download…</> : 'Download Resume (.docx)'}
            </Button>
          </CardContent>
        </Card>

        <Card className="flex-1 flex flex-col">
          <CardContent className="flex flex-col h-full p-6">
            <h2 className="text-xl font-semibold mb-2">Cover Letter</h2>
            <div className="flex-1 bg-muted rounded-md p-4 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap break-words">{coverLetterText || fallbackCover}</pre>
            </div>
            <Button className="mt-4" onClick={downloadCoverLetterDocx} disabled={!coverLetterText || downloadingCover} aria-busy={downloadingCover}>
              {downloadingCover ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Preparing download…</> : 'Download Cover Letter (.docx)'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
