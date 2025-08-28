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
  const isUserSpeaking = usePersistentSpeakingIndicator(status === "listening")
  const { user } = useAuth()

  useEffect(() => {
    if (videoRef.current && videoStream && !isVideoOff) {
      ;(videoRef.current as HTMLVideoElement).srcObject = videoStream
    }
    if (videoRef.current && (!videoStream || isVideoOff)) {
      ;(videoRef.current as HTMLVideoElement).srcObject = null
    }
  }, [videoStream, isVideoOff])

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
        setTranscript((prev) => [
          ...prev,
          {
            role: m.role === "assistant" ? "Ruchit" : "Ruchit",
            message: m.transcript,
            timestamp,
          },
        ])
      }
    })

    return () => vapi.stop()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      setVideoStream(stream)
      if (videoRef.current) {
        ;(videoRef.current as HTMLVideoElement).srcObject = stream
      }
      return stream
    } catch (error) {
      setVideoStream(null)
      if (videoRef.current) (videoRef.current as HTMLVideoElement).srcObject = null
      throw error
    }
  }

  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => track.stop())
      setVideoStream(null)
    }
    if (videoRef.current) {
      ;(videoRef.current as HTMLVideoElement).srcObject = null
    }
  }

  const handleStart = async () => {
    if (!vapiRef.current) return
    setIsAnimatingOut(false)
    setTranscript([])

    try {
      await startCamera()
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
      stopCamera()
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
    <main className="min-h-[80vh] bg-gradient-to-br from-primary/80 via-primary to-primary/80 flex flex-col">
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white">AI Interview</h1>
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
              onClick={() => {
                localStorage.clear()
                stopCamera()
              }}
              className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/30 transition-colors"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
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
              className="text-white px-8 py-3 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
          <div className="flex-1 flex">
            <div className="flex-1 relative p-4">
              <div
                className={`relative w-full h-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
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
                    <span className="text-white font-medium">Ruchit</span>
                    {isUserSpeaking && (
                      <div className="flex gap-1">
                        <div className="w-1 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="w-1 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className={`absolute bottom-6 right-6 w-48 h-36 bg-gray-900 rounded-xl overflow-hidden shadow-xl transition-all duration-300 ${agentSpeaking ? "ring-3 ring-blue-400 shadow-blue-400/20" : ""}`}>
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600 relative">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🤖</span>
                  </div>

                  <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white text-sm font-medium">Mike</span>
                      {agentSpeaking && (
                        <div className="flex gap-0.5">
                          <div className="w-0.5 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          <div className="w-0.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.1s" }}></div>
                          <div className="w-0.5 h-3 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {(agentListening || agentThinking) && (
                    <div className="absolute top-2 right-2">
                      {agentListening && <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">Listening</div>}
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

              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-black/50 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-4 shadow-xl">
                  <Button variant="ghost" size="sm" onClick={toggleMute} className={`rounded-full w-12 h-12 p-0 transition-colors ${isMuted ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white/20 hover:bg-white/30 text-white"}`}>
                    {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>

                  <Button variant="ghost" size="sm" onClick={toggleVideo} className={`rounded-full w-12 h-12 p-0 transition-colors ${isVideoOff ? "bg-red-500 hover:bg-red-600 text-white" : "bg-white/20 hover:bg-white/30 text-white"}`}>
                    {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                  </Button>

                  <Button variant="ghost" size="sm" onClick={handleRestart} className="rounded-full w-12 h-12 p-0 bg-white/20 hover:bg-white/30 text-white transition-colors">
                    <RotateCcw className="h-5 w-5" />
                  </Button>

                  <Button variant="destructive" size="sm" onClick={handleEnd} className="rounded-full w-12 h-12 p-0">
                    <PhoneOff className="h-5 w-5" />
                  </Button>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="sm" className="rounded-full w-12 h-12 p-0 bg-white/20 hover:bg-white/30 text-white transition-colors">
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
                          <p className="text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200">{reportId || "Not set"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Job Title</label>
                          <p className="text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200">{jobtitle || "Not set"}</p>
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-700">Company</label>
                          <p className="text-sm font-medium text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200">{companyname || "Not set"}</p>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>

            <div className="w-80 bg-white/95 backdrop-blur-sm border-l border-white/20 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Live Transcript</h3>
                <p className="text-sm text-gray-600 mt-1">Real-time conversation transcript</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: "calc(100vh - 130px)" }}>
                {transcript.map((entry, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">{entry.role}</span>
                      <span className="text-xs text-gray-500">{entry.timestamp}</span>
                    </div>
                    <div className={`p-3 rounded-lg text-sm ${entry.role === "Mike" ? "bg-blue-50 text-blue-900 ml-0 mr-4" : "bg-gray-50 text-gray-900 ml-4 mr-0"}`}>
                      {entry.message}
                    </div>
                  </div>
                ))}

                {transcript.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <p className="text-sm">Transcript will appear here once the conversation starts...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
