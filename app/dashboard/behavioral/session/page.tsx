"use client";

export const dynamic = "force-dynamic";

import {
  Suspense,
  type ComponentType,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Vapi, { type VapiMessage } from "@vapi-ai/web";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Mic,
  Crown,
  Users,
  Droplets,
  RotateCcw,
  PhoneOff,
  Settings,
  MicOff,
  Video,
  VideoOff,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";

type TopicKey = "communication" | "leadership" | "team_player";

const API_URL = process.env.NEXT_PUBLIC_API_BASE;

const TOPIC_CONFIG: Record<
  TopicKey,
  {
    title: string;
    blurb: string;
    icon: ComponentType<{ className?: string }>;
    color: {
      text: string;
      ring: string;
      hover: string;
      gradientFrom: string;
      gradientTo: string;
    };
  }
> = {
  communication: {
    title: "Communication",
    blurb: "Improve clarity, active listening, and concise delivery.",
    icon: Mic,
    color: {
      text: "text-blue-700 dark:text-blue-300",
      ring: "border-blue-100 dark:border-slate-700",
      hover: "hover:border-blue-400",
      gradientFrom: "from-blue-600",
      gradientTo: "to-indigo-600",
    },
  },
  leadership: {
    title: "Leadership",
    blurb: "Demonstrate ownership, influence, and decision-making.",
    icon: Crown,
    color: {
      text: "text-purple-700 dark:text-purple-300",
      ring: "border-purple-100 dark:border-slate-700",
      hover: "hover:border-purple-400",
      gradientFrom: "from-purple-600",
      gradientTo: "to-pink-600",
    },
  },
  team_player: {
    title: "Team Player",
    blurb: "Showcase collaboration, conflict resolution, and empathy.",
    icon: Users,
    color: {
      text: "text-indigo-700 dark:text-indigo-300",
      ring: "border-indigo-100 dark:border-slate-700",
      hover: "hover:border-indigo-400",
      gradientFrom: "from-indigo-600",
      gradientTo: "to-blue-600",
    },
  },
};

// Reuse the same public key as reference
const PUBLIC_KEY = "4b3fb521-9ad5-439a-8224-cdb78e2e78e8";

// Pick assistant by topic (replace placeholders with real IDs)
const ASSISTANT_IDS: Record<TopicKey, string> = {
  communication: "1e314056-262a-4975-a1f5-b60bef43f365",
  leadership: "3a3861ec-5e0d-4eef-8cdc-4011ab1f3c23",
  team_player: "540ab241-dbcc-4a76-a49e-6d2352bb95ae",
};

type Status = "idle" | "listening" | "thinking" | "speaking";

type Line = {
  role: "AI Interviewer" | "You";
  message: string;
  timestamp: string;
  final: boolean;
};

export default function BehavioralSessionPage() {
  return (
    <Suspense fallback={<SessionSkeleton />}>
      <SessionContent />
    </Suspense>
  );
}

function SessionSkeleton() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12">
      <div className="text-center space-y-3 mb-10 animate-pulse">
        <div className="h-10 w-64 bg-slate-200/60 dark:bg-slate-700/60 rounded mx-auto" />
        <div className="h-5 w-80 bg-slate-200/60 dark:bg-slate-700/60 rounded mx-auto" />
      </div>
      <div className="w-full max-w-3xl h-64 bg-white/60 dark:bg-slate-800/60 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700 animate-pulse" />
    </main>
  );
}

/* ================= Speaking indicator (persistent) ================= */
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

