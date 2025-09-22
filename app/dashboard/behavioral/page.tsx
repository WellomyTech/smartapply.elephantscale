import Link from "next/link";
import { Sparkles, Mic, Crown, Users } from "lucide-react";

export default function BehavioralDashboardPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-6 md:py-20 px-4">
      {/* Header */}
      <div className="text-center space-y-3 mb-12">
        <h1 className="text-2xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Choose a Topic to Practice
        </h1>
        {/* <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Practice behavioral interview topics with AI voice agent
        </p> */}
      </div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Communication */}
        <Link href="/dashboard/behavioral/session?topic=communication" className="group w-full md:w-96">
          <div className="h-56 bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all duration-300 border-2 border-blue-100 dark:border-slate-700 hover:border-blue-400 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-md">
            <div className="flex items-center justify-center mb-2">
              <Mic className="h-10 w-10 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-1 tracking-tight">
              Communication
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center px-6">
              Improve clarity, active listening, and concise delivery.
            </p>
          </div>
        </Link>

        {/* Leadership */}
        <Link href="/dashboard/behavioral/session?topic=leadership" className="group w-full md:w-96">
          <div className="h-56 bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all duration-300 border-2 border-purple-100 dark:border-slate-700 hover:border-purple-400 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-md">
            <div className="flex items-center justify-center mb-2">
              <Crown className="h-10 w-10 text-purple-600 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-2xl font-semibold text-purple-700 dark:text-purple-300 mb-1 tracking-tight">
              Leadership
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center px-6">
              Demonstrate ownership, influence, and decision-making.
            </p>
          </div>
        </Link>

        {/* Teamwork */}
        <Link href="/dashboard/behavioral/session?topic=teamwork" className="group w-full md:w-96">
          <div className="h-56 bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all duration-300 border-2 border-indigo-100 dark:border-slate-700 hover:border-indigo-400 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-md">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-10 w-10 text-indigo-600 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-2xl font-semibold text-indigo-700 dark:text-indigo-300 mb-1 tracking-tight">
              Team Player
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center px-6">
              Showcase collaboration, conflict resolution, and empathy.
            </p>
          </div>
        </Link>
      </div>
    </main>
  );
}