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
  // Historically we stored a Big Five numeric profile under `personality`.
  // Newer assessment code stores a personality "type" string plus a
  // `personalityProfile` object. Allow both shapes for backward compatibility.
  personality:
    | {
        openness: number
        conscientiousness: number
        extraversion: number
        agreeableness: number
        neuroticism: number
      }
    | string
  // Optional richer profile produced by the assessment UI
  personalityProfile?: {
    type: string
    description: string
    dominantTraits: { trait: string; score: number }[]
    allTraits: { trait: string; score: number }[]
  }
  // Work style can be a single description string (current UI) or an array
  workStyle?: string | string[]
  strengths?: string[]
  developmentAreas?: string[]
  // Additional optional fields the UI includes
  traits?: unknown
  completedAt?: string
  answers?: Record<number, string>
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
