'use client'
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useResume } from '@/components/ResumeProvider'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Check, X, LogOut, Loader2 } from 'lucide-react'
import DashboardButton from '@/components/DashboardButton'

interface SkillsMatchItem {
  skill: string;
  in_job: boolean;
  in_resume: boolean;
}
interface CompareApiResponse {
  report_id?: number;
  job_title?: string;
  job_company?: string;
  skills_match: SkillsMatchItem[];
  gaps: string[];
  bonus_points: string[];
  recommendations: string[];
  google_doc_link?: string;
  raw?: string;
  error?: string;
}
interface Compare422 {
  status: number; // 422
  detail?: { message?: string; missing_fields?: string[] };
  error?: string;
  raw?: string;
  google_doc_link?: string;
}

async function compareResumeJob({
  jobDescription,
  jobTitle,
  jobCompany,
}: {
  jobDescription: string,
  jobTitle?: string,
  jobCompany?: string,
}) {
  const API_KEY  = process.env.NEXT_PUBLIC_API_BASE as string
  const email = typeof window !== 'undefined' ? (localStorage.getItem('user_email') || '') : ''

  const form = new FormData()
  form.append('user_email', email)
  form.append('job_description', jobDescription)
  if (jobTitle) form.append('job_title', jobTitle)
  if (jobCompany) form.append('job_company', jobCompany)

  const res = await fetch(`${API_KEY}compare-resume-job`, {
    method: 'POST',
    body: form,
    headers: { accept: 'application/json' },
  })

  let data: any
  try {
    data = await res.json()
  } catch {
    return { error: 'Could not parse API response.' } as Compare422
  }

  if (res.status === 422) {
    return {
      status: 422,
      detail: data?.detail,
      error: data?.detail?.message || 'Missing required job metadata.',
      raw: data?.raw,
      google_doc_link: data?.google_doc_link,
    } as Compare422
  }

  if (!res.ok || data?.error) {
    return {
      status: res.status,
      error: data?.error || 'Unknown error',
      raw: data?.raw,
      google_doc_link: data?.google_doc_link,
    } as Compare422
  }

  if (data?.report_id) {
    localStorage.setItem('report_id', String(data.report_id))
  }
  return data as CompareApiResponse
}

