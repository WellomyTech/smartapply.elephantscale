'use client'

import React, { ChangeEvent, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useResume } from '@/components/ResumeProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LogOut, Upload } from 'lucide-react'

import PricingButtons from '@/components/PricingButtons'

export default function Dashboard() {

  const API_KEY  = process.env.NEXT_PUBLIC_API_BASE

  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const resumeInputRef = useRef<HTMLInputElement | null>(null)
  const coverLetterInputRef = useRef<HTMLInputElement | null>(null)

  // Context for files
  const {
    resumeFile, setResumeFile,
    coverLetterFile, setCoverLetterFile
  } = useResume()

  // New state: hasResume (null = loading, true = locked, false = not uploaded)
  const [hasResume, setHasResume] = useState<boolean | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>('')

  // -------------- localStorage integration --------------

  // Save hasResume to localStorage whenever it changes
  useEffect(() => {
    if (hasResume !== null) {
      localStorage.setItem('has_resume', JSON.stringify(hasResume));
    }
  }, [hasResume])

  // Save user email to localStorage
  useEffect(() => {
    if (user?.email) localStorage.setItem('user_email', user.email)
  }, [user])

  // Save resume/cover file name on change (can't store files)
  const onResumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setResumeFile(file)
    setError('')
    if (file) localStorage.setItem('resume_file_name', file.name)
    else localStorage.removeItem('resume_file_name')
  }
  const onCoverLetterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setCoverLetterFile(file)
    setError('')
    if (file) localStorage.setItem('cover_letter_file_name', file.name)
    else localStorage.removeItem('cover_letter_file_name')
  }

  // Restore hasResume state from localStorage on mount
  useEffect(() => {
    const savedHasResume = localStorage.getItem('has_resume')
    if (savedHasResume) setHasResume(JSON.parse(savedHasResume))
    // (Optional: show filenames on reload if you want)
  }, [])

  // Fetch resume status from backend (still does network check)
  useEffect(() => {
    if (user?.email) {
      fetch(`${API_KEY}user-dashboard?user_email=${encodeURIComponent(user.email)}`)
        .then(res => res.json())
        .then(data => setHasResume(data.has_resume === 1))
        .catch(() => setHasResume(false))
    }
  }, [user])

  // Upload resume & cover letter (API call)
  const handleUpload = async () => {
    if (!resumeFile || !user?.email) return
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('resume', resumeFile)
    if (coverLetterFile) formData.append('cover_letter', coverLetterFile)
    formData.append('user_email', user.email)
    try {
      const res = await fetch(`${API_KEY}upload-resume`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setHasResume(true)
        setResumeFile(null)
        setCoverLetterFile(null)
        // Remove file names since they're locked after upload
        localStorage.removeItem('resume_file_name')
        localStorage.removeItem('cover_letter_file_name')
      } else {
        setError(data.detail || 'Upload failed. Try again.')
      }
    } catch (e: any) {
      setError('Network error. Try again.')
    } finally {
      setUploading(false)
    }
  }

  // Custom logout handler to clear all localStorage data (optional, for privacy)
  const handleLogout = () => {
    logout()
    
    localStorage.clear(); // This clears all localStorage for this domain

    // add any other keys you want to clear!
  }

  // Redirect if not authenticated
  if (!isLoading && !user) {
    router.replace('/')
    return null
  }
  // Loading state
  if (isLoading || hasResume === null) {
    return <p className="p-8">Loading…</p>
  }

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
        <Button variant="outline" onClick={handleLogout}>
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
              {hasResume && (
                <div className="text-center text-indigo-700 font-semibold py-2 flex items-center justify-center">
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path d="M7 11V7a5 5 0 0 1 10 0v4M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z" stroke="#6366f1" strokeWidth="1.5"/></svg>
                  <span className="ml-2">Resume and Cover Letter are locked after upload.</span>
                </div>
              )}
              <label
                htmlFor="resume"
                className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-40 cursor-pointer ${hasResume ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}`}
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
                  <p className={`text-sm ${hasResume ? "text-gray-400" : "text-gray-500"}`}>
                    {hasResume
                      ? "Resume uploaded"
                      : localStorage.getItem('resume_file_name')
                      ? `Last selected: ${localStorage.getItem('resume_file_name')}`
                      : "Click to upload PDF"}
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
                className={`flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-40 cursor-pointer ${hasResume ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                <Input
                  id="cover-letter"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  ref={coverLetterInputRef}
                  onChange={onCoverLetterChange}
                  disabled={hasResume}
                />
                {coverLetterFile ? (
                  <p className="text-sm">{coverLetterFile.name}</p>
                ) : (
                  <p className={`text-sm ${hasResume ? "text-gray-400" : "text-gray-500"}`}>
                    {hasResume
                      ? "Cover letter uploaded"
                      : localStorage.getItem('cover_letter_file_name')
                      ? `Last selected: ${localStorage.getItem('cover_letter_file_name')}`
                      : "Click to upload PDF (optional)"}
                  </p>
                )}
              </label>
            </CardContent>
          </Card>
        </div>

        {/* Error message */}
        {error && (
          <div className="text-red-600 text-center">{error}</div>
        )}

        {/* Button logic */}
        <div>
          {/* <PricingButtons /> */}
          {hasResume ? (
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
              onClick={() => router.push('/job-kit')}
            >
              Continue to Job Kit
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
              disabled={!resumeFile || uploading}
              onClick={handleUpload}
            >
              {uploading ? "Uploading..." : "Upload & Get Started"}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}












// 'use client'

// import { ChangeEvent, useEffect, useRef } from 'react'
// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/components/AuthProvider'
// import { useResume } from '@/components/ResumeProvider'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent } from '@/components/ui/card'
// import { Input } from '@/components/ui/input'
// import { LogOut, Upload } from 'lucide-react'
// import React, { useState } from 'react'

// export default function Dashboard() {
//   const { user, isLoading, logout } = useAuth()
//   const router = useRouter()
//   const resumeInputRef = useRef<HTMLInputElement | null>(null)
//   const coverLetterInputRef = useRef<HTMLInputElement | null>(null)
//   const [uploadError, setUploadError] = useState('')
//   const [uploading, setUploading] = useState(false)

//   const [hasResume, setHasResume] = useState<boolean | null>(null) // null = loading


  

//   // Use context for files
//   const {
//     resumeFile, setResumeFile,
//     coverLetterFile, setCoverLetterFile
//   } = useResume();

//   // Redirect if not authenticated
//   if (!isLoading && !user) {
//     router.replace('/')
//     return null
//   }
//   if (isLoading) {
//     return <p className="p-8">Loading…</p>
//   }

//   // Handlers
// const onResumeChange = (e: ChangeEvent<HTMLInputElement>) => {
//   setResumeFile(e.target.files?.[0] ?? null);
//   console.log("Setting resume file:", e.target.files?.[0]);
// };
//   const onCoverLetterChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setCoverLetterFile(e.target.files?.[0] ?? null)
//   }

//   const onGetStarted = async () => {
//     setUploadError('')
//     if (!resumeFile) return
//     setUploading(true)
//     try {
//       const form = new FormData()
//       form.append('resume', resumeFile)
//       if (coverLetterFile) form.append('cover_letter', coverLetterFile)
//       form.append('user_email', user.email)
//       const res = await fetch('http://127.0.0.1:8000/upload-resume', {
//         method: 'POST',
//         body: form,
//         headers: {
//           'accept': 'application/json',
//         },
//       })
//       if (!res.ok) {
//         const err = await res.json()
//         throw new Error(err.detail || 'Upload failed')
//       }
//       // Optionally use response data
//       router.push('/job-kit')
//     } catch (err: any) {
//       setUploadError(err.message || 'Upload failed')
//     } finally {
//       setUploading(false)
//     }
//   }

//   const isFormValid = !!resumeFile // Only resume is required!

//   return (
//     <div className="min-h-screen bg-[#eef5ff] px-4 py-6 space-y-8">
//       {/* Top Bar */}
//       <header className="flex items-center justify-between max-w-5xl mx-auto">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             Smart Job Kit Generator
//           </h1>
//           <p className="text-gray-600">
//             Create personalized job application materials
//           </p>
//         </div>
//         <Button variant="outline" onClick={logout}>
//           <LogOut className="mr-2 h-4 w-4" /> Logout
//         </Button>
//       </header>

//       <main className="max-w-5xl mx-auto space-y-8">
//         {/* User Card */}
//         <Card className="shadow-sm">
//           <CardContent className="flex items-center space-x-4 p-6">
//             {user?.picture ? (
//               <img
//                 src={user.picture}
//                 alt={user.name}
//                 className="h-14 w-14 rounded-full object-cover"
//               />
//             ) : (
//               <div className="h-14 w-14 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold text-white">
//                 {user?.name
//                   .split(' ')
//                   .map((n) => n[0])
//                   .join('')}
//               </div>
//             )}
//             <div className="flex-1">
//               <p className="text-lg font-semibold text-gray-900">
//                 {user?.name}
//               </p>
//               <p className="text-sm text-gray-500">
//                 {user?.headline
//                   ? user?.headline
//                   : user?.email
//                   ? user.email
//                   : 'LinkedIn member'}
//               </p>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Upload Resume & Cover Letter */}
//         <div className="grid gap-6 md:grid-cols-2">
//           {/* Resume Upload */}
//           <Card className="shadow-sm">
//             <CardContent className="p-6 space-y-4">
//               <div className="flex items-center space-x-2 text-indigo-600">
//                 <Upload className="h-5 w-5" />
//                 <h2 className="text-lg font-semibold">Upload Resume (PDF) *</h2>
//               </div>
              

              
//               <p className="text-sm text-gray-600">
//                 Please upload your resume in PDF format. (Required)
//               </p>
//               <label
//                 htmlFor="resume"
//                 className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-40 cursor-pointer hover:bg-gray-50"
//               >
//                 <Input
//                   id="resume"
//                   type="file"
//                   accept="application/pdf"
//                   className="hidden"
//                   ref={resumeInputRef}
//                   onChange={onResumeChange}
//                   disabled={hasResume}
//                 />
//                 {resumeFile ? (
//                   <p className="text-sm">{resumeFile.name}</p>
//                 ) : (
//                   <p className="text-sm text-gray-500">
//                     Click to upload PDF
//                   </p>
//                 )}
//               </label>
//             </CardContent>
//           </Card>

//           {/* Cover Letter Upload */}
//           <Card className="shadow-sm">
//             <CardContent className="p-6 space-y-4">
//               <div className="flex items-center space-x-2 text-indigo-600">
//                 <Upload className="h-5 w-5" />
//                 <h2 className="text-lg font-semibold">Upload Cover Letter (PDF)</h2>
//               </div>
//               <p className="text-sm text-gray-600">
//                 Optional: You can upload a cover letter in PDF format.
//               </p>
//               <label
//                 htmlFor="cover-letter"
//                 className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md h-40 cursor-pointer hover:bg-gray-50"
//               >
//                 <Input
//                   id="cover-letter"
//                   type="file"
//                   accept="application/pdf"
//                   className="hidden"
//                   ref={coverLetterInputRef}
//                   onChange={onCoverLetterChange}
//                   disabled={hasResume}
//                 />
//                 {coverLetterFile ? (
//                   <p className="text-sm">{coverLetterFile.name}</p>
//                 ) : (
//                   <p className="text-sm text-gray-500">
//                     Click to upload PDF (optional)
//                   </p>
//                 )}
//               </label>
//             </CardContent>
//           </Card>
//         </div>

//          {/* Upload error message */}
//       {uploadError && (
//         <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{uploadError}</div>
//       )}

//       {/* Let's Get Started Button */}
//       <Button
//         size="lg"
//         className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
//         disabled={!isFormValid || uploading}
//         onClick={onGetStarted}
//       >
//         {uploading ? "Uploading..." : "Let's Get Started"}
//       </Button>
//     </main>
//   </div>
// )
// }
