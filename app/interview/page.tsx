"use client"

import { useEffect, useRef, useState } from "react"
import Vapi, { type VapiMessage } from "@vapi-ai/web"
import DashboardButton from "@/components/DashboardButton"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { LogOut, RotateCcw, PhoneOff, Settings } from "lucide-react"
import { useAuth } from "@/components/AuthProvider"

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

type Status = "idle" | "listening" | "thinking" | "speaking"

const PUBLIC_KEY = "4b3fb521-9ad5-439a-8224-cdb78e2e78e8"
const ASSISTANT_ID = "9295e1aa-6e41-4334-9dc4-030954c7274a"

export default function InterviewVoiceDemo() {
  const [status, setStatus] = useState<Status>("idle")
  const [reportId, setReportId] = useState<string | null>(null)
  const [jobtitle, setJobTitle] = useState<string | null>(null)
  const [companyname, setCompanyName] = useState<string | null>(null)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)
  const [timer, setTimer] = useState(0)

  const vapiRef = useRef<Vapi | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const isUserSpeaking = usePersistentSpeakingIndicator(status === "listening")
  const { user } = useAuth()

  const handleLogout = () => {
    localStorage.clear()
  }

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
        console.log(`${m.role}: ${m.transcript}`)
      }
    })

    return () => vapi.stop()
  }, [])

  const handleStart = async () => {
    if (!vapiRef.current) return
    setIsAnimatingOut(false)
    await navigator.mediaDevices.getUserMedia({ audio: true })
    await vapiRef.current.start(ASSISTANT_ID, {
      variableValues: {
        report_id: reportId,
        company_name: companyname,
        job_title: jobtitle,
      },
    })
  }

  const handleEnd = () => {
    if (vapiRef.current) {
      setIsAnimatingOut(true)
      vapiRef.current.stop()
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Top App Bar */}
      <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Interview</h1>
              <p className="text-sm font-medium text-gray-500">Professional Interview Assistant</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="bg-gray-100 px-4 py-2 rounded-full text-sm font-medium text-gray-700 border border-gray-200">
              Meeting ID: {reportId || "—"}
            </div>
            {status !== "idle" && (
              <div className="bg-red-50 px-4 py-2 rounded-full text-sm font-medium text-red-700 border border-red-200 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                LIVE {formatTime(timer)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <DashboardButton />
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors bg-transparent"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 md:p-8">
        {status === "idle" ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-center mb-8 max-w-2xl">
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">Ready to Begin Your Interview?</h2>
              <p className="text-lg font-medium text-gray-600">
                Start your professional AI-powered interview session when you're ready.
              </p>
            </div>
            <Button
              onClick={handleStart}
              disabled={!reportId}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-base font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
            >
              Start Interview
            </Button>
            {!reportId && (
              <p className="text-sm font-medium text-red-600 mt-4">
                Please ensure you have a valid report ID to start the interview.
              </p>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto">
            <div className="flex-1 flex items-center justify-center mb-8">
              <div
                className={`relative bg-white rounded-2xl shadow-lg border border-gray-200 p-12 flex flex-col items-center justify-center aspect-video w-full max-w-3xl transition-all duration-300 ease-in-out transform ${
                  isAnimatingOut ? "scale-95 opacity-0" : "scale-100 opacity-100"
                } ${
                  agentSpeaking
                    ? "ring-2 ring-blue-500 shadow-lg shadow-blue-500/10"
                    : agentListening
                      ? "ring-2 ring-green-500 shadow-lg shadow-green-500/10"
                      : agentThinking
                        ? "ring-2 ring-yellow-500 shadow-lg shadow-yellow-500/10"
                        : ""
                }`}
              >
                <div
                  className={`w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-inner transition-all duration-300 ${
                    agentSpeaking ? "shadow-lg shadow-blue-500/25 scale-105" : ""
                  }`}
                >
                  <span className="text-4xl">🤖</span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">Mike</h3>

                <p className="text-base font-medium text-gray-600 mb-6">Voice Assistant</p>

                <div className="flex items-center justify-center">
                  {agentSpeaking && (
                    <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold border border-blue-200 flex items-center gap-2 animate-in fade-in duration-200">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                      Speaking
                    </div>
                  )}
                  {agentListening && (
                    <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold border border-green-200 animate-in fade-in duration-200">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      Listening
                    </div>
                  )}
                  {agentThinking && (
                    <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-semibold border border-yellow-200 flex items-center gap-2 animate-in fade-in duration-200">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full animate-bounce"></div>
                      Thinking
                    </div>
                  )}
                </div>
              </div>
            </div>

            {status !== "idle" && (
              <div className="flex justify-center">
                <div className="bg-white rounded-full shadow-lg border border-gray-200 px-6 py-3 flex items-center gap-4 backdrop-blur-sm">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRestart}
                    disabled={status === "idle"}
                    title="Restart Interview"
                    className="rounded-full w-10 h-10 p-0 hover:bg-gray-100 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4 text-gray-600" />
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleEnd}
                    title="End Interview"
                    className="rounded-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium"
                  >
                    <PhoneOff className="h-4 w-4 mr-2" />
                    End Interview
                  </Button>

                  <Sheet>
                    <SheetTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Settings"
                        className="rounded-full w-10 h-10 p-0 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-gray-600" />
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
            )}
          </div>
        )}
      </div>
    </div>
  )
}




