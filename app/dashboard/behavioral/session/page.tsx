'use client'

export const dynamic = 'force-dynamic'

import { Suspense, type ComponentType } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Sparkles, Mic, Crown, Users } from 'lucide-react'

type TopicKey = 'communication' | 'leadership' | 'teamwork'

const TOPIC_CONFIG: Record<
  TopicKey,
  {
    title: string
    blurb: string
    icon: ComponentType<{ className?: string }>
    color: {
      text: string
      ring: string
      hover: string
      gradientFrom: string
      gradientTo: string
    }
  }
> = {
  communication: {
    title: 'Communication',
    blurb: 'Improve clarity, active listening, and concise delivery.',
    icon: Mic,
    color: {
      text: 'text-blue-700 dark:text-blue-300',
      ring: 'border-blue-100 dark:border-slate-700',
      hover: 'hover:border-blue-400',
      gradientFrom: 'from-blue-600',
      gradientTo: 'to-indigo-600',
    },
  },
  leadership: {
    title: 'Leadership',
    blurb: 'Demonstrate ownership, influence, and decision-making.',
    icon: Crown,
    color: {
      text: 'text-purple-700 dark:text-purple-300',
      ring: 'border-purple-100 dark:border-slate-700',
      hover: 'hover:border-purple-400',
      gradientFrom: 'from-purple-600',
      gradientTo: 'to-pink-600',
    },
  },
  teamwork: {
    title: 'Teamwork',
    blurb: 'Showcase collaboration, conflict resolution, and empathy.',
    icon: Users,
    color: {
      text: 'text-indigo-700 dark:text-indigo-300',
      ring: 'border-indigo-100 dark:border-slate-700',
      hover: 'hover:border-indigo-400',
      gradientFrom: 'from-indigo-600',
      gradientTo: 'to-blue-600',
    },
  },
}

export default function BehavioralSessionPage() {
  return (
    <Suspense fallback={<SessionSkeleton />}>
      <SessionContent />
    </Suspense>
  )
}

function SessionSkeleton() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12">
      <div className="text-center space-y-3 mb-10 animate-pulse">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Behavioral Coach</span>
        </div>
        <div className="h-10 w-64 bg-slate-200/60 dark:bg-slate-700/60 rounded mx-auto" />
        <div className="h-5 w-80 bg-slate-200/60 dark:bg-slate-700/60 rounded mx-auto" />
      </div>
      <div className="w-full max-w-3xl h-64 bg-white/60 dark:bg-slate-800/60 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700 animate-pulse" />
    </main>
  )
}

function SessionContent() {
  const sp = useSearchParams()
  const rawTopic = (sp.get('topic') || '').toLowerCase()
  const topic = (['communication', 'leadership', 'teamwork'].includes(rawTopic) ? rawTopic : 'communication') as TopicKey

  const cfg = TOPIC_CONFIG[topic]
  const Icon = cfg.icon

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12">
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Behavioral Coach</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {cfg.title} Practice
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">{cfg.blurb}</p>
      </div>

      <div className={`w-full max-w-3xl bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl border-2 ${cfg.color.ring} ${cfg.color.hover} backdrop-blur-md`}>
        <div className="flex flex-col items-center justify-center p-8">
          <div className="flex items-center justify-center mb-4">
            <Icon className={`h-12 w-12 ${cfg.color.text}`} />
          </div>
          <h2 className={`text-2xl font-semibold mb-2 tracking-tight ${cfg.color.text}`}>{cfg.title} Session</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-2xl mb-8">
            This unified page adapts to your selection. Hook your agent flow here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className={`px-6 py-3 rounded-xl text-white font-semibold shadow-lg transition-all bg-gradient-to-r ${cfg.color.gradientFrom} ${cfg.color.gradientTo} hover:brightness-110`}
              onClick={() => alert(`Starting ${cfg.title} practice...`)}
            >
              Start Practice
            </button>
            <Link
              href="/dashboard/behavioral"
              className="px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm hover:shadow transition-all text-center"
            >
              Back to Topics
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}