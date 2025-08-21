"use client"

import { useEffect, useRef, useState } from "react"
import Vapi, { type VapiMessage } from "@vapi-ai/web"
import DashboardButton from "@/components/DashboardButton"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { LogOut, RotateCcw, PhoneOff, Settings, Mic, MicOff, Video, VideoOff } from "lucide-react"
import { useAuth } from "@/components/AuthProvider"

type Status = "idle" | "listening" | "thinking" | "speaking"

const PUBLIC_KEY = "4b3fb521-9ad5-439a-8224-cdb78e2e78e8"
const ASSISTANT_ID = "9295e1aa-6e41-4334-9dc4-030954c7274a"

function usePersistentSpeakingIndicator(active: boolean) {
  const [isUserSpeaking, setIsUserSpeaking] = useState(false)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    let isMounted = true

    if (active && !audioContextRef.current) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        streamRef.current = stream
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
        audioContextRef.current = ctx
        const source = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 512
        source.connect(analyser)
        analyserRef.current = analyser
        const dataArray = new Uint8Array(analyser.frequencyBinCount)

        const detect = () => {
          analyser.getByteFrequencyData(dataArray)
          const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
          if (isMounted) {
            const isSpeaking = volume > 10
            setIsUserSpeaking(isSpeaking)
          }
          rafRef.current = requestAnimationFrame(detect)
        }
        detect()
      })
    }

    if (!active) setIsUserSpeaking(false)

    return () => {
      isMounted = false
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [active])

  return isUserSpeaking
}