// "use client";

// import { useEffect, useRef, useState } from "react";
// import Vapi, { type VapiMessage } from "@vapi-ai/web";

// type Status = "idle" | "listening" | "thinking" | "speaking";

// const PUBLIC_KEY   = "4b3fb521-9ad5-439a-8224-cdb78e2e78e8";
// const ASSISTANT_ID = "9295e1aa-6e41-4334-9dc4-030954c7274a";

// export default function InterviewVoiceDemo() {
//   const [status, setStatus] = useState<Status>("idle");
//   const [reportId, setReportId] = useState<string | null>(null);
//   const vapiRef = useRef<Vapi | null>(null);

//   useEffect(() => {
//     setReportId(localStorage.getItem("report_id") || "140");
//     const vapi = new Vapi(PUBLIC_KEY);
//     vapiRef.current = vapi;

//     vapi.on("call-start",   () => setStatus("listening"));
//     vapi.on("speech-start", () => setStatus("speaking"));
//     vapi.on("speech-end",   () => setStatus("thinking"));
//     vapi.on("call-end",     () => setStatus("idle"));

//     vapi.on("message", (m: VapiMessage) => {
//       if (m.type === "transcript") console.log(`${m.role}: ${m.transcript}`);
//     });

//     return () => vapi.stop();
//   }, []);

//   const handleStart = async () => {
//     if (!vapiRef.current) return;
//     await navigator.mediaDevices.getUserMedia({ audio: true });
//     await vapiRef.current.start(
//       ASSISTANT_ID, {
//         variableValues: { report_id: reportId },
//       }
//     );
//   };

//   const handleEnd = () => {
//     if (vapiRef.current) {
//       vapiRef.current.stop();
//     }
//   };

//   // Determine which card is "active" for effect
//   const agentSpeaking = status === "speaking";
//   const agentListening = status === "listening";
//   const agentThinking = status === "thinking";
//   const userSpeaking = status === "listening"; // You speak when agent is listening

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-8">
//       <div className="mb-6 text-lg font-semibold text-gray-700">
//         AI Interview Room
//       </div>
//       <div className="mb-2 text-sm text-gray-500">
//         Job Report ID: <b>{reportId || "none"}</b>
//       </div>

//       {/* ZOOM-LIKE VIDEO LAYOUT */}
//       <div className="flex flex-row gap-10 justify-center items-end w-full max-w-3xl mb-8">
//         {/* Agent Card */}
//         <div
//           className={`w-64 h-56 rounded-2xl flex flex-col items-center justify-end p-5 bg-white shadow-xl transition-all duration-300 border-4
//             ${agentSpeaking ? "border-blue-600 shadow-blue-300" : agentListening ? "border-blue-400" : agentThinking ? "border-blue-300" : "border-gray-200"}`}
//         >
//           <div className="flex flex-col items-center flex-1 justify-center">
//             <div className="rounded-full bg-blue-100 w-16 h-16 flex items-center justify-center mb-3 border-4 border-blue-400 shadow">
//               <span className="text-blue-700 text-3xl">🤖</span>
//             </div>
//             <div className="font-bold text-blue-800">Mike (AI Agent)</div>
//             <div className="text-xs text-gray-400 mt-2 mb-2 italic">AI Interviewer</div>
//           </div>
//           {/* Status below agent */}
//           <div className="text-xs text-blue-600 font-semibold min-h-[24px] text-center">
//             {agentSpeaking && <span className="animate-pulse">Speaking…</span>}
//             {agentListening && <span>Listening…</span>}
//             {agentThinking && <span>Thinking…</span>}
//           </div>
//         </div>

