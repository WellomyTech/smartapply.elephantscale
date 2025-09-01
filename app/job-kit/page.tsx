'use client'
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useResume } from '@/components/ResumeProvider'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
  jobDescription: string
  jobTitle?: string
  jobCompany?: string
}) {
  const API_KEY = process.env.NEXT_PUBLIC_API_BASE as string
  const email =
    typeof window !== 'undefined' ? (window.localStorage.getItem('user_email') || '') : ''

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

  if (data?.report_id && typeof window !== 'undefined') {
    window.localStorage.setItem('report_id', String(data.report_id))
  }
  return data as CompareApiResponse
}

export default function JobKitPage() {
  const API_KEY = process.env.NEXT_PUBLIC_API_BASE as string
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const { resumeFile } = useResume() // (kept in case you need it later)

  const [jobUrl, setJobUrl] = useState('')
  const [description, setDescription] = useState('')

  // separate inputs for job title & company
  const [jobTitle, setJobTitle] = useState('')
  const [jobCompany, setJobCompany] = useState('')

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

  // Safe display values (no localStorage during SSR)
  const [displayJobTitle, setDisplayJobTitle] = useState('')
  const [displayJobCompany, setDisplayJobCompany] = useState('')

  // Keep email from auth
  useEffect(() => {
    if (user?.email) setEmail(user.email)
  }, [user])

  // Persist fields (client-only)
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('job_url', jobUrl)
  }, [jobUrl])
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('job_description', description)
  }, [description])
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('job_title', jobTitle)
  }, [jobTitle])
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('job_company', jobCompany)
  }, [jobCompany])
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('user_email', email)
  }, [email])
  useEffect(() => {
    if (typeof window === 'undefined' || !result) return
    window.localStorage.setItem('compare_result', JSON.stringify(result))
  }, [result])
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('worked_on', JSON.stringify(workedOn))
  }, [workedOn])
  useEffect(() => {
    if (typeof window === 'undefined' || !generatedResume) return
    window.localStorage.setItem('generated_resume', generatedResume)
  }, [generatedResume])

  // Update workedOn after getting a result
  useEffect(() => {
    if (!result) return
    setWorkedOn(result.skills_match.filter(s => s.in_job).map(s => !!s.in_resume))
  }, [result])

  // Compute display job title/company on client only
  // Wipe Job Kit data when this page opens