function SessionContent() {
  const sp = useSearchParams();
  const rawTopic = (sp.get("topic") || "").toLowerCase();
  const topic = (
    ["communication", "leadership", "team_player"].includes(rawTopic)
      ? rawTopic
      : "communication"
  ) as TopicKey;

  const cfg = TOPIC_CONFIG[topic];
  const Icon = cfg.icon;

  // Call and UI state
  const [status, setStatus] = useState<Status>("idle");
  const [reportId, setReportId] = useState<number | null>(null);
  const [jobtitle, setJobTitle] = useState<string | null>(null);
  const [companyname, setCompanyName] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [transcript, setTranscript] = useState<Line[]>([]);

  // Video + mic UI
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // visual only, Vapi owns mic

  // Blur pipeline
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
  const { user } = useAuth();
  const isUserSpeaking = usePersistentSpeakingIndicator(status === "listening");
  // guards & camera status
  const callOpenRef = useRef(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // NEW: capture starter values + call info + delayed post timer
  const candidateNameRef = useRef<string>("");
  const userEmailRef = useRef<string>("");
  const interviewTypeRef = useRef<TopicKey>(topic);
  const callStartInfoRef = useRef<string | null>(null);
  const sendInfoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // NEW: structured data fetch guard + defaults
  const hasFetchedStructuredRef = useRef(false);
  const FETCH_MAX_WAIT_SECONDS = 240;
  const FETCH_INTERVAL_SECONDS = 30;

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
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

  // Utils
  const loadScript = (src: string) =>
    new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(s);
    });

  // Attach/re-attach stream to <video> when UI or stream changes (same logic as interview/page.tsx)
  const attachStreamToVideo = async () => {
    const vid = videoRef.current;
    const stream = videoStream;
    if (!vid) return;

    if (!stream) {
      (vid as HTMLVideoElement).srcObject = null;
      return;
    }

    vid.muted = true;
    (vid as any).playsInline = true;

    try {
      (vid as any).srcObject = stream;
    } catch {
      (vid as any).srcObject = stream;
    }

    const onLoaded = async () => {
      try {
        await vid.play();
      } catch {
        // ignore autoplay block; user gesture will play
      }
    };

    if (vid.readyState >= 2) {
      await onLoaded();
    } else {
      vid.addEventListener("loadedmetadata", onLoaded, { once: true });
    }
  };

  // Persist a session (stub API)
  const saveSession = async (finalDuration: number) => {
    try {
      await fetch("/api/behavioral/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          report_id: reportId,
          job_title: jobtitle,
          company_name: companyname,
          duration_sec: finalDuration,
          // include scores if available later; this is just a stub call
          scores: null,
        }),
      });
    } catch {}
  };

  // Pick call id from various payload shapes
  const pickCallId = (src: any): string | null => {
    if (!src) return null;
    const candidates = [
      src.id,
      src.call?.id,
      src.data?.id,
      src.session?.id,
      src.sessionId,
      src.conversationId,
      src.metadata?.id,
    ];
    return (candidates.find(Boolean) as string) ?? null;
  };

  // NEW: send-call-info helper (posts 5s after call starts)
  const sendCallInfo = async () => {
    // require a call_id; avoid 422s
    if (!callStartInfoRef.current) {
      console.warn("send-call-info skipped: missing call_id");
      return;
    }
    try {
      const base = (API_URL || "").replace(/\/+$/, "");
      const url =
        base ? `${base}/api/behavioral/send-call-info` : `/api/behavioral/send-call-info`;

      const form = new URLSearchParams();
      form.set("user_email", userEmailRef.current || "");
      form.set("name", candidateNameRef.current || "");
      form.set("type", interviewTypeRef.current || "");
      form.set("call_id", callStartInfoRef.current || "");

      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
    } catch (e) {
      console.error("send-call-info failed:", e);
    }
  };

  const scheduleSendCallInfo = () => {
    if (sendInfoTimeoutRef.current) clearTimeout(sendInfoTimeoutRef.current);
    // start 5s countdown only after we have a call_id
    if (!callStartInfoRef.current) return;
    sendInfoTimeoutRef.current = setTimeout(() => {
      if (callOpenRef.current) void sendCallInfo();
    }, 5000);
  };

  // NEW: fetch structured data after the call ends
  const fetchVapiStructuredData = async () => {
    if (hasFetchedStructuredRef.current) return;
    if (!callStartInfoRef.current) {
      console.warn("fetch-vapi-structured-data skipped: missing call_id");
      return;
    }
    hasFetchedStructuredRef.current = true;
    try {
      const base = (API_URL || "").replace(/\/+$/, "");
      const url = base
        ? `${base}/api/behavioral/fetch-vapi-structured-data`
        : `/api/behavioral/fetch-vapi-structured-data`;

      const form = new URLSearchParams();
      form.set("call_id", callStartInfoRef.current);
      form.set("user_email", userEmailRef.current || "");
      form.set("type", interviewTypeRef.current || "");
      form.set("max_wait_seconds", String(FETCH_MAX_WAIT_SECONDS));
      form.set("interval_seconds", String(FETCH_INTERVAL_SECONDS));

      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
    } catch (e) {
      console.error("fetch-vapi-structured-data failed:", e);
    }
  };

  // Vapi wiring + localStorage
  useEffect(() => {
    const ridRaw = localStorage.getItem("report_id");
    const ridInt = ridRaw !== null ? parseInt(ridRaw, 10) : null;
    setReportId(Number.isInteger(ridInt as number) ? (ridInt as number) : null);
    setJobTitle(localStorage.getItem("job_title"));
    setCompanyName(localStorage.getItem("company_name"));

    const vapi = new Vapi(PUBLIC_KEY);
    vapiRef.current = vapi;

    vapi.on("call-start", (info?: any) => {
      if (!callOpenRef.current) return;
      // capture call id from Vapi
      const cid = pickCallId(info);
      if (cid) {
        callStartInfoRef.current = cid;
        console.debug("Vapi call-start id:", cid);
        // now that we have the id, arm the 5s post
        scheduleSendCallInfo();
      } else {
        console.debug("Vapi call-start payload (no id):", info);
      }
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
      // Mark call inactive first, then clean state.
      callOpenRef.current = false;

      // cancel pending delayed post if any
      if (sendInfoTimeoutRef.current) clearTimeout(sendInfoTimeoutRef.current);

      // save current timer value
      void saveSession(timer);

      // NEW: fetch structured data once the call is over
      void fetchVapiStructuredData();

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

  // Bind video element when stream OR UI status changes (fixes camera toggle on this page)
  useEffect(() => {
    attachStreamToVideo();
    return () => {
      // no-op; cleanup handled elsewhere
    };
  }, [videoStream, status]);

  // Camera control
  // const getVideo = async (): Promise<MediaStream | null> => {
  //   try {
  //     const media = await navigator.mediaDevices.getUserMedia({
  //       video: {
  //         facingMode: "user",
  //         width: { ideal: 1280 },
  //         height: { ideal: 720 },
  //         frameRate: { ideal: 30, max: 60 },
  //       },
  //       audio: false, // Vapi owns mic
  //     });
  //     const vt = media.getVideoTracks()[0];
  //     if (!vt) throw new Error("No video track");
  //     return media;
  //   } catch (e) {
  //     console.error("[getVideo] failed:", e);
  //     return null;
  //   }
  // };

  // const ensureVideoOn = async () => {
  //   const track = videoStream?.getVideoTracks()[0];
  //   if (track && track.readyState === "live" && track.enabled) {
  //     setIsVideoOff(false);
  //     return videoStream;
  //   }
  //   const media = await getVideo();
  //   if (!media) {
  //     setIsVideoOff(true);
  //     return null;
  //   }
  //   setVideoStream(media);
  //   setIsVideoOff(false);
  //   return media;
  // };

  // const stopVideo = () => {
  //   if (videoStream) {
  //     videoStream.getVideoTracks().forEach((t) => {
  //       try {
  //         t.stop();
  //       } catch {}
  //     });
  //   }
  //   setVideoStream(null);
  //   setIsVideoOff(true);
  //   if (videoRef.current) videoRef.current.srcObject = null;
  // };

  // const toggleVideo = async () => {
  //   const track = videoStream?.getVideoTracks()[0];
  //   if (!track || track.readyState !== "live") {
  //     await ensureVideoOn();
  //     return;
  //   }
  //   stopVideo();
  // };

  // Small helper to format and show camera errors consistently
  const showCameraError = (msg: string, detail?: unknown) => {
    console.error("[camera]", msg, detail ?? "");
    setCameraError(msg);
    toast.error(msg);
  };

  // Optional: pre-check permission to give immediate guidance
  const checkCameraPermission = async (): Promise<boolean> => {
    try {
      // localhost is secure, but surface helpful msg if not
      if (!window.isSecureContext) {
        showCameraError("Camera requires HTTPS or localhost. Please use https:// or localhost.");
        return false;
      }
      // Not all browsers support Permissions API for 'camera'
      // In Chrome it's 'camera', in others it may not exist.
      if ((navigator as any).permissions?.query) {
        // Cast to avoid TS issues across browsers
        const status = await (navigator as any).permissions.query({ name: "camera" as any });
        if (status.state === "denied") {
          showCameraError("Camera permission is blocked in the browser. Allow camera in Site settings and reload.");
          return false;
        }
      }
    } catch {
      // Ignore; we'll attempt getUserMedia next which will still error with details
    }
    return true;
  };

  const pickFirstVideoDevice = async (): Promise<MediaDeviceInfo | null> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === "videoinput");
      return cams[0] ?? null;
    } catch (e) {
      console.warn("enumerateDevices failed", e);
      return null;
    }
  };

  const getVideo = async (): Promise<MediaStream | null> => {
    setCameraError(null);

    const ok = await checkCameraPermission();
    if (!ok) return null;

    // Prefer a specific deviceId if available
    const device = await pickFirstVideoDevice();

    const trials: MediaStreamConstraints[] = [
      {
        video: {
          deviceId: device?.deviceId ? { exact: device.deviceId } : undefined,
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 60 },
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
      } catch (e: any) {
        // Try next constraint, but keep last meaningful error
        const name = e?.name || "Error";
        const msg = e?.message || "";
        if (name === "NotAllowedError") {
          showCameraError("Camera access was denied. Click the camera icon in the address bar to allow and reload.", e);
          return null;
        }
        if (name === "NotReadableError") {
          showCameraError("Camera is busy (used by another app). Close other apps (Zoom/Teams) and retry.", e);
          return null;
        }
        if (name === "OverconstrainedError") {
          // Fall through to try less strict constraints
          console.warn("Overconstrained; trying fallback constraints", constraints, e);
          continue;
        }
        if (name === "NotFoundError") {
          showCameraError("No camera device found. Check Windows Privacy settings > Camera.", e);
          return null;
        }
        console.warn("getUserMedia failed; trying fallback", name, msg, constraints);
      }
    }

    showCameraError("Couldn't start your camera. Check browser permissions and HTTPS.");
    return null;
  };

  const ensureVideoOn = async () => {
    let stream = videoStream;

    // If we already have a live track, just re-enable it
    const existingTrack = stream?.getVideoTracks()[0];
    if (existingTrack && existingTrack.readyState === "live") {
      if (!existingTrack.enabled) existingTrack.enabled = true;
      setIsVideoOff(false);
      return stream!;
    }

    // Otherwise, acquire a new stream
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
    if (videoStream) {
      videoStream.getTracks().forEach((t) => {
        try { t.stop(); } catch {}
      });
    }
    setVideoStream(null);
    setIsVideoOff(true);
    if (videoRef.current) (videoRef.current as HTMLVideoElement).srcObject = null;
  };

  const toggleVideo = async () => {
    // If we have a track, toggle enabled; if ended, reacquire
    const track = videoStream?.getVideoTracks()[0];
    if (track) {
      if (track.readyState !== "live") {
        await ensureVideoOn();
        return;
      }
      const nextEnabled = !track.enabled;
      track.enabled = nextEnabled;
      setIsVideoOff(!nextEnabled);
      if (!nextEnabled && videoRef.current) {
        try { videoRef.current.pause(); } catch {}
      } else if (nextEnabled && videoRef.current) {
        try { await videoRef.current.play(); } catch {}
      }
      // Ensure the stream is attached after state/UI changes
      await attachStreamToVideo();
      return;
    }

    // No active stream? Acquire one now and attach.
    await ensureVideoOn();
    await attachStreamToVideo();
  };

  const toggleMute = () => setIsMuted((v) => !v);

  // Blur pipeline
  useEffect(() => {
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

          // mask
          ctx.drawImage(results.segmentationMask, 0, 0, cw, ch);

          // keep person
          ctx.globalCompositeOperation = "source-in";
          ctx.drawImage(results.image, 0, 0, cw, ch);

          // blurred background on offscreen
          offCtx.save();
          offCtx.clearRect(0, 0, cw, ch);
          offCtx.filter = `blur(${blurLevel === "high" ? 18 : 8}px)`;
          offCtx.drawImage(results.image, 0, 0, cw, ch);
          offCtx.restore();

          // compose blurred bg behind person
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
              // transient
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

  // Call lifecycle
  // const handleStart = async () => {
  //   if (!vapiRef.current) return;
  //   setTranscript([]);
  //   resetBuffers();
  //   await ensureVideoOn();

  //   try {
  //     await vapiRef.current.start(ASSISTANT_IDS[topic], {
  //       variableValues: {
  //         report_id: reportId ?? undefined,
  //         company_name: companyname ?? undefined,
  //         job_title: jobtitle ?? undefined,
  //       },
  //     });
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  // const handleEnd = () => {
  //   try {
  //     vapiRef.current?.stop();
  //   } catch {}
  //   flushBuffer("AI Interviewer", true);
  //   flushBuffer("You", true);
  //   stopVideo();
  //   setStatus("idle");
  // };
  const handleStart = async () => {
    if (!vapiRef.current || callOpenRef.current) return;
    setTranscript([]);
    resetBuffers();

    // reset structured-data flag for a new call
    hasFetchedStructuredRef.current = false;

    // Read name/email from localStorage.socialUser
    const socialUserRaw =
      typeof window !== "undefined" ? localStorage.getItem("socialUser") : null;
    let socialUser: any = null;
    try {
      socialUser = socialUserRaw ? JSON.parse(socialUserRaw) : null;
    } catch {
      socialUser = null;
    }

    const rawName = (socialUser?.name || socialUser?.given_name || "").trim();
    const rawEmailStored =
      typeof window !== "undefined" ? localStorage.getItem("user_email") : null;
    const rawEmail = (socialUser?.email || rawEmailStored || "").trim();

    // Prefer given_name; otherwise first token of full name
    const candidate_name =
      (socialUser?.given_name || "").trim() ||
      (rawName ? rawName.split(/\s+/)[0] : "");
    const user_email = rawEmail;
    const interview_type: TopicKey = topic;

    candidateNameRef.current = candidate_name;
    userEmailRef.current = user_email;
    interviewTypeRef.current = interview_type;

    if (!candidate_name || !user_email || !interview_type) {
      toast.error("Missing name or email. Please complete your profile and try again.");
      return;
    }

    await ensureVideoOn();

    callOpenRef.current = true;
    try {
      const started = await vapiRef.current.start(ASSISTANT_IDS[topic], {
        variableValues: {
          candidate_name,
          user_email,
          interview_type,
        },
      });

      // capture id from start() response too
      const cid = pickCallId(started);
      if (cid) {
        callStartInfoRef.current = cid;
        console.debug("Vapi start() id:", cid);
        scheduleSendCallInfo(); // 5s after id obtained
      }
      // call-start event will also set it if not present here
    } catch (e) {
      callOpenRef.current = false;
      if (sendInfoTimeoutRef.current) clearTimeout(sendInfoTimeoutRef.current);
      console.error(e);
      toast.error("Failed to start session. Please try again.");
      setStatus("idle");
    }
  };

  const handleEnd = () => {
    // First, mark as not active so any late events are ignored
    callOpenRef.current = false;

    // cancel pending delayed post if any
    if (sendInfoTimeoutRef.current) clearTimeout(sendInfoTimeoutRef.current);

    // save current timer value
    void saveSession(timer);

    try {
      vapiRef.current?.stop();
    } catch {}

    // Do not call fetchVapiStructuredData here directly to avoid double-call;
    // vapi "call-end" handler above will trigger it once.

    flushBuffer("AI Interviewer", true);
    flushBuffer("You", true);

    stopVideo();
    setStatus("idle");
  };

  const handleRestart = () => {
    handleEnd();
    setTimeout(() => handleStart(), 600);
  };

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

  // UI
  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {status === "idle" ? (
        <div className="flex flex-col items-center justify-start py-6 md:py-20 px-4">
          {/* Topic header */}
          <div className="text-center space-y-3 mb-12">
            <h1 className="text-2xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {cfg.title} Practice
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {cfg.blurb}
            </p>
          </div>

          {/* Topic card with Start Practice */}
          <div
            className={`w-full max-w-3xl bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl border-2 ${cfg.color.ring} ${cfg.color.hover} backdrop-blur-md`}
          >
            <div className="flex flex-col items-center justify-center p-8">
              <div className="flex items-center justify-center mb-4">
                <Icon className={`h-12 w-12 ${cfg.color.text}`} />
              </div>
              <h2
                className={`text-2xl font-semibold mb-2 tracking-tight ${cfg.color.text}`}
              >
                {cfg.title} Session
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mb-8">
                Start a live simulated interview adapted to this topic. Your
                camera can be blurred, and you’ll see a live transcript on the
                right.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  className={`px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all bg-gradient-to-r ${cfg.color.gradientFrom} ${cfg.color.gradientTo} hover:brightness-110`}
                  onClick={handleStart}
                >
                  Start Practice
                </Button>
                <Link
                  href="/dashboard/behavioral"
                  className="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:shadow transition-all text-center"
                >
                  Back to Topics
                </Link>
                <Link
                  href={`/dashboard/behavioral/progress/${topic}`}
                  className="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:shadow transition-all text-center"
                >
                  View detailed progress
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Active session: camera left + transcript right

        <section className="h-screen w-screen flex">
          {cameraError && (
            <div className="absolute top-4 right-4 z-50 bg-yellow-100 text-yellow-900 border border-yellow-300 px-3 py-2 rounded-xl text-sm shadow">
              {cameraError}
            </div>
          )}

          {/* LEFT: Camera with blur support */}
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
                                Topic
                              </label>
                              <p className="text-base font-bold text-gray-900 bg-gray-50 p-3 rounded-lg mt-1 border border-gray-200 capitalize">
                                {topic}
                              </p>
                            </div>
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
