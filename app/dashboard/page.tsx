'use client'

import { ChangeEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useResume } from '@/components/ResumeProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LogOut, Upload } from 'lucide-react'

export default function Dashboard() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const resumeInputRef = useRef<HTMLInputElement | null>(null)
  const coverLetterInputRef = useRef<HTMLInputElement | null>(null)

  // Use context for files
  const {
    resumeFile, setResumeFile,
    coverLetterFile, setCoverLetterFile
  } = useResume();

  // Redirect if not authenticated
  if (!isLoading && !user) {
    router.replace('/')
    return null
  }
  if (isLoading) {
    return <p className="p-8">Loading…</p>
  }

  // Handlers
const onResumeChange = (e: ChangeEvent<HTMLInputElement>) => {
  setResumeFile(e.target.files?.[0] ?? null);
  console.log("Setting resume file:", e.target.files?.[0]);
};
  const onCoverLetterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCoverLetterFile(e.target.files?.[0] ?? null)
  }

  const onGetStarted = () => {
    router.push('/job-kit')
  }

  const isFormValid = !!resumeFile // Only resume is required!

  return (
    <div className="min-h-screen bg-[#eef5ff] px-4 py-6 space-y-8">
      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Smart Job Kit Generator
          </h1>
          <p className="text-gray-600">
            Create personalized job application materials
          </p>
        </div>
        <Button variant="outline" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </header>

      <main className="max-w-5xl mx-auto space-y-8">
        {/* User Card */}
        <Card className="shadow-sm">
          <CardContent className="flex items-center space-x-4 p-6">
            {user?.picture ? (
              <img
                src={user.picture}
                alt={user.name}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold text-white">
                {user?.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
            )}
            <div className="flex-1">
              <p className="text-lg font-semibold text-gray-900">
                {user?.name}
              </p>
              <p className="text-sm text-gray-500">
                {user?.headline
                  ? user?.headline
                  : user?.email
                  ? user.email
                  : 'LinkedIn member'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Resume & Cover Letter */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Resume Upload */}
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Upload className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Upload Resume (PDF) *</h2>
              </div>
              <p className="text-sm text-gray-600">
                Please upload your resume in PDF format. (Required)
              </p>
              <label
                htmlFor="resume"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-40 cursor-pointer hover:bg-gray-50"
              >
                <Input
                  id="resume"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  ref={resumeInputRef}
                  onChange={onResumeChange}
                />
                {resumeFile ? (
                  <p className="text-sm">{resumeFile.name}</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Click to upload PDF
                  </p>
                )}
              </label>
            </CardContent>
          </Card>

          {/* Cover Letter Upload */}
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Upload className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Upload Cover Letter (PDF)</h2>
              </div>
              <p className="text-sm text-gray-600">
                Optional: You can upload a cover letter in PDF format.
              </p>
              <label
                htmlFor="cover-letter"
                className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-40 cursor-pointer hover:bg-gray-50"
              >
                <Input
                  id="cover-letter"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  ref={coverLetterInputRef}
                  onChange={onCoverLetterChange}
                />
                {coverLetterFile ? (
                  <p className="text-sm">{coverLetterFile.name}</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Click to upload PDF (optional)
                  </p>
                )}
              </label>
            </CardContent>
          </Card>
        </div>

        {/* Let's Get Started Button */}
        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
          disabled={!isFormValid}
          onClick={onGetStarted}
        >
          Let&apos;s Get Started
        </Button>
      </main>
    </div>
  )
}
