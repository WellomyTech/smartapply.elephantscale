"use client";

import React, { ChangeEvent, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Upload, Sparkles, FileText, Briefcase } from "lucide-react";

import { useAuth } from "@/components/AuthProvider";
import { useResume } from "@/components/ResumeProvider";
import { useEntitlement } from "@/hooks/useEntitlement";
import PricingModal from "@/components/PricingButtons";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBar, useStatusBar } from "@/components/ui/status-bar";
import JobScanList from "@/components/JobScanList";
import DashboardButton from "@/components/DashboardButton";

/** ---- in-flight fetch de-dupe (no logic change) ---- */
/** ---- JSON fetch with in-flight + persistent cache ---- */
const inflight = new Map<string, Promise<any>>();
const jsonCache = new Map<string, any>();

async function fetchJsonOnce(url: string, init?: RequestInit) {
  // If we already have the parsed JSON, return it immediately.
  if (jsonCache.has(url)) return jsonCache.get(url);

  // If a request is currently in flight, await and share it.
  if (inflight.has(url)) return inflight.get(url)!;

  const p = fetch(url, init)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((data) => {
      jsonCache.set(url, data); // persist for subsequent calls
      return data;
    })
    .finally(() => {
      inflight.delete(url); // clear in-flight but keep jsonCache
    });

  inflight.set(url, p);
  return p;
}

