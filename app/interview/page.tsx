"use client";

import { useEffect, useRef, useState } from "react";
import Vapi, { type VapiMessage } from "@vapi-ai/web";
import DashboardButton from "@/components/DashboardButton";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

// 👇 Persistent speaking indicator: only starts once, stays active for whole interview
function usePersistentSpeakingIndicator(active: boolean) {
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number>();
  const streamRef = useRef<MediaStream>();
  
  const { user, isLoading, logout } = useAuth()
  

  useEffect(() => {
    let isMounted = true;
    if (active && !audioContextRef.current) {
      // Request mic and setup analyzer ONCE for the whole interview
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        streamRef.current = stream;
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        analyserRef.current = analyser;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const detect = () => {
          analyser.getByteFrequencyData(dataArray);
          const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          if (isMounted) setIsUserSpeaking(volume > 10);
          rafRef.current = requestAnimationFrame(detect);
        };
        detect();
      });
    }

    if (!active) setIsUserSpeaking(false);

    return () => {
      isMounted = false;
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = undefined;
      }
      cancelAnimationFrame(rafRef.current!);
    };
  }, [active]);

  return isUserSpeaking;
}

type Status = "idle" | "listening" | "thinking" | "speaking";

const PUBLIC_KEY   = "4b3fb521-9ad5-439a-8224-cdb78e2e78e8";
const ASSISTANT_ID = "9295e1aa-6e41-4334-9dc4-030954c7274a";

export default function InterviewVoiceDemo() {
  const [status, setStatus] = useState<Status>("idle");
  const [reportId, setReportId] = useState<string | null>(null);
  const [jobtitle, setJobTitle] = useState<string | null>(null);
  const [companyname, setCompanyName] = useState<string | null>(null);

  const vapiRef = useRef<Vapi | null>(null);

  // 🔥 Use the speaking indicator for the entire interview (all non-idle states)
  const isUserSpeaking = usePersistentSpeakingIndicator(status !== "idle");

    const handleLogout = () => {
    localStorage.clear()
  }

  useEffect(() => {
    setReportId(localStorage.getItem("report_id"));
    setJobTitle(localStorage.getItem("job_title"));
    setCompanyName(localStorage.getItem("company_name"));
    const vapi = new Vapi(PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on("call-start",   () => setStatus("listening"));
    vapi.on("speech-start", () => setStatus("speaking"));
    vapi.on("speech-end",   () => setStatus("thinking"));
    vapi.on("call-end",     () => setStatus("idle"));

    vapi.on("message", (m: VapiMessage) => {
      if (m.type === "transcript") console.log(`${m.role}: ${m.transcript}`);
    });

    return () => vapi.stop();
  }, []);

  const handleStart = async () => {
    if (!vapiRef.current) return;
    await navigator.mediaDevices.getUserMedia({ audio: true });
    await vapiRef.current.start(
      ASSISTANT_ID, {
        variableValues: { report_id: reportId, company_name: companyname, job_title: jobtitle },
      }
    );
  };

  const handleEnd = () => {
    if (vapiRef.current) {
      vapiRef.current.stop();
    }
  };


  // Determine active effect for agent/user
  const agentSpeaking = status === "speaking";
  const agentListening = status === "listening";
  const agentThinking = status === "thinking";
  // Candidate card glows only when "listening" AND user is actually speaking
  const candidateGlow = status === "listening" && isUserSpeaking;

  return (
    <div className="min-h-screen bg-[#eef5ff] p-8">
            <header className="flex items-center justify-between max-w-5xl mx-auto">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Job Info
                </h1>
              </div>
              <div className="flex gap-2">
                <DashboardButton />
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </div>
            </header>
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-8">
         
      <div className="mb-6 text-lg font-semibold text-gray-700">
        AI Interview Room
      </div>
      <div className="mb-2 text-sm text-gray-500">
        Job Report ID: <b>{reportId || "none"}</b>
      </div>

      {/* ZOOM-LIKE VIDEO LAYOUT */}
      <div className="flex flex-row gap-10 justify-center items-end w-full max-w-3xl mb-8">
        {/* Agent Card */}
        <div
          className={`w-64 h-56 rounded-2xl flex flex-col items-center justify-end p-5 bg-white shadow-xl transition-all duration-300 border-4
            ${agentSpeaking ? "border-blue-600 shadow-blue-300" : agentListening ? "border-blue-400" : agentThinking ? "border-blue-300" : "border-gray-200"}`}
        >
          <div className="flex flex-col items-center flex-1 justify-center">
            <div className="rounded-full bg-blue-100 w-16 h-16 flex items-center justify-center mb-3 border-4 border-blue-400 shadow">
              <span className="text-blue-700 text-3xl">🤖</span>
            </div>
            <div className="font-bold text-blue-800">Mike (AI Agent)</div>
            <div className="text-xs text-gray-400 mt-2 mb-2 italic">AI Interviewer</div>
          </div>
          <div className="text-xs text-blue-600 font-semibold min-h-[24px] text-center">
            {agentSpeaking && <span className="animate-pulse">Speaking…</span>}
            {agentListening && <span>Listening…</span>}
            {agentThinking && <span>Thinking…</span>}
          </div>
        </div>

        {/* User Card */}
        <div
          className={`w-64 h-56 rounded-2xl flex flex-col items-center justify-end p-5 bg-white shadow-xl transition-all duration-300 border-4
            ${candidateGlow ? "border-green-600 shadow-green-300 ring-4 ring-green-400" : status === "listening" ? "border-green-400" : "border-gray-200"}`}
        >
          <div className="flex flex-col items-center flex-1 justify-center">
            <div className="rounded-full bg-green-100 w-16 h-16 flex items-center justify-center mb-3 border-4 border-green-400 shadow">
              <span className="text-green-700 text-3xl">🧑</span>
            </div>
            <div className="font-bold text-green-800">You</div>
            <div className="text-xs text-gray-400 mt-2 mb-2 italic">Candidate</div>
          </div>
          <div className="text-xs text-green-600 font-semibold min-h-[24px] text-center">
            {status === "listening" && (
              <span className={candidateGlow ? "animate-pulse" : ""}>
                {candidateGlow ? "You're speaking…" : "You're live! Start answering…"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Start/End Interview buttons */}
      <div className="flex gap-4 justify-center items-center">
        {status === "idle" && (
          <button
            onClick={handleStart}
            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow hover:bg-blue-700 transition disabled:opacity-60"
            disabled={!reportId}
          >
            Start Interview
          </button>
        )}
        {status !== "idle" && (
          <button
            onClick={handleEnd}
            className="bg-red-600 text-white px-8 py-3 rounded-xl font-semibold text-lg shadow hover:bg-red-700 transition"
          >
            End Interview
          </button>
        )}
      </div>

      {/* Interview state indicator */}
      {status !== "idle" && (
        <div className="mt-5 text-xs text-gray-500 text-center">
          {status === "listening" && "You may answer the question now."}
          {status === "speaking" && "Mike is asking a question…"}
          {status === "thinking" && "Mike is thinking…"}
        </div>
      )}
    </div>
    </div>
  );
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
