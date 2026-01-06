"use client"

import React, { ChangeEvent, useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Upload, Sparkles, FileText, Briefcase, Target, Zap, CheckCircle, ArrowRight, Plus } from "lucide-react"

import { useAuth } from "@/components/AuthProvider"
import { useResume } from "@/components/ResumeProvider"
import { useEntitlement } from "@/hooks/useEntitlement"
import PricingModal from "@/components/PricingButtons"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { StatusBar, useStatusBar } from "@/components/ui/status-bar"
import JobScanList from "@/components/JobScanList"
import DashboardButton from "@/components/DashboardButton"
import { useTranslations } from "next-intl"

/** ---- in-flight fetch de-dupe (no logic change) ---- */
/** ---- JSON fetch with in-flight + persistent cache ---- */
const inflight = new Map<string, Promise<any>>();
const jsonCache = new Map<string, any>();

async function fetchJsonOnce(url: string, init?: RequestInit) {
  // If we already have the parsed JSON, return it immediately.
  if (jsonCache.has(url)) return jsonCache.get(url);

  // If a request is currently in flight, await and share it.
  if (inflight.has(url)) return inflight.get(url)!;

  const p = fetch(url, init)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      jsonCache.set(url, data);   // persist for subsequent calls
      return data;
    })
    .finally(() => {
      inflight.delete(url);       // clear in-flight but keep jsonCache
    });

  inflight.set(url, p);
  return p;
}

