'use client'

import { ChangeEvent, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Upload, LogOut, Link as LinkIcon } from 'lucide-react'

export default function Dashboard() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [jobUrl, setJobUrl] = useState('')
  const [description, setDescription] = useState('')
  const [isJobUrlValid, setIsJobUrlValid] = useState(true)

  // Validate URL whenever jobUrl changes
  useEffect(() => {
    if (jobUrl.trim() === '') {
      setIsJobUrlValid(true)
    } else {
      try {
        // Throws if invalid
        new URL(jobUrl)
        setIsJobUrlValid(true)
      } catch {
        setIsJobUrlValid(false)
      }
    }
  }, [jobUrl])

  // Redirect if not authenticated
  if (!isLoading && !user) {
    router.replace('/')
    return null
  }
  if (isLoading) {
    return <p className="p-8">Loading…</p>
  }

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] ?? null)
  }

  const submitJobKit = () => {
  // Save jobUrl in localStorage so result page can read it
  if (jobUrl.trim()) {
    localStorage.setItem('jobLink', jobUrl.trim())
  } else {
    localStorage.removeItem('jobLink')
  }

  const params = new URLSearchParams()
  if (description.trim()) params.set('description', description.trim())
  if (jobUrl.trim()) params.set('jobUrl', jobUrl.trim())
  router.push(`/job-kit?${params.toString()}`)
}

  // const submitJobKit = () => {
  //   const params = new URLSearchParams()
  //   if (description.trim()) params.set('description', description.trim())
  //   if (jobUrl.trim()) params.set('jobUrl', jobUrl.trim())
  //   router.push(`/job-kit?${params.toString()}`)
  // }

  // Form is valid if resume is selected, at least one of description/jobUrl is provided,
  // and the jobUrl (if provided) is a valid URL
  const isFormValid =
    !!selectedFile &&
    (description.trim() !== '' || jobUrl.trim() !== '') &&
    isJobUrlValid

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

        {/* Description Field */}
        <Card className="shadow-sm">
          <CardContent className="p-6 space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">Description</h2>
            <p className="text-sm text-gray-600">
              Paste any additional details or a cover-letter snippet here.
            </p>
            <Textarea
              placeholder="Enter description…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />
          </CardContent>
        </Card>

        {/* Upload Resume & Job Posting */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Resume Upload */}
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-600">
                <Upload className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Upload Resume (Required)*</h2>
              </div>
              <p className="text-sm text-gray-600">
                Upload your current resume in PDF format
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
                  ref={fileInputRef}
                  onChange={onFileChange}
                />
                {selectedFile ? (
                  <p className="text-sm">{selectedFile.name}</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Click to upload PDF
                  </p>
                )}
              </label>
            </CardContent>
          </Card>

          {/* Job Posting URL */}
          <Card className="shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-2 text-indigo-600">
                <LinkIcon className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Job Posting</h2>
              </div>
              <p className="text-sm text-gray-600">
                Paste the LinkedIn job posting URL you&apos;re applying for
              </p>
              <Input
                placeholder="https://www.linkedin.com/jobs/view/..."
                value={jobUrl}
                onChange={(e) => setJobUrl(e.target.value)}
                className={!isJobUrlValid ? 'border-red-500' : ''}
              />
              {!isJobUrlValid && (
                <p className="text-red-600 text-sm">
                  Please enter a valid URL.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Generate Job Kit Button */}
        <Button
          size="lg"
          className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
          disabled={!isFormValid}
          onClick={submitJobKit}
        >
          Generate Job Kit
        </Button>
      </main>
    </div>
  )
}
