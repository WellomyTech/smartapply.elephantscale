"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { useResume } from "@/components/ResumeProvider";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Check,
  X,
  LogOut,
  Loader2,
  Sparkles,
  Target,
  Briefcase,
  FileText,
  Zap,
  Search,
  HelpCircle,
  Building2,
  Link,
  AlertCircle,
} from "lucide-react";
import DashboardButton from "@/components/DashboardButton";
import { StatusBar, useStatusBar } from "@/components/ui/status-bar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SkillsMatchItem {
  skill: string;
  in_job: boolean;
  in_resume: boolean;
}
interface CompareApiResponse {
  report_id?: number;
  job_title?: string;
  job_company?: string;
  skills_match: SkillsMatchItem[];
  gaps: string[];
  bonus_points: string[];
  recommendations: string[];
  google_doc_link?: string;
  raw?: string;
  error?: string;
}
interface Compare422 {
  status: number; // 422
  detail?: { message?: string; missing_fields?: string[] };
  error?: string;
  raw?: string;
  google_doc_link?: string;
}

async function compareResumeJob({
  jobDescription,
  jobTitle,
  jobCompany,
  jobLink, // 👈 NEW
}: {
  jobDescription: string;
  jobTitle?: string;
  jobCompany?: string;
  jobLink?: string; // 👈 NEW
}) {
  const API_KEY = process.env.NEXT_PUBLIC_API_BASE as string;
  const email =
    typeof window !== "undefined"
      ? window.localStorage.getItem("user_email") || ""
      : "";

  const form = new FormData();
  form.append("user_email", email);
  form.append("job_description", jobDescription);
  if (jobTitle) form.append("job_title", jobTitle);
  if (jobCompany) form.append("job_company", jobCompany);
  if (jobLink) form.append("job_link", jobLink); // 👈 NEW

  const res = await fetch(`${API_KEY}compare-resume-job`, {
    method: "POST",
    body: form,
    headers: { accept: "application/json" },
  });

  let data: any;
  try {
    data = await res.json();
  } catch {
    return { error: "Could not parse API response." } as Compare422;
  }

  if (res.status === 422) {
    return {
      status: 422,
      detail: data?.detail,
      error: data?.detail?.message || "Missing required job metadata.",
      raw: data?.raw,
      google_doc_link: data?.google_doc_link,
    } as Compare422;
  }

  if (!res.ok || data?.error) {
    return {
      status: res.status,
      error: data?.error || "Unknown error",
      raw: data?.raw,
      google_doc_link: data?.google_doc_link,
    } as Compare422;
  }

  if (data?.report_id && typeof window !== "undefined") {
    window.localStorage.setItem("report_id", String(data.report_id));
  }
  return data as CompareApiResponse;
}

type GenDocsInput = {
  reportId: number;
  userEmail: string;
  additionalSkills: string;
  jobDescription?: string;
  jobLink?: string;
};

type GenerateResumeResponse = {
  // adjust names if your API differs
  resume_text?: string;
  cover_letter_text?: string;
  // any extras your API returns
  google_doc_link?: string;
  [k: string]: any;
};

export async function generateDocuments({
  reportId,
  userEmail,
  additionalSkills,
  jobDescription,
  jobLink,
}: GenDocsInput) {
  if (!reportId) throw new Error("No report ID provided");
  const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || "").replace(
    /\/?$/,
    "/"
  );

  const body = new URLSearchParams();
  body.set("report_id", String(reportId));
  body.set("user_email", userEmail);
  body.set("additional_skills", additionalSkills);
  if (jobDescription) body.set("job_description", jobDescription || "");
  if (jobLink) body.set("job_link", jobLink || ""); // 👈 NEW

  const res = await fetch(`${API_BASE}generate-resume`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    console.error("POST /generate-resume failed:", res.status, text);
    throw new Error(`generate-resume failed: ${res.status}`);
  }

  let data: GenerateResumeResponse;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {} as any;
  }

  // Save results (be tolerant to slight key name changes)
  const resume = data.updated_resume ?? (data as any).resume ?? "";
  const cover = data.cover_letter ?? (data as any).cover_letter ?? "";

  if (typeof window !== "undefined") {
    if (resume && String(resume).trim().length) {
      localStorage.setItem("generated_resume", String(resume));
      console.log("✅ saved generated_resume (len=%d)", String(resume).length);
    } else {
      console.warn("⚠️ No resume-like field found. Keys:", Object.keys(data));
    }

    if (cover && String(cover).trim().length) {
      localStorage.setItem("generated_cover_letter", String(cover));
      console.log(
        "✅ saved generated_cover_letter (len=%d)",
        String(cover).length
      );
    } else {
      console.warn(
        "⚠️ No cover_letter-like field found. Keys:",
        Object.keys(data)
      );
    }
  }

  return data; // return in case caller wants links/metadata too
}