export default function InterviewVoiceDemo() {
  const [status, setStatus] = useState<Status>("idle")
  const [reportId, setReportId] = useState<string | null>(null)
  const [jobtitle, setJobTitle] = useState<string | null>(null)
  const [companyname, setCompanyName] = useState<string | null>(null)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [timer, setTimer] = useState(0)
  const [transcript, setTranscript] = useState<Array<{ role: string; message: string; timestamp: string }>>([])
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)

  const vapiRef = useRef<Vapi | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const lastLineRef = useRef<{ role: string; message: string; at: number } | null>(null)
  const lastByRoleRef = useRef<Map<string, { text: string; at: number }>>(new Map())
  const transcriptEndRef = useRef<HTMLDivElement | null>(null)
  const isUserSpeaking = usePersistentSpeakingIndicator(status === "listening")
  const { user } = useAuth()

  const normalize = (s: string) => s?.replace(/\s+/g, " ").trim() || ""

  useEffect(() => {
    if (status !== "idle") {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      setTimer(0)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [status])

  useEffect(() => {
    setReportId(localStorage.getItem("report_id"))
    setJobTitle(localStorage.getItem("job_title"))
    setCompanyName(localStorage.getItem("company_name"))
    const vapi = new Vapi(PUBLIC_KEY)
    vapiRef.current = vapi

    vapi.on("call-start", () => setStatus("listening"))
    vapi.on("speech-start", () => setStatus("speaking"))
    vapi.on("speech-end", () => setStatus("thinking"))
    vapi.on("call-end", () => setStatus("idle"))

    vapi.on("message", (m: VapiMessage) => {
      if (m.type === "transcript") {
        const now = new Date()
        const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        const role = m.role === "assistant" ? "Sophie" : "Alex"
        const text = normalize(m.transcript || "")
        if (!text) return

        const nowMs = Date.now()
        const windowMs = 2500 // 2.5s suppression window

        if (
          lastLineRef.current &&
          lastLineRef.current.role === role &&
          normalize(lastLineRef.current.message) === text
        ) {
          return
        }

        const lastByRole = lastByRoleRef.current.get(role)
        if (lastByRole && lastByRole.text === text && nowMs - lastByRole.at < windowMs) {
          return
        }

        let replaced = false
        if (lastLineRef.current && lastLineRef.current.role === role && nowMs - lastLineRef.current.at < windowMs) {
          const prev = normalize(lastLineRef.current.message)
          const grows = text.startsWith(prev) || prev.startsWith(text)
          if (grows) {
            setTranscript((prevArr) => {
              const copy = [...prevArr]
              if (copy.length > 0) {
                copy[copy.length - 1] = { role, message: m.transcript, timestamp }
              }
              return copy
            })
            lastLineRef.current = { role, message: m.transcript, at: nowMs }
            lastByRoleRef.current.set(role, { text, at: nowMs })
            replaced = true
          }
        }

        if (!replaced) {
          setTranscript((prevArr) => [...prevArr, { role, message: m.transcript, timestamp }])
          lastLineRef.current = { role, message: m.transcript, at: nowMs }
          lastByRoleRef.current.set(role, { text, at: nowMs })
        }
      }
    })

    return () => vapi.stop()
  }, [])

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [transcript])

  const handleStart = async () => {
    if (!vapiRef.current) return
    setIsAnimatingOut(false)
    setTranscript([])

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      setVideoStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      await vapiRef.current.start(ASSISTANT_ID, {
        variableValues: {
          report_id: reportId,
          company_name: companyname,
          job_title: jobtitle,
        },
      })
    } catch (error) {
      console.error("Error accessing media devices:", error)
    }
  }

  const handleEnd = () => {
    if (vapiRef.current) {
      setIsAnimatingOut(true)
      vapiRef.current.stop()

      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop())
        setVideoStream(null)
      }

      setTimeout(() => {
        setStatus("idle")
        setIsAnimatingOut(false)
      }, 300)
    }
  }

  const handleRestart = () => {
    handleEnd()
    setTimeout(() => handleStart(), 1000)
  }

  const toggleMute = () => {
    if (videoStream) {
      const audioTrack = videoStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  const toggleVideo = () => {
    if (videoStream) {
      const videoTrack = videoStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)
      }
    }
  }

  const agentSpeaking = status === "speaking"
  const agentListening = status === "listening"
  const agentThinking = status === "thinking"

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getUserInitial = () => {
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 flex flex-col">
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-semibold text-white">AI Interview</h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="bg-black/30 px-3 py-1.5 rounded-lg text-sm font-medium text-white/90 border border-white/20">
              Meeting ID: {reportId || "—"}
            </div>
            {status !== "idle" && (
              <div className="bg-red-500/20 px-3 py-1.5 rounded-lg text-sm font-medium text-red-200 border border-red-400/30 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                LIVE {formatTime(timer)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DashboardButton />
            <Button
              variant="outline"
              size="sm"
              onClick={() => localStorage.clear()}
              className="border-white/20 hover:bg-white/10 hover:border-white/30 transition-colors bg-transparent text-white"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {status === "idle" ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center mb-8 max-w-2xl">
            <h2 className="text-3xl font-semibold text-white mb-4">Ready to Begin Your Interview?</h2>
            <p className="text-lg font-medium text-white/80">
              Start your professional AI-powered interview session when you're ready.
            </p>
          </div>
          <Button
            onClick={handleStart}
            disabled={!reportId}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Start Interview
          </Button>
          {!reportId && (
            <p className="text-sm font-medium text-red-300 mt-4">
              Please ensure you have a valid report ID to start the interview.
            </p>
          )}
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-[1fr_320px] gap-0 h-[calc(100vh-56px)]">
          <div className="relative p-4">
            <div
              className={`relative w-full h-full overflow-hidden rounded-2xl shadow-2xl bg-black transition-all duration-300 ${
                isUserSpeaking ? "ring-4 ring-green-400 shadow-green-400/20" : ""
              }`}
            >
              {videoStream && !isVideoOff ? (
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <span className="text-3xl text-white">{getUserInitial()}</span>
                    </div>
                    <p className="text-white font-medium">Camera Off</p>
                  </div>
                </div>
              )}

              <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">Alex</span>
                  {isUserSpeaking && (
                    <div className="flex gap-1">
                      <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <div
                        className="w-1 h-2 bg-green-400 rounded-full animate-pulse"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-1 h-4 bg-green-400 rounded-full animate-pulse"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>

              <div
                className={`absolute bottom-6 right-6 w-48 h-36 bg-gray-900 rounded-xl overflow-hidden shadow-xl transition-all duration-300 ${
                  agentSpeaking ? "ring-3 ring-blue-400 shadow-blue-400/20" : ""
                }`}
              >
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 relative">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>

                  <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white text-sm font-medium">Sophie</span>
                      {agentSpeaking && (
                        <div className="flex gap-0.5">
                          <div className="w-0.5 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <div
                            className="w-0.5 h-1.5 bg-blue-400 rounded-full animate-pulse"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-0.5 h-3 bg-blue-400 rounded-full animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {(agentListening || agentThinking) && (
                    <div className="absolute top-2 right-2">
                      {agentListening && (
                        <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">Listening</div>
                      )}
                      {agentThinking && (
                        <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                          <div className="w-1 h-1 bg-white rounded-full animate-bounce"></div>
                          Thinking
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-3 bg-black/60 px-6 py-4 rounded-full shadow-xl">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className={`rounded-full w-12 h-12 p-0 transition-colors ${
                    isMuted ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white/20 hover:bg-white/30 text-white"
                  }`}
                >
                  {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVideo}
                  className={`rounded-full w-12 h-12 p-0 transition-colors ${
                    isVideoOff ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white/20 hover:bg-white/30 text-white"
                  }`}
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRestart}
                  className="rounded-full w-12 h-12 p-0 bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleEnd}
                  className="rounded-full w-12 h-12 p-0 bg-red-500 hover:bg-red-600 text-white"
                >
                  <PhoneOff className="h-5 w-5" />
                </Button>

                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full w-12 h-12 p-0 bg-white/20 hover:bg-white/30 text-white transition-colors"
                    >
                      <Settings className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="bg-white">
                    <SheetHeader>
                      <SheetTitle className="font-semibold text-gray-900">Session Information</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Report ID</label>
                        <p className="text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200">
                          {reportId || "Not set"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Job Title</label>
                        <p className="text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200">
                          {jobtitle || "Not set"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700">Company</label>
                        <p className="text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200">
                          {companyname || "Not set"}
                        </p>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm border-l border-white/20 flex flex-col h-full overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Live Transcript</h3>
                <p className="text-sm text-gray-600 mt-1">Real-time conversation transcript</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {transcript.map((entry, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">{entry.role}</span>
                      <span className="text-xs text-gray-500">{entry.timestamp}</span>
                    </div>
                    <div
                      className={`p-3 rounded-lg text-sm ${
                        entry.role === "Sophie"
                          ? "bg-blue-50 text-blue-900 ml-0 mr-4"
                          : "bg-gray-50 text-gray-900 ml-4 mr-0"
                      }`}
                    >
                      {entry.message}
                    </div>
                  </div>
                ))}

                {transcript.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <p className="text-sm">Transcript will appear here once the conversation starts...</p>
                  </div>
                )}

                <div ref={transcriptEndRef} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
















// // app/job-kit/page.tsx
// 'use client'
// export const dynamic = 'force-dynamic'

// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/components/AuthProvider'
// import { useResume } from '@/components/ResumeProvider'
// import { useState } from 'react'
// import { Card, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Check, X, LogOut, Loader2 } from 'lucide-react'
// import { useEffect } from 'react';


// // ---- API call for compare endpoint ----
// interface SkillsMatchItem {
//   skill: string;
//   in_job: boolean;
//   in_resume: boolean;
// }
// interface CompareApiResponse {
//   skills_match: SkillsMatchItem[];
//   gaps: string[];
//   bonus_points: string[];
//   recommendations: string[];
//   google_doc_link: string;
  
//   raw?: string;      // <-- add this line
//   error?: string;    
// }

// async function compareResumeJob({
//   resumeFile,
//   jobDescription,
//   jobUrl
// }: {
//   resumeFile: File,
//   jobDescription: string,
//   jobUrl?: string,
// }) {
//   const form = new FormData();
//   //form.append('resume_file', resumeFile);           // (If you later want to add file support)
//   form.append('job_description', jobDescription);   // Text
//   form.append('job_link', jobUrl || '');         // <-- NAME MATCHED
//   form.append('user_email', "ruchitrakholiya878@gmail.com");                 // <-- NAME MATCHED

//   const res = await fetch('http://127.0.0.1:8000/compare-resume-job', {
//     method: 'POST',
//     body: form,
//     headers: {
//       'accept': 'application/json',
//     },
//   });






// // const form = new FormData();
// // form.append('resume_file', resumeFile);           // File object, not string
// // form.append('job_description', jobDescription);   // String
// // form.append('job_url', jobUrl || 'N/A');          // String


// // console.log("jobDescription value before API:", jobDescription);

// // // If you want to add headers like in curl:
// // const res = await fetch('http://127.0.0.1:8000/compare-resume-job', {
// //   method: 'POST',
// //   body: form,
// //   credentials: 'include', // if your backend needs cookies/auth
// //   headers: {
// //     // DO NOT set Content-Type for FormData, browser will do it!
// //     'accept': 'application/json',
// //     'linkedin-id': '123', // replace with your logic or context!
// //     'email': 'ruchitrakholiya878@gmail.com', // replace with user's email!
// //   },
// // });


//   let data;
//   try {
//     data = await res.json();
//   } catch (e) {
//     throw new Error('Could not parse API response.');
//   }

//   if (!res.ok || data.error) {
//     // error from API
//     return { error: data.error || 'Unknown error', raw: data.raw, google_doc_link: data.google_doc_link };
//   }
//   return data
// }

// export default function JobKitPage() {
  
//   const router = useRouter()
//   const { user, isLoading, logout } = useAuth()
//   //const { resumeFile } = useResume()
  
// const { resumeFile } = useResume();

//   // UI states
//   const [jobUrl, setJobUrl] = useState('')
//   const [description, setDescription] = useState('')
//   const [email, setEmail] = useState(user?.email ?? '')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [result, setResult] = useState<CompareApiResponse | null>(null)

//   const [workedOn, setWorkedOn] = useState<boolean[]>([]);

//   useEffect(() => {
//   if (result) {
//     setWorkedOn(result.skills_match.map(s => s.in_resume));
//   }
// }, [result]);


//   // Redirect if not logged in
//   if (!isLoading && !user) {
//     router.replace('/')
//     return null
//   }
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
//       </div>
//     )
//   }
//   // if (!resumeFile) {
//   //   // If no resume uploaded, force user back to dashboard
//   //   router.replace('/dashboard')
//   //   return null
//   // }

//   // Form handler
//   async function handleCompare(e: React.FormEvent) {
//     e.preventDefault();
//     setError('');
//     setResult(null);
//     setLoading(true);
//     try {
      
//       console.log("Submitting:", { jobDescription: description, resumeFile, jobUrl });

//       const compareResult = await compareResumeJob({
//         resumeFile,
//         jobUrl: jobUrl || undefined,
//         jobDescription: description || undefined, // <-- FIXED!
//         email,
//       });

//       if ('error' in compareResult) {
//   setError(compareResult.error);
//   setResult({
//     skills_match: [],
//     gaps: [],
//     bonus_points: [],
//     recommendations: [],
//     google_doc_link: compareResult.google_doc_link,
//     raw: compareResult.raw // <-- add this!
//   } as CompareApiResponse);
// } else {
//   setResult(compareResult);
// }

//       } catch (err: any) {
//         setError(err.message ?? 'An error occurred.');
//       } finally {
//         setLoading(false);
//       }
//     }

//     const GeenrateResume = () => {
//     router.push('/job-kit/result')
//   }


//   return (
//     <div className="min-h-screen bg-[#eef5ff] px-4 py-6 space-y-8">
//       {/* Top Bar */}
//       <header className="flex items-center justify-between max-w-5xl mx-auto">
//         <h1 className="text-2xl font-bold text-gray-900">
//           Smart Job Kit Generator
//         </h1>
//         <Button variant="outline" onClick={logout}>
//           <LogOut className="mr-2 h-4 w-4" />
//           Logout
//         </Button>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-4xl mx-auto space-y-12">
//         {/* Form to enter Job Link / Description */}
//         <Card className="shadow-lg">
//           <CardContent className="p-6">
//             <form onSubmit={handleCompare} className="space-y-4">
//               <h2 className="text-xl font-semibold mb-2">Enter Job Info</h2>
//               <label className="block font-semibold">Job Link:</label>
//               <input
//                 type="url"
//                 value={jobUrl}
//                 onChange={e => setJobUrl(e.target.value)}
//                 placeholder="Paste job posting URL"
//                 className="w-full border p-2 rounded"
//               />
//               <div className="text-center text-gray-400">or</div>
//               <label className="block font-semibold">Job Description:</label>
//               <textarea
//                 value={description}
//                 onChange={e => setDescription(e.target.value)}
//                 rows={4}
//                 className="w-full border p-2 rounded"
//                 placeholder="Paste the job description"
//               />
//               <label className="block font-semibold">Your Email:</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={e => setEmail(e.target.value)}
//                 required
//                 className="w-full border p-2 rounded"
//               />
//               {error && <div className="text-red-600">{error}</div>}
//               <Button
//                 type="submit"
//                 size="lg"
//                 className="w-full"
//                 disabled={loading || (!jobUrl && !description)}
//               >
//                 {loading
//                   ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Comparing...</>
//                   : 'Compare Resume'}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>


//         {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//               <strong className="font-bold">Error:</strong> {error}
//               {result?.google_doc_link && (
//                 <div className="mt-2">
//                   <a
//                     href={result.google_doc_link}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="underline text-blue-600 font-semibold"
//                   >
//                     View your document on Google Docs
//                   </a>
//                 </div>
//               )}
//               {result?.raw && (
//                 <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
//                   {result.raw}
//                 </pre>
//               )}
//             </div>
//           )}
//         {/* Results */}
//         {result && (
//           <div className="space-y-12">
//             {/* Skills Table */}
//             <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Skills Comparison</h3>
//                 <div className="overflow-x-auto">
//                   <table className="w-full table-auto border-collapse">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="px-3 py-2 text-left">Skill</th>
//                         <th className="px-3 py-2 text-center">In Job</th>
//                         <th className="px-3 py-2 text-center">In Resume</th>
//                         <th className="px-3 py-2 text-center">Have You Worked On It?</th>
//                       </tr>
//                     </thead>

//                    <tbody>
//                       {result.skills_match.map(({ skill, in_job, in_resume }, i) => (
//                         <tr key={skill} className="even:bg-gray-50">
//                           <td className="px-3 py-2">{skill}</td>
//                           <td className="px-3 py-2 text-center">
//                             {in_job
//                               ? <Check className="inline h-5 w-5 text-green-600"/>
//                               : <X className="inline h-5 w-5 text-red-600"/>}
//                           </td>
//                           <td className="px-3 py-2 text-center">
//                             {in_resume
//                               ? <Check className="inline h-5 w-5 text-green-600"/>
//                               : <X className="inline h-5 w-5 text-red-600"/>}
//                           </td>
//                           <td className="px-3 py-2 text-center">
//                             {in_job && in_resume ? (
//                               "" // empty cell when both are true
//                             ) : in_resume ? (
//                               "Yes"
//                             ) : (
//                               <div className="flex justify-center space-x-4">
//                                 <label className="inline-flex items-center space-x-1">
//                                   <input
//                                     type="radio"
//                                     name={`worked-${i}`}
//                                     checked={workedOn[i] === true}
//                                     onChange={() =>
//                                       setWorkedOn(arr => {
//                                         const copy = [...arr];
//                                         copy[i] = true;
//                                         return copy;
//                                       })
//                                     }
//                                     className="form-radio h-4 w-4"
//                                   />
//                                   <span>Yes</span>
//                                 </label>
//                                 <label className="inline-flex items-center space-x-1">
//                                   <input
//                                     type="radio"
//                                     name={`worked-${i}`}
//                                     checked={workedOn[i] === false}
//                                     onChange={() =>
//                                       setWorkedOn(arr => {
//                                         const copy = [...arr];
//                                         copy[i] = false;
//                                         return copy;
//                                       })
//                                     }
//                                     className="form-radio h-4 w-4"
//                                   />
//                                   <span>No</span>
//                                 </label>
//                               </div>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>


//                   </table>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Skill Gaps
//             <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Skill Gaps</h3>
//                 <ul className="list-disc list-inside space-y-1 text-gray-700">
//                   {result.gaps.map((gap) => (
//                     <li key={gap}>{gap}</li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card> */}

//             {/* Bonus Points */}
//             <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Bonus Points</h3>
//                 <ul className="list-disc list-inside space-y-2 text-gray-700">
//                   {result.bonus_points.map((bp) => (
//                     <li key={bp}>{bp}</li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card>

//             {/* Recommendations */}
//             {/* <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Recommendations</h3>
//                 <ul className="list-decimal list-inside space-y-2 text-gray-700">
//                   {result.recommendations.map((rec) => (
//                     <li key={rec}>{rec}</li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card> */}

//             {/* Google Doc Link */}
//             {/* <div className="text-center mt-4">
//               <a
//                 href={result.google_doc_link}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="underline text-blue-600 font-semibold"
//               >
//                 View AI-tailored Resume (Google Doc)
//               </a>
//             </div> */}

//             <Button
//           size="lg"
//           className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
//           onClick={GeenrateResume}
//         >
//           Generate Resume and Cover Letter
//         </Button>
//           </div>
//         )}
//       </main>
//     </div>
    
//   )
// }