export default function Dashboard() {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE;

  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const {
    isLoading: entLoading,
    canGenerate,
    isPremium,
    freeRemain,
  } = useEntitlement();
  const [showPaywall, setShowPaywall] = useState(false);
  const { status, showStatus, hideStatus } = useStatusBar();

  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const coverLetterInputRef = useRef<HTMLInputElement | null>(null);

  const { resumeFile, setResumeFile, coverLetterFile, setCoverLetterFile } =
    useResume();

  const [hasResume, setHasResume] = useState<boolean>(false);
  const [hasCoverLetter, setHasCoverLetter] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  /** ensure we write email once */
  useEffect(() => {
    if (user?.email) localStorage.setItem("user_email", user.email);
  }, [user?.email]);

  /** ---- RUN-ONCE GUARD for the dashboard fetch ---- */
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (authLoading || !user?.email) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const url = `${API_URL}user-dashboard?user_email=${encodeURIComponent(
      user.email
    )}`;

    fetchJsonOnce(url)
      .then((data) => {
        setHasResume(data.has_resume === 1);
        setHasCoverLetter(data.has_cover_letter === 1);
        setUserData(data);
      })
      .catch((error) => {
        console.error("Failed to fetch dashboard:", error);
        setHasResume(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email, authLoading]); // (omit API_URL to avoid re-trigger)

  const localSetFileName = (
    key: "resume" | "cover_letter",
    file: File | null
  ) => {
    const storageKey = `${key}_file_name`;
    if (file) localStorage.setItem(storageKey, file.name);
    else localStorage.removeItem(storageKey);
  };

  const onResumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setResumeFile(f);
    setError("");
    localSetFileName("resume", f);

    // Automatically upload the resume when selected
    if (f) {
      handleResumeUpload(e);
    }
  };

  const onCoverLetterChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setCoverLetterFile(f);
    setError("");
    localSetFileName("cover_letter", f);
  };

  const handleResumeUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showStatus("Please upload a PDF file", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showStatus("File size must be less than 10MB", "error");
      return;
    }

    setUploading(true);

    // Dynamic loading messages with animations
    const loadingMessages = [
      "Uploading resume",
      "Processing document",
      "Analyzing content",
      "Almost done",
    ];

    let messageIndex = 0;
    showStatus(loadingMessages[0], "loading");

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      showStatus(loadingMessages[messageIndex], "loading");
    }, 1500);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("user_email", user?.email || "");

      const response = await fetch(`${API_URL}upload-resume`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      setResumeFile(file);
      setHasResume(true); // Update the hasResume state
      clearInterval(messageInterval);
      showStatus("Resume uploaded successfully!", "success");
    } catch (error) {
      clearInterval(messageInterval);
      showStatus("Failed to upload resume", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleCoverLetterUpload = async () => {
    if (!coverLetterFile || !user?.email) return;
    setUploading(true);
    setError("");

    // Dynamic loading messages for cover letter upload
    const loadingMessages = [
      "Uploading cover letter",
      "Processing document",
      "Validating format",
      "Finalizing upload",
    ];

    let messageIndex = 0;
    showStatus(loadingMessages[0], "loading");

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      showStatus(loadingMessages[messageIndex], "loading");
    }, 1200);

    const fd = new FormData();
    fd.append("cover_letter", coverLetterFile);
    fd.append("user_email", user.email);

    try {
      const res = await fetch(`${API_URL}upload-cover-letter`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (res.ok) {
        setHasCoverLetter(true);
        setCoverLetterFile(null);
        localStorage.removeItem("cover_letter_file_name");
        showStatus("Cover letter uploaded successfully! ✨", "success");
      } else {
        const errorMsg =
          data.detail || "Cover letter upload failed. Try again.";
        setError(errorMsg);
        showStatus(errorMsg, "error");
      }
    } catch {
      const errorMsg = "Network error. Try again.";
      setError(errorMsg);
      showStatus(errorMsg, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    if (canGenerate) {
      showStatus("Redirecting to Job Kit...", "info");
      router.push("/job-kit");
    } else {
      setShowPaywall(true);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.clear();
  };

  if (authLoading || entLoading) {
    return (
      <p className="text-center mt-10 text-muted-foreground">
        Loading dashboard...
      </p>
    );
  }
  if (!user) {
    router.replace("/");
    return null;
  }
  if (!userData) {
    return (
      <p className="text-center mt-10 text-muted-foreground">
        Loading dashboard...
      </p>
    );
  }

  return (
    <>
      <StatusBar
        message={status.message}
        type={status.type}
        visible={status.visible}
        onClose={hideStatus}
      />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header with gradient */}
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Smart Apply Dashboard
              </span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome to Your Career Hub
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Upload your documents and let AI transform your job search
              experience
            </p>
          </div>

          {/* User Card */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-white/20 shadow-xl">
            <CardContent className="flex items-center gap-4 p-6">
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  className="h-16 w-16 rounded-full object-cover ring-4 ring-blue-500/20"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-semibold text-white shadow-lg">
                  {user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </div>
              )}
              <div className="flex-1">
                <p className="text-xl font-semibold text-slate-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {user?.email ?? "LinkedIn member"}
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Active</span>
              </div>
            </CardContent>
          </Card>

          {/* Upload Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Resume */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold">
                    Upload Resume (PDF) *
                  </h2>
                </div>
                {hasResume && (
                  <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-green-700 dark:text-green-300 font-medium text-sm">
                      ✓ Resume uploaded and locked
                    </p>
                  </div>
                )}
                <label
                  htmlFor="resume"
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-40 cursor-pointer transition-all duration-300 ${
                    hasResume
                      ? "opacity-60 cursor-not-allowed border-gray-300 dark:border-gray-600"
                      : "hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <Input
                    id="resume"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    ref={resumeInputRef}
                    onChange={onResumeChange}
                    disabled={hasResume}
                  />
                  {resumeFile ? (
                    <p className="text-sm">{resumeFile.name}</p>
                  ) : (
                    <p
                      className={`text-sm ${
                        hasResume
                          ? "text-muted-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {hasResume
                        ? "Resume uploaded"
                        : localStorage.getItem("resume_file_name")
                        ? `Last selected: ${localStorage.getItem(
                            "resume_file_name"
                          )}`
                        : "Click to upload PDF"}
                    </p>
                  )}
                </label>
              </CardContent>
            </Card>

            {/* Cover Letter */}
            <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <Upload className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold">
                    Upload Cover Letter (PDF)
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Optional: Enhance your applications with a personalized cover
                  letter.
                </p>

                <label
                  htmlFor="cover-letter"
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-40 cursor-pointer transition-all duration-300 ${
                    !hasResume || hasCoverLetter
                      ? "opacity-60 cursor-not-allowed border-gray-300 dark:border-gray-600"
                      : "hover:border-purple-400 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <Input
                    id="cover-letter"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    ref={coverLetterInputRef}
                    onChange={onCoverLetterChange}
                    disabled={!hasResume || hasCoverLetter}
                  />
                  {coverLetterFile ? (
                    <p className="text-sm">{coverLetterFile.name}</p>
                  ) : (
                    <p
                      className={`text-sm ${
                        hasCoverLetter
                          ? "text-muted-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {!hasResume
                        ? "Upload resume first to unlock"
                        : hasCoverLetter
                        ? "Cover letter uploaded"
                        : localStorage.getItem("cover_letter_file_name")
                        ? `Last selected: ${localStorage.getItem(
                            "cover_letter_file_name"
                          )}`
                        : "Click to upload PDF (optional)"}
                    </p>
                  )}
                </label>

                <Input
                  id="cover-letter"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  ref={coverLetterInputRef}
                  onChange={onCoverLetterChange}
                  disabled={!hasResume || hasCoverLetter}
                />

                {hasResume && !hasCoverLetter && coverLetterFile && (
                  <Button
                    size="sm"
                    className="w-full mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={handleCoverLetterUpload}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Uploading...
                      </div>
                    ) : (
                      "Upload Cover Letter"
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p className="text-red-700 dark:text-red-300 font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Free credit badge */}
          {!isPremium && freeRemain > 0 && hasResume && (
            <div className="text-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-blue-700 dark:text-blue-300 font-medium">
                {freeRemain} / 5 free credits remaining
              </p>
            </div>
          )}

          {/* Paywall modal */}
          <PricingModal open={showPaywall} onOpenChange={setShowPaywall} />

          {/* CTA buttons */}
          {!hasResume ? (
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={uploading}
              onClick={() => resumeInputRef.current?.click()}
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Uploading...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  {resumeFile
                    ? "Upload Selected Resume"
                    : "Select & Upload Resume"}
                </div>
              )}
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={handleContinue}
            >
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Continue to Job Kit
              </div>
            </Button>
          )}

          {/* Job Scan List */}
          <JobScanList reports={userData.reports} />
        </div>
      </main>
    </>
  );
}