useEffect(() => {
  if (typeof window === "undefined") return
  try {
    // delete ONLY Job Kit keys (keeps auth/user_email intact)
    const keys = [
      "job_title",
      "job_company",
      "job_description",
      "job_url",
      "compare_result",
      "worked_on",
      "report_id",
      "generated_resume",
      "latex_resume",
      "generated_cover_letter",
      "latex_cover",
    ]
    keys.forEach(k => window.localStorage.removeItem(k))
  } catch (e) {
    console.error("Failed to clear Job Kit localStorage keys", e)
  }

  // reset UI state
  setJobTitle("")
  setJobCompany("")
  setDescription("")
  setResult(null)
  setWorkedOn([])
  setGeneratedResume(null)
}, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const lsTitle = window.localStorage.getItem('job_title')
    const lsCompany = window.localStorage.getItem('job_company')
    const title = (result?.job_title ?? lsTitle ?? jobTitle ?? '').toString().trim()
    const company = (result?.job_company ?? lsCompany ?? jobCompany ?? '').toString().trim()
    setDisplayJobTitle(title)
    setDisplayJobCompany(company)
  }, [result?.job_title, result?.job_company, jobTitle, jobCompany])

  if (!isLoading && !user) {
    router.replace('/')
    return null
  }
  if (isLoading) {
    return (
      <main className="py-8">
        <div className="container min-h-[60vh] grid place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const compareRes = await compareResumeJob({
        jobDescription: description || '',
        jobTitle: jobTitle?.trim() || undefined,
        jobCompany: jobCompany?.trim() || undefined,
      })

      if ((compareRes as Compare422).status === 422) {
        const err = compareRes as Compare422
        const missing = err.detail?.missing_fields?.length
          ? err.detail.missing_fields
          : ['job_title', 'job_company']
        setMissingFields(missing)
        setJobTitleInput(jobTitle || '')
        setJobCompanyInput(jobCompany || '')
        setShowMissingModal(true)
        return
      }

      if ('error' in (compareRes as any) && !(compareRes as any).skills_match) {
        const err = compareRes as Compare422
        setError(err.error || 'An error occurred.')
        setResult({
          skills_match: [],
          gaps: [],
          bonus_points: [],
          recommendations: [],
          google_doc_link: err.google_doc_link,
          raw: err.raw,
        })
        return
      }

      const ok = compareRes as CompareApiResponse
      if (ok.job_title && typeof window !== 'undefined') {
        window.localStorage.setItem('job_title', ok.job_title)
      }
      if (ok.job_company && typeof window !== 'undefined') {
        window.localStorage.setItem('job_company', ok.job_company)
      }
      setResult(ok)
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
          skills_match: [],
          gaps: [],
          bonus_points: [],
          recommendations: [],
          google_doc_link: err.google_doc_link,
          raw: err.raw,
        })
        return
      }

      const ok = compareRes as CompareApiResponse
      if (jobTitleInput.trim() && typeof window !== 'undefined') {
        window.localStorage.setItem('job_title', jobTitleInput.trim())
      }
      if (jobCompanyInput.trim() && typeof window !== 'undefined') {
        window.localStorage.setItem('job_company', jobCompanyInput.trim())
      }

      setJobTitle(jobTitleInput.trim())
      setJobCompany(jobCompanyInput.trim())
      setResult(ok)
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
      alert('Please select at least one skill you have worked on.')
      return
    }

    const form = new FormData()
    const email = typeof window !== 'undefined' ? (window.localStorage.getItem('user_email') || '') : ''
    form.append('user_email', email)
    form.append('additional_skills', selectedSkills.join(', '))
    form.append('job_description', description)

    const jt = typeof window !== 'undefined' ? (window.localStorage.getItem('job_title') || jobTitle) : jobTitle
    const jc = typeof window !== 'undefined' ? (window.localStorage.getItem('job_company') || jobCompany) : jobCompany
    if (jt) form.append('job_title', jt)
    if (jc) form.append('job_company', jc)

    if (result.report_id) form.append('report_id', result.report_id.toString())

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
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('generated_resume', data.updated_resume)
          if (data.latex_resume) window.localStorage.setItem('latex_resume', data.latex_resume)
          if (data.cover_letter) window.localStorage.setItem('generated_cover_letter', data.cover_letter)
          if (data.latex_cover) window.localStorage.setItem('latex_cover', data.latex_cover)
        }
        router.push('/job-kit/result')
      } else {
        alert('No resume generated.')
      }
    } catch (err) {
      alert('Failed to generate resume.')
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const handleLogout = () => {
    logout()
    if (typeof window !== 'undefined') window.localStorage.clear()
  }

  const compareDisabled =
    loading || !description.trim() || !jobTitle.trim() || !jobCompany.trim()

  return (
    <main className="py-8">
        <div className="max-w-screen-2x2 mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {!result ? (
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <form onSubmit={handleCompare} className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="job-title">
                        Job Title <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="job-title"
                        type="text"
                        value={jobTitle}
                        onChange={e => setJobTitle(e.target.value)}
                        placeholder="e.g., Senior Software Engineer"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job-company">
                        Company Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="job-company"
                        type="text"
                        value={jobCompany}
                        onChange={e => setJobCompany(e.target.value)}
                        placeholder="e.g., Acme Corp"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="job-company">
                        Job Link (Optional) <span className="text-destructive"></span>
                      </Label>
                      <Input
                        id="job-company"
                        type="text"
                        value={jobCompany}
                        onChange={e => setJobCompany(e.target.value)}
                        placeholder="e.g., https://www.linkedin.com/jobs/view/123456789"
                        required
                      />
                    </div>


                    <div className="space-y-2">
                      <Label htmlFor="job-desc">
                        Job Description (Please Copy - Paste from Job Board){' '}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="job-desc"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        rows={30}
                        placeholder="Paste the full job description..."
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Fields marked with <span className="text-destructive">*</span> are mandatory.
                      </p>
                    </div>
                  </div>

                  {error && <div className="text-destructive">{error}</div>}
                  <Button type="submit" size="lg" className="w-full" disabled={compareDisabled}>
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-4 w-4" /> Comparing...
                      </>
                    ) : (
                      'Compare with Recruiter Job Scanner'
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            // After successful compare: compact summary card
            <Card className="rounded-xl shadow-sm border border-[#0099d7]/20 overflow-hidden">
              <CardHeader className="bg-[#0099d7] py-3 flex items-center justify-center">
                <CardTitle className="text-white text-base font-semibold text-center">
                  Recruiter&apos;s View
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-lg font-semibold">{displayJobTitle || '—'}</div>
                  <div className="text-muted-foreground">{displayJobCompany || '—'}</div>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-10">
              <Card className="shadow-sm">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Job Scan Results</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow
                          className="-mx-6 -mt-6 mb-4 rounded-t-xl bg-[#808080] px-6 py-3 font-poppins
                                     hover:bg-[#808080]
                                     [&>th]:text-white [&>th]:font-semibold
                                     [&>th]:whitespace-nowrap [&>th]:truncate
                                     [&>th]:text-[15px] md:[&>th]:text-base"
                        >
                          <TableHead>Skills</TableHead>
                          <TableHead className="text-center">Job Requirement</TableHead>
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
                                  {in_job ? (
                                    <Check className="inline h-5 w-5 text-green-600" />
                                  ) : (
                                    <X className="inline h-5 w-5 text-red-600" />
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {in_resume ? (
                                    <Check className="inline h-5 w-5 text-green-600" />
                                  ) : (
                                    <X className="inline h-5 w-5 text-red-600" />
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {showRadio ? (
                                    <RadioGroup
                                      className="flex items-center justify-center gap-6"
                                      value={String(workedOn[i])}
                                      onValueChange={(val) => {
                                        setWorkedOn((arr) => {
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
                    {result.bonus_points.map((bp) => (
                      <li key={bp}>{bp}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Button size="lg" className="w-full" onClick={handleGenerateResume} disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" /> Generating Resume...
                  </>
                ) : (
                  'Generate Resume and Cover Letter'
                )}
              </Button>
            </div>
          )}

        {/* Minimal custom modal for missing meta */}
        {showMissingModal && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-xl bg-background p-6 shadow-xl border">
              <h3 className="text-lg font-semibold">We need a bit more info</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Please provide the missing job details to continue.
              </p>

              <div className="mt-4 space-y-3">
                <div>
                  <Label htmlFor="job-title-modal">
                    Job Title {missingFields.includes('job_title') && <span className="text-destructive">*</span>}
                  </Label>
                  <input
                    id="job-title-modal"
                    type="text"
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="e.g., Senior Software Engineer"
                    value={jobTitleInput}
                    onChange={(e) => setJobTitleInput(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="job-company-modal">
                    Company Name {missingFields.includes('job_company') && (
                      <span className="text-destructive">*</span>
                    )}
                  </Label>
                  <input
                    id="job-company-modal"
                    type="text"
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="e.g., Acme Corp"
                    value={jobCompanyInput}
                    onChange={(e) => setJobCompanyInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setShowMissingModal(false)} disabled={submittingMeta}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitMissingMeta} disabled={submittingMeta}>
                  {submittingMeta ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
