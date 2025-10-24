"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, CheckCircle, XCircle, ArrowLeft, Sparkles, Brain, Zap, User, LogOut } from "lucide-react"
import { useAppStore } from "@/lib/store"
// import { parseResumeFile } from "@/lib/resume-parser" // no longer used; using external API
import { useAuth } from '@/components/AuthProvider'
import type { ResumeData } from '@/lib/store'

const API_URL = process.env.NEXT_PUBLIC_API_BASE

async function parseResumeViaApi(file: File): Promise<ResumeData> {
  const form = new FormData()
  form.append('resume', file, file.name)
  const res = await fetch(`${API_URL}resume_assessment/resume-parser`, { method: 'POST', body: form })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Parser API ${res.status}: ${text}`)
  }
  const data = await res.json()
  const item = Array.isArray(data) ? (data[0] || {}) : data
  const mapped: ResumeData = {
    fileName: item.fileName ?? file.name,
    fileSize: item.fileSize ?? file.size,
    uploadDate: item.uploadDate ?? new Date().toISOString(),
    skills: item.skills ?? [],
    experience: item.experience ?? 'Unable to determine',
    industry: item.industry ?? 'Technology',
    education: item.education ?? 'Unable to determine',
    currentRole: item.currentRole ?? 'Unable to determine',
    rawText: item.rawText,
    meta: item.meta,
  }
  return mapped
}

export default function ResumeUpload() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const resumeData = useAppStore((state) => state.resumeData)
  const setResumeData = useAppStore((state) => state.setResumeData)

  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.replace("/")
    }
  }, [user, router])

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        setUploadStatus("uploading")
        setUploadedFile(file)
        setErrorMessage(null)
        try {
          const parsedData = await parseResumeViaApi(file)
          setResumeData(parsedData)
          setUploadStatus("success")
        } catch (error: any) {
          console.error("Error parsing resume via API:", error)
          setErrorMessage(error?.message || 'Failed to parse resume')
          setUploadStatus("error")
        }
      }
    },
    [setResumeData],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 15 * 1024 * 1024,
  })

  const handleContinue = () => {
    router.push("/ai-career/analysis")
  }

  const handleBack = () => {
    router.push("/dashboard")
  }

  const handleSignOut = () => {
    logout()
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Navigation */}
      {/* <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center">
                <div className="mr-3">
                  <img
                    src={'/elephant-logo.png'}
                    alt="ElephantScale logo"
                    className="w-30 h-10 object-contain"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 rounded-full px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{user!.name}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav> */}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-6">
            <Brain className="w-4 h-4 mr-2" />
            Step 1 of 3 - Resume Upload
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Upload Your
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Resume
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your resume to begin your personalized AI-powered career analysis. We support PDF, Word, and text
            files.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {uploadStatus === "idle" && (
            <div className="p-12">
              <div
                {...getRootProps()}
                className={`relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive
                    ? "border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50 scale-105"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:scale-105"
                }`}
              >
                <input {...getInputProps()} />

                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                <div className="relative z-10">
                  <div
                    className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                      isDragActive
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-110"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400"
                    }`}
                  >
                    <Upload className="w-10 h-10" />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {isDragActive ? "Drop your resume here" : "Upload your resume"}
                  </h3>

                  <p className="text-lg text-gray-600 mb-6">Drag and drop your resume, or click to browse</p>

                  <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <FileText className="w-5 h-5 mr-2" />
                    Choose File
                  </div>

                  <p className="text-sm text-gray-500 mt-6">Supports PDF, DOC, DOCX, and TXT files up to 10MB</p>
                </div>
              </div>
            </div>
          )}

          {uploadStatus === "uploading" && (
            <div className="text-center py-16">
              <div className="relative mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-10 h-10 text-white animate-pulse" />
                </div>
                <div className="absolute inset-0 w-20 h-20 mx-auto">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent border-t-blue-500 border-r-purple-500"></div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-4">Processing your resume...</h3>
              <p className="text-lg text-gray-600 mb-8">
                Our AI is analyzing your experience, skills, and career trajectory
              </p>

              <div className="max-w-md mx-auto bg-gray-50 rounded-xl p-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Zap className="w-4 h-4 mr-2 text-blue-500" />
                  <span>Extracting text from document...</span>
                </div>
              </div>
            </div>
          )}

          {uploadStatus === "success" && resumeData && (
            <div className="p-12">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Resume uploaded successfully!</h3>
                <p className="text-lg text-gray-600">Here's what we found in your resume:</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 mb-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{resumeData!.fileName}</h4>
                    {resumeData!.meta && (
                      <p className="text-sm text-gray-600">
                        Parsed with {resumeData!.meta?.extractor} • {resumeData!.meta?.textLength} characters
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <Brain className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-semibold text-gray-700">Industry</span>
                    </div>
                    <span className="text-gray-900 font-medium">{resumeData!.industry}</span>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <Zap className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-semibold text-gray-700">Experience</span>
                    </div>
                    <span className="text-gray-900 font-medium">{resumeData!.experience}</span>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="font-semibold text-gray-700">Current Role</span>
                    </div>
                    <span className="text-gray-900 font-medium">{resumeData!.currentRole}</span>
                  </div>

                  <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                        <FileText className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="font-semibold text-gray-700">Education</span>
                    </div>
                    <span className="text-gray-900 font-medium">{resumeData!.education}</span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h5 className="font-semibold text-gray-700 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                    </div>
                    Key Skills
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {resumeData!.skills.slice(0, 12).map((skill, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {resumeData!.skills.length > 12 && (
                      <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm">
                        +{resumeData!.skills.length - 12} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
              >
                Continue to Analysis Options
                <ArrowLeft className="w-5 h-5 ml-3 rotate-180" />
              </button>
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload failed</h3>
              <p className="text-lg text-gray-600 mb-4">
                {errorMessage || 'There was an error processing your resume.'}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 max-w-md mx-auto">
                <p className="text-sm text-red-700">
                  <strong>Tip:</strong> Ensure CORS is allowed on {API_URL}. Try converting your file to PDF or ensure it's under 15MB.
                </p>
              </div>
              <button
                onClick={() => setUploadStatus("idle")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
