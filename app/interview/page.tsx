"use client";

import { useEffect, useRef, useState } from "react";
import Vapi, { type VapiMessage } from "@vapi-ai/web";
import { Button } from "@/components/ui/button";
import { Droplets } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  RotateCcw,
  PhoneOff,
  Settings,
  Mic,
  MicOff,
  Video,
  VideoOff,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

type Status = "idle" | "listening" | "thinking" | "speaking";

const PUBLIC_KEY = "4b3fb521-9ad5-439a-8224-cdb78e2e78e8";
const ASSISTANT_ID = "9295e1aa-6e41-4334-9dc4-030954c7274a";

type Line = {
  role: "AI Interviewer" | "You";
  message: string;
  timestamp: string;
  final: boolean;
};

/* ================= Speaking indicator ================= */
function usePersistentSpeakingIndicator(active: boolean) {
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (active && !audioContextRef.current) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        streamRef.current = stream;
        const ctx = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        analyserRef.current = analyser;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const detect = () => {
          analyser.getByteFrequencyData(dataArray);
          const volume =
            dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
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
        streamRef.current = null;
      }
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  return isUserSpeaking;
}

/* ============================ PAGE ============================ */
export default function InterviewVoiceDemo() {
  const [status, setStatus] = useState<Status>("idle");
  const [reportId, setReportId] = useState<number | null>(null);
  const [jobtitle, setJobTitle] = useState<string | null>(null);
  const [companyname, setCompanyName] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState<Line[]>([]);

  // Camera & UI
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // visual only (Vapi owns real mic)
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Blur
  const [blurLevel, setBlurLevel] = useState<"off" | "low" | "high">("off");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const rafSegRef = useRef<number | null>(null);
  const segmenterRef = useRef<any>(null);

  // Refs
  const vapiRef = useRef<Vapi | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const transcriptWrapRef = useRef<HTMLDivElement>(null);
  const callOpenRef = useRef(false); // <-- guard against late events
  const { user } = useAuth();
  const isUserSpeaking = usePersistentSpeakingIndicator(status === "listening");

  const myLabel = user?.name || user?.email?.split("@")[0] || "You";
  const roleLabel = (r: string): Line["role"] =>
    r === "assistant" ? "AI Interviewer" : "You";

  // Transcript buffers
  const buffersRef = useRef<Record<Line["role"], string>>({
    "AI Interviewer": "",
    You: "",
  });
  const lastSeenRef = useRef<Record<Line["role"], string>>({
    "AI Interviewer": "",
    You: "",
  });
  const lastRoleRef = useRef<Line["role"] | null>(null);

  const stamp = () =>
    new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  const ensureSentenceEnd = (s: string) =>
    /[.?!…]"?$/.test(s.trim()) ? s.trim() : s.trim() + ".";
  const popCompleteSentences = (buffer: string) => {
    const re = /(.+?[.?!…]+(?:["'”’])?)(?:\s+|$)/g;
    const completed: string[] = [];
    let lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(buffer)) !== null) {
      completed.push(m[1].trim());
      lastIndex = re.lastIndex;
    }
    return { completed, remainder: buffer.slice(lastIndex) };
  };
  const pushLine = (role: Line["role"], text: string) =>
    setTranscript((prev) => [
      ...prev,
      { role, message: text, timestamp: stamp(), final: true },
    ]);
  const flushBuffer = (role: Line["role"], force = false) => {
    const current = buffersRef.current[role] || "";
    if (!current.trim()) return;
    const { completed, remainder } = popCompleteSentences(current);
    completed.forEach((s) => pushLine(role, s));
    if (force && remainder.trim()) {
      pushLine(role, ensureSentenceEnd(remainder));
      buffersRef.current[role] = "";
    } else {
      buffersRef.current[role] = remainder;
    }
  };
  const resetBuffers = () => {
    buffersRef.current = { "AI Interviewer": "", You: "" };
    lastSeenRef.current = { "AI Interviewer": "", You: "" };
    lastRoleRef.current = null;
  };

  /* ------------------------ Utils ------------------------ */
  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });

  /* ------------------------ Vapi wiring (guarded) ------------------------ */
  useEffect(() => {
    const ridRaw = localStorage.getItem("report_id");
    const ridInt = ridRaw !== null ? parseInt(ridRaw, 10) : null;
    setReportId(Number.isInteger(ridInt as number) ? (ridInt as number) : null);
    setJobTitle(localStorage.getItem("job_title"));
    setCompanyName(localStorage.getItem("company_name"));

    const vapi = new Vapi(PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on("call-start", () => {
      if (!callOpenRef.current) return;
      setStatus("listening");
    });

    vapi.on("speech-start", () => {
      if (!callOpenRef.current) return;
      setStatus("speaking");
    });

    vapi.on("speech-end", () => {
      if (!callOpenRef.current) return;
      flushBuffer("AI Interviewer", true);
      setStatus("thinking");
    });

    vapi.on("call-end", () => {
      // mark inactive first
      callOpenRef.current = false;
      flushBuffer("AI Interviewer", true);
      flushBuffer("You", true);
      setStatus("idle");
      stopVideo();
    });

    vapi.on("message", (m: VapiMessage) => {
      if (!callOpenRef.current) return;
      if (m.type !== "transcript") return;
      const role = roleLabel(m.role);
      const fullText = (m as any).transcript ?? "";

      if (lastRoleRef.current && lastRoleRef.current !== role) {
        flushBuffer(lastRoleRef.current, true);
      }
      lastRoleRef.current = role;

      const lastSeen = lastSeenRef.current[role] || "";
      const delta =
        fullText && fullText.startsWith(lastSeen)
          ? fullText.slice(lastSeen.length)
          : fullText;
      lastSeenRef.current[role] = fullText;

      buffersRef.current[role] += delta;
      flushBuffer(role, false);
    });

    return () => {
      try {
        vapi.stop();
      } catch {}
    };
  }, []);

  // Timer
  useEffect(() => {
    if (status !== "idle") {
      timerRef.current = setInterval(() => setTimer((p) => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setTimer(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Auto-scroll transcript
  useEffect(() => {
    const el = transcriptWrapRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [transcript]);

  // Bind video element when stream changes (wait for metadata, then play)
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    if (!videoStream) {
      vid.srcObject = null;
      return;
    }

    vid.muted = true;
    (vid as any).playsInline = true;

    try {
      vid.srcObject = videoStream;
    } catch {
      (vid as any).srcObject = videoStream;
    }

    const onLoaded = async () => {
      try {
        await vid.play();
      } catch {
        // autoplay may need a user gesture; control bar click will play
      }
    };

    if (vid.readyState >= 2) {
      onLoaded();
    } else {
      vid.addEventListener("loadedmetadata", onLoaded, { once: true });
    }

    return () => {
      vid.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [videoStream]);

  /* ------------------------ Camera control ------------------------ */
  const getVideo = async (): Promise<MediaStream | null> => {
    setCameraError(null);
    const trials: MediaStreamConstraints[] = [
      {
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      },
      { video: { facingMode: "user" }, audio: false },
      { video: true, audio: false },
    ];

    for (const constraints of trials) {
      try {
        const media = await navigator.mediaDevices.getUserMedia(constraints);
        const vt = media.getVideoTracks()[0];
        if (vt) return media;
      } catch {
        // try next set
      }
    }
    setCameraError(
      "Couldn't start your camera. Check permissions, device selection, and HTTPS."
    );
    return null;
  };

  const ensureVideoOn = async () => {
    let stream = videoStream;

    const existingTrack = stream?.getVideoTracks()[0];
    if (existingTrack && existingTrack.readyState === "live") {
      if (!existingTrack.enabled) existingTrack.enabled = true;
      setIsVideoOff(false);
      return stream!;
    }

    stream = await getVideo();
    if (!stream) {
      setIsVideoOff(true);
      return null;
    }
    setVideoStream(stream);
    setIsVideoOff(false);
    return stream;
  };

  const stopVideo = () => {
    // fully stop only when the session ends
    if (videoStream) {
      videoStream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {}
      });
    }
    setVideoStream(null);
    setIsVideoOff(true);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const toggleVideo = async () => {
    const track = videoStream?.getVideoTracks()[0];
    if (track && track.readyState === "live") {
      const nextEnabled = !track.enabled;
      track.enabled = nextEnabled;
      setIsVideoOff(!nextEnabled);
      if (videoRef.current) {
        if (!nextEnabled) {
          // keep element but pause to blank frame
          try {
            videoRef.current.pause();
          } catch {}
        } else {
          try {
            await videoRef.current.play();
          } catch {}
        }
      }
      return;
    }
    // no live track — acquire one
    await ensureVideoOn();
  };

  const toggleMute = () => setIsMuted((v) => !v);

  /* ------------------------ BLUR PIPELINE ------------------------ */
  useEffect(() => {
    // Stop segmentation when OFF or no camera
    if (blurLevel === "off" || !videoStream || isVideoOff) {
      if (rafSegRef.current) cancelAnimationFrame(rafSegRef.current);
      rafSegRef.current = null;
      if (segmenterRef.current?.close) segmenterRef.current.close();
      segmenterRef.current = null;
      return;
    }

    let cancelled = false;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const init = async () => {
      try {
        // Resolve constructor (ESM first, CDN fallback)
        let SelfieSegmentationCtor: any = null;
        try {
          const mod = await import("@mediapipe/selfie_segmentation");
          SelfieSegmentationCtor = (mod as any).SelfieSegmentation;
        } catch {
          if (!(window as any).SelfieSegmentation) {
            await loadScript(
              "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js"
            );
          }
          const g = (window as any).SelfieSegmentation;
          SelfieSegmentationCtor = g?.SelfieSegmentation || g;
        }

        if (!SelfieSegmentationCtor) {
          console.error("SelfieSegmentation ctor not available.");
          return;
        }

        const segmenter = new SelfieSegmentationCtor({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
        });
        segmenter.setOptions({ modelSelection: 1, selfieMode: true });
        segmenterRef.current = segmenter;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("2D canvas context not available");
          return;
        }
        if (!offscreenRef.current)
          offscreenRef.current = document.createElement("canvas");
        const off = offscreenRef.current;
        const offCtx = off.getContext("2d")!;

        const onResults = (results: any) => {
          if (!results?.segmentationMask || !results?.image) return;

          const vw = video.videoWidth;
          const vh = video.videoHeight;
          if (!vw || !vh) return;

          const dpr = window.devicePixelRatio || 1;
          const cw = Math.floor(vw * dpr);
          const ch = Math.floor(vh * dpr);

          if (canvas.width !== cw || canvas.height !== ch) {
            canvas.width = cw;
            canvas.height = ch;
            canvas.style.width = `${vw}px`;
            canvas.style.height = `${vh}px`;
          }
          if (off.width !== cw || off.height !== ch) {
            off.width = cw;
            off.height = ch;
          }

          ctx.save();
          ctx.clearRect(0, 0, cw, ch);

          // 1) draw mask
          ctx.drawImage(results.segmentationMask, 0, 0, cw, ch);

          // 2) keep PERSON only
          ctx.globalCompositeOperation = "source-in";
          ctx.drawImage(results.image, 0, 0, cw, ch);

          // 3) blurred background on offscreen
          offCtx.save();
          offCtx.clearRect(0, 0, cw, ch);
          offCtx.filter = `blur(${blurLevel === "high" ? 18 : 8}px)`;
          offCtx.drawImage(results.image, 0, 0, cw, ch);
          offCtx.restore();

          // 4) compose blurred background behind person
          ctx.globalCompositeOperation = "destination-over";
          ctx.drawImage(off, 0, 0);

          ctx.globalCompositeOperation = "source-over";
          ctx.restore();
        };

        segmenter.onResults(onResults);

        const loop = async () => {
          if (cancelled) return;
          if (video.readyState >= 2) {
            try {
              await segmenter.send({ image: video });
            } catch {
              /* transient between frames */
            }
          }
          rafSegRef.current = requestAnimationFrame(loop);
        };
        loop();
      } catch (e) {
        console.error("Segmentation init failed:", e);
      }
    };

    init();

    return () => {
      cancelled = true;
      if (rafSegRef.current) cancelAnimationFrame(rafSegRef.current);
      rafSegRef.current = null;
      if (segmenterRef.current?.close) segmenterRef.current.close();
      segmenterRef.current = null;
    };
  }, [blurLevel, videoStream, isVideoOff]);

  const cycleBlur = () =>
    setBlurLevel((b) => (b === "off" ? "low" : b === "low" ? "high" : "off"));

  /* ------------------------ Call lifecycle ------------------------ */
  const handleStart = async () => {
    if (!vapiRef.current || callOpenRef.current) return; // prevent double starts
    setTranscript([]);
    resetBuffers();

    // Turn camera on before starting Vapi
    await ensureVideoOn();

    callOpenRef.current = true; // mark as active BEFORE start
    try {
      await vapiRef.current.start(ASSISTANT_ID, {
        variableValues: {
          report_id: reportId ?? undefined,
          company_name: companyname ?? undefined,
          job_title: jobtitle ?? undefined,
        },
      });
    } catch (e) {
      callOpenRef.current = false; // roll back on failure
      console.error(e);
      setStatus("idle");
    }
  };

  const handleEnd = () => {
    // mark inactive first so late events are ignored
    callOpenRef.current = false;

    try {
      vapiRef.current?.stop();
    } catch {}

    flushBuffer("AI Interviewer", true);
    flushBuffer("You", true);
    stopVideo();
    setStatus("idle");
  };

  const handleRestart = () => {
    handleEnd();
    setTimeout(() => handleStart(), 600);
  };

  // Agent flags
  const agentSpeaking = status === "speaking";
  const agentListening = status === "listening";
  const agentThinking = status === "thinking";

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getUserInitial = () =>
    user?.email ? user.email.charAt(0).toUpperCase() : "U";

  /* ============================ UI ============================ */
  return (
    <main className="h-screen w-screen overflow-hidden bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#f1f5f9]">
      {/* IDLE – Ready screen */}
      {status === "idle" && (
        <section className="h-[100svh] w-full grid place-items-center px-6">
          {reportId ? (
            // User has a resume/report - show ready to interview UI
            <div className="w-full max-w-xl bg-white/95 rounded-3xl shadow-2xl border border-gray-100 p-10 text-center">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                Ready to Begin?
              </h2>
              <p className="text-lg text-gray-500 mb-8">
                Start your professional, AI-powered interview session. Make sure
                your camera and microphone are ready!
              </p>
              <Button
                onClick={handleStart}
                size="lg"
                className="text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-4 text-lg font-bold rounded-xl shadow-xl transition-all duration-200"
              >
                Start Interview
              </Button>
            </div>
          ) : (
            // First-time user without resume - show onboarding UI
            <div className="w-full max-w-2xl bg-white/95 rounded-3xl shadow-2xl border border-gray-100 p-12 text-center">
              <div className="mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg
                    className="w-10 h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
                  Welcome to SmartApply!
                </h2>
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  Get started with AI-powered interview practice tailored to
                  your resume and target job.
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 border border-blue-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  To begin your interview session:
                </h3>
                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Upload your resume
                      </p>
                      <p className="text-gray-600">
                        We'll analyze your skills and experience
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Add job details
                      </p>
                      <p className="text-gray-600">
                        Tell us about the position you're targeting
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        Start practicing
                      </p>
                      <p className="text-gray-600">
                        Get personalized interview questions and feedback
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => (window.location.href = "/job-kit")}
                size="lg"
                className="text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-12 py-4 text-lg font-bold rounded-xl shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                Get Started - Upload Resume
              </Button>

              <p className="text-sm text-gray-500 mt-6">
                Already uploaded your resume? The interview will be available
                once your profile is complete.
              </p>
            </div>
          )}
        </section>
      )}

      {/* ACTIVE – Camera left, Transcript right */}
      {status !== "idle" && (
        <section className="h-screen w-screen flex">
          {/* LEFT: modern camera frame */}
          <div className="relative flex-1 bg-transparent">
            <div className="h-full w-full p-4 md:p-6 lg:p-8">
              <div className="relative h-full w-full rounded-[28px] p-[10px] bg-gradient-to-br from-blue-600 via-purple-500 to-fuchsia-500 shadow-[0_30px_80px_-20px_rgba(59,130,246,0.45)]">
                <div className="relative h-full w-full rounded-2xl overflow-hidden bg-gray-900 ring-1 ring-white/10">
                  {/* LIVE badge */}
                  <div className="absolute top-4 left-4 z-50">
                    <div className="bg-red-50 px-4 py-2 rounded-xl text-sm font-semibold text-red-600 border border-red-200 flex items-center gap-2 shadow-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      LIVE <span className="ml-1">{formatTime(timer)}</span>
                    </div>
                  </div>

                  {/* Optional camera error banner */}
                  {cameraError && (
                    <div className="absolute top-4 right-4 z-50 bg-yellow-100 text-yellow-900 border border-yellow-300 px-3 py-2 rounded-xl text-sm shadow">
                      {cameraError}
                    </div>
                  )}

                  {/* Raw VIDEO (visible when blur OFF) */}
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity ${
                      blurLevel === "off" && videoStream && !isVideoOff
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  />

                  {/* CANVAS (visible when blur ON) */}
                  <canvas
                    ref={canvasRef}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity ${
                      blurLevel !== "off" && videoStream && !isVideoOff
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  />

                  {/* Placeholder when camera OFF */}
                  {(!videoStream || isVideoOff) && (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700">
                      <div className="text-center">
                        <div className="w-28 h-28 bg-gray-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
                          <span className="text-4xl text-white">
                            {getUserInitial()}
                          </span>
                        </div>
                        <p className="text-white text-base font-semibold">
                          Camera Off
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Vignette */}
                  <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10 shadow-[inset_0_40px_120px_rgba(0,0,0,0.45)]" />

                  {/* Label + speaking bars */}
                  <div className="absolute bottom-5 left-5 bg-black/60 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-3 shadow-md z-40">
                    <span className="text-white font-bold select-none text-lg">
                      {myLabel}
                    </span>
                    {isUserSpeaking && (
                      <div className="flex gap-1">
                        <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" />
                        <div
                          className="w-1 h-3 bg-green-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.1s" }}
                        />
                        <div
                          className="w-1 h-5 bg-green-400 rounded-full animate-pulse"
                          style={{ animationDelay: "0.2s" }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-white/95 backdrop-blur rounded-full px-6 py-3 flex items-center gap-3 sm:gap-6 shadow-xl border border-gray-200">
                      {/* Mic (visual) */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleMute}
                        className={`rounded-full w-12 h-12 p-0 transition-colors text-xl ${
                          isMuted
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? (
                          <MicOff className="h-5 w-5" />
                        ) : (
                          <Mic className="h-5 w-5" />
                        )}
                      </Button>

                      {/* Video ON/OFF */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleVideo}
                        className={`rounded-full w-12 h-12 p-0 transition-colors text-xl ${
                          isVideoOff
                            ? "bg-red-500 hover:bg-red-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                        title={
                          isVideoOff ? "Turn camera on" : "Turn camera off"
                        }
                      >
                        {isVideoOff ? (
                          <VideoOff className="h-5 w-5" />
                        ) : (
                          <Video className="h-5 w-5" />
                        )}
                      </Button>

                      {/* Blur: Off → Low → High */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={cycleBlur}
                        className="rounded-full w-12 h-12 p-0 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-xl"
                        title={`Blur: ${
                          blurLevel === "off"
                            ? "Off"
                            : blurLevel === "low"
                            ? "Low"
                            : "High"
                        }`}
                      >
                        <Droplets className="h-5 w-5" />
                      </Button>

                      {/* Restart */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRestart}
                        className="rounded-full w-12 h-12 p-0 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-xl"
                        title="Restart session"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </Button>

                      {/* End */}
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={handleEnd}
                        className="rounded-full w-12 h-12 p-0 text-xl"
                        title="End call"
                      >
                        <PhoneOff className="h-5 w-5" />
                      </Button>

                      {/* Settings */}
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full w-12 h-12 p-0 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-xl"
                            title="Session info"
                          >
                            <Settings className="h-5 w-5" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="bg-white">
                          <SheetHeader>
                            <SheetTitle className="font-semibold text-gray-900">
                              Session Information
                            </SheetTitle>
                          </SheetHeader>
                          <div className="mt-6 space-y-4">
                            <div>
                              <label className="text-sm font-semibold text-gray-700">
                                Report ID
                              </label>
                              <p className="text-base font-bold text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200">
                                {reportId != null
                                  ? String(reportId)
                                  : "Not set"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">
                                Job Title
                              </label>
                              <p className="text-base font-bold text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200">
                                {jobtitle || "Not set"}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-semibold text-gray-700">
                                Company
                              </label>
                              <p className="text-base font-bold text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200">
                                {companyname || "Not set"}
                              </p>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Transcript */}
          <aside className="w-full max-w-[420px] bg-white/95 backdrop-blur-sm border-l border-gray-100 shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white/95 z-10">
              <h3 className="font-extrabold text-gray-900 text-xl">
                Live Transcript
              </h3>
              <p className="text-base text-gray-500 mt-1">
                Real-time conversation transcript
              </p>
            </div>
            <div
              ref={transcriptWrapRef}
              className="flex-1 overflow-y-auto p-6 space-y-5"
            >
              {transcript.length === 0 ? (
                <div className="text-center text-gray-400 mt-12">
                  <p className="text-base">
                    Transcript will appear here once the conversation starts...
                  </p>
                </div>
              ) : (
                transcript.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 items-start ${
                      entry.role === "You" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow ${
                          entry.role === "AI Interviewer"
                            ? "bg-gradient-to-br from-blue-500 to-purple-500"
                            : "bg-gray-400"
                        }`}
                      >
                        {entry.role === "AI Interviewer"
                          ? "🤖"
                          : user?.email
                          ? user.email.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                    </div>
                    <div className="max-w-[75%]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-base">
                          {entry.role}
                        </span>
                        <span className="text-xs text-gray-400">
                          {entry.timestamp}
                        </span>
                      </div>
                      <div
                        className={`px-5 py-3 rounded-2xl text-base break-words shadow ${
                          entry.role === "AI Interviewer"
                            ? "bg-blue-50 text-blue-900"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {entry.message}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </section>
      )}
    </main>
  );
}

// "use client";

// import { useEffect, useRef, useState } from "react";
// import Vapi, { type VapiMessage } from "@vapi-ai/web";
// import { Button } from "@/components/ui/button";
// import { Droplets } from "lucide-react";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import {
//   RotateCcw,
//   PhoneOff,
//   Settings,
//   Mic,
//   MicOff,
//   Video,
//   VideoOff,
// } from "lucide-react";
// import { useAuth } from "@/components/AuthProvider";

// type Status = "idle" | "listening" | "thinking" | "speaking";

// const PUBLIC_KEY = "4b3fb521-9ad5-439a-8224-cdb78e2e78e8";
// const ASSISTANT_ID = "9295e1aa-6e41-4334-9dc4-030954c7274a";

// type Line = {
//   role: "AI Interviewer" | "You";
//   message: string;
//   timestamp: string;
//   final: boolean;
// };

// /* ================= Speaking indicator ================= */
// function usePersistentSpeakingIndicator(active: boolean) {
//   const [isUserSpeaking, setIsUserSpeaking] = useState(false);
//   const audioContextRef = useRef<AudioContext | null>(null);
//   const analyserRef = useRef<AnalyserNode | null>(null);
//   const rafRef = useRef<number | null>(null);
//   const streamRef = useRef<MediaStream | null>(null);

//   useEffect(() => {
//     let isMounted = true;

//     if (active && !audioContextRef.current) {
//       navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
//         streamRef.current = stream;
//         const ctx = new (window.AudioContext ||
//           (window as any).webkitAudioContext)();
//         audioContextRef.current = ctx;
//         const source = ctx.createMediaStreamSource(stream);
//         const analyser = ctx.createAnalyser();
//         analyser.fftSize = 512;
//         source.connect(analyser);
//         analyserRef.current = analyser;
//         const dataArray = new Uint8Array(analyser.frequencyBinCount);

//         const detect = () => {
//           analyser.getByteFrequencyData(dataArray);
//           const volume =
//             dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
//           if (isMounted) setIsUserSpeaking(volume > 10);
//           rafRef.current = requestAnimationFrame(detect);
//         };
//         detect();
//       });
//     }

//     if (!active) setIsUserSpeaking(false);

//     return () => {
//       isMounted = false;
//       if (audioContextRef.current) {
//         audioContextRef.current.close();
//         audioContextRef.current = null;
//       }
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((t) => t.stop());
//         streamRef.current = null;
//       }
//       if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
//     };
//   }, [active]);

//   return isUserSpeaking;
// }

// /* ============================ PAGE ============================ */
// export default function InterviewVoiceDemo() {
//   const [status, setStatus] = useState<Status>("idle");
//   const [reportId, setReportId] = useState<number | null>(null);
//   const [jobtitle, setJobTitle] = useState<string | null>(null);
//   const [companyname, setCompanyName] = useState<string | null>(null);
//   const [timer, setTimer] = useState(0);
//   const [transcript, setTranscript] = useState<Line[]>([]);

//   // Camera & UI
//   const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
//   const [isVideoOff, setIsVideoOff] = useState(false);
//   const [isMuted, setIsMuted] = useState(false); // visual only (Vapi owns real mic)

//   // Blur
//   const [blurLevel, setBlurLevel] = useState<"off" | "low" | "high">("off");
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const offscreenRef = useRef<HTMLCanvasElement | null>(null);
//   const rafSegRef = useRef<number | null>(null);
//   const segmenterRef = useRef<any>(null);

//   // Refs
//   const vapiRef = useRef<Vapi | null>(null);
//   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const transcriptWrapRef = useRef<HTMLDivElement>(null);
//   const { user } = useAuth();
//   const isUserSpeaking = usePersistentSpeakingIndicator(status === "listening");

//   const myLabel = user?.name || user?.email?.split("@")[0] || "You";
//   const roleLabel = (r: string): Line["role"] =>
//     r === "assistant" ? "AI Interviewer" : "You";

//   // Transcript buffers
//   const buffersRef = useRef<Record<Line["role"], string>>({
//     "AI Interviewer": "",
//     You: "",
//   });
//   const lastSeenRef = useRef<Record<Line["role"], string>>({
//     "AI Interviewer": "",
//     You: "",
//   });
//   const lastRoleRef = useRef<Line["role"] | null>(null);

//   const stamp = () =>
//     new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   const ensureSentenceEnd = (s: string) =>
//     /[.?!…]"?$/.test(s.trim()) ? s.trim() : s.trim() + ".";
//   const popCompleteSentences = (buffer: string) => {
//     const re = /(.+?[.?!…]+(?:["'”’])?)(?:\s+|$)/g;
//     const completed: string[] = [];
//     let lastIndex = 0;
//     let m: RegExpExecArray | null;
//     while ((m = re.exec(buffer)) !== null) {
//       completed.push(m[1].trim());
//       lastIndex = re.lastIndex;
//     }
//     return { completed, remainder: buffer.slice(lastIndex) };
//   };
//   const pushLine = (role: Line["role"], text: string) =>
//     setTranscript((prev) => [
//       ...prev,
//       { role, message: text, timestamp: stamp(), final: true },
//     ]);
//   const flushBuffer = (role: Line["role"], force = false) => {
//     const current = buffersRef.current[role] || "";
//     if (!current.trim()) return;
//     const { completed, remainder } = popCompleteSentences(current);
//     completed.forEach((s) => pushLine(role, s));
//     if (force && remainder.trim()) {
//       pushLine(role, ensureSentenceEnd(remainder));
//       buffersRef.current[role] = "";
//     } else {
//       buffersRef.current[role] = remainder;
//     }
//   };
//   const resetBuffers = () => {
//     buffersRef.current = { "AI Interviewer": "", You: "" };
//     lastSeenRef.current = { "AI Interviewer": "", You: "" };
//     lastRoleRef.current = null;
//   };

//   /* ------------------------ Utils ------------------------ */
//   const loadScript = (src: string) =>
//     new Promise<void>((resolve, reject) => {
//       const s = document.createElement("script");
//       s.src = src;
//       s.async = true;
//       s.onload = () => resolve();
//       s.onerror = () => reject(new Error(`Failed to load ${src}`));
//       document.head.appendChild(s);
//     });

//   /* ------------------------ Vapi wiring ------------------------ */
//   useEffect(() => {
//     const ridRaw = localStorage.getItem("report_id");
//     const ridInt = ridRaw !== null ? parseInt(ridRaw, 10) : null;
//     setReportId(Number.isInteger(ridInt as number) ? (ridInt as number) : null);
//     setJobTitle(localStorage.getItem("job_title"));
//     setCompanyName(localStorage.getItem("company_name"));

//     const vapi = new Vapi(PUBLIC_KEY);
//     vapiRef.current = vapi;

//     vapi.on("call-start", () => setStatus("listening"));
//     vapi.on("speech-start", () => setStatus("speaking"));
//     vapi.on("speech-end", () => {
//       flushBuffer("AI Interviewer", true);
//       setStatus("thinking");
//     });
//     vapi.on("call-end", () => {
//       flushBuffer("AI Interviewer", true);
//       flushBuffer("You", true);
//       setStatus("idle");
//       stopVideo();
//     });

//     vapi.on("message", (m: VapiMessage) => {
//       if (m.type !== "transcript") return;
//       const role = roleLabel(m.role);
//       const fullText = (m as any).transcript ?? "";

//       if (lastRoleRef.current && lastRoleRef.current !== role) {
//         flushBuffer(lastRoleRef.current, true);
//       }
//       lastRoleRef.current = role;

//       const lastSeen = lastSeenRef.current[role] || "";
//       const delta =
//         fullText && fullText.startsWith(lastSeen)
//           ? fullText.slice(lastSeen.length)
//           : fullText;
//       lastSeenRef.current[role] = fullText;

//       buffersRef.current[role] += delta;
//       flushBuffer(role, false);
//     });

//     return () => {
//       try {
//         vapi.stop();
//       } catch {}
//     };
//   }, []);

//   // Timer
//   useEffect(() => {
//     if (status !== "idle") {
//       timerRef.current = setInterval(() => setTimer((p) => p + 1), 1000);
//     } else {
//       if (timerRef.current) clearInterval(timerRef.current);
//       setTimer(0);
//     }
//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current);
//     };
//   }, [status]);

//   // Auto-scroll transcript
//   useEffect(() => {
//     const el = transcriptWrapRef.current;
//     if (el) el.scrollTop = el.scrollHeight;
//   }, [transcript]);

//   // Bind video element when stream changes
//   useEffect(() => {
//     const vid = videoRef.current;
//     if (!vid) return;
//     vid.srcObject = videoStream ?? null;
//     if (videoStream) {
//       vid.muted = true;
//       vid.playsInline = true;
//       (async () => {
//         for (let i = 0; i < 4; i++) {
//           try {
//             await vid.play();
//             break;
//           } catch {
//             await new Promise((r) => setTimeout(r, 120));
//           }
//         }
//       })();
//     }
//   }, [videoStream]);

//   /* ------------------------ Camera control ------------------------ */
//   const getVideo = async (): Promise<MediaStream | null> => {
//     try {
//       const media = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: "user",
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//           frameRate: { ideal: 30, max: 60 },
//         },
//         audio: false, // keep video-only; Vapi handles mic
//       });
//       const vt = media.getVideoTracks()[0];
//       if (!vt) throw new Error("No video track");
//       return media;
//     } catch (e) {
//       console.error("[getVideo] failed:", e);
//       return null;
//     }
//   };

//   const ensureVideoOn = async () => {
//     const track = videoStream?.getVideoTracks()[0];
//     if (track && track.readyState === "live" && track.enabled) {
//       setIsVideoOff(false);
//       return videoStream;
//     }
//     const media = await getVideo();
//     if (!media) {
//       setIsVideoOff(true);
//       return null;
//     }
//     setVideoStream(media);
//     setIsVideoOff(false);
//     return media;
//   };

//   const stopVideo = () => {
//     if (videoStream) {
//       videoStream.getVideoTracks().forEach((t) => {
//         try {
//           t.stop();
//         } catch {}
//       });
//     }
//     setVideoStream(null);
//     setIsVideoOff(true);
//     if (videoRef.current) videoRef.current.srcObject = null;
//   };

//   const toggleVideo = async () => {
//     const track = videoStream?.getVideoTracks()[0];
//     if (!track || track.readyState !== "live") {
//       await ensureVideoOn();
//       return;
//     }
//     stopVideo(); // turning OFF releases device (LED off)
//   };

//   const toggleMute = () => setIsMuted((v) => !v);

//   /* ------------------------ BLUR PIPELINE ------------------------ */
//   useEffect(() => {
//     // Stop segmentation when OFF or no camera
//     if (blurLevel === "off" || !videoStream || isVideoOff) {
//       if (rafSegRef.current) cancelAnimationFrame(rafSegRef.current);
//       rafSegRef.current = null;
//       if (segmenterRef.current?.close) segmenterRef.current.close();
//       segmenterRef.current = null;
//       return;
//     }

//     let cancelled = false;
//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     if (!video || !canvas) return;

//     const init = async () => {
//       try {
//         // --- resolve constructor (ESM first, CDN fallback with correct file) ---
//         let SelfieSegmentationCtor: any = null;
//         try {
//           const mod = await import("@mediapipe/selfie_segmentation");
//           SelfieSegmentationCtor = (mod as any).SelfieSegmentation;
//         } catch {
//           if (!(window as any).SelfieSegmentation) {
//             await loadScript(
//               "https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js"
//             );
//           }
//           // Global could be either the ctor or a namespace with .SelfieSegmentation
//           const g = (window as any).SelfieSegmentation;
//           SelfieSegmentationCtor = g?.SelfieSegmentation || g;
//         }

//         if (!SelfieSegmentationCtor) {
//           console.error("SelfieSegmentation ctor not available.");
//           return;
//         }

//         const segmenter = new SelfieSegmentationCtor({
//           locateFile: (file: string) =>
//             `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
//         });
//         segmenter.setOptions({ modelSelection: 1, selfieMode: true });
//         segmenterRef.current = segmenter;

//         const ctx = canvas.getContext("2d");
//         if (!ctx) {
//           console.error("2D canvas context not available");
//           return;
//         }
//         if (!offscreenRef.current)
//           offscreenRef.current = document.createElement("canvas");
//         const off = offscreenRef.current;
//         const offCtx = off.getContext("2d")!;

//         const onResults = (results: any) => {
//           if (!results?.segmentationMask || !results?.image) return;

//           const vw = video.videoWidth;
//           const vh = video.videoHeight;
//           if (!vw || !vh) return;

//           // scale for DPR
//           const dpr = window.devicePixelRatio || 1;
//           const cw = Math.floor(vw * dpr);
//           const ch = Math.floor(vh * dpr);

//           if (canvas.width !== cw || canvas.height !== ch) {
//             canvas.width = cw;
//             canvas.height = ch;
//             canvas.style.width = `${vw}px`;
//             canvas.style.height = `${vh}px`;
//           }
//           if (off.width !== cw || off.height !== ch) {
//             off.width = cw;
//             off.height = ch;
//           }

//           ctx.save();
//           ctx.clearRect(0, 0, cw, ch);

//           // 1) draw mask
//           ctx.drawImage(results.segmentationMask, 0, 0, cw, ch);

//           // 2) keep PERSON only
//           ctx.globalCompositeOperation = "source-in";
//           ctx.drawImage(results.image, 0, 0, cw, ch);

//           // 3) blurred background on offscreen
//           offCtx.save();
//           offCtx.clearRect(0, 0, cw, ch);
//           offCtx.filter = `blur(${blurLevel === "high" ? 18 : 8}px)`;
//           offCtx.drawImage(results.image, 0, 0, cw, ch);
//           offCtx.restore();

//           // 4) compose blurred background behind person
//           ctx.globalCompositeOperation = "destination-over";
//           ctx.drawImage(off, 0, 0);

//           ctx.globalCompositeOperation = "source-over";
//           ctx.restore();
//         };

//         segmenter.onResults(onResults);

//         const loop = async () => {
//           if (cancelled) return;
//           if (video.readyState >= 2) {
//             try {
//               await segmenter.send({ image: video });
//             } catch {
//               /* transient between frames */
//             }
//           }
//           rafSegRef.current = requestAnimationFrame(loop);
//         };
//         loop();
//       } catch (e) {
//         console.error("Segmentation init failed:", e);
//       }
//     };

//     init();

//     return () => {
//       cancelled = true;
//       if (rafSegRef.current) cancelAnimationFrame(rafSegRef.current);
//       rafSegRef.current = null;
//       if (segmenterRef.current?.close) segmenterRef.current.close();
//       segmenterRef.current = null;
//     };
//   }, [blurLevel, videoStream, isVideoOff]);

//   const cycleBlur = () =>
//     setBlurLevel((b) => (b === "off" ? "low" : b === "low" ? "high" : "off"));

//   /* ------------------------ Call lifecycle ------------------------ */
//   const handleStart = async () => {
//     if (!vapiRef.current) return;
//     setTranscript([]);
//     resetBuffers();

//     // best effort camera ON by default
//     await ensureVideoOn();

//     try {
//       await vapiRef.current.start(ASSISTANT_ID, {
//         variableValues: {
//           report_id: reportId ?? undefined,
//           company_name: companyname ?? undefined,
//           job_title: jobtitle ?? undefined,
//         },
//       });
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   const handleEnd = () => {
//     try {
//       vapiRef.current?.stop();
//     } catch {}
//     flushBuffer("AI Interviewer", true);
//     flushBuffer("You", true);
//     stopVideo();
//     setStatus("idle");
//   };

//   const handleRestart = () => {
//     handleEnd();
//     setTimeout(() => handleStart(), 600);
//   };

//   // Agent flags
//   const agentSpeaking = status === "speaking";
//   const agentListening = status === "listening";
//   const agentThinking = status === "thinking";

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${mins.toString().padStart(2, "0")}:${secs
//       .toString()
//       .padStart(2, "0")}`;
//   };

//   const getUserInitial = () =>
//     user?.email ? user.email.charAt(0).toUpperCase() : "U";

//   /* ============================ UI ============================ */
//   return (
//     <main className="h-screen w-screen overflow-hidden bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#f1f5f9]">
//       {/* IDLE – Ready screen */}
//       {status === "idle" && (
//         <section className="h-[100svh] w-full grid place-items-center px-6">
//           {reportId ? (
//             // User has a resume/report - show ready to interview UI
//             <div className="w-full max-w-xl bg-white/95 rounded-3xl shadow-2xl border border-gray-100 p-10 text-center">
//               <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
//                 Ready to Begin?
//               </h2>
//               <p className="text-lg text-gray-500 mb-8">
//                 Start your professional, AI-powered interview session. Make sure
//                 your camera and microphone are ready!
//               </p>
//               <Button
//                 onClick={handleStart}
//                 size="lg"
//                 className="text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-10 py-4 text-lg font-bold rounded-xl shadow-xl transition-all duration-200"
//               >
//                 Start Interview
//               </Button>
//             </div>
//           ) : (
//             // First-time user without resume - show onboarding UI
//             <div className="w-full max-w-2xl bg-white/95 rounded-3xl shadow-2xl border border-gray-100 p-12 text-center">
//               <div className="mb-8">
//                 <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
//                   <svg
//                     className="w-10 h-10 text-white"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                     />
//                   </svg>
//                 </div>
//                 <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
//                   Welcome to SmartApply!
//                 </h2>
//                 <p className="text-xl text-gray-600 mb-6 leading-relaxed">
//                   Get started with AI-powered interview practice tailored to
//                   your resume and target job.
//                 </p>
//               </div>

//               <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 border border-blue-100">
//                 <h3 className="text-2xl font-bold text-gray-900 mb-4">
//                   To begin your interview session:
//                 </h3>
//                 <div className="space-y-4 text-left">
//                   <div className="flex items-start gap-4">
//                     <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
//                       1
//                     </div>
//                     <div>
//                       <p className="font-semibold text-gray-900">
//                         Upload your resume
//                       </p>
//                       <p className="text-gray-600">
//                         We'll analyze your skills and experience
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-4">
//                     <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
//                       2
//                     </div>
//                     <div>
//                       <p className="font-semibold text-gray-900">
//                         Add job details
//                       </p>
//                       <p className="text-gray-600">
//                         Tell us about the position you're targeting
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-4">
//                     <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5">
//                       3
//                     </div>
//                     <div>
//                       <p className="font-semibold text-gray-900">
//                         Start practicing
//                       </p>
//                       <p className="text-gray-600">
//                         Get personalized interview questions and feedback
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <Button
//                 onClick={() => (window.location.href = "/job-kit")}
//                 size="lg"
//                 className="text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-12 py-4 text-lg font-bold rounded-xl shadow-xl transition-all duration-200 transform hover:scale-105"
//               >
//                 Get Started - Upload Resume
//               </Button>

//               <p className="text-sm text-gray-500 mt-6">
//                 Already uploaded your resume? The interview will be available
//                 once your profile is complete.
//               </p>
//             </div>
//           )}
//         </section>
//       )}

//       {/* ACTIVE – Camera left, Transcript right */}
//       {status !== "idle" && (
//         <section className="h-screen w-screen flex">
//           {/* LEFT: modern camera frame */}
//           <div className="relative flex-1 bg-transparent">
//             <div className="h-full w-full p-4 md:p-6 lg:p-8">
//               <div className="relative h-full w-full rounded-[28px] p-[10px] bg-gradient-to-br from-blue-600 via-purple-500 to-fuchsia-500 shadow-[0_30px_80px_-20px_rgba(59,130,246,0.45)]">
//                 <div className="relative h-full w-full rounded-2xl overflow-hidden bg-gray-900 ring-1 ring-white/10">
//                   {/* LIVE badge */}
//                   <div className="absolute top-4 left-4 z-50">
//                     <div className="bg-red-50 px-4 py-2 rounded-xl text-sm font-semibold text-red-600 border border-red-200 flex items-center gap-2 shadow-sm">
//                       <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
//                       LIVE <span className="ml-1">{formatTime(timer)}</span>
//                     </div>
//                   </div>

//                   {/* Raw VIDEO (visible when blur OFF) */}
//                   <video
//                     ref={videoRef}
//                     autoPlay
//                     muted
//                     playsInline
//                     className={`absolute inset-0 w-full h-full object-cover transition-opacity ${
//                       blurLevel === "off" && videoStream && !isVideoOff
//                         ? "opacity-100"
//                         : "opacity-0 pointer-events-none"
//                     }`}
//                   />

//                   {/* CANVAS (visible when blur ON) */}
//                   <canvas
//                     ref={canvasRef}
//                     className={`absolute inset-0 w-full h-full object-cover transition-opacity ${
//                       blurLevel !== "off" && videoStream && !isVideoOff
//                         ? "opacity-100"
//                         : "opacity-0 pointer-events-none"
//                     }`}
//                   />

//                   {/* Placeholder when camera OFF */}
//                   {(!videoStream || isVideoOff) && (
//                     <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-700">
//                       <div className="text-center">
//                         <div className="w-28 h-28 bg-gray-500 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
//                           <span className="text-4xl text-white">
//                             {getUserInitial()}
//                           </span>
//                         </div>
//                         <p className="text-white text-base font-semibold">
//                           Camera Off
//                         </p>
//                       </div>
//                     </div>
//                   )}

//                   {/* Vignette */}
//                   <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10 shadow-[inset_0_40px_120px_rgba(0,0,0,0.45)]" />

//                   {/* Label + speaking bars */}
//                   <div className="absolute bottom-5 left-5 bg-black/60 backdrop-blur px-4 py-2 rounded-xl flex items-center gap-3 shadow-md z-40">
//                     <span className="text-white font-bold select-none text-lg">
//                       {myLabel}
//                     </span>
//                     {isUserSpeaking && (
//                       <div className="flex gap-1">
//                         <div className="w-1 h-4 bg-green-400 rounded-full animate-pulse" />
//                         <div
//                           className="w-1 h-3 bg-green-400 rounded-full animate-pulse"
//                           style={{ animationDelay: "0.1s" }}
//                         />
//                         <div
//                           className="w-1 h-5 bg-green-400 rounded-full animate-pulse"
//                           style={{ animationDelay: "0.2s" }}
//                         />
//                       </div>
//                     )}
//                   </div>

//                   {/* Controls */}
//                   <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
//                     <div className="bg-white/95 backdrop-blur rounded-full px-6 py-3 flex items-center gap-3 sm:gap-6 shadow-xl border border-gray-200">
//                       {/* Mic (visual) */}
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={toggleMute}
//                         className={`rounded-full w-12 h-12 p-0 transition-colors text-xl ${
//                           isMuted
//                             ? "bg-red-500 hover:bg-red-600 text-white"
//                             : "bg-gray-100 hover:bg-gray-200 text-gray-700"
//                         }`}
//                         title={isMuted ? "Unmute" : "Mute"}
//                       >
//                         {isMuted ? (
//                           <MicOff className="h-5 w-5" />
//                         ) : (
//                           <Mic className="h-5 w-5" />
//                         )}
//                       </Button>

//                       {/* Video ON/OFF */}
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={toggleVideo}
//                         className={`rounded-full w-12 h-12 p-0 transition-colors text-xl ${
//                           isVideoOff
//                             ? "bg-red-500 hover:bg-red-600 text-white"
//                             : "bg-gray-100 hover:bg-gray-200 text-gray-700"
//                         }`}
//                         title={
//                           isVideoOff ? "Turn camera on" : "Turn camera off"
//                         }
//                       >
//                         {isVideoOff ? (
//                           <VideoOff className="h-5 w-5" />
//                         ) : (
//                           <Video className="h-5 w-5" />
//                         )}
//                       </Button>

//                       {/* Blur: Off → Low → High */}
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={cycleBlur}
//                         className="rounded-full w-12 h-12 p-0 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-xl"
//                         title={`Blur: ${
//                           blurLevel === "off"
//                             ? "Off"
//                             : blurLevel === "low"
//                             ? "Low"
//                             : "High"
//                         }`}
//                       >
//                         <Droplets className="h-5 w-5" />
//                       </Button>

//                       {/* Restart */}
//                       <Button
//                         variant="ghost"
//                         size="icon"
//                         onClick={handleRestart}
//                         className="rounded-full w-12 h-12 p-0 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-xl"
//                         title="Restart session"
//                       >
//                         <RotateCcw className="h-5 w-5" />
//                       </Button>

//                       {/* End */}
//                       <Button
//                         variant="destructive"
//                         size="icon"
//                         onClick={handleEnd}
//                         className="rounded-full w-12 h-12 p-0 text-xl"
//                         title="End call"
//                       >
//                         <PhoneOff className="h-5 w-5" />
//                       </Button>

//                       {/* Settings */}
//                       <Sheet>
//                         <SheetTrigger asChild>
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="rounded-full w-12 h-12 p-0 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-xl"
//                             title="Session info"
//                           >
//                             <Settings className="h-5 w-5" />
//                           </Button>
//                         </SheetTrigger>
//                         <SheetContent className="bg-white">
//                           <SheetHeader>
//                             <SheetTitle className="font-semibold text-gray-900">
//                               Session Information
//                             </SheetTitle>
//                           </SheetHeader>
//                           <div className="mt-6 space-y-4">
//                             <div>
//                               <label className="text-sm font-semibold text-gray-700">
//                                 Report ID
//                               </label>
//                               <p className="text-base font-bold text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200">
//                                 {reportId != null
//                                   ? String(reportId)
//                                   : "Not set"}
//                               </p>
//                             </div>
//                             <div>
//                               <label className="text-sm font-semibold text-gray-700">
//                                 Job Title
//                               </label>
//                               <p className="text-base font-bold text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200">
//                                 {jobtitle || "Not set"}
//                               </p>
//                             </div>
//                             <div>
//                               <label className="text-sm font-semibold text-gray-700">
//                                 Company
//                               </label>
//                               <p className="text-base font-bold text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200">
//                                 {companyname || "Not set"}
//                               </p>
//                             </div>
//                           </div>
//                         </SheetContent>
//                       </Sheet>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT: Transcript */}
//           <aside className="w-full max-w-[420px] bg-white/95 backdrop-blur-sm border-l border-gray-100 shadow-2xl flex flex-col">
//             <div className="p-6 border-b border-gray-100 sticky top-0 bg-white/95 z-10">
//               <h3 className="font-extrabold text-gray-900 text-xl">
//                 Live Transcript
//               </h3>
//               <p className="text-base text-gray-500 mt-1">
//                 Real-time conversation transcript
//               </p>
//             </div>
//             <div
//               ref={transcriptWrapRef}
//               className="flex-1 overflow-y-auto p-6 space-y-5"
//             >
//               {transcript.length === 0 ? (
//                 <div className="text-center text-gray-400 mt-12">
//                   <p className="text-base">
//                     Transcript will appear here once the conversation starts...
//                   </p>
//                 </div>
//               ) : (
//                 transcript.map((entry, index) => (
//                   <div
//                     key={index}
//                     className={`flex gap-3 items-start ${
//                       entry.role === "You" ? "flex-row-reverse" : ""
//                     }`}
//                   >
//                     <div className="flex-shrink-0">
//                       <div
//                         className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow ${
//                           entry.role === "AI Interviewer"
//                             ? "bg-gradient-to-br from-blue-500 to-purple-500"
//                             : "bg-gray-400"
//                         }`}
//                       >
//                         {entry.role === "AI Interviewer"
//                           ? "🤖"
//                           : user?.email
//                           ? user.email.charAt(0).toUpperCase()
//                           : "U"}
//                       </div>
//                     </div>
//                     <div className="max-w-[75%]">
//                       <div className="flex items-center gap-2 mb-1">
//                         <span className="font-bold text-gray-900 text-base">
//                           {entry.role}
//                         </span>
//                         <span className="text-xs text-gray-400">
//                           {entry.timestamp}
//                         </span>
//                       </div>
//                       <div
//                         className={`px-5 py-3 rounded-2xl text-base break-words shadow ${
//                           entry.role === "AI Interviewer"
//                             ? "bg-blue-50 text-blue-900"
//                             : "bg-gray-100 text-gray-900"
//                         }`}
//                       >
//                         {entry.message}
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </aside>
//         </section>
//       )}
//     </main>
//   );
// }