//         {/* User Card */}
// {/* User Card */}
// <div
//   className={`w-64 h-56 rounded-2xl flex flex-col items-center justify-end p-5 bg-white shadow-xl transition-all duration-300 border-4
//     ${status === "listening" ? "border-green-600 shadow-green-300" : "border-gray-200"}`}
// >
//   <div className="flex flex-col items-center flex-1 justify-center">
//     <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mb-3 border-4 border-green-400 shadow">
//       <span className="text-green-700 text-3xl">🧑</span>
//     </div>
//     <div className="font-bold text-green-800">You</div>
//     <div className="text-xs text-gray-400 mt-2 mb-2 italic">Candidate</div>
//   </div>
//   <div className="text-xs text-green-600 font-semibold min-h-[24px] text-center">
//     {status === "listening" && <span className="animate-pulse">You’re speaking…</span>}
//   </div>
// </div>

//       </div>

//       {/* Start/End Interview buttons */}
//       <div className="flex gap-4 justify-center items-center">
//         {status === "idle" && (
//           <button
//             onClick={handleStart}
//             className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow hover:bg-blue-700 transition disabled:opacity-60"
//             disabled={!reportId}
//           >
//             Start Interview
//           </button>
//         )}
//         {status !== "idle" && (
//           <button
//             onClick={handleEnd}
//             className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow hover:bg-red-700 transition"
//           >
//             End Interview
//           </button>
//         )}
//       </div>

//       {/* Interview state indicator */}
//       {status !== "idle" && (
//         <div className="mt-5 text-xs text-gray-500 text-center">
//           {status === "listening" && "You may answer the question now."}
//           {status === "speaking" && "Mike is asking a question…"}
//           {status === "thinking" && "Mike is thinking…"}
//         </div>
//       )}
//     </div>
//   );
// }


// "use client";

// import { useEffect, useRef, useState } from "react";
// import Vapi, { type VapiMessage } from "@vapi-ai/web";

// type Status = "idle" | "listening" | "thinking" | "speaking";

// const PUBLIC_KEY   = "4b3fb521-9ad5-439a-8224-cdb78e2e78e8";
// const ASSISTANT_ID = "9295e1aa-6e41-4334-9dc4-030954c7274a";

// export default function InterviewVoiceDemo() {
//   const [status, setStatus] = useState<Status>("idle");
//   const [reportId, setReportId] = useState<string | null>(null);
//   const vapiRef = useRef<Vapi | null>(null);

//   useEffect(() => {
//     setReportId(localStorage.getItem("report_id") || "140");
//     const vapi = new Vapi(PUBLIC_KEY);
//     vapiRef.current = vapi;

//     vapi.on("call-start",   () => setStatus("listening"));
//     vapi.on("speech-start", () => setStatus("speaking"));
//     vapi.on("speech-end",   () => setStatus("thinking"));
//     vapi.on("call-end",     () => setStatus("idle"));

//     vapi.on("message", (m: VapiMessage) => {
//       if (m.type === "transcript") console.log(`${m.role}: ${m.transcript}`);
//     });

//     return () => vapi.stop();
//   }, []);

//   const handleStart = async () => {
//     if (!vapiRef.current) return;
//     await navigator.mediaDevices.getUserMedia({ audio: true });
//     await vapiRef.current.start(
//        ASSISTANT_ID,{
//       variableValues: { report_id: reportId},
//     });
//   };

//   const handleEnd = () => {
//     if (vapiRef.current) {
//       vapiRef.current.stop();
//     }
//   };

//   return (
//     <div className="flex flex-col items-center gap-3">
//       <div className="text-gray-700 text-sm">
//         Job Report ID: <b>{reportId || "none"}</b>
//       </div>

//       {/* Start Interview button */}
//       {status === "idle" && (
//         <button
//           onClick={handleStart}
//           className="px-8 py-3 rounded-xl text-lg font-semibold shadow transition
//                    bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
//           disabled={!reportId}
//         >
//           Start Interview
//         </button>
//       )}

//       {/* End Interview button (always shown during call, speech, thinking, etc) */}
//       {status !== "idle" && (
//         <button
//           onClick={handleEnd}
//           className="px-8 py-3 rounded-xl text-lg font-semibold shadow transition
//                    bg-red-600 text-white hover:bg-red-700"
//         >
//           End Interview
//         </button>
//       )}

//       {/* Optional: status indicator */}
//       {status !== "idle" && (
//         <div className="mt-2 text-sm text-gray-500">
//           {status === "listening" && "Listening…"}
//           {status === "speaking"  && "Speaking…"}
//           {status === "thinking"  && "Thinking…"}
//         </div>
//       )}
//     </div>
//   );
// }
