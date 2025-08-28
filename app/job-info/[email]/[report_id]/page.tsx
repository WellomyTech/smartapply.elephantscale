 'use client'
export const dynamic = 'force-dynamic'

import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2, Check, X, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import DashboardButton from '@/components/DashboardButton'

import { useEntitlement } from "@/hooks/useEntitlement"
import PricingModal from "@/components/PricingButtons"

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

export default function JobInfoPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE
  const router = useRouter()
  const params = useParams()
  const { user, isLoading, logout } = useAuth()

  const email = Array.isArray(params.email) ? params.email[0] : params.email
  const report_id = Array.isArray(params.report_id) ? params.report_id[0] : params.report_id

  const [jobData, setJobData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSkills, setShowSkills] = useState(false)
  const [workedOn, setWorkedOn] = useState<boolean[]>([])
  const [generating, setGenerating] = useState(false)

  const [downloadingResume, setDownloadingResume] = useState(false)
  const [downloadingCover, setDownloadingCover] = useState(false)

  const {
    isLoading: entLoading,
    isPremium,
    canGenerate,
    freeRemain,
  } = useEntitlement()
  const [showPaywall, setShowPaywall] = useState(false)

  useEffect(() => {
    if (!report_id || !email) return
    fetch(`${API_URL}user-dashboard?user_email=${email}&report_id=${report_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.report) {
          let report = { ...data.report };
          try {
            if (typeof report.skills_match === "string") { report.skills_match = JSON.parse(report.skills_match) }
          } catch {}
          try {
            if (typeof report.gaps === "string") { report.gaps = JSON.parse(report.gaps) }
          } catch {}
          setJobData(report);
          localStorage.setItem('report_id', report.id || report.report_id || (report_id as string))
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [report_id, email, API_URL])

  useEffect(() => {
    if (!jobData) return
    const gaps = safeJsonArray(jobData.gaps)
    setWorkedOn(Array(gaps.length).fill(false))
  }, [jobData?.gaps])

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

  const handleLogout = () => {
    logout()
    localStorage.clear()
  }

  async function handleGenerateResume() {
    if (!user?.email || !jobData) return

    const gaps = safeJsonArray(jobData.gaps)
    const selectedSkills = gaps
      .map((skill, idx) => workedOn[idx] ? skill : null)
      .filter(Boolean) as string[]

    if (selectedSkills.length === 0) {
      alert("Please select at least one skill you have worked on.")
      return
    }

    const jobInfoToSend = jobData.job_link ? jobData.job_link : jobData.job_description
    const email = localStorage.getItem('user_email') || ''

    const form = new FormData()
    form.append('user_email', email)
    form.append('additional_skills', selectedSkills.join(', '))
    form.append('job_description', jobInfoToSend)
    if (jobData.id || jobData.report_id) {
      form.append('report_id', (jobData.id || jobData.report_id).toString())
    }

    setGenerating(true)
    try {
      const res = await fetch(`${API_URL}generate-resume`, {
        method: 'POST',
        body: form,
        headers: { accept: 'application/json' }
      })
      const data = await res.json()
      if (data.updated_resume) {
        localStorage.setItem('generated_resume', data.updated_resume)
        if (data.cover_letter) localStorage.setItem('generated_cover_letter', data.cover_letter)
        router.push('/job-kit/result')
      } else {
        alert("No resume generated.")
      }
    } catch (err) {
      alert("Failed to generate resume.")
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const downloadResumeDocx = async () => {
    const API_KEY = process.env.NEXT_PUBLIC_API_BASE
    const reportId = localStorage.getItem("report_id")
    if (!reportId) {
      alert("No report_id found in localStorage!")
      return
    }
    setDownloadingResume(true)
    try {
      const response = await fetch(`${API_KEY}download-custom-resume-docx?report_id=${reportId}`)
      if (!response.ok) {
        alert("Failed to generate/download resume DOCX")
        return
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "resume.docx"
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert("Resume download failed!")
      console.error(err)
    } finally {
      setDownloadingResume(false)
    }
  }

  const downloadCoverLetterDocx = async () => {
    const coverLetter = localStorage.getItem('generated_cover_letter')
    if (!coverLetter) {
      alert("No cover letter found in localStorage!")
      return
    }
    setDownloadingCover(true)
    const formData = new FormData()
    formData.append('cover_letter_text', coverLetter)
    try {
      const response = await fetch(`${API_URL}generate-cover-letter-pdf`, {
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

  const jobMeta = (
    <div className="bg-background rounded-xl border p-6 mb-6">
      <h2 className="text-xl font-semibold">{jobData?.job_title || 'Unknown Title'}</h2>
      <p className="text-muted-foreground">{jobData?.job_company || 'Unknown Company'}</p>
      {jobData?.job_link && (
        <a
          className="inline-flex items-center gap-2 mt-2 text-primary hover:underline"
          href={jobData.job_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="h-4 w-4" /> View Job Posting
        </a>
      )}
      <p className="mt-3 whitespace-pre-wrap">{jobData?.job_description}</p>
    </div>
  )

  const gaps = safeJsonArray(jobData.gaps)
  const skills_match = Array.isArray(jobData.skills_match) ? jobData.skills_match : []

  if (showSkills) {
    return (
      <main className="px-4 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Job Info</h1>
          <div className="flex gap-2">
            <DashboardButton />
            <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto">
          {jobMeta}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4">Skills Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left">Skill</th>
                      <th className="px-3 py-2 text-center">In Job</th>
                      <th className="px-3 py-2 text-center">In Resume</th>
                      <th className="px-3 py-2 text-center">Have You Worked On It?</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(skills_match) && skills_match
                      .filter(({ in_job }: any) => in_job)
                      .map(({ skill, in_job, in_resume }: any, i: number) => {
                        const showRadio = gaps.includes(skill)
                        return (
                          <tr key={skill} className="even:bg-muted/30">
                            <td className="px-3 py-2">{skill}</td>
                            <td className="px-3 py-2 text-center">{in_job ? <Check className="inline h-5 w-5 text-green-600" /> : <X className="inline h-5 w-5 text-red-600" />}</td>
                            <td className="px-3 py-2 text-center">{in_resume ? <Check className="inline h-5 w-5 text-green-600" /> : <X className="inline h-5 w-5 text-red-600" />}</td>
                            <td className="px-3 py-2 text-center">
                              {showRadio ? (
                                <div className="flex justify-center gap-6">
                                  <label className="inline-flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`worked-${i}`}
                                      checked={workedOn[i] === true}
                                      onChange={() => setWorkedOn(arr => { const copy = [...arr]; copy[i] = true; return copy })}
                                      className="form-radio h-4 w-4"
                                    />
                                    <span>Yes</span>
                                  </label>
                                  <label className="inline-flex items-center gap-2">
                                    <input
                                      type="radio"
                                      name={`worked-${i}`}
                                      checked={workedOn[i] === false}
                                      onChange={() => setWorkedOn(arr => { const copy = [...arr]; copy[i] = false; return copy })}
                                      className="form-radio h-4 w-4"
                                    />
                                    <span>No</span>
                                  </label>
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
              <Button size="lg" className="w-full mt-8" onClick={handleGenerateResume} disabled={generating}>
                {generating ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Generating Resume...</> : 'Generate Resume and Cover Letter'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  if (jobData?.updated_resume && jobData?.cover_letter) {
    return (
      <main className="px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Job Info</h1>
          <div className="flex gap-2">
            <DashboardButton />
            <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto">
          {jobMeta}
          <div className="flex justify-center mt-4 mb-8">
            <Button
              size="lg"
              onClick={() => { !isPremium ? setShowPaywall(true) : setShowSkills(true) }}
            >
              Reselect/Add Skills
            </Button>
            <PricingModal open={showPaywall} onOpenChange={setShowPaywall} />
          </div>
          <div className="flex flex-col md:flex-row gap-6 w-full md:h-[calc(100vh-18rem)]">
            <Card className="flex-1 flex flex-col shadow-sm">
              <CardContent className="flex flex-col h-full p-6">
                <h2 className="text-xl font-semibold mb-2">Resume</h2>
                <div className="flex-1 bg-muted rounded-md p-4 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap break-words">{jobData.updated_resume}</pre>
                </div>
                <Button className="mt-4" onClick={downloadResumeDocx} disabled={downloadingResume} aria-busy={downloadingResume}>
                  {downloadingResume ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Preparing download…</> : 'Download Resume (.docx)'}
                </Button>
              </CardContent>
            </Card>
            <Card className="flex-1 flex flex-col shadow-sm">
              <CardContent className="flex flex-col h-full p-6">
                <h2 className="text-xl font-semibold mb-2">Cover Letter</h2>
                <div className="flex-1 bg-muted rounded-md p-4 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap break-words">{jobData.cover_letter}</pre>
                </div>
                <Button className="mt-4" onClick={downloadCoverLetterDocx} disabled={downloadingCover} aria-busy={downloadingCover}>
                  {downloadingCover ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Preparing download…</> : 'Download Cover Letter (.docx)'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="px-4 py-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Job Info</h1>
        <div className="flex gap-2">
          <DashboardButton />
          <Button variant="outline" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto">
        {jobMeta}
        <div className="flex flex-col items-center gap-4 mt-10">
          <div className="text-lg text-muted-foreground">Resume and/or cover letter not found for this job.</div>
          <Button size="lg" onClick={() => setShowSkills(true)}>Continue to Skills Match</Button>
        </div>
      </div>
    </main>
  )
}
