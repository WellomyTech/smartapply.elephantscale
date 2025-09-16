'use client'
import React, { createContext, useContext, useState } from 'react'

interface ResumeContextValue {
  resumeFile: File | null
  setResumeFile: (file: File | null) => void
  coverLetterFile: File | null
  setCoverLetterFile: (file: File | null) => void
}

const ResumeContext = createContext<ResumeContextValue | undefined>(undefined)

export const ResumeProvider = ({ children }: { children: React.ReactNode }) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null)

  return (
    <ResumeContext.Provider value={{ resumeFile, setResumeFile, coverLetterFile, setCoverLetterFile }}>
      {children}
    </ResumeContext.Provider>
  )
}

export const useResume = () => {
  const ctx = useContext(ResumeContext)
  if (!ctx) throw new Error('useResume must be used within a ResumeProvider')
  return ctx
}
