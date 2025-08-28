"use client"

import React, { ChangeEvent, useRef, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Upload } from "lucide-react"

import { useAuth } from "@/components/AuthProvider"
import { useResume } from "@/components/ResumeProvider"
import { useEntitlement } from "@/hooks/useEntitlement"
import PricingModal from "@/components/PricingButtons"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import JobScanList from "@/components/JobScanList"
import DashboardButton from "@/components/DashboardButton"

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

  const resumeInputRef = useRef<HTMLInputElement | null>(null)
  const coverLetterInputRef = useRef<HTMLInputElement | null>(null)

  const { resumeFile, setResumeFile, coverLetterFile, setCoverLetterFile } = useResume()

  const [hasResume, setHasResume] = useState<boolean>(false)
  const [hasCoverLetter, setHasCoverLetter] = useState<boolean>(false)
  const [userData, setUserData] = useState<any>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (user?.email) localStorage.setItem("user_email", user.email)
  }, [user?.email])

  useEffect(() => {
    if (authLoading || !user?.email) return
    fetch(`${API_URL}user-dashboard?user_email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        setHasResume(data.has_resume === 1)
        setHasCoverLetter(data.has_cover_letter === 1)
        setUserData(data)
      })
      .catch((error) => {
        console.error('Failed to fetch dashboard:', error)
        setHasResume(false)
      })
  }, [user?.email, authLoading, API_URL])

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
  }

  const onCoverLetterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setCoverLetterFile(f)
    setError("")
    localSetFileName("cover_letter", f)
  }

  const handleUpload = async () => {
    if (!resumeFile || !user?.email) return
    setUploading(true)
    setError("")
    const fd = new FormData()
    fd.append("resume", resumeFile)
    if (coverLetterFile) fd.append("cover_letter", coverLetterFile)
    fd.append("user_email", user.email)
    try {
      const res = await fetch(`${API_URL}upload-resume`, {
        method: "POST",
        body: fd,
      })
      const data = await res.json()
      if (res.ok) {
        setHasResume(true)
        if (coverLetterFile) setHasCoverLetter(true)
        setResumeFile(null)
        setCoverLetterFile(null)
        localStorage.removeItem("resume_file_name")
        localStorage.removeItem("cover_letter_file_name")
      } else {
        setError(data.detail || "Upload failed. Try again.")
      }
    } catch {
      setError("Network error. Try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleCoverLetterUpload = async () => {
    if (!coverLetterFile || !user?.email) return;
    setUploading(true);
    setError("");
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
      } else {
        setError(data.detail || "Cover letter upload failed. Try again.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    if (canGenerate) router.push("/job-kit")
    else setShowPaywall(true)
  }

  const handleLogout = () => {
    logout()
    localStorage.clear()
  }

  if (authLoading || entLoading) {
    return <p className="text-center mt-10 text-muted-foreground">Loading dashboard...</p>
  }
  if (!user) {
    router.replace('/')
    return null
  }
  if (!userData) {
    return <p className="text-center mt-10 text-muted-foreground">Loading dashboard...</p>
  }

  return (
    <main className="px-4 py-8">
      {/* Page heading */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Build. Prepare. Perform. Get Hired.</p>
        </div>
        <div className="flex gap-2">
          <DashboardButton />
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* User Card */}
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                {user?.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
            )}
            <div className="flex-1">
              <p className="text-lg font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email ?? "LinkedIn member"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Resume */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Upload className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Upload Resume (PDF) *</h2>
              </div>
              {hasResume && (
                <p className="text-center text-primary font-medium">
                  Resume is locked after upload.
                </p>
              )}
              <label
                htmlFor="resume"
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md h-40 cursor-pointer transition-colors
                ${hasResume ? "opacity-60 cursor-not-allowed" : "hover:bg-muted/40 border-muted-foreground/30"}`}
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
                  <p className={`text-sm ${hasResume ? "text-muted-foreground" : "text-muted-foreground"}`}>
                    {hasResume
                      ? "Resume uploaded"
                      : localStorage.getItem("resume_file_name")
                      ? `Last selected: ${localStorage.getItem("resume_file_name")}`
                      : "Click to upload PDF"}
                  </p>
                )}
              </label>
            </CardContent>
          </Card>

          {/* Cover Letter */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Upload className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Upload Cover Letter (PDF)</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Optional: You can upload a cover letter in PDF format.
              </p>

              <label
                htmlFor="cover-letter"
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md h-40 cursor-pointer transition-colors
                ${!hasResume || hasCoverLetter ? "opacity-60 cursor-not-allowed" : "hover:bg-muted/40 border-muted-foreground/30"}`}
              >
                <Input
                  id="cover-letter"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  ref={coverLetterInputRef}
                  onChange={onCoverLetterChange}
                  disabled={!hasResume || hasCoverLetter}
                />
                {coverLetterFile ? (
                  <p className="text-sm">{coverLetterFile.name}</p>
                ) : (
                  <p className={`text-sm ${hasCoverLetter ? "text-muted-foreground" : "text-muted-foreground"}`}>
                    {!hasResume
                      ? "Upload resume first to unlock"
                      : hasCoverLetter
                      ? "Cover letter uploaded"
                      : localStorage.getItem("cover_letter_file_name")
                      ? `Last selected: ${localStorage.getItem("cover_letter_file_name")}`
                      : "Click to upload PDF (optional)"}
                  </p>
                )}
              </label>

              {hasResume && !hasCoverLetter && coverLetterFile && (
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={handleCoverLetterUpload}
                  disabled={uploading}
                >
                  {uploading ? "Uploading…" : "Upload Cover Letter"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Error message */}
        {error && <p className="text-center text-destructive">{error}</p>}

        {/* Free credit badge */}
        {!isPremium && freeRemain > 0 && hasResume && (
          <p className="text-center text-sm text-muted-foreground">
            {freeRemain} / 5 free credits remaining
          </p>
        )}

        {/* Paywall modal */}
        <PricingModal open={showPaywall} onOpenChange={setShowPaywall} />

        {/* CTA buttons */}
        {!hasResume ? (
          <Button
            size="lg"
            className="w-full"
            disabled={!resumeFile || uploading}
            onClick={handleUpload}
          >
            {uploading ? "Uploading…" : "Upload & Get Started"}
          </Button>
        ) : (
          <Button
            size="lg"
            className="w-full"
            onClick={handleContinue}
          >
            Continue to Job Kit
          </Button>
        )}

        {/* Job Scan List */}
        <JobScanList reports={userData.reports} />
      </div>
    </main>
  )
}