export default function JobKitPage() {
  const API_KEY = process.env.NEXT_PUBLIC_API_BASE as string;
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const { resumeFile } = useResume(); // (kept in case you need it later)

  const [jobUrl, setJobUrl] = useState("");
  const [jobUrlError, setJobUrlError] = useState("");
  const [description, setDescription] = useState("");

  // separate inputs for job title & company
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");

  const [email, setEmail] = useState(user?.email ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CompareApiResponse | null>(null);
  const [workedOn, setWorkedOn] = useState<boolean[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const [hasResume, setHasResume] = useState<boolean>(false);

  const [showMissingModal, setShowMissingModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [jobCompanyInput, setJobCompanyInput] = useState("");
  const [submittingMeta, setSubmittingMeta] = useState(false);

  // Safe display values (no localStorage during SSR)
  const [displayJobTitle, setDisplayJobTitle] = useState("");
  const [displayJobCompany, setDisplayJobCompany] = useState("");

  // Status bar hook
  const { status, showStatus, hideStatus } = useStatusBar();

  // Keep email from auth
  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  // Check if user has uploaded a resume
  useEffect(() => {
    if (!user?.email) return;

    const checkResume = async () => {
      try {
        const response = await fetch(
          `${API_KEY}user-dashboard?user_email=${encodeURIComponent(
            user.email || ""
          )}`
        );
        if (response.ok) {
          const data = await response.json();
          setHasResume(data.has_resume === 1);
        }
      } catch (error) {
        console.error("Failed to check resume status:", error);
        setHasResume(false);
      }
    };

    checkResume();
  }, [user?.email, API_KEY]);

  // URL validation function
  const validateUrl = (url: string) => {
    if (!url.trim()) {
      setJobUrlError("Job link is required");
      return false;
    }
    try {
      const urlObj = new URL(url);
      if (!["http:", "https:"].includes(urlObj.protocol)) {
        setJobUrlError("Please enter a valid HTTP or HTTPS URL");
        return false;
      }
      setJobUrlError("");
      return true;
    } catch {
      setJobUrlError(
        "Please enter a valid URL (e.g., https://www.linkedin.com/jobs/view/123456789)"
      );
      return false;
    }
  };

  // Persist fields (client-only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("job_url", jobUrl);
    if (jobUrl.trim()) {
      validateUrl(jobUrl);
    }
  }, [jobUrl]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("job_description", description);
  }, [description]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("job_title", jobTitle);
  }, [jobTitle]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("job_company", jobCompany);
  }, [jobCompany]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("user_email", email);
  }, [email]);
  useEffect(() => {
    if (typeof window === "undefined" || !result) return;
    window.localStorage.setItem("compare_result", JSON.stringify(result));
  }, [result]);
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("worked_on", JSON.stringify(workedOn));
  }, [workedOn]);
  useEffect(() => {
    if (typeof window === "undefined" || !generatedResume) return;
    window.localStorage.setItem("generated_resume", generatedResume);
  }, [generatedResume]);

  // Update workedOn after getting a result
  useEffect(() => {
    if (!result) return;
    setWorkedOn(
      result.skills_match.filter((s) => s.in_job).map((s) => !!s.in_resume)
    );
  }, [result]);

  // Compute display job title/company on client only
  // Wipe Job Kit data when this page opens
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // delete ONLY Job Kit keys (keeps auth/user_email intact)
      const keys = [
        "job_title",
        "job_company",
        "job_description",
        "job_url",
        "compare_result",
        "worked_on",
        "report_id",
        "generated_resume",
        "latex_resume",
        "generated_cover_letter",
        "latex_cover",
      ];
      keys.forEach((k) => window.localStorage.removeItem(k));
    } catch (e) {
      console.error("Failed to clear Job Kit localStorage keys", e);
    }

    // reset UI state
    setJobTitle("");
    setJobCompany("");
    setDescription("");
    setResult(null);
    setWorkedOn([]);
    setGeneratedResume(null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const lsTitle = window.localStorage.getItem("job_title");
    const lsCompany = window.localStorage.getItem("job_company");
    const title = (result?.job_title ?? lsTitle ?? jobTitle ?? "")
      .toString()
      .trim();
    const company = (result?.job_company ?? lsCompany ?? jobCompany ?? "")
      .toString()
      .trim();
    setDisplayJobTitle(title);
    setDisplayJobCompany(company);
  }, [result?.job_title, result?.job_company, jobTitle, jobCompany]);

  if (!isLoading && !user) {
    router.replace("/");
    return null;
  }
  if (isLoading) {
    return (
      <main className="py-8">
        <div className="container min-h-[60vh] grid place-items-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </main>
    );
  }

  function buildAdditionalSkills() {
    if (!result?.skills_match?.length) return "N/A";
    // indices of workedOn align to skills filtered by in_job (see your table + setter)
    const jobSkills = result.skills_match.filter((s) => s.in_job);
    const picked = jobSkills
      .map((s, i) => (workedOn[i] ? s.skill : ""))
      .filter(Boolean);

    return picked.length ? picked.join(", ") : "N/A";
  }

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    if (!hasResume) {
      showStatus("Please upload your resume first from the dashboard", "error");
      return;
    }
    if (!description.trim()) {
      showStatus("Please enter a job description", "warning");
      return;
    }
    if (!jobUrl.trim()) {
      showStatus("Please enter a job link", "warning");
      return;
    }
    if (!validateUrl(jobUrl)) {
      showStatus("Please enter a valid job URL", "warning");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);

    // Dynamic loading messages with animations
    const loadingMessages = [
      "Analyzing job requirements with AI",
      "Processing job description",
      "Comparing with your resume",
      "Generating skill analysis",
      "Creating optimized resume",
      "Crafting personalized cover letter",
      "Finalizing your documents",
    ];

    let messageIndex = 0;
    showStatus(loadingMessages[0], "loading");

    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      showStatus(loadingMessages[messageIndex], "loading");
    }, 2000);

    try {
      const compareRes = await compareResumeJob({
        jobDescription: description || "",
        jobTitle: jobTitle?.trim() || undefined,
        jobCompany: jobCompany?.trim() || undefined,
        jobLink: jobUrl?.trim() || undefined,
      });

      if ((compareRes as Compare422).status === 422) {
        const err = compareRes as Compare422;
        const missing = err.detail?.missing_fields?.length
          ? err.detail.missing_fields
          : ["job_title", "job_company"];
        setMissingFields(missing);
        setJobTitleInput(jobTitle || "");
        setJobCompanyInput(jobCompany || "");
        setShowMissingModal(true);
        clearInterval(messageInterval);
        showStatus("Missing job details required", "warning");
        setLoading(false);
        return;
      }

      if ("error" in (compareRes as any) && !(compareRes as any).skills_match) {
        const err = compareRes as Compare422;
        clearInterval(messageInterval);
        setError(err.error || "An error occurred.");
        showStatus(err.error || "Analysis failed", "error");
        setResult(null); // Don't show results section on error
        setLoading(false);
        return;
      }

      const ok = compareRes as CompareApiResponse;
      if (ok.job_title && typeof window !== "undefined") {
        window.localStorage.setItem("job_title", ok.job_title);
      }
      if (ok.job_company && typeof window !== "undefined") {
        window.localStorage.setItem("job_company", ok.job_company);
      }
      if (jobUrl && typeof window !== "undefined") {
        window.localStorage.setItem("job_url", jobUrl);
      }

      setResult(ok);
      clearInterval(messageInterval);

      showStatus("Analysis complete! Review your results below.", "success");
    } catch (err: any) {
      clearInterval(messageInterval);
      setError(err?.message ?? "An error occurred.");
      showStatus(err?.message ?? "Analysis failed", "error");
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    logout();
    if (typeof window !== "undefined") window.localStorage.clear();
  };

  const compareDisabled =
    loading ||
    !hasResume ||
    !description.trim() ||
    !jobUrl.trim() ||
    !!jobUrlError ||
    !jobTitle.trim() ||
    !jobCompany.trim();

  return (
    <TooltipProvider>
      <StatusBar
        message={status.message}
        type={status.type}
        visible={status.visible}
        onClose={hideStatus}
      />
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
        <div className="container mx-auto px-4 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 backdrop-blur-sm">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                AI-Powered Job Analysis
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Job Kit Scanner
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compare your resume against job requirements and get AI-powered
              recommendations
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-white/20 rounded-xl hover:bg-white/90"
            >
              <Target className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="flex gap-3">
              <DashboardButton />
              <Button
                variant="outline"
                onClick={handleLogout}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-white/20 rounded-xl hover:bg-white/90"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {!result ? (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-white/20 shadow-2xl rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                  <Search className="h-6 w-6 text-blue-600" />
                  Job Analysis Form
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {!hasResume && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                      <AlertCircle className="h-5 w-5" />
                      <p className="font-medium">Resume Required</p>
                    </div>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                      Please upload your resume from the dashboard before
                      proceeding with job analysis.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
                      onClick={() => router.push("/dashboard")}
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                )}
                <form onSubmit={handleCompare} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="job-title"
                          className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                        >
                          <Briefcase className="inline h-4 w-4 mr-1" />
                          Job Title <span className="text-red-500">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Enter the exact job title from the job posting.
                              This helps our AI understand the role requirements
                              and tailor your resume accordingly.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Enter the exact job title from the job posting.
                              This helps our AI understand the role requirements
                              and tailor your resume accordingly.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="job-title"
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="e.g., Senior Software Engineer"
                        className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor="job-company"
                          className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                        >
                          <Building2 className="inline h-4 w-4 mr-1" />
                          Company Name <span className="text-red-500">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Enter the company name exactly as it appears in
                              the job posting. This helps personalize your cover
                              letter and resume.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Enter the company name exactly as it appears in
                              the job posting. This helps personalize your cover
                              letter and resume.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id="job-company"
                        type="text"
                        value={jobCompany}
                        onChange={(e) => setJobCompany(e.target.value)}
                        placeholder="e.g., Google, Microsoft, Apple"
                        className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="job-link"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        <Link className="inline h-4 w-4 mr-1" />
                        Job Link <span className="text-red-500">*</span>
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Paste the complete URL of the job posting. Make sure
                            it's a valid link starting with https://. This
                            allows you to apply directly after generating your
                            documents.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Paste the complete URL of the job posting. Make sure
                            it's a valid link starting with https://. This
                            allows you to apply directly after generating your
                            documents.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Input
                      id="job-link"
                      type="url"
                      value={jobUrl}
                      onChange={(e) => setJobUrl(e.target.value)}
                      placeholder="e.g., https://www.linkedin.com/jobs/view/123456789"
                      className={`rounded-xl border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 ${
                        jobUrlError ? "border-red-500 focus:border-red-500" : ""
                      }`}
                      required
                    />
                    {jobUrlError && (
                      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <span>{jobUrlError}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor="job-desc"
                        className="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        <FileText className="inline h-4 w-4 mr-1" />
                        Job Description <span className="text-red-500">*</span>
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Copy and paste the complete job description from the
                            job board. Include requirements, responsibilities,
                            and qualifications for the most accurate AI
                            analysis.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Copy and paste the complete job description from the
                            job board. Include requirements, responsibilities,
                            and qualifications for the most accurate AI
                            analysis.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Textarea
                      id="job-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={20}
                      placeholder="Paste the complete job description here..."
                      className="rounded-xl border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                      required
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                      <Sparkles className="h-3 w-3" />
                      <span>
                        All fields marked with{" "}
                        <span className="text-red-500">*</span> are required for
                        AI analysis
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                      <p className="text-red-700 dark:text-red-300 font-medium">
                        {error}
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={compareDisabled}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Analyzing with AI Scanner...
                      </div>
                    ) : !hasResume ? (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Upload Resume Required
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Start AI Job Analysis
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            // After successful compare: modern summary card
            <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200/30 backdrop-blur-sm rounded-2xl shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-t-2xl">
                <CardTitle className="text-white text-lg font-bold text-center flex items-center justify-center gap-2">
                  <Check className="h-5 w-5" />
                  Analysis Complete - Recruiter's View
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {displayJobTitle || "—"}
                  </div>
                  <div className="text-lg text-muted-foreground font-medium">
                    {displayJobCompany || "—"}
                  </div>
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm font-medium mt-2">
                    <Sparkles className="h-3 w-3" />
                    AI Analysis Ready
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {result && (
            <div className="space-y-8">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-white/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Target className="h-6 w-6 text-blue-600" />
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      AI Job Scan Results
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-700 hover:to-slate-800 [&>th]:text-white [&>th]:font-bold [&>th]:py-4">
                          <TableHead>Skills</TableHead>
                          <TableHead className="text-center">
                            Job Requirement
                          </TableHead>
                          <TableHead className="text-center">
                            In Resume
                          </TableHead>
                          <TableHead className="text-center">
                            Have You Worked On It?
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.skills_match
                          .filter(({ in_job }) => in_job)
                          .map(({ skill, in_job, in_resume }, i) => {
                            const showRadio = result.gaps.includes(skill);
                            return (
                              <TableRow key={skill}>
                                <TableCell className="font-medium">
                                  {skill}
                                </TableCell>
                                <TableCell className="text-center">
                                  {in_job ? (
                                    <Check className="inline h-5 w-5 text-green-600" />
                                  ) : (
                                    <X className="inline h-5 w-5 text-red-600" />
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {in_resume ? (
                                    <Check className="inline h-5 w-5 text-green-600" />
                                  ) : (
                                    <X className="inline h-5 w-5 text-red-600" />
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
                                  {showRadio ? (
                                    <RadioGroup
                                      className="flex items-center justify-center gap-6"
                                      value={String(workedOn[i])}
                                      onValueChange={(val) => {
                                        setWorkedOn((arr) => {
                                          const copy = [...arr];
                                          copy[i] = val === "true";
                                          return copy;
                                        });
                                      }}
                                    >
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                          id={`yes-${i}`}
                                          value="true"
                                        />
                                        <Label htmlFor={`yes-${i}`}>Yes</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <RadioGroupItem
                                          id={`no-${i}`}
                                          value="false"
                                        />
                                        <Label htmlFor={`no-${i}`}>No</Label>
                                      </div>
                                    </RadioGroup>
                                  ) : null}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                      <TableCaption className="text-left">
                        Only job-required skills are listed.
                      </TableCaption>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-white/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-500" />
                    <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                      Bonus Points
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    {result.bonus_points.map((bp) => (
                      <li key={bp}>{bp}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card> */}

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                onClick={async () => {
                  if (!result?.report_id) return;
                  setGenerating(true);
                  showStatus("Generating AI-optimized documents...", "loading");

                  try {
                    await generateDocuments({
                      reportId: result.report_id,
                      userEmail:
                        user?.email ??
                        (typeof window !== "undefined"
                          ? localStorage.getItem("user_email") || ""
                          : ""),
                      additionalSkills: buildAdditionalSkills(),
                      jobDescription: description?.trim() || undefined, // optional in API
                      jobLink: jobUrl?.trim() || undefined, // optional in API
                    });

                    showStatus("Documents generated successfully!", "success");
                    setTimeout(() => {
                      router.push("/job-kit/result");
                    }, 1000);
                  } catch (error) {
                    console.error(error);
                    showStatus("Failed to generate documents", "error");
                  } finally {
                    setGenerating(false);
                  }
                }}
                disabled={generating || !result?.report_id}
              >
                {generating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating AI-Optimized Resume...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6" />
                    Generate AI Resume & Cover Letter
                  </div>
                )}
              </Button>
            </div>
          )}

          {/* Modern modal for missing meta */}
          {showMissingModal && (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm px-4">
              <div className="w-full max-w-md rounded-2xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-6 shadow-2xl border border-white/20">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-3">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">Complete Job Details</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We need a few more details to provide accurate AI analysis.
                  </p>
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <Label htmlFor="job-title-modal">
                      Job Title{" "}
                      {missingFields.includes("job_title") && (
                        <span className="text-destructive">*</span>
                      )}
                    </Label>
                    <Input
                      id="job-title-modal"
                      type="text"
                      className="mt-1 w-full rounded-xl border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="e.g., Senior Software Engineer"
                      value={jobTitleInput}
                      onChange={(e) => setJobTitleInput(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="job-company-modal">
                      Company Name{" "}
                      {missingFields.includes("job_company") && (
                        <span className="text-destructive">*</span>
                      )}
                    </Label>
                    <Input
                      id="job-company-modal"
                      type="text"
                      className="mt-1 w-full rounded-xl border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="e.g., Acme Corp"
                      value={jobCompanyInput}
                      onChange={(e) => setJobCompanyInput(e.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowMissingModal(false)}
                    disabled={submittingMeta}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setJobTitle(jobTitleInput);
                      setJobCompany(jobCompanyInput);
                      setShowMissingModal(false);
                    }}
                    disabled={submittingMeta}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
                  >
                    {submittingMeta ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Submitting...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Continue Analysis
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </TooltipProvider>
  );
}
