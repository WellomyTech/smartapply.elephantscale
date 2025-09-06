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
import { Check, X, LogOut, Loader2, Sparkles, Target, Briefcase, FileText, Zap, Search, HelpCircle, Building2, Link, AlertCircle } from 'lucide-react'
import DashboardButton from '@/components/DashboardButton'
import { StatusBar, useStatusBar } from '@/components/ui/status-bar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

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
  jobLink,
}: {
  jobDescription: string
  jobTitle?: string
  jobCompany?: string
  jobLink?: string
}) {
  const API_KEY = process.env.NEXT_PUBLIC_API_BASE as string
  const email =
    typeof window !== 'undefined' ? (window.localStorage.getItem('user_email') || '') : ''

  const form = new FormData()
  form.append('user_email', email)
  form.append('job_description', jobDescription)
  if (jobTitle) form.append('job_title', jobTitle)
  if (jobCompany) form.append('job_company', jobCompany)
  if (jobLink) form.append('job_link', jobLink)

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
    window.localStorage.setItem('report_id', data.report_id.toString())
  }

  return data as CompareApiResponse
}

export default function JobKitPage() {
  const API_KEY = process.env.NEXT_PUBLIC_API_BASE as string
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const { resumeFile } = useResume()

  const [jobUrl, setJobUrl] = useState('')
  const [jobUrlError, setJobUrlError] = useState('')
  const [description, setDescription] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobCompany, setJobCompany] = useState('')
  const [email, setEmail] = useState(user?.email ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CompareApiResponse | null>(null)

  // Missing fields modal state
  const [showMissingModal, setShowMissingModal] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [jobTitleInput, setJobTitleInput] = useState('')
  const [jobCompanyInput, setJobCompanyInput] = useState('')

  // Skills selection state
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [generatedResume, setGeneratedResume] = useState('')
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState('')
  const [generating, setGenerating] = useState(false)

  // Display job title/company (from result or user input)
  const [displayJobTitle, setDisplayJobTitle] = useState('')
  const [displayJobCompany, setDisplayJobCompany] = useState('')

  // Status bar hook
  const { status, showStatus, hideStatus } = useStatusBar()

  // Keep email from auth
  useEffect(() => {
    if (user?.email) setEmail(user.email)
  }, [user])

  // URL validation function
  const validateUrl = (url: string) => {
    if (!url.trim()) {
      setJobUrlError('Job link is required')
      return false
    }
    try {
      const urlObj = new URL(url)
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        setJobUrlError('Please enter a valid HTTP or HTTPS URL')
        return false
      }
      setJobUrlError('')
      return true
    } catch {
      setJobUrlError('Please enter a valid URL (e.g., https://www.linkedin.com/jobs/view/123456789)')
      return false
    }
  }

  // Persist fields (client-only)
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('job_url', jobUrl)
    if (jobUrl.trim()) {
      validateUrl(jobUrl)
    }
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

  // Load persisted fields on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const lsUrl = window.localStorage.getItem('job_url')
    const lsDesc = window.localStorage.getItem('job_description')
    const lsTitle = window.localStorage.getItem('job_title')
    const lsCompany = window.localStorage.getItem('job_company')
    if (lsUrl) setJobUrl(lsUrl)
    if (lsDesc) setDescription(lsDesc)
    if (lsTitle) setJobTitle(lsTitle)
    if (lsCompany) setJobCompany(lsCompany)
  }, [])

  // Update display job title/company when result changes
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

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) {
      showStatus('Please enter a job description', 'warning')
      return
    }
    if (!jobUrl.trim()) {
      showStatus('Please enter a job link', 'warning')
      return
    }
    if (!validateUrl(jobUrl)) {
      showStatus('Please enter a valid job URL', 'warning')
      return
    }
    if (!jobTitle.trim()) {
      showStatus('Please enter a job title', 'warning')
      return
    }
    if (!jobCompany.trim()) {
      showStatus('Please enter a company name', 'warning')
      return
    }

    setError('')
    setResult(null)
    setLoading(true)
    showStatus('Analyzing job requirements with AI...', 'loading')

    try {
      const compareRes = await compareResumeJob({
        jobDescription: description || '',
        jobTitle: jobTitle?.trim() || undefined,
        jobCompany: jobCompany?.trim() || undefined,
        jobLink: jobUrl?.trim() || undefined,
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
        showStatus('Missing job details required', 'warning')
        setLoading(false)
        return
      }

      if ((compareRes as Compare422).error) {
        setError((compareRes as Compare422).error || 'Unknown error')
        showStatus((compareRes as Compare422).error || 'Analysis failed', 'error')
        setLoading(false)
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
      showStatus('Job analysis completed successfully!', 'success')
    } catch (err: any) {
      setError(err?.message ?? 'An error occurred.')
      showStatus(err?.message ?? 'Analysis failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    if (typeof window !== 'undefined') window.localStorage.clear()
  }

  const compareDisabled = loading || !description.trim() || !jobUrl.trim() || !!jobUrlError || !jobTitle.trim() || !jobCompany.trim()

  return (
    <TooltipProvider>
      <StatusBar
        message={status.message}
        type={status.type}
        visible={status.visible}
        onClose={hideStatus}
      />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
        <div className="container mx-auto px-4 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 backdrop-blur-sm">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI-Powered Job Analysis</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Job Kit Scanner
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compare your resume against job requirements and get AI-powered recommendations
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-white/20 rounded-xl hover:bg-white/90"
            >
              <Target className="mr-2 h-4 w-4" />
              Back to Dashboard
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

          {!result ? (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-white/20 shadow-2xl rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                  <Search className="h-6 w-6 text-blue-600" />
                  Job Analysis Form
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <form onSubmit={handleCompare} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="job-title" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <Briefcase className="inline h-4 w-4 mr-1" />
                          Job Title <span className="text-red-500">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enter the exact job title from the job posting. This helps our AI understand the role requirements and tailor your resume accordingly.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="job-title"
                        type="text"
                        value={jobTitle}
                        onChange={e => setJobTitle(e.target.value)}
                        placeholder="e.g., Senior Software Engineer"
                        className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="job-company" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          <Building2 className="inline h-4 w-4 mr-1" />
                          Company Name <span className="text-red-500">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enter the company name exactly as it appears in the job posting. This helps personalize your cover letter and resume.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="job-company"
                        type="text"
                        value={jobCompany}
                        onChange={e => setJobCompany(e.target.value)}
                        placeholder="e.g., Google, Microsoft, Apple"
                        className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="job-link" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <Link className="inline h-4 w-4 mr-1" />
                        Job Link <span className="text-red-500">*</span>
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Paste the complete URL of the job posting. Make sure it's a valid link starting with https://. This allows you to apply directly after generating your documents.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="job-link"
                      type="url"
                      value={jobUrl}
                      onChange={e => setJobUrl(e.target.value)}
                      placeholder="e.g., https://www.linkedin.com/jobs/view/123456789"
                      className={`rounded-xl border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 ${jobUrlError ? 'border-red-500 focus:border-red-500' : ''}`}
                      required
                    />
                    {jobUrlError && (
                      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <span>{jobUrlError}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="job-desc" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        <FileText className="inline h-4 w-4 mr-1" />
                        Job Description <span className="text-red-500">*</span>
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Copy and paste the complete job description from the job board. Include requirements, responsibilities, and qualifications for the most accurate AI analysis.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Textarea
                      id="job-desc"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={20}
                      placeholder="Paste the complete job description here..."
                      className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                      required
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Sparkles className="h-3 w-3" />
                      <span>All fields marked with <span className="text-red-500">*</span> are required for AI analysis</span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
                    </div>
                  )}
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300" 
                    disabled={compareDisabled}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Analyzing with AI Scanner...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Start AI Job Analysis
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            // After successful compare: modern summary card
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200/30 backdrop-blur-sm rounded-2xl shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl">
                <CardTitle className="text-white text-lg font-bold text-center flex items-center justify-center gap-2">
                  <Check className="h-5 w-5" />
                  Analysis Complete - Recruiter's View
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {displayJobTitle || '—'}
                  </div>
                  <div className="text-lg text-muted-foreground font-medium">{displayJobCompany || '—'}</div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mt-2">
                    <Sparkles className="h-3 w-3" />
                    AI Analysis Ready
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-8">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-white/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Target className="h-6 w-6 text-blue-600" />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      AI Job Scan Results
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-700 hover:to-slate-800 [&>th]:text-white [&>th]:font-bold [&>th]:py-4">
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
                                  {showRadio && (
                                    <RadioGroup
                                      value={selectedSkills.includes(skill) ? 'yes' : 'no'}
                                      onValueChange={(value) => {
                                        if (value === 'yes') {
                                          setSelectedSkills(prev => [...prev.filter(s => s !== skill), skill])
                                        } else {
                                          setSelectedSkills(prev => prev.filter(s => s !== skill))
                                        }
                                      }}
                                      className="flex items-center justify-center gap-6"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="yes" id={`${skill}-yes`} />
                                        <Label htmlFor={`${skill}-yes`}>Yes</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="no" id={`${skill}-no`} />
                                        <Label htmlFor={`${skill}-no`}>No</Label>
                                      </div>
                                    </RadioGroup>
                                  )}
                                </TableCell>
                              </TableRow>
                            )
                          })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              <div className="text-center">
                <Button 
                  size="lg" 
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => router.push('/job-kit/result')}
                >
                  <Zap className="mr-2 h-5 w-5" />
                  Generate Optimized Resume & Cover Letter
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </TooltipProvider>
  )
}