export default function JobKitPage() {
  const API_KEY  = process.env.NEXT_PUBLIC_API_BASE  as string
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const { resumeFile } = useResume()

  const [jobUrl, setJobUrl] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState(user?.email ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CompareApiResponse | null>(null)
  const [workedOn, setWorkedOn] = useState<boolean[]>([])
  const [generating, setGenerating] = useState(false)
  const [generatedResume, setGeneratedResume] = useState<string | null>(null)

  const [showMissingModal, setShowMissingModal] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [jobTitleInput, setJobTitleInput] = useState('')
  const [jobCompanyInput, setJobCompanyInput] = useState('')
  const [submittingMeta, setSubmittingMeta] = useState(false)

  useEffect(() => {
    const savedJobUrl = localStorage.getItem('job_url')
    if (savedJobUrl) setJobUrl(savedJobUrl)

    const savedDescription = localStorage.getItem('job_description')
    if (savedDescription) setDescription(savedDescription)

    const savedEmail = localStorage.getItem('user_email')
    if (savedEmail) setEmail(savedEmail)

    const savedResult = localStorage.getItem('compare_result')
    if (savedResult) setResult(JSON.parse(savedResult))

    const savedWorkedOn = localStorage.getItem('worked_on')
    if (savedWorkedOn) setWorkedOn(JSON.parse(savedWorkedOn))

    const savedResume = localStorage.getItem('generated_resume')
    if (savedResume) setGeneratedResume(savedResume)
  }, [])

  useEffect(() => { localStorage.setItem('job_url', jobUrl) }, [jobUrl])
  useEffect(() => { localStorage.setItem('job_description', description) }, [description])
  useEffect(() => { localStorage.setItem('user_email', email) }, [email])
  useEffect(() => { if (result) localStorage.setItem('compare_result', JSON.stringify(result)) }, [result])
  useEffect(() => { localStorage.setItem('worked_on', JSON.stringify(workedOn)) }, [workedOn])
  useEffect(() => { if (generatedResume) localStorage.setItem('generated_resume', generatedResume) }, [generatedResume])

  useEffect(() => { if (user?.email) setEmail(user.email) }, [user])

  useEffect(() => {
    if (result) {
      setWorkedOn(result.skills_match.filter(s => s.in_job).map(s => !!s.in_resume))
    }
  }, [result])

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

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const compareRes = await compareResumeJob({ jobDescription: description || '' })

      if ((compareRes as Compare422).status === 422) {
        const err = compareRes as Compare422
        const missing = err.detail?.missing_fields?.length
          ? err.detail.missing_fields
          : ['job_title', 'job_company']
        setMissingFields(missing)
        setJobTitleInput('')
        setJobCompanyInput('')
        setShowMissingModal(true)
        return
      }

      if ('error' in (compareRes as any) && !(compareRes as any).skills_match) {
        const err = compareRes as Compare422
        setError(err.error || 'An error occurred.')
        setResult({
          skills_match: [], gaps: [], bonus_points: [], recommendations: [],
          google_doc_link: err.google_doc_link, raw: err.raw
        })
        return
      }

      setResult(compareRes as CompareApiResponse)
    } catch (err: any) {
      setError(err?.message ?? 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitMissingMeta() {
    if (missingFields.includes('job_title') && !jobTitleInput.trim()) {
      alert('Please enter Job Title')
      return
    }
    if (missingFields.includes('job_company') && !jobCompanyInput.trim()) {
      alert('Please enter Company Name')
      return
    }

    setSubmittingMeta(true)
    setError('')

    try {
      const compareRes = await compareResumeJob({
        jobDescription: description || '',
        jobTitle: jobTitleInput.trim() || undefined,
        jobCompany: jobCompanyInput.trim() || undefined,
      })

      if ((compareRes as Compare422).status === 422) {
        alert('We still need both Job Title and Company Name to continue.')
        return
      }

      if ('error' in (compareRes as any) && !(compareRes as any).skills_match) {
        const err = compareRes as Compare422
        setError(err.error || 'An error occurred.')
        setResult({
          skills_match: [], gaps: [], bonus_points: [], recommendations: [],
          google_doc_link: err.google_doc_link, raw: err.raw
        })
        return
      }

      setResult(compareRes as CompareApiResponse)
      setShowMissingModal(false)
    } catch (err: any) {
      alert(err?.message ?? 'Failed to submit job details.')
    } finally {
      setSubmittingMeta(false)
    }
  }

  async function handleGenerateResume() {
    if (!user?.email || !result) return

    const selectedSkills = result.skills_match
      .filter((item, idx) => result.gaps.includes(item.skill) && workedOn[idx])
      .map(item => item.skill)

    if (selectedSkills.length === 0) {
      alert("Please select at least one skill you have worked on.")
      return
    }

    const jobInfoToSend = description
    const form = new FormData()
    const email = localStorage.getItem('user_email') || ''

    form.append('user_email', email)
    form.append('additional_skills', selectedSkills.join(', '))
    form.append('job_description', jobInfoToSend)

    if (result.report_id) {
      form.append('report_id', result.report_id.toString())
    }

    setGenerating(true)
    setGeneratedResume(null)
    try {
      const res = await fetch(`${API_KEY}generate-resume`, {
        method: 'POST',
        body: form,
        headers: { accept: 'application/json' },
      })

      const data = await res.json()
      if (data.updated_resume) {
        localStorage.setItem('generated_resume', data.updated_resume)
        setGeneratedResume(data.updated_resume_tex)

        if (data.updated_resume) {
          localStorage.setItem('generated_resume', data.updated_resume)
        }
        if (data.latex_resume) {
          localStorage.setItem('latex_resume', data.latex_resume)
        }
        if (data.cover_letter) {
          localStorage.setItem('generated_cover_letter', data.cover_letter)
        }
        if (data.latex_cover) {
          localStorage.setItem('latex_cover', data.latex_cover)
        }

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

  const handleLogout = () => {
    logout()
    localStorage.clear()
  }

  return (
    <main className="px-4 py-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Smart Job Kit Generator</h1>
        <div className="flex gap-2">
          <DashboardButton />
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <form onSubmit={handleCompare} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-desc">Job Description</Label>
                <Textarea
                  id="job-desc"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={6}
                  placeholder="Paste the job description"
                />
              </div>

              {error && <div className="text-destructive">{error}</div>}
              <Button type="submit" size="lg" className="w-full" disabled={loading || !description.trim()}>
                {loading ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Comparing...</> : 'Compare with Recruiter Job Scanner'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-10">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Skills Comparison</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Skill</TableHead>
                        <TableHead className="text-center">In Job</TableHead>
                        <TableHead className="text-center">In Resume</TableHead>
                        <TableHead className="text-center">Have You Worked On It?</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.skills_match
                        .filter(({ in_job }) => in_job)
                        .map(({ skill, in_job, in_resume }, i) => {
                          const showRadio = result.gaps.includes(skill)
                          return (
                            <TableRow key={skill}>
                              <TableCell className="font-medium">{skill}</TableCell>
                              <TableCell className="text-center">
                                {in_job ? <Check className="inline h-5 w-5 text-green-600" /> : <X className="inline h-5 w-5 text-red-600" />}
                              </TableCell>
                              <TableCell className="text-center">
                                {in_resume ? <Check className="inline h-5 w-5 text-green-600" /> : <X className="inline h-5 w-5 text-red-600" />}
                              </TableCell>
                              <TableCell className="text-center">
                                {showRadio ? (
                                  <RadioGroup
                                    className="flex items-center justify-center gap-6"
                                    value={String(workedOn[i])}
                                    onValueChange={(val) => {
                                      setWorkedOn(arr => {
                                        const copy = [...arr]
                                        copy[i] = val === 'true'
                                        return copy
                                      })
                                    }}
                                  >
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem id={`yes-${i}`} value="true" />
                                      <Label htmlFor={`yes-${i}`}>Yes</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <RadioGroupItem id={`no-${i}`} value="false" />
                                      <Label htmlFor={`no-${i}`}>No</Label>
                                    </div>
                                  </RadioGroup>
                                ) : null}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                    <TableCaption className="text-left">Only job-required skills are listed.</TableCaption>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-3">Bonus Points</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {result.bonus_points.map((bp) => (<li key={bp}>{bp}</li>))}
                </ul>
              </CardContent>
            </Card>

            <Button size="lg" className="w-full" onClick={handleGenerateResume} disabled={generating}>
              {generating ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Generating Resume...</> : 'Generate Resume and Cover Letter'}
            </Button>
          </div>
        )}
      </div>

      {/* Minimal custom modal for missing meta (kept for logic parity) */}
      {showMissingModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-xl border">
            <h3 className="text-lg font-semibold">We need a bit more info</h3>
            <p className="mt-1 text-sm text-muted-foreground">Please provide the missing job details to continue.</p>

            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="job-title">Job Title {missingFields.includes('job_title') && <span className="text-destructive">*</span>}</Label>
                <input
                  id="job-title"
                  type="text"
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="e.g., Senior Software Engineer"
                  value={jobTitleInput}
                  onChange={(e) => setJobTitleInput(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="job-company">Company Name {missingFields.includes('job_company') && <span className="text-destructive">*</span>}</Label>
                <input
                  id="job-company"
                  type="text"
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="e.g., Acme Corp"
                  value={jobCompanyInput}
                  onChange={(e) => setJobCompanyInput(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setShowMissingModal(false)} disabled={submittingMeta}>Cancel</Button>
              <Button onClick={handleSubmitMissingMeta} disabled={submittingMeta}>
                {submittingMeta ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
