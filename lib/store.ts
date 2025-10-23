"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  name: string
  email: string
  profilePicture: string
  linkedinId: string
}

export interface ResumeData {
  fileName: string
  fileSize: number
  uploadDate: string
  skills: string[]
  experience: string
  industry: string
  education: string
  currentRole: string
  rawText?: string
  meta?: {
    extractor?: string
    usedOCR?: boolean
    pages?: number
    textLength?: number
    extractionScore?: number
    error?: boolean
    legacyDoc?: boolean
    warning?: string
  }
  parseError?: boolean
  parseErrorMessage?: string
}

export interface PsychometricResults {
  personality: {
    openness: number
    conscientiousness: number
    extraversion: number
    agreeableness: number
    neuroticism: number
  }
  workStyle: string[]
  strengths: string[]
  developmentAreas: string[]
}

interface AppState {
  user: User | null
  resumeData: ResumeData | null
  analysisType: "quick" | "detailed" | null
  psychometricResults: PsychometricResults | null
  setUser: (user: User | null) => void
  setResumeData: (data: ResumeData | null) => void
  setAnalysisType: (type: "quick" | "detailed" | null) => void
  setPsychometricResults: (results: PsychometricResults | null) => void
  reset: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      resumeData: null,
      analysisType: null,
      psychometricResults: null,
      setUser: (user) => set({ user }),
      setResumeData: (resumeData) => set({ resumeData }),
      setAnalysisType: (analysisType) => set({ analysisType }),
      setPsychometricResults: (psychometricResults) => set({ psychometricResults }),
      reset: () => set({ user: null, resumeData: null, analysisType: null, psychometricResults: null }),
    }),
    {
      name: "ElephantScale-storage",
    },
  ),
)
