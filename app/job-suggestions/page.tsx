"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Heart } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import RouteGuard from "@/components/RouteGuard";

// Dummy data (replace later with LinkedIn API results)
export type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  mode: "Onsite" | "Remote" | "Hybrid" | string;
  type: "Full-time" | "Part-time" | string;
  salary: string;
  match: number; // 0-100
  tags?: string[];
  createdAt?: string; // ISO date for sorting in "Recently Added"
  profileUrl?: string;
};

// Selected skills (dummy)
const initialSkills: string[] = ["React", "Node.js", "SQL", "AWS"];

// Skill grouping types and defaults
type SkillCategory = "tech" | "soft";
type SkillGroups = { tech: string[]; soft: string[] };
const initialSkillGroups: SkillGroups = {
  tech: ["React", "Node.js", "SQL", "AWS", "Python"],
  soft: ["Leadership", "Communication", "Problem-Solving", "Teamwork"],
};

const jobs: Job[] = [
  {
    id: 1,
    title: "Tech Support Specialist",
    company: "Platform Science",
    location: "United States",
    mode: "Remote",
    type: "Full-time",
    salary: "$26/hr - $30/hr",
    match: 80,
    tags: ["Work/Life Balance", "H1B Sponsor Likely"],
    createdAt: "2025-09-27",
    profileUrl: "https://company.example/jobs/1",
  },
  {
    id: 2,
    title: "Frontend Engineer",
    company: "ElephantScale",
    location: "Austin, TX",
    mode: "Hybrid",
    type: "Full-time",
    salary: "$120k - $150k",
    match: 86,
    tags: ["Modern Stack", "Great Team"],
    createdAt: "2025-09-29",
    profileUrl: "https://company.example/jobs/2",
  },
  {
    id: 3,
    title: "Customer Success Manager",
    company: "Acme Corp",
    location: "New York, NY",
    mode: "Onsite",
    type: "Full-time",
    salary: "$90k - $110k",
    match: 72,
    tags: ["Growth", "Healthcare"],
    createdAt: "2025-09-25",
    profileUrl: "https://company.example/jobs/3",
  },
  {
    id: 4,
    title: "Data Analyst",
    company: "Globex",
    location: "Remote",
    mode: "Remote",
    type: "Part-time",
    salary: "$45/hr - $55/hr",
    match: 65,
    tags: ["SQL", "Python"],
    createdAt: "2025-09-22",
    profileUrl: "https://company.example/jobs/4",
  },
  {
    id: 5,
    title: "Junior QA Tester",
    company: "TechNova",
    location: "Chicago, IL",
    mode: "Onsite",
    type: "Full-time",
    salary: "$50k - $60k",
    match: 42,
    tags: ["Entry Level", "Training Provided"],
    createdAt: "2025-09-30",
    profileUrl: "https://company.example/jobs/5",
  },
];

function matchLabel(match: number): string {
  if (match > 80) return "Excellent Match";
  if (match >= 60) return "Good Match";
  return "Fair/Low Match";
}

// Salary parsing for potential future sorting
function salaryToValue(s: string | undefined): number {
  if (!s) return 0;
  // extract numbers like 26, 30, 90, 110, 120k
  const nums = Array.from(String(s).matchAll(/(\d+(?:\.\d+)?)(k)?/gi)).map((m) => {
    const n = parseFloat(m[1]);
    return m[2] ? n * 1000 : n;
  });
  if (nums.length === 0) return 0;
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return avg;
}

// Suggestions shown in the modal (pretend extracted from resume)
const suggestedTech = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "JavaScript",
  "Python",
  "Django",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "AWS",
  "Docker",
  "Kubernetes",
  "Git",
];
const suggestedSoft = [
  "Leadership",
  "Communication",
  "Teamwork",
  "Problem-Solving",
  "Adaptability",
  "Time Management",
  "Collaboration",
  "Critical Thinking",
  "Creativity",
  "Attention to Detail",
];

// Replace simple skills summary with grouped view and a button to open modal
function SkillsSummary({ groups, onEdit }: { groups: SkillGroups; onEdit: () => void }) {
  const Section = ({ title, items }: { title: string; items: string[] }) => (
    <div>
      <div className="text-xs font-semibold text-slate-500 mb-2">{title}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((s) => (
          <span key={s} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            {s}
          </span>
        ))}
        {items.length === 0 && <span className="text-xs text-slate-400">None</span>}
      </div>
    </div>
  );
  return (
    <div className="rounded-xl border shadow-md backdrop-blur-md bg-white/80 dark:bg-slate-800/80 px-4 py-3 flex items-start justify-between gap-6">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="Tech Skills" items={groups.tech} />
        <Section title="Soft Skills" items={groups.soft} />
      </div>
      <div className="shrink-0 pt-1">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-sm text-blue-700 underline hover:opacity-80 dark:text-blue-300"
          aria-label="Edit selected skills"
        >
          <Pencil className="h-4 w-4" />
          Edit Skills
        </button>
      </div>
    </div>
  );
}

