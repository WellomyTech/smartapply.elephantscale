'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ResumeForm } from '@/components/ResumeForm'

export default function UploadPage() {
  const [hasResume, setHasResume] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true
    async function check() {
      try {
        const email = typeof window !== 'undefined' ? localStorage.getItem('user_email') || '' : ''
        const resp = await fetch(`/api/me/resume-status${email ? `?user_email=${encodeURIComponent(email)}` : ''}`, {
          cache: 'no-store',
          headers: email ? { 'x-user-email': email } : undefined,
        })
        const data = await resp.json()
        if (mounted) setHasResume(!!data?.hasResume)
      } catch {
        if (mounted) setHasResume(false)
      }
    }
    check()
    return () => { mounted = false }
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-slate-50 via-brand-blue/10 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-6 md:py-20 px-4">
      <div className="w-full max-w-3xl space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-blue">
          Upload Your Resume
        </h1>
        {hasResume ? (
          <div className="text-sm text-slate-600">
            You already have a resume on file. <Link href="/job-suggestions" className="underline">Go to Job Suggestions</Link>
          </div>
        ) : null}
        <ResumeForm />
      </div>
    </main>
  )
}
