 'use client'
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2, FileText, Download, Sparkles, CheckCircle, ArrowLeft, Eye, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import DashboardButton from '@/components/DashboardButton'
import { StatusBar, useStatusBar } from '@/components/ui/status-bar'

export default function JobKitResultPage() {
  const API_KEY = process.env.NEXT_PUBLIC_API_BASE
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()

  const [jobLink, setJobLink] = useState<string | null>(null)
  const [resumeText, setResumeText] = useState<string | null>(null)
  const [coverLetterText, setCoverLetterText] = useState<string | null>(null)

  const [downloadingResume, setDownloadingResume] = useState(false)
  const [downloadingCover, setDownloadingCover] = useState(false)

  // Status bar hook
  const { status, showStatus, hideStatus } = useStatusBar()

  useEffect(() => {
    const jobUrl = localStorage.getItem('job_url') || localStorage.getItem('jobLink') || localStorage.getItem('job_link') || null
    const resume = localStorage.getItem('generated_resume') || null
    const coverLetter = localStorage.getItem('generated_cover_letter') || null
    
    console.log('Results page - Loading from localStorage:')
    console.log('Job URL:', jobUrl)
    console.log('Resume text:', resume ? `${resume.substring(0, 100)}...` : 'null')
    console.log('Cover letter text:', coverLetter ? `${coverLetter.substring(0, 100)}...` : 'null')
    
    setJobLink(jobUrl)
    setResumeText(resume)
    setCoverLetterText(coverLetter)
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
      showStatus('No report ID found. Please regenerate your resume.', 'error')
      return
    }

    setDownloadingResume(true)
    showStatus('Preparing resume download...', 'loading')
    try {
      const response = await fetch(`${API_KEY}download-custom-resume-docx?report_id=${reportId}`)
      if (!response.ok) {
        showStatus('Failed to generate resume DOCX', 'error')
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
      showStatus('Resume downloaded successfully!', 'success')
    } catch (err) {
      showStatus('Resume download failed!', 'error')
      console.error(err)
    } finally {
      setDownloadingResume(false)
    }
  }

  const downloadCoverLetterDocx = async () => {
    const coverLetter = localStorage.getItem('generated_cover_letter')
    if (!coverLetter) {
      showStatus('No cover letter found. Please regenerate your documents.', 'error')
      return
    }

    setDownloadingCover(true)
    showStatus('Preparing cover letter download...', 'loading')
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
      showStatus('Cover letter downloaded successfully!', 'success')
    } catch (err) {
      showStatus('Cover letter download failed!', 'error')
      console.error(err)
    } finally {
      setDownloadingCover(false)
    }
  }

  return (
    <>
      <StatusBar
        message={status.message}
        type={status.type}
        visible={status.visible}
        onClose={hideStatus}
      />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
        <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-200/20 backdrop-blur-sm">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-300">AI Generation Complete</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Your AI-Optimized Documents
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Review and download your personalized resume and cover letter
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-white/20 rounded-xl hover:bg-white/90"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Analysis
          </Button>
          <div className="flex gap-3">
            <DashboardButton />
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-white/20 rounded-xl hover:bg-white/90"
            >
              <LogOut className="mr-2 h-4 w-4" /> 
              Logout
            </Button>
          </div>
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

        {/* Success Message and Apply Button */}
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
                  {jobLink ? 
                    "Ready to take the next step? Apply directly to the job posting:" :
                    "Ready to apply? Use your downloaded documents to apply to job postings:"
                  }
                </p>
                {jobLink ? (
                  <Button 
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                    onClick={() => window.open(jobLink, '_blank')}
                  >
                    <ExternalLink className="mr-3 h-5 w-5" />
                    Apply to Job Now
                  </Button>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      No specific job link found. You can now apply to any job posting with your optimized documents.
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={() => router.push('/job-kit')}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Job Kit
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </main>
    </>
  )
}