function ringColor(match: number): string {
  if (match > 80) return "#22c55e"; // green
  if (match >= 60) return "#3b82f6"; // blue
  return "#f97316"; // orange
}

// Transparent percentage block with ring and gradient percentage text
function PercentBlock({ match }: { match: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(match)));
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct / 100);
  const color = ringColor(pct);
  const textGrad =
    pct > 80
      ? "from-green-500 to-emerald-600"
      : pct >= 60
      ? "from-blue-500 to-indigo-500"
      : "from-orange-500 to-red-500";
  return (
    <div className="min-w-[150px] shrink-0">
      <div className="relative w-20 h-20 mx-auto">
        <svg viewBox="0 0 72 72" className="w-20 h-20">
          <circle cx="36" cy="36" r={radius} stroke="#e5e7eb" strokeWidth={6} fill="transparent" />
          <circle
            cx="36"
            cy="36"
            r={radius}
            stroke={color}
            strokeWidth={6}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 300ms ease" }}
          />
        </svg>
        <div className={`absolute inset-0 flex items-center justify-center text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${textGrad}`}>
          {pct}%
        </div>
      </div>
      <div className="mt-1.5 text-center text-xs font-medium text-slate-700 dark:text-slate-300">{matchLabel(pct)}</div>
    </div>
  );
}

function isNew(createdAt?: string): boolean {
  if (!createdAt) return false;
  const d = new Date(createdAt).getTime();
  return Date.now() - d < 7 * 24 * 60 * 60 * 1000; // within 7 days
}