export default function Dashboard() {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE

  const { user, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()

  const {
    isLoading: entLoading,
    canGenerate,
    isPremium,
    freeRemain,
  } = useEntitlement()
  const [showPaywall, setShowPaywall] = useState(false)
  const { status, showStatus, hideStatus } = useStatusBar()
  const t = useTranslations('resume')

  const resumeInputRef = useRef<HTMLInputElement | null>(null)
  const coverLetterInputRef = useRef<HTMLInputElement | null>(null)

  const { resumeFile, setResumeFile, coverLetterFile, setCoverLetterFile } = useResume()

  const [hasResume, setHasResume] = useState<boolean>(false)
  const [hasCoverLetter, setHasCoverLetter] = useState<boolean>(false)
  const [userData, setUserData] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  /** ensure we write email once */
  useEffect(() => {
    if (user?.email) localStorage.setItem("user_email", user.email)
  }, [user?.email])

  /** ---- RUN-ONCE GUARD for the dashboard fetch ---- */
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (authLoading || !user?.email) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const url = `${API_URL}user-dashboard?user_email=${encodeURIComponent(user.email)}`;

    fetchJsonOnce(url)
      .then((data) => {
        setHasResume(data.has_resume === 1);
        setHasCoverLetter(data.has_cover_letter === 1);
        setUserData(data);
      })
      .catch((error) => {
        console.error("Failed to fetch dashboard:", error);
        setHasResume(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, authLoading]);  // (omit API_URL to avoid re-trigger)


  const localSetFileName = (
    key: "resume" | "cover_letter",
    file: File | null,
  ) => {
    const storageKey = `${key}_file_name`
    if (file) localStorage.setItem(storageKey, file.name)
    else localStorage.removeItem(storageKey)
  }

  const onResumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setResumeFile(f)
    setError("")
    localSetFileName("resume", f)

    // Automatically upload the resume when selected
    if (f) {
      handleResumeUpload(e)
    }
  }

  const onCoverLetterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setCoverLetterFile(f)
    setError("")
    localSetFileName("cover_letter", f)
  }

  const handleResumeUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      showStatus(t('status.onlyPdf'), 'error')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      showStatus(t('status.sizeLimit'), 'error')
      return
    }

    setUploading(true)
    
    // Dynamic loading messages with animations
    const loadingMessages = [
      t('status.resLoading1'),
      t('status.resLoading2'),
      t('status.resLoading3'),
      t('status.resLoading4')
    ]
    
    let messageIndex = 0
    showStatus(loadingMessages[0], 'loading')
    
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length
      showStatus(loadingMessages[messageIndex], 'loading')
    }, 1500)

    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('user_email', user?.email || '')

      const response = await fetch(`${API_URL}upload-resume`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      setResumeFile(file)
      setHasResume(true) // Update the hasResume state
      clearInterval(messageInterval)
      showStatus(t('status.resSuccess'), 'success')

      // Redirect to Job Suggestions page after a successful upload
      router.push('/job-suggestions')

    } catch (error) {
      clearInterval(messageInterval)
      showStatus(t('status.resError'), 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleCoverLetterUpload = async () => {
    if (!coverLetterFile || !user?.email) return;
    setUploading(true);
    setError("");
    
    // Dynamic loading messages for cover letter upload
    const loadingMessages = [
      t('status.coverLoading1'),
      t('status.coverLoading2'),
      t('status.coverLoading3'),
      t('status.coverLoading4')
    ]
    
    let messageIndex = 0
    showStatus(loadingMessages[0], 'loading')
    
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length
      showStatus(loadingMessages[messageIndex], 'loading')
    }, 1200);
    
    const fd = new FormData();
    fd.append("cover_letter", coverLetterFile);
    fd.append("user_email", user.email);

    try {
      const res = await fetch(`${API_URL}upload-cover-letter`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setHasCoverLetter(true);
        setCoverLetterFile(null);
        localStorage.removeItem("cover_letter_file_name");
        showStatus(t('status.coverSuccess'), "success")
      } else {
        const errorMsg = data.detail || t('status.coverFail');
        setError(errorMsg);
        showStatus(errorMsg, "error");
      }
    } catch {
      const errorMsg = t('status.networkError');
      setError(errorMsg);
      showStatus(errorMsg, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    if (canGenerate) {
      showStatus(t('status.redirecting'), "info")
      router.push("/job-kit")
    } else {
      setShowPaywall(true)
    }
  }

  const handleLogout = () => {
    logout()
    localStorage.clear()
  }

  if (authLoading || entLoading) {
    return <p className="text-center mt-10 text-muted-foreground">{t('loadingDashboard')}</p>
  }
  if (!user) {
    router.replace('/')
    return null
  }
  if (!userData) {
    return <p className="text-center mt-10 text-muted-foreground">{t('loadingDashboard')}</p>
  }

  return (
    <>
      <StatusBar
        message={status.message}
        type={status.type}
        visible={status.visible}
        onClose={hideStatus}
      />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header with gradient */}
          <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50 px-6 py-6 text-center shadow-sm">
            
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {t('header.title', { name: (user.name || '').split(' ')[0] || '' })}
            </h1>
            {!hasResume && (
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('header.subtitle')}
              </p>
            )}
          </div>

          {/* Only show upload section if resume is NOT uploaded */}
          {!hasResume ? (
            <div className="grid gap-8 md:grid-cols-2">
              {/* Resume */}
              <Card className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl border-2 border-slate-200/50 dark:border-slate-700 hover:border-blue-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 text-blue-700 dark:text-blue-300">
                    <div className="p-2 rounded-lg bg-blue-100/70 dark:bg-blue-900/30">
                      <FileText className="h-6 w-6" />
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight">{t('upload.resumeTitle')}</h2>
                  </div>
                  <label
                    htmlFor="resume"
                    className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl h-40 cursor-pointer transition-all duration-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
                  >
                    <Input
                      id="resume"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      ref={resumeInputRef}
                      onChange={onResumeChange}
                      disabled={hasResume}
                    />
                    {resumeFile ? (
                      <p className="text-sm">{resumeFile.name}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t('upload.resumeClick')}</p>
                    )}
                  </label>
                  {/* Show Continue button after resume is uploaded */}
                  {hasResume && (
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={handleContinue}
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        {t('upload.continue')}
                      </div>
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Cover Letter */}
              <Card className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl border-2 border-slate-200/50 dark:border-slate-700 hover:border-purple-400 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
                    <div className="p-2 rounded-lg bg-purple-100/70 dark:bg-purple-900/30">
                      <Upload className="h-6 w-6" />
                    </div>
                    <h2 className="text-lg font-semibold tracking-tight">{t('upload.coverTitle')}</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">{t('upload.coverHint')}</p>
                  <label
                    htmlFor="cover-letter"
                    className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl h-40 cursor-pointer transition-all duration-300 border-slate-200 dark:border-slate-700 hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20"
                  >
                    <Input
                      id="cover-letter"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      ref={coverLetterInputRef}
                      onChange={onCoverLetterChange}
                      disabled={!resumeFile}
                    />
                    {coverLetterFile ? (
                      <p className="text-sm">{coverLetterFile.name}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {resumeFile ? t('upload.coverClickOptional') : t('upload.coverLocked')}
                      </p>
                    )}
                  </label>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div>
              {/* Removed the old "Apply New Job" full-width button */}
              {/* Show onboarding UI if no reports exist */}
              {(!userData.reports || userData.reports.length === 0) ? (
                <div className="mt-8 space-y-8">
                  {/* Welcome message for first-time users */}
                  <Card className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl border-2 border-slate-200/50 dark:border-slate-700">
                    <CardContent className="p-6 text-center">
                      <div className="flex items-center justify-center mb-4">
                        <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('onboarding.readyTitle')}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">{t('onboarding.readyBody')}</p>
                    </CardContent>
                  </Card>

                  {/* How it works section */}
                  <Card className="bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl border-2 border-slate-200/50 dark:border-slate-700">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-600" />
                        {t('onboarding.howWorks')}
                      </h3>

                      {/* Horizontal layout: 4 steps in a row (responsive) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
                        {/* Step 1 */}
                        <div className="relative p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 h-full">
                          <div className="absolute -top-3 -left-3 h-7 w-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow">
                            1
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{t('onboarding.steps.findTitle')}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{t('onboarding.steps.findBody')}</p>
                            </div>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="relative p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 h-full">
                          <div className="absolute -top-3 -left-3 h-7 w-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shadow">
                            2
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                              <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{t('onboarding.steps.analysisTitle')}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{t('onboarding.steps.analysisBody')}</p>
                            </div>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="relative p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 h-full">
                          <div className="absolute -top-3 -left-3 h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow">
                            3
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                              <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{t('onboarding.steps.resultsTitle')}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{t('onboarding.steps.resultsBody')}</p>
                            </div>
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className="relative p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 h-full">
                          <div className="absolute -top-3 -left-3 h-7 w-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow">
                            4
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                              <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{t('onboarding.steps.practiceTitle')}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{t('onboarding.steps.practiceBody')}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Call to action */}
                  <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl">
                    <CardContent className="p-6 text-center">
                      <h3 className="text-xl font-semibold mb-2">{t('onboarding.ctaTitle')}</h3>
                      <p className="mb-4 opacity-90">
                        {t('onboarding.ctaBody')}
                        <span className="inline-flex items-center justify-center mx-1 h-6 w-6 rounded-full bg-white/90 text-green-700 shadow-sm align-middle">
                          <Plus className="h-4 w-4" />
                        </span>
                        {t('onboarding.ctaTail')}
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm opacity-75">
                        <span>{t('onboarding.ctaNote')}</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tips section */}
                  <Card className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl shadow-xl border-2 border-amber-200 dark:border-amber-800">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-4">💡 {t('tips.title')}</h3>
                      <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          {t('tips.tip1')}
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          {t('tips.tip2')}
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 mt-1">•</span>
                          {t('tips.tip3')}
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <JobScanList reports={userData.reports} />
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="text-center p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800">
              <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            </div>
          )}

          {/* Free credit badge */}
          {!isPremium && freeRemain > 0 && hasResume && (
            <div className="text-center p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
              <p className="text-blue-700 dark:text-blue-300 font-medium">{t('badges.noJobsYet')}</p>
            </div>
          )}

          {/* Paywall modal */}
          <PricingModal open={showPaywall} onOpenChange={setShowPaywall} />
        </div>

        {/* Floating + button (only when resume is uploaded) */}
        {hasResume && (
          <Button
            size="icon"
            aria-label={t('badges.startScanAria')}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full p-0 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-2xl"
            onClick={handleContinue}
          >
            <Plus className="h-7 w-7" />
          </Button>
        )}
      </main>
    </>
  )
}