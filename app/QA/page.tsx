'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/components/AuthProvider';
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Clipboard,
  Download,
  RefreshCw,
  Sparkles,
  LogOut,
} from 'lucide-react';

type QAPair = { q: string; a: string };

const API_URL = process.env.NEXT_PUBLIC_API_BASE;
const QA_POST_PATH = 'generate-question-answers';

export default function QAPage() {
  const router = useRouter();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [reportId, setReportId] = useState<string | null>(null);
  const [raw, setRaw] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // --- header height state (keeps content below the app header)
  const [headerH, setHeaderH] = useState<number>(64);

  useEffect(() => {
    const header = document.getElementById('site-header') || (document.querySelector('header') as HTMLElement | null);
    const update = () => {
      if (header?.offsetHeight) setHeaderH(header.offsetHeight);
    };
    update();
    const ro = header ? new ResizeObserver(update) : null;
    if (header && ro) ro.observe(header);
    const onResize = () => update();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      ro?.disconnect();
    };
  }, []);

  const jobTitle = typeof window !== 'undefined' ? localStorage.getItem('job_title') || '' : '';
  const companyName = typeof window !== 'undefined' ? localStorage.getItem('company_name') || '' : '';
  const interviewType = typeof window !== 'undefined' ? localStorage.getItem('interview_type') || '' : '';

  useEffect(() => {
    const getReportId = () => {
      if (typeof window === 'undefined') return null;
      const url = new URL(window.location.href);
      return url.searchParams.get('report_id') || localStorage.getItem('report_id');
    };

    const id = getReportId();
    if (!id) {
      setError('Missing report_id.');
      setLoading(false);
      return;
    }
    setReportId(id);
    void loadQA(id);
  }, []);

  const loadQA = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}${QA_POST_PATH}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ report_id: String(id) }),
        cache: 'no-store',
      });

      if (!res.ok) throw new Error(`Failed to generate Q&A (HTTP ${res.status})`);
      const data = await res.json();
      setRaw(String(data?.question_answers || ''));
    } catch (e: any) {
      setError(e?.message || 'Failed to load Q&A');
    } finally {
      setLoading(false);
    }
  };

  const parsed = useMemo(() => parseQAText(raw), [raw]);

  const handleCopyAll = async () => {
    const md = toMarkdown(parsed);
    await navigator.clipboard.writeText(md);
    alert('All Q&A copied to clipboard.');
  };

  const handleDownload = () => {
    const md = toMarkdown(parsed);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeTitle = (jobTitle || 'Interview').replace(/[^\w\-]+/g, '_');
    a.href = url;
    a.download = `${safeTitle}_QA_${reportId || 'report'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = async () => {
    if (reportId) await loadQA(reportId);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Centered container used across sections (keeps content inside the red lines)
  const containerClass = 'mx-auto max-w-5xl px-4 sm:px-6 lg:px-8';

  return (
    <main
      style={{ paddingTop: `${headerH}px` }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-blue/10 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-5"
    >
      {/* Hero */}
      <section className={`${containerClass} pt-8`}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-blue/10 to-purple-500/10 border border-brand-blue/30 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-brand-blue" />
              <span className="text-xs font-medium text-brand-blue dark:text-brand-blue">
                Interview Q&A
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-brand-blue">
              Practice Answers Tailored to Your Role
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
              {jobTitle ? (
                <span className="inline-flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium">{jobTitle}</span>
                </span>
              ) : null}
              {companyName ? (
                <span className="inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  <span className="font-medium">@ {companyName}</span>
                </span>
              ) : null}
              {interviewType ? (
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} Interview
                </span>
              ) : null}
            </div>
          </div>

          
        </div>
      </section>

      {/* Toolbar */}
      <section className={`${containerClass} mt-6`}>
        <Card className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50 shadow-lg rounded-2xl">
          <CardContent className="p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-300">
                These Q&A are generated specifically for your scanned role.
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleRegenerate} className="text-sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
                <Button variant="outline" onClick={handleCopyAll} className="text-sm">
                  <Clipboard className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
                <Button onClick={handleDownload} className="text-sm bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-700 hover:to-sky-700 text-white">
                  <Download className="h-4 w-4 mr-2" />
                  Download .md
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Content */}
      <section className={`${containerClass} mt-6 space-y-6`}>
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <Card className="bg-red-50 border-red-200 text-red-800 rounded-2xl">
            <CardContent className="p-6">{error}</CardContent>
          </Card>
        ) : parsed.length === 0 ? (
          <Card className="bg-amber-50 border-amber-200 text-amber-800 rounded-2xl">
            <CardContent className="p-6">No Q&amp;A found from the API.</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {parsed.map((item, idx) => (
              <QACard key={idx} index={idx + 1} q={item.q} a={item.a} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

// Attractive loading skeleton
function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-6">
      <div className="w-12 h-12 border-4 border-indigo-500/60 border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground font-medium">Generating Q&amp;A...</p>
      <div className="w-full max-w-5xl grid gap-4 md:grid-cols-2 mt-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border bg-white/70 dark:bg-slate-800/70 shadow-sm">
            <div className="h-4 w-3/5 bg-slate-200/70 dark:bg-slate-700/50 rounded mb-3" />
            <div className="h-3 w-11/12 bg-slate-200/70 dark:bg-slate-700/50 rounded mb-2" />
            <div className="h-3 w-4/5 bg-slate-200/70 dark:bg-slate-700/50 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function QACard({ index, q, a }: { index: number; q: string; a: string }) {
  const copyOne = async () => {
    const block = `Q${index}: ${q}\n\n${a}\n`;
    await navigator.clipboard.writeText(block);
    alert(`Copied Q${index} to clipboard.`);
  };

  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50 shadow-lg rounded-2xl">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold">
              <FileBadge index={index} />
              Question {index}
            </div>
            <h3 className="text-base font-semibold leading-6 break-words">{q}</h3>
          </div>
          <Button variant="outline" size="sm" onClick={copyOne} className="text-xs">
            <Clipboard className="h-3.5 w-3.5 mr-1.5" />
            Copy
          </Button>
        </div>

        <div className="mt-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 p-4">
          <div className="text-[0.8rem] uppercase tracking-wide text-slate-500 mb-1">Answer</div>
          <div className="text-sm whitespace-pre-wrap leading-6">{a}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function FileBadge({ index }: { index: number }) {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-indigo-500 text-white text-[10px] font-bold">
      {index}
    </span>
  );
}

function parseQAText(text: string): Array<{ q: string; a: string }> {
  if (!text) return [];

  // Normalize
  let src = String(text).trim();
  // Strip enclosing single/double quotes if present
  if ((src.startsWith("'") && src.endsWith("'")) || (src.startsWith('"') && src.endsWith('"'))) {
    src = src.slice(1, -1).trim();
  }
  src = src.replace(/\r\n/g, "\n");
  // Fix doubled apostrophes often coming from SQL-style escaping
  src = src.replace(/''/g, "'");

  const items: Array<{ q: string; a: string }> = [];

  // Pattern 1: Numbered pairs Q1:/A1: (A may be on next line or same line)
  const reNumbered =
    /Q(\d+):\s*([\s\S]*?)(?:\n|\s{2,})A\1:\s*([\s\S]*?)(?=\s*Q\d+:|$)/gi;
  let m: RegExpExecArray | null;
  while ((m = reNumbered.exec(src)) !== null) {
    items.push({ q: m[2].trim(), a: m[3].trim() });
  }
  if (items.length) return items;

  // Pattern 2: Unnumbered Q:/A: pairs
  const reGeneric = /Q:\s*([\s\S]*?)(?:\n|\s{2,})A:\s*([\s\S]*?)(?=\s*Q:|$)/gi;
  while ((m = reGeneric.exec(src)) !== null) {
    items.push({ q: m[1].trim(), a: m[2].trim() });
  }
  if (items.length) return items;

  // Pattern 3: Fallback — try looser split by next Q#
  const reLoose =
    /Q\d*:\s*([\s\S]*?)\s*A\d*:\s*([\s\S]*?)(?=\s*Q\d*:\s*|$)/gi;
  while ((m = reLoose.exec(src)) !== null) {
    items.push({ q: m[1].trim(), a: m[2].trim() });
  }

  return items;
}

function toMarkdown(items: Array<{ q: string; a: string }>): string {
  if (!items.length) return '';
  return items
    .map(
      (item, i) => `### Q${i + 1}: ${item.q}\n\n${item.a}\n\n${i < items.length - 1 ? '---\n' : ''}`
    )
    .join('\n');
}