function JobCard({
  job,
  liked,
  applied,
  onToggleLike,
  onApply,
  onOpenProfile,
}: {
  job: Job;
  liked: boolean;
  applied: boolean;
  onToggleLike: (id: number) => void;
  onApply: (id: number) => void;
  onOpenProfile: (url?: string) => void;
}) {
  return (
    <div className="relative rounded-2xl border bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-0.5 p-4">
      {isNew(job.createdAt) && (
        <span className="absolute left-2 top-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          New
        </span>
      )}

      {/* Top-right percent card */}
      <div className="absolute top-3 right-14">
        <PercentBlock match={job.match} />
      </div>

      {/* Like button at far right */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => onToggleLike(job.id)}
              className="absolute top-3 right-3"
              aria-label={liked ? "Remove from Saved" : "Save Job"}
            >
              {liked ? (
                <Heart className="h-6 w-6 text-red-500 fill-red-500" />
              ) : (
                <Heart className="h-6 w-6 text-gray-400" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>{liked ? "Remove from Saved" : "Save Job"}</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className={`flex items-start justify-between gap-4 ${isNew(job.createdAt) ? 'mt-6' : ''}`}>
        <div className="flex-1 min-w-0">
          <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate">{job.title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 truncate">{job.company} — {job.location}</p>
          <p className="text-sm mt-1">
            {job.mode} · {job.type}
          </p>
          <p className="text-sm mt-1">{job.salary}</p>
          {/* Small Apply button positioned under salary, left-most */}
          <div className="mt-2">
            {applied ? (
              <button className="px-3 py-1.5 rounded-md bg-gray-500 text-white text-xs" onClick={() => onOpenProfile(job.profileUrl)}>
                Applied ✓
              </button>
            ) : (
              <Link
                href={job.profileUrl ? `/application-options?linkedin_url=${encodeURIComponent(job.profileUrl)}` : "/application-options"}
                onClick={() => {
                  try { sessionStorage.setItem("applicationJob", JSON.stringify(job)); } catch {}
                }}
                className="px-3 py-1.5 rounded-md text-white text-xs bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm transition-all duration-200 hover:brightness-105 hover:-translate-y-[1px] hover:shadow-md inline-flex items-center justify-center"
              >
                Apply Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function JobSuggestionsPage() {
  const [skills] = useState<string[]>(initialSkills);
  // Grouped skills and modal state
  const [skillGroups, setSkillGroups] = useState<SkillGroups>(initialSkillGroups);
  const [editOpen, setEditOpen] = useState(false);
  const [tempGroups, setTempGroups] = useState<SkillGroups>(skillGroups);

  // Status filters + sorting
  const [statusFilter, setStatusFilter] = useState<"all" | "applied" | "liked">("all");
  const [sortBy, setSortBy] = useState<"match" | "salary" | "date">("match");
  const [likedJobs, setLikedJobs] = useState<number[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const router = useRouter();

  const displayedJobs = useMemo(() => {
    let list = jobs.slice();
    if (statusFilter === "applied") list = list.filter((j) => appliedJobs.includes(j.id));
    if (statusFilter === "liked") list = list.filter((j) => likedJobs.includes(j.id));
    if (sortBy === "match") list.sort((a, b) => b.match - a.match);
    if (sortBy === "salary") list.sort((a, b) => salaryToValue(b.salary) - salaryToValue(a.salary));
    if (sortBy === "date") list.sort((a, b) => (new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    return list;
  }, [statusFilter, sortBy, likedJobs, appliedJobs, skillGroups]);

  const toggleLike = (jobId: number) => setLikedJobs((prev) => (prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]));
  const openProfile = (url?: string) => { if (url && typeof window !== "undefined") window.location.href = url; };
  const applyToJob = (jobId: number) => {
    const job = jobs.find((j) => j.id === jobId);
    const href = (() => {
      const url = job?.profileUrl || (job as any)?.linkedin_url || "";
      const qs = url ? `?linkedin_url=${encodeURIComponent(url)}` : "";
      return `/application-options${qs}`;
    })();

    if (typeof window !== "undefined" && job) {
      try { sessionStorage.setItem("applicationJob", JSON.stringify(job)); } catch {}
    }

    router.push(href);
    if (typeof window !== "undefined") {
      setTimeout(() => {
        if (!window.location.pathname.includes("/application-options")) {
          window.location.href = href;
        }
      }, 80);
    }
  };

  const countApplied = appliedJobs.length;
  const countLiked = likedJobs.length;
  const pill = (active: boolean) => `px-4 py-2 rounded-lg border text-sm transition-colors ${active ? "bg-slate-900 text-white border-slate-900 dark:bg-slate-800" : "bg-white border-slate-200 hover:bg-slate-50"}`;

  // Modal helpers
  const openEdit = () => {
    setTempGroups({ tech: [...skillGroups.tech], soft: [...skillGroups.soft] });
    setEditOpen(true);
  };
  const cancelEdit = () => setEditOpen(false);
  const saveEdit = () => { setSkillGroups(tempGroups); setEditOpen(false); };

  const isSelected = (cat: SkillCategory, s: string) => tempGroups[cat].some((x) => x.toLowerCase() === s.toLowerCase());
  const toggleSelect = (cat: SkillCategory, s: string) => {
    setTempGroups((prev) => {
      const inCat = prev[cat].some((x) => x.toLowerCase() === s.toLowerCase());
      // ensure exclusivity: remove from both first
      const nextTech = prev.tech.filter((x) => x.toLowerCase() !== s.toLowerCase());
      const nextSoft = prev.soft.filter((x) => x.toLowerCase() !== s.toLowerCase());
      if (!inCat) {
        if (cat === "tech") nextTech.push(s); else nextSoft.push(s);
      }
      return { tech: nextTech, soft: nextSoft };
    });
  };

  return (
    <RouteGuard requireResume>
      <main className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-6 md:py-20 px-4">
        <div className="w-full max-w-6xl space-y-6">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="space-y-2 text-left">
              <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Job Suggestions
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">Personalized matches based on your skills and preferences.</p>
            </div>
            <div className="flex items-center gap-2">
              <button className={pill(statusFilter === "all")} onClick={() => setStatusFilter("all")}>
                All
              </button>
              <button className={pill(statusFilter === "applied")} onClick={() => setStatusFilter("applied")}>
                Applied <span className="ml-1 text-xs opacity-80">({countApplied})</span>
              </button>
              <button className={pill(statusFilter === "liked")} onClick={() => setStatusFilter("liked")}>
                Liked <span className="ml-1 text-xs opacity-80">({countLiked})</span>
              </button>
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="ml-2 px-3 py-2 rounded-lg border bg-white text-sm dark:bg-slate-900 dark:border-slate-700"
                aria-label="Sort jobs by"
              >
                <option value="match">Highest Matched</option>
                <option value="salary">Salary (High → Low)</option>
                <option value="date">Recently Added</option>
              </select>
            </div>
          </div>

          {/* Grouped Skills summary */}
          <SkillsSummary groups={skillGroups} onEdit={openEdit} />

          {/* Edit Skills Modal */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Edit Skills
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tech suggestions */}
                <div>
                  <div className="text-xs font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    Tech Skills
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTech.map((s) => {
                      const selected = isSelected("tech", s);
                      return (
                        <button
                          key={`tech-${s}`}
                          type="button"
                          onClick={() => toggleSelect("tech", s)}
                          className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                            selected
                              ? "bg-blue-600 text-white border-blue-600"
                              : "bg-transparent text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Soft suggestions */}
                <div>
                  <div className="text-xs font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    Soft Skills
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSoft.map((s) => {
                      const selected = isSelected("soft", s);
                      return (
                        <button
                          key={`soft-${s}`}
                          type="button"
                          onClick={() => toggleSelect("soft", s)}
                          className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                            selected
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-transparent text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 rounded-lg border bg-white text-sm dark:bg-slate-900 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-slate-800"
                >
                  Save
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                liked={likedJobs.includes(job.id)}
                applied={appliedJobs.includes(job.id)}
                onToggleLike={toggleLike}
                onApply={applyToJob}
                onOpenProfile={openProfile}
              />
            ))}
          </div>

          <div className="text-center">
            <Link href="/dashboard" className="inline-block mt-6 text-sm text-slate-700 dark:text-slate-300 hover:underline">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </RouteGuard>
  );
}
