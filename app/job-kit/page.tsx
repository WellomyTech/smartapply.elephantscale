'use client'
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useResume } from '@/components/ResumeProvider'
import { useState, useEffect } from 'react'
<<<<<<< HEAD
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Check, X, LogOut, Loader2 } from 'lucide-react'
import DashboardButton from '@/components/DashboardButton'

=======
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, LogOut, Loader2 } from 'lucide-react'
import DashboardButton from '@/components/DashboardButton'

// ---- Types ----
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
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

<<<<<<< HEAD
=======
// ---- API call for compare endpoint ----
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
async function compareResumeJob({
  jobDescription,
  jobTitle,
  jobCompany,
}: {
<<<<<<< HEAD
  jobDescription: string
  jobTitle?: string
  jobCompany?: string
}) {
  const API_KEY = process.env.NEXT_PUBLIC_API_BASE as string
  const email =
    typeof window !== 'undefined' ? (window.localStorage.getItem('user_email') || '') : ''
=======
  jobDescription: string,
  jobTitle?: string,
  jobCompany?: string,
}) {
  const API_KEY  = process.env.NEXT_PUBLIC_API_BASE as string
  const email = localStorage.getItem('user_email') || '' // <- from localStorage
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369

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

<<<<<<< HEAD
=======
  // Handle 422 (missing job_title/job_company)
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
  if (res.status === 422) {
    return {
      status: 422,
      detail: data?.detail,
      error: data?.detail?.message || 'Missing required job metadata.',
      raw: data?.raw,
      google_doc_link: data?.google_doc_link,
    } as Compare422
  }

<<<<<<< HEAD
=======
  // Other non-OK errors
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
  if (!res.ok || data?.error) {
    return {
      status: res.status,
      error: data?.error || 'Unknown error',
      raw: data?.raw,
      google_doc_link: data?.google_doc_link,
    } as Compare422
  }

<<<<<<< HEAD
  if (data?.report_id && typeof window !== 'undefined') {
    window.localStorage.setItem('report_id', String(data.report_id))
=======
  // Success
  if (data?.report_id) {
    localStorage.setItem('report_id', String(data.report_id))
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
  }
  return data as CompareApiResponse
}

export default function JobKitPage() {
<<<<<<< HEAD
  const API_KEY = process.env.NEXT_PUBLIC_API_BASE as string
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const { resumeFile } = useResume() // (kept in case you need it later)

  const [jobUrl, setJobUrl] = useState('')
  const [description, setDescription] = useState('')

  // separate inputs for job title & company
  const [jobTitle, setJobTitle] = useState('')
  const [jobCompany, setJobCompany] = useState('')

=======
  const API_KEY  = process.env.NEXT_PUBLIC_API_BASE  as string
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const { resumeFile } = useResume()

  // UI states
  const [jobUrl, setJobUrl] = useState('') // (kept for compatibility; not used in API anymore)
  const [description, setDescription] = useState('')
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
  const [email, setEmail] = useState(user?.email ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CompareApiResponse | null>(null)
  const [workedOn, setWorkedOn] = useState<boolean[]>([])
  const [generating, setGenerating] = useState(false)
  const [generatedResume, setGeneratedResume] = useState<string | null>(null)

<<<<<<< HEAD
=======
  // ---- Missing metadata modal ----
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
  const [showMissingModal, setShowMissingModal] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [jobTitleInput, setJobTitleInput] = useState('')
  const [jobCompanyInput, setJobCompanyInput] = useState('')
  const [submittingMeta, setSubmittingMeta] = useState(false)

<<<<<<< HEAD
  // Safe display values (no localStorage during SSR)
  const [displayJobTitle, setDisplayJobTitle] = useState('')
  const [displayJobCompany, setDisplayJobCompany] = useState('')

  // Keep email from auth
=======
  // ----- Restore from localStorage on mount -----
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

  // ----- Save to localStorage on state changes -----
  useEffect(() => {
    localStorage.setItem('job_url', jobUrl)
  }, [jobUrl])
  useEffect(() => {
    localStorage.setItem('job_description', description)
  }, [description])
  useEffect(() => {
    localStorage.setItem('user_email', email)
  }, [email])
  useEffect(() => {
    if (result) localStorage.setItem('compare_result', JSON.stringify(result))
  }, [result])
  useEffect(() => {
    localStorage.setItem('worked_on', JSON.stringify(workedOn))
  }, [workedOn])
  useEffect(() => {
    if (generatedResume) localStorage.setItem('generated_resume', generatedResume)
  }, [generatedResume])

>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
  useEffect(() => {
    if (user?.email) setEmail(user.email)
  }, [user])

<<<<<<< HEAD
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

=======
  useEffect(() => {
    if (result) {
      setWorkedOn(result.skills_match.filter(s => s.in_job).map(s => !!s.in_resume))
    }
  }, [result])

  // Redirect if not logged in
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
  if (!isLoading && !user) {
    router.replace('/')
    return null
  }
  if (isLoading) {
    return (
<<<<<<< HEAD
      <main className="py-8">
        <div className="container min-h-[60vh] grid place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    )
  }

=======
      <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  // Submit the main compare form
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
  async function handleCompare(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    try {
      const compareRes = await compareResumeJob({
        jobDescription: description || '',
<<<<<<< HEAD
        jobTitle: jobTitle?.trim() || undefined,
        jobCompany: jobCompany?.trim() || undefined,
      })

=======
      })

      // Handle 422 => open modal to collect metadata
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
      if ((compareRes as Compare422).status === 422) {
        const err = compareRes as Compare422
        const missing = err.detail?.missing_fields?.length
          ? err.detail.missing_fields
          : ['job_title', 'job_company']
        setMissingFields(missing)
<<<<<<< HEAD
        setJobTitleInput(jobTitle || '')
        setJobCompanyInput(jobCompany || '')
=======
        // Clear previous inputs
        setJobTitleInput('')
        setJobCompanyInput('')
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
        setShowMissingModal(true)
        return
      }

<<<<<<< HEAD
=======
      // Other errors
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
      if ('error' in (compareRes as any) && !(compareRes as any).skills_match) {
        const err = compareRes as Compare422
        setError(err.error || 'An error occurred.')
        setResult({
          skills_match: [],
          gaps: [],
          bonus_points: [],
          recommendations: [],
          google_doc_link: err.google_doc_link,
<<<<<<< HEAD
          raw: err.raw,
=======
          raw: err.raw
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
        })
        return
      }

<<<<<<< HEAD
      const ok = compareRes as CompareApiResponse
      if (ok.job_title && typeof window !== 'undefined') {
        window.localStorage.setItem('job_title', ok.job_title)
      }
      if (ok.job_company && typeof window !== 'undefined') {
        window.localStorage.setItem('job_company', ok.job_company)
      }
      setResult(ok)
=======
      // Success
      setResult(compareRes as CompareApiResponse)

>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
    } catch (err: any) {
      setError(err?.message ?? 'An error occurred.')
    } finally {
      setLoading(false)
    }
  }

<<<<<<< HEAD
  async function handleSubmitMissingMeta() {
=======
  // Re-post with user-provided job meta (job_title & job_company)
  async function handleSubmitMissingMeta() {
    // Basic guardrails – only require fields that API said were missing
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
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
<<<<<<< HEAD
=======
        // Still missing? Keep the modal open and show a friendly message
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
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
<<<<<<< HEAD
          raw: err.raw,
=======
          raw: err.raw
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
        })
        return
      }

<<<<<<< HEAD
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
=======
      // Success – close modal and continue with normal flow
      setResult(compareRes as CompareApiResponse)
      setShowMissingModal(false)

>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
    } catch (err: any) {
      alert(err?.message ?? 'Failed to submit job details.')
    } finally {
      setSubmittingMeta(false)
    }
  }

<<<<<<< HEAD
=======
  // Generate Resume API (unchanged except we no longer send job link)
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
  async function handleGenerateResume() {
    if (!user?.email || !result) return

    const selectedSkills = result.skills_match
      .filter((item, idx) => result.gaps.includes(item.skill) && workedOn[idx])
      .map(item => item.skill)

    if (selectedSkills.length === 0) {
<<<<<<< HEAD
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
=======
      alert("Please select at least one skill you have worked on.")
      return
    }

    const jobInfoToSend = description // we rely on description now
    const form = new FormData()
    const email = localStorage.getItem('user_email') || ''

    form.append('user_email', email)
    form.append('additional_skills', selectedSkills.join(', '))
    form.append('job_description', jobInfoToSend)

    if (result.report_id) {
      form.append('report_id', result.report_id.toString())
    }
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369

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
<<<<<<< HEAD
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
=======
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
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

<<<<<<< HEAD
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
=======
  // Custom logout handler to clear all localStorage data
  const handleLogout = () => {
    logout()
    localStorage.clear()
  }

  return (
    <div className="min-h-screen bg-[#eef5ff] px-4 py-6 space-y-8">
      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Smart Job Kit Generator
          </h1>
        </div>
        <div className="flex gap-2">
          <DashboardButton />
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto space-y-12">
        {/* Form to enter Job Description */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleCompare} className="space-y-4">
              <h2 className="text-xl font-semibold mb-2">Enter Job Info</h2>

              <label className="block font-semibold">Job Description:</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="w-full border p-2 rounded"
                placeholder="Paste the job description"
              />

              {error && <div className="text-red-600">{error}</div>}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading || !description.trim()}
              >
                {loading
                  ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Comparing...</>
                  : 'Compare with Recruiter Job Scanner'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-12">
            {/* Skills Table */}
            <Card className="shadow-lg">
              <CardContent>
                <h3 className="text-2xl font-semibold mb-4">Skills Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto border-collapse">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Skill</th>
                        <th className="px-3 py-2 text-center">In Job</th>
                        <th className="px-3 py-2 text-center">In Resume</th>
                        <th className="px-3 py-2 text-center">Have You Worked On It?</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.skills_match
                        .filter(({ in_job }) => in_job)
                        .map(({ skill, in_job, in_resume }, i) => {
                          const showRadio = result.gaps.includes(skill)
                          return (
                            <tr key={skill} className="even:bg-gray-50">
                              <td className="px-3 py-2">{skill}</td>
                              <td className="px-3 py-2 text-center">
                                {in_job
                                  ? <Check className="inline h-5 w-5 text-green-600" />
                                  : <X className="inline h-5 w-5 text-red-600" />}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {in_resume
                                  ? <Check className="inline h-5 w-5 text-green-600" />
                                  : <X className="inline h-5 w-5 text-red-600" />}
                              </td>
                              <td className="px-3 py-2 text-center">
                                {showRadio ? (
                                  <div className="flex justify-center space-x-4">
                                    <label className="inline-flex items-center space-x-1">
                                      <input
                                        type="radio"
                                        name={`worked-${i}`}
                                        checked={workedOn[i] === true}
                                        onChange={() =>
                                          setWorkedOn(arr => {
                                            const copy = [...arr]
                                            copy[i] = true
                                            return copy
                                          })
                                        }
                                        className="form-radio h-4 w-4"
                                      />
                                      <span>Yes</span>
                                    </label>
                                    <label className="inline-flex items-center space-x-1">
                                      <input
                                        type="radio"
                                        name={`worked-${i}`}
                                        checked={workedOn[i] === false}
                                        onChange={() =>
                                          setWorkedOn(arr => {
                                            const copy = [...arr]
                                            copy[i] = false
                                            return copy
                                          })
                                        }
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
              </CardContent>
            </Card>

            {/* Bonus Points */}
            <Card className="shadow-lg">
              <CardContent>
                <h3 className="text-2xl font-semibold mb-4">Bonus Points</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {result.bonus_points.map((bp) => (
                    <li key={bp}>{bp}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
              onClick={handleGenerateResume}
              disabled={generating}
            >
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
      </main>

      {/* --- Minimal custom modal for missing Job Title / Company --- */}
      {showMissingModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold">We need a bit more info</h3>
            <p className="mt-1 text-sm text-gray-600">
              Please provide the missing job details to continue.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium">
                  Job Title {missingFields.includes('job_title') && <span className="text-red-600">*</span>}
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="e.g., Senior Software Engineer"
                  value={jobTitleInput}
                  onChange={(e) => setJobTitleInput(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Company Name {missingFields.includes('job_company') && <span className="text-red-600">*</span>}
                </label>
                <input
                  type="text"
                  className="mt-1 w-full rounded border px-3 py-2"
                  placeholder="e.g., Acme Corp"
                  value={jobCompanyInput}
                  onChange={(e) => setJobCompanyInput(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowMissingModal(false)}
                disabled={submittingMeta}
              >
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
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
  )
}























// 'use client'
// export const dynamic = 'force-dynamic'

// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/components/AuthProvider'
// import { useResume } from '@/components/ResumeProvider'
// import { useState, useEffect } from 'react'
// import { Card, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Check, X, LogOut, Loader2 } from 'lucide-react'
// import DashboardButton from '@/components/DashboardButton'

// // ---- API call for compare endpoint ----
// interface SkillsMatchItem {
//   skill: string;
//   in_job: boolean;
//   in_resume: boolean;
// }
// interface CompareApiResponse {
//   report_id?: number;
//   skills_match: SkillsMatchItem[];
//   gaps: string[];
//   bonus_points: string[];
//   recommendations: string[];
//   google_doc_link: string;
//   raw?: string;
//   error?: string;
// }

// async function compareResumeJob({
//   resumeFile,
//   jobDescription,
//   jobUrl,
// }: {
//   resumeFile: File,
//   jobDescription: string,
//   jobUrl?: string,
//   email: string
// }) {
//   const API_KEY  = process.env.NEXT_PUBLIC_API_BASE
//   const email = localStorage.getItem('user_email') || ''; // <- get from localStorage

//   const form = new FormData();
//   form.append('job_description', jobDescription);
//   form.append('job_link', jobUrl || '');
//   form.append('user_email', email);

//   const res = await fetch(`${API_KEY}compare-resume-job`, {
//     method: 'POST',
//     body: form,
//     headers: {
//       'accept': 'application/json',
//     },
//   });

//   let data;
//   try {
//     data = await res.json();
//   } catch (e) {
//     throw new Error('Could not parse API response.');
//   }
    
//   if (data.report_id) {
//     localStorage.setItem('report_id', data.report_id);
//   }

//   if (!res.ok || data.error) {
//     return { error: data.error || 'Unknown error', raw: data.raw, google_doc_link: data.google_doc_link };
//   }
//   return data
// }

// export default function JobKitPage() {
//   const API_KEY  = process.env.NEXT_PUBLIC_API_BASE  as string

//   const router = useRouter()
//   const { user, isLoading, logout } = useAuth()
//   const { resumeFile } = useResume();

//   // UI states
//   const [jobUrl, setJobUrl] = useState('')
//   const [description, setDescription] = useState('')
//   const [email, setEmail] = useState(user?.email ?? '')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [result, setResult] = useState<CompareApiResponse | null>(null)
//   const [workedOn, setWorkedOn] = useState<boolean[]>([]);
//   const [generating, setGenerating] = useState(false);
//   const [generatedResume, setGeneratedResume] = useState<string | null>(null);

//   // ----- Restore from localStorage on mount -----
//   useEffect(() => {
//     const savedJobUrl = localStorage.getItem('job_url');
//     if (savedJobUrl) setJobUrl(savedJobUrl);

//     const savedDescription = localStorage.getItem('job_description');
//     if (savedDescription) setDescription(savedDescription);

//     const savedEmail = localStorage.getItem('user_email');
//     if (savedEmail) setEmail(savedEmail);

//     const savedResult = localStorage.getItem('compare_result');
//     if (savedResult) setResult(JSON.parse(savedResult));

//     const savedWorkedOn = localStorage.getItem('worked_on');
//     if (savedWorkedOn) setWorkedOn(JSON.parse(savedWorkedOn));

//     const savedResume = localStorage.getItem('generated_resume');
//     if (savedResume) setGeneratedResume(savedResume);

//   }, []);

//   // ----- Save to localStorage on state changes -----
//   useEffect(() => {
//     localStorage.setItem('job_url', jobUrl);
//   }, [jobUrl]);
//   useEffect(() => {
//     localStorage.setItem('job_description', description);
//   }, [description]);
//   useEffect(() => {
//     localStorage.setItem('user_email', email);
//   }, [email]);
//   useEffect(() => {
//     if (result) localStorage.setItem('compare_result', JSON.stringify(result));
//   }, [result]);
//   useEffect(() => {
//     localStorage.setItem('worked_on', JSON.stringify(workedOn));
//   }, [workedOn]);
//   useEffect(() => {
//     if (generatedResume) localStorage.setItem('generated_resume', generatedResume);
//   }, [generatedResume]);

//   useEffect(() => {
//     if (user?.email) setEmail(user.email)
//   }, [user]);

//   useEffect(() => {
//     if (result) {
//       setWorkedOn(result.skills_match.filter(s => s.in_job).map(s => !!s.in_resume));
//     }
//   }, [result]);

//   // Redirect if not logged in
//   if (!isLoading && !user) {
//     router.replace('/')
//     return null
//   }
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
//       </div>
//     )
//   }

//   // Form handler
//   async function handleCompare(e: React.FormEvent) {
//     e.preventDefault();
//     setError('');
//     setResult(null);
//     setLoading(true);
//     try {
//       const compareResult = await compareResumeJob({
        
//         jobUrl: jobUrl || undefined,
//         jobDescription: description || undefined,
//       });

//       if ('error' in compareResult) {
//         setError(compareResult.error);
//         setResult({
//           skills_match: [],
//           gaps: [],
//           bonus_points: [],
//           recommendations: [],
//           google_doc_link: compareResult.google_doc_link,
//           raw: compareResult.raw
//         } as CompareApiResponse);
//       } else {
//         setResult(compareResult);
//       }

//     } catch (err: any) {
//       setError(err.message ?? 'An error occurred.');
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Generate Resume API
//   async function handleGenerateResume() {
//     if (!user?.email || !result) return;

//    const selectedSkills = result.skills_match
//   .filter((item, idx) => result.gaps.includes(item.skill) && workedOn[idx])
//   .map(item => item.skill);


//     if (selectedSkills.length === 0) {
//       alert("Please select at least one skill you have worked on.");
//       return;
//     }

//     const jobInfoToSend = jobUrl ? jobUrl : description;
//     const form = new FormData();

//     const email = localStorage.getItem('user_email') || '';

//     form.append('user_email', email);
//     form.append('additional_skills', selectedSkills.join(', '));
//     form.append('job_description', jobInfoToSend);

//     if (result.report_id) {
//       form.append('report_id', result.report_id.toString());
//     }

//     setGenerating(true);
//     setGeneratedResume(null);
//     try {
//       const res = await fetch(`${API_KEY}generate-resume`, {
//         method: 'POST',
//         body: form,
//         headers: { accept: 'application/json' },
//       });

//       const data = await res.json();
//       if (data.updated_resume) {
//         localStorage.setItem('generated_resume', data.updated_resume);
//         setGeneratedResume(data.updated_resume_tex);
//         // In your generate-resume handler (previous page, for completeness)
//       if (data.updated_resume) {
//         localStorage.setItem('generated_resume', data.updated_resume);
//       }
//        if (data.latex_resume) {
//         localStorage.setItem('latex_resume', data.latex_resume);
//       }
//       if (data.cover_letter) {
//         localStorage.setItem('generated_cover_letter', data.cover_letter);
//       }
//       if (data.latex_cover) {
//         localStorage.setItem('latex_cover', data.latex_cover);
//       }


//         router.push('/job-kit/result');
//       } else {
//         alert("No resume generated.");
//       }
//     } catch (err) {
//       alert("Failed to generate resume.");
//       console.error(err);
//     } finally {
//       setGenerating(false);
//     }
//   }
//     // Custom logout handler to clear all localStorage data (optional, for privacy)
//   const handleLogout = () => {
//     logout()
    
//     localStorage.clear(); // This clears all localStorage for this domain

//     // add any other keys you want to clear!
//   }


//   return (
//     <div className="min-h-screen bg-[#eef5ff] px-4 py-6 space-y-8">
//       {/* Top Bar */}
//       <header className="flex items-center justify-between max-w-5xl mx-auto">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//                         Smart Job Kit Generator
//           </h1>
//         </div>
//         <div className="flex gap-2">
//           <DashboardButton />
//           <Button variant="outline" onClick={handleLogout}>
//             <LogOut className="mr-2 h-4 w-4" /> Logout
//           </Button>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-4xl mx-auto space-y-12">
//         {/* Form to enter Job Link / Description */}
//         <Card className="shadow-lg">
//           <CardContent className="p-6">
//             <form onSubmit={handleCompare} className="space-y-4">
//               <h2 className="text-xl font-semibold mb-2">Enter Job Info</h2>
//               {/* <label className="block font-semibold">Job Link:</label>
//               <input
//                 type="url"
//                 value={jobUrl}
//                 onChange={e => setJobUrl(e.target.value)}
//                 placeholder="Paste job posting URL"
//                 className="w-full border p-2 rounded"
//               />
//               <div className="text-center text-gray-400">or</div> */}
//               <label className="block font-semibold">Job Description:</label>
//               <textarea
//                 value={description}
//                 onChange={e => setDescription(e.target.value)}
//                 rows={4}
//                 className="w-full border p-2 rounded"
//                 placeholder="Paste the job description"
//               />
              
//               {error && <div className="text-red-600">{error}</div>}
//               <Button
//                 type="submit"
//                 size="lg"
//                 className="w-full"
//                 disabled={loading || (!jobUrl && !description)}
//               >
//                 {loading
//                   ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Comparing...</>
//                   : 'Compare with Recruiter Job Scanner'}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>

//         {/* Results */}
//         {result && (
//           <div className="space-y-12">
//             {/* Skills Table */}
//             <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Skills Comparison</h3>
//                 <div className="overflow-x-auto">
//                   <table className="w-full table-auto border-collapse">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="px-3 py-2 text-left">Skill</th>
//                         <th className="px-3 py-2 text-center">In Job</th>
//                         <th className="px-3 py-2 text-center">In Resume</th>
//                         <th className="px-3 py-2 text-center">Have You Worked On It?</th>
//                       </tr>
//                     </thead>

//                     <tbody>
//                       {result.skills_match
//                       .filter(({ in_job }) => in_job)
//                       .map(({ skill, in_job, in_resume }, i) => {
//                         const showRadio = result.gaps.includes(skill); // ← Only if in gaps
//                         return (
//                           <tr key={skill} className="even:bg-gray-50">
//                             <td className="px-3 py-2">{skill}</td>
//                             <td className="px-3 py-2 text-center">
//                               {in_job
//                                 ? <Check className="inline h-5 w-5 text-green-600" />
//                                 : <X className="inline h-5 w-5 text-red-600" />}
//                             </td>
//                             <td className="px-3 py-2 text-center">
//                               {in_resume
//                                 ? <Check className="inline h-5 w-5 text-green-600" />
//                                 : <X className="inline h-5 w-5 text-red-600" />}
//                             </td>
//                             <td className="px-3 py-2 text-center">
//                               {showRadio ? (
//                                 <div className="flex justify-center space-x-4">
//                                   <label className="inline-flex items-center space-x-1">
//                                     <input
//                                       type="radio"
//                                       name={`worked-${i}`}
//                                       checked={workedOn[i] === true}
//                                       onChange={() =>
//                                         setWorkedOn(arr => {
//                                           const copy = [...arr];
//                                           copy[i] = true;
//                                           return copy;
//                                         })
//                                       }
//                                       className="form-radio h-4 w-4"
//                                     />
//                                     <span>Yes</span>
//                                   </label>
//                                   <label className="inline-flex items-center space-x-1">
//                                     <input
//                                       type="radio"
//                                       name={`worked-${i}`}
//                                       checked={workedOn[i] === false}
//                                       onChange={() =>
//                                         setWorkedOn(arr => {
//                                           const copy = [...arr];
//                                           copy[i] = false;
//                                           return copy;
//                                         })
//                                       }
//                                       className="form-radio h-4 w-4"
//                                     />
//                                     <span>No</span>
//                                   </label>
//                                 </div>
//                               ) : (
//                                 // Empty cell if not in gaps
//                                 null
//                               )}
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Bonus Points */}
//             <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Bonus Points</h3>
//                 <ul className="list-disc list-inside space-y-2 text-gray-700">
//                   {result.bonus_points.map((bp) => (
//                     <li key={bp}>{bp}</li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card>

//             <Button
//               size="lg"
//               className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
//               onClick={handleGenerateResume}
//               disabled={generating}
//             >
//               {generating ? (
//                 <>
//                   <Loader2 className="animate-spin mr-2 h-4 w-4" /> Generating Resume...
//                 </>
//               ) : (
//                 'Generate Resume and Cover Letter'
//               )}
//             </Button>

            
//           </div>
//         )}
//       </main>
//     </div>
//   )
// }





















// // app/job-kit/page.tsx
// 'use client'
// export const dynamic = 'force-dynamic'

// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/components/AuthProvider'
// import { useResume } from '@/components/ResumeProvider'
// import { useState } from 'react'
// import { Card, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Check, X, LogOut, Loader2 } from 'lucide-react'
// import { useEffect } from 'react';


// // ---- API call for compare endpoint ----
// interface SkillsMatchItem {
//   skill: string;
//   in_job: boolean;
//   in_resume: boolean;
// }
// interface CompareApiResponse {
//   skills_match: SkillsMatchItem[];
//   gaps: string[];
//   bonus_points: string[];
//   recommendations: string[];
//   google_doc_link: string;
  
//   raw?: string;      // <-- add this line
//   error?: string;    
// }

// async function compareResumeJob({
//   resumeFile,
//   jobDescription,
//   jobUrl
// }: {
//   resumeFile: File,
//   jobDescription: string,
//   jobUrl?: string,
// }) {
//   const form = new FormData();
//   //form.append('resume_file', resumeFile);           // (If you later want to add file support)
//   form.append('job_description', jobDescription);   // Text
//   form.append('job_link', jobUrl || '');         // <-- NAME MATCHED
//   form.append('user_email', "ruchitrakholiya878@gmail.com");                 // <-- NAME MATCHED

//   const res = await fetch('http://127.0.0.1:8000/compare-resume-job', {
//     method: 'POST',
//     body: form,
//     headers: {
//       'accept': 'application/json',
//     },
//   });






// // const form = new FormData();
// // form.append('resume_file', resumeFile);           // File object, not string
// // form.append('job_description', jobDescription);   // String
// // form.append('job_url', jobUrl || 'N/A');          // String


// // console.log("jobDescription value before API:", jobDescription);

// // // If you want to add headers like in curl:
// // const res = await fetch('http://127.0.0.1:8000/compare-resume-job', {
// //   method: 'POST',
// //   body: form,
// //   credentials: 'include', // if your backend needs cookies/auth
// //   headers: {
// //     // DO NOT set Content-Type for FormData, browser will do it!
// //     'accept': 'application/json',
// //     'linkedin-id': '123', // replace with your logic or context!
// //     'email': 'ruchitrakholiya878@gmail.com', // replace with user's email!
// //   },
// // });


//   let data;
//   try {
//     data = await res.json();
//   } catch (e) {
//     throw new Error('Could not parse API response.');
//   }

//   if (!res.ok || data.error) {
//     // error from API
//     return { error: data.error || 'Unknown error', raw: data.raw, google_doc_link: data.google_doc_link };
//   }
//   return data
// }

// export default function JobKitPage() {
  
//   const router = useRouter()
//   const { user, isLoading, logout } = useAuth()
//   //const { resumeFile } = useResume()
  
// const { resumeFile } = useResume();

//   // UI states
//   const [jobUrl, setJobUrl] = useState('')
//   const [description, setDescription] = useState('')
//   const [email, setEmail] = useState(user?.email ?? '')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [result, setResult] = useState<CompareApiResponse | null>(null)

//   const [workedOn, setWorkedOn] = useState<boolean[]>([]);

//   useEffect(() => {
//   if (result) {
//     setWorkedOn(result.skills_match.map(s => s.in_resume));
//   }
// }, [result]);


//   // Redirect if not logged in
//   if (!isLoading && !user) {
//     router.replace('/')
//     return null
//   }
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
//       </div>
//     )
//   }
//   // if (!resumeFile) {
//   //   // If no resume uploaded, force user back to dashboard
//   //   router.replace('/dashboard')
//   //   return null
//   // }

//   // Form handler
//   async function handleCompare(e: React.FormEvent) {
//     e.preventDefault();
//     setError('');
//     setResult(null);
//     setLoading(true);
//     try {
      
//       console.log("Submitting:", { jobDescription: description, resumeFile, jobUrl });

//       const compareResult = await compareResumeJob({
//         resumeFile,
//         jobUrl: jobUrl || undefined,
//         jobDescription: description || undefined, // <-- FIXED!
//         email,
//       });

//       if ('error' in compareResult) {
//   setError(compareResult.error);
//   setResult({
//     skills_match: [],
//     gaps: [],
//     bonus_points: [],
//     recommendations: [],
//     google_doc_link: compareResult.google_doc_link,
//     raw: compareResult.raw // <-- add this!
//   } as CompareApiResponse);
// } else {
//   setResult(compareResult);
// }

//       } catch (err: any) {
//         setError(err.message ?? 'An error occurred.');
//       } finally {
//         setLoading(false);
//       }
//     }

//     const GeenrateResume = () => {
//     router.push('/job-kit/result')
//   }


//   return (
//     <div className="min-h-screen bg-[#eef5ff] px-4 py-6 space-y-8">
//       {/* Top Bar */}
//       <header className="flex items-center justify-between max-w-5xl mx-auto">
//         <h1 className="text-2xl font-bold text-gray-900">
//           Smart Job Kit Generator
//         </h1>
//         <Button variant="outline" onClick={logout}>
//           <LogOut className="mr-2 h-4 w-4" />
//           Logout
//         </Button>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-4xl mx-auto space-y-12">
//         {/* Form to enter Job Link / Description */}
//         <Card className="shadow-lg">
//           <CardContent className="p-6">
//             <form onSubmit={handleCompare} className="space-y-4">
//               <h2 className="text-xl font-semibold mb-2">Enter Job Info</h2>
//               <label className="block font-semibold">Job Link:</label>
//               <input
//                 type="url"
//                 value={jobUrl}
//                 onChange={e => setJobUrl(e.target.value)}
//                 placeholder="Paste job posting URL"
//                 className="w-full border p-2 rounded"
//               />
//               <div className="text-center text-gray-400">or</div>
//               <label className="block font-semibold">Job Description:</label>
//               <textarea
//                 value={description}
//                 onChange={e => setDescription(e.target.value)}
//                 rows={4}
//                 className="w-full border p-2 rounded"
//                 placeholder="Paste the job description"
//               />
//               <label className="block font-semibold">Your Email:</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={e => setEmail(e.target.value)}
//                 required
//                 className="w-full border p-2 rounded"
//               />
//               {error && <div className="text-red-600">{error}</div>}
//               <Button
//                 type="submit"
//                 size="lg"
//                 className="w-full"
//                 disabled={loading || (!jobUrl && !description)}
//               >
//                 {loading
//                   ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Comparing...</>
//                   : 'Compare Resume'}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>


//         {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//               <strong className="font-bold">Error:</strong> {error}
//               {result?.google_doc_link && (
//                 <div className="mt-2">
//                   <a
//                     href={result.google_doc_link}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="underline text-blue-600 font-semibold"
//                   >
//                     View your document on Google Docs
//                   </a>
//                 </div>
//               )}
//               {result?.raw && (
//                 <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
//                   {result.raw}
//                 </pre>
//               )}
//             </div>
//           )}
//         {/* Results */}
//         {result && (
//           <div className="space-y-12">
//             {/* Skills Table */}
//             <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Skills Comparison</h3>
//                 <div className="overflow-x-auto">
//                   <table className="w-full table-auto border-collapse">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="px-3 py-2 text-left">Skill</th>
//                         <th className="px-3 py-2 text-center">In Job</th>
//                         <th className="px-3 py-2 text-center">In Resume</th>
//                         <th className="px-3 py-2 text-center">Have You Worked On It?</th>
//                       </tr>
//                     </thead>

//                    <tbody>
//                       {result.skills_match.map(({ skill, in_job, in_resume }, i) => (
//                         <tr key={skill} className="even:bg-gray-50">
//                           <td className="px-3 py-2">{skill}</td>
//                           <td className="px-3 py-2 text-center">
//                             {in_job
//                               ? <Check className="inline h-5 w-5 text-green-600"/>
//                               : <X className="inline h-5 w-5 text-red-600"/>}
//                           </td>
//                           <td className="px-3 py-2 text-center">
//                             {in_resume
//                               ? <Check className="inline h-5 w-5 text-green-600"/>
//                               : <X className="inline h-5 w-5 text-red-600"/>}
//                           </td>
//                           <td className="px-3 py-2 text-center">
//                             {in_job && in_resume ? (
//                               "" // empty cell when both are true
//                             ) : in_resume ? (
//                               "Yes"
//                             ) : (
//                               <div className="flex justify-center space-x-4">
//                                 <label className="inline-flex items-center space-x-1">
//                                   <input
//                                     type="radio"
//                                     name={`worked-${i}`}
//                                     checked={workedOn[i] === true}
//                                     onChange={() =>
//                                       setWorkedOn(arr => {
//                                         const copy = [...arr];
//                                         copy[i] = true;
//                                         return copy;
//                                       })
//                                     }
//                                     className="form-radio h-4 w-4"
//                                   />
//                                   <span>Yes</span>
//                                 </label>
//                                 <label className="inline-flex items-center space-x-1">
//                                   <input
//                                     type="radio"
//                                     name={`worked-${i}`}
//                                     checked={workedOn[i] === false}
//                                     onChange={() =>
//                                       setWorkedOn(arr => {
//                                         const copy = [...arr];
//                                         copy[i] = false;
//                                         return copy;
//                                       })
//                                     }
//                                     className="form-radio h-4 w-4"
//                                   />
//                                   <span>No</span>
//                                 </label>
//                               </div>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>


//                   </table>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Skill Gaps
//             <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Skill Gaps</h3>
//                 <ul className="list-disc list-inside space-y-1 text-gray-700">
//                   {result.gaps.map((gap) => (
//                     <li key={gap}>{gap}</li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card> */}

//             {/* Bonus Points */}
//             <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Bonus Points</h3>
//                 <ul className="list-disc list-inside space-y-2 text-gray-700">
//                   {result.bonus_points.map((bp) => (
//                     <li key={bp}>{bp}</li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card>

//             {/* Recommendations */}
//             {/* <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Recommendations</h3>
//                 <ul className="list-decimal list-inside space-y-2 text-gray-700">
//                   {result.recommendations.map((rec) => (
//                     <li key={rec}>{rec}</li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card> */}

//             {/* Google Doc Link */}
//             {/* <div className="text-center mt-4">
//               <a
//                 href={result.google_doc_link}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="underline text-blue-600 font-semibold"
//               >
//                 View AI-tailored Resume (Google Doc)
//               </a>
//             </div> */}

//             <Button
//           size="lg"
//           className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
//           onClick={GeenrateResume}
//         >
//           Generate Resume and Cover Letter
//         </Button>
//           </div>
//         )}
//       </main>
//     </div>
    
//   )
// }













// // app/job-kit/page.tsx
// 'use client'
// export const dynamic = 'force-dynamic'

// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/components/AuthProvider'
// import { useResume } from '@/components/ResumeProvider'
// import { useState } from 'react'
// import { Card, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Check, X, LogOut, Loader2 } from 'lucide-react'
// import { useEffect } from 'react';


// // ---- API call for compare endpoint ----
// interface SkillsMatchItem {
//   skill: string;
//   in_job: boolean;
//   in_resume: boolean;
// }
// interface CompareApiResponse {
//   skills_match: SkillsMatchItem[];
//   gaps: string[];
//   bonus_points: string[];
//   recommendations: string[];
//   google_doc_link: string;
  
//   raw?: string;      // <-- add this line
//   error?: string;    
// }

// async function compareResumeJob({
//   resumeFile,
//   jobDescription,
//   jobUrl
// }: {
//   resumeFile: File,
//   jobDescription: string,
//   jobUrl?: string,
// }) {
//   const form = new FormData();
//   //form.append('resume_file', resumeFile);           // (If you later want to add file support)
//   form.append('job_description', jobDescription);   // Text
//   form.append('job_link', jobUrl || '');         // <-- NAME MATCHED
//   form.append('user_email', "ruchitrakholiya878@gmail.com");                 // <-- NAME MATCHED

//   const res = await fetch('http://127.0.0.1:8000/compare-resume-job', {
//     method: 'POST',
//     body: form,
//     headers: {
//       'accept': 'application/json',
//     },
//   });






// // const form = new FormData();
// // form.append('resume_file', resumeFile);           // File object, not string
// // form.append('job_description', jobDescription);   // String
// // form.append('job_url', jobUrl || 'N/A');          // String


// // console.log("jobDescription value before API:", jobDescription);

// // // If you want to add headers like in curl:
// // const res = await fetch('http://127.0.0.1:8000/compare-resume-job', {
// //   method: 'POST',
// //   body: form,
// //   credentials: 'include', // if your backend needs cookies/auth
// //   headers: {
// //     // DO NOT set Content-Type for FormData, browser will do it!
// //     'accept': 'application/json',
// //     'linkedin-id': '123', // replace with your logic or context!
// //     'email': 'ruchitrakholiya878@gmail.com', // replace with user's email!
// //   },
// // });


//   let data;
//   try {
//     data = await res.json();
//   } catch (e) {
//     throw new Error('Could not parse API response.');
//   }

//   if (!res.ok || data.error) {
//     // error from API
//     return { error: data.error || 'Unknown error', raw: data.raw, google_doc_link: data.google_doc_link };
//   }
//   return data
// }

// export default function JobKitPage() {
  
//   const router = useRouter()
//   const { user, isLoading, logout } = useAuth()
//   //const { resumeFile } = useResume()
  
// const { resumeFile } = useResume();

//   // UI states
//   const [jobUrl, setJobUrl] = useState('')
//   const [description, setDescription] = useState('')
//   const [email, setEmail] = useState(user?.email ?? '')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [result, setResult] = useState<CompareApiResponse | null>(null)

//   const [workedOn, setWorkedOn] = useState<boolean[]>([]);

//   useEffect(() => {
//   if (result) {
//     setWorkedOn(result.skills_match.map(s => s.in_resume));
//   }
// }, [result]);


//   // Redirect if not logged in
//   if (!isLoading && !user) {
//     router.replace('/')
//     return null
//   }
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
//       </div>
//     )
//   }
//   // if (!resumeFile) {
//   //   // If no resume uploaded, force user back to dashboard
//   //   router.replace('/dashboard')
//   //   return null
//   // }

//   // Form handler
//   async function handleCompare(e: React.FormEvent) {
//     e.preventDefault();
//     setError('');
//     setResult(null);
//     setLoading(true);
//     try {
      
//       console.log("Submitting:", { jobDescription: description, resumeFile, jobUrl });

//       const compareResult = await compareResumeJob({
//         resumeFile,
//         jobUrl: jobUrl || undefined,
//         jobDescription: description || undefined, // <-- FIXED!
//         email,
//       });

//       if ('error' in compareResult) {
//   setError(compareResult.error);
//   setResult({
//     skills_match: [],
//     gaps: [],
//     bonus_points: [],
//     recommendations: [],
//     google_doc_link: compareResult.google_doc_link,
//     raw: compareResult.raw // <-- add this!
//   } as CompareApiResponse);
// } else {
//   setResult(compareResult);
// }

//       } catch (err: any) {
//         setError(err.message ?? 'An error occurred.');
//       } finally {
//         setLoading(false);
//       }
//     }

//     const GeenrateResume = () => {
//     router.push('/job-kit/result')
//   }


//   return (
//     <div className="min-h-screen bg-[#eef5ff] px-4 py-6 space-y-8">
//       {/* Top Bar */}
//       <header className="flex items-center justify-between max-w-5xl mx-auto">
//         <h1 className="text-2xl font-bold text-gray-900">
//           Smart Job Kit Generator
//         </h1>
//         <Button variant="outline" onClick={logout}>
//           <LogOut className="mr-2 h-4 w-4" />
//           Logout
//         </Button>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-4xl mx-auto space-y-12">
//         {/* Form to enter Job Link / Description */}
//         <Card className="shadow-lg">
//           <CardContent className="p-6">
//             <form onSubmit={handleCompare} className="space-y-4">
//               <h2 className="text-xl font-semibold mb-2">Enter Job Info</h2>
//               <label className="block font-semibold">Job Link:</label>
//               <input
//                 type="url"
//                 value={jobUrl}
//                 onChange={e => setJobUrl(e.target.value)}
//                 placeholder="Paste job posting URL"
//                 className="w-full border p-2 rounded"
//               />
//               <div className="text-center text-gray-400">or</div>
//               <label className="block font-semibold">Job Description:</label>
//               <textarea
//                 value={description}
//                 onChange={e => setDescription(e.target.value)}
//                 rows={4}
//                 className="w-full border p-2 rounded"
//                 placeholder="Paste the job description"
//               />
//               <label className="block font-semibold">Your Email:</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={e => setEmail(e.target.value)}
//                 required
//                 className="w-full border p-2 rounded"
//               />
//               {error && <div className="text-red-600">{error}</div>}
//               <Button
//                 type="submit"
//                 size="lg"
//                 className="w-full"
//                 disabled={loading || (!jobUrl && !description)}
//               >
//                 {loading
//                   ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Comparing...</>
//                   : 'Compare Resume'}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>


//         {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//               <strong className="font-bold">Error:</strong> {error}
//               {result?.google_doc_link && (
//                 <div className="mt-2">
//                   <a
//                     href={result.google_doc_link}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="underline text-blue-600 font-semibold"
//                   >
//                     View your document on Google Docs
//                   </a>
//                 </div>
//               )}
//               {result?.raw && (
//                 <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
//                   {result.raw}
//                 </pre>
//               )}
//             </div>
//           )}
//         {/* Results */}
//         {result && (
//           <div className="space-y-12">
//             {/* Skills Table */}
//             <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Skills Comparison</h3>
//                 <div className="overflow-x-auto">
//                   <table className="w-full table-auto border-collapse">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="px-3 py-2 text-left">Skill</th>
//                         <th className="px-3 py-2 text-center">In Job</th>
//                         <th className="px-3 py-2 text-center">In Resume</th>
//                         <th className="px-3 py-2 text-center">Have You Worked On It?</th>
//                       </tr>
//                     </thead>

//                    <tbody>
//                       {result.skills_match.map(({ skill, in_job, in_resume }, i) => (
//                         <tr key={skill} className="even:bg-gray-50">
//                           <td className="px-3 py-2">{skill}</td>
//                           <td className="px-3 py-2 text-center">
//                             {in_job
//                               ? <Check className="inline h-5 w-5 text-green-600"/>
//                               : <X className="inline h-5 w-5 text-red-600"/>}
//                           </td>
//                           <td className="px-3 py-2 text-center">
//                             {in_resume
//                               ? <Check className="inline h-5 w-5 text-green-600"/>
//                               : <X className="inline h-5 w-5 text-red-600"/>}
//                           </td>
//                           <td className="px-3 py-2 text-center">
//                             {in_job && in_resume ? (
//                               "" // empty cell when both are true
//                             ) : in_resume ? (
//                               "Yes"
//                             ) : (
//                               <div className="flex justify-center space-x-4">
//                                 <label className="inline-flex items-center space-x-1">
//                                   <input
//                                     type="radio"
//                                     name={`worked-${i}`}
//                                     checked={workedOn[i] === true}
//                                     onChange={() =>
//                                       setWorkedOn(arr => {
//                                         const copy = [...arr];
//                                         copy[i] = true;
//                                         return copy;
//                                       })
//                                     }
//                                     className="form-radio h-4 w-4"
//                                   />
//                                   <span>Yes</span>
//                                 </label>
//                                 <label className="inline-flex items-center space-x-1">
//                                   <input
//                                     type="radio"
//                                     name={`worked-${i}`}
//                                     checked={workedOn[i] === false}
//                                     onChange={() =>
//                                       setWorkedOn(arr => {
//                                         const copy = [...arr];
//                                         copy[i] = false;
//                                         return copy;
//                                       })
//                                     }
//                                     className="form-radio h-4 w-4"
//                                   />
//                                   <span>No</span>
//                                 </label>
//                               </div>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>


//                   </table>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Skill Gaps
//             <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Skill Gaps</h3>
//                 <ul className="list-disc list-inside space-y-1 text-gray-700">
//                   {result.gaps.map((gap) => (
//                     <li key={gap}>{gap}</li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card> */}

//             {/* Bonus Points */}
//             <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Bonus Points</h3>
//                 <ul className="list-disc list-inside space-y-2 text-gray-700">
//                   {result.bonus_points.map((bp) => (
//                     <li key={bp}>{bp}</li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card>

//             {/* Recommendations */}
//             {/* <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Recommendations</h3>
//                 <ul className="list-decimal list-inside space-y-2 text-gray-700">
//                   {result.recommendations.map((rec) => (
//                     <li key={rec}>{rec}</li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card> */}

//             {/* Google Doc Link */}
//             {/* <div className="text-center mt-4">
//               <a
//                 href={result.google_doc_link}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="underline text-blue-600 font-semibold"
//               >
//                 View AI-tailored Resume (Google Doc)
//               </a>
//             </div> */}

//             <Button
//           size="lg"
//           className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
//           onClick={GeenrateResume}
//         >
//           Generate Resume and Cover Letter
//         </Button>
//           </div>
//         )}
//       </main>
//     </div>
    
//   )
// }
