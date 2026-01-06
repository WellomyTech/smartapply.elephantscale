import Link from "next/link";
import { Sparkles, FileText, Mic } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("dashboard")

  return (
    <main className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-6 md:py-20 px-4">
      {/* Header */}
      <div className="text-center space-y-3 mb-6">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {t("title")}
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          {t("subtitle")}
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* ResumeForge Card - Blue */}
        <Link href="/dashboard/resume" className="group w-full md:w-96">
          <div className="h-56 bg-blue-50/80 dark:bg-slate-800/80 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all duration-300 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-md">
            <div className="flex items-center justify-center mb-2">
              <FileText className="h-10 w-10 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-1 tracking-tight">
              {t("cards.resume.title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center px-6">
              {t("cards.resume.description")}
            </p>
          </div>
        </Link>

        {/* InterviewPilot Card - Emerald */}
        <Link href="/dashboard/interview" className="group w-full md:w-96">
          <div className="h-56 bg-emerald-50/80 dark:bg-slate-800/80 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all duration-300 border-2 border-emerald-200 dark:border-emerald-700 hover:border-emerald-400 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-md">
            <div className="flex items-center justify-center mb-2">
              <Mic className="h-10 w-10 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-2xl font-semibold text-emerald-700 dark:text-emerald-300 mb-1 tracking-tight">
              {t("cards.technical.title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center px-6">
              {t("cards.technical.description")}
            </p>
          </div>
        </Link>
        
        {/* Behavioral Card - Rose */}
        <Link href="/dashboard/behavioral" className="group w-full md:w-96">
          <div className="h-56 bg-rose-50/80 dark:bg-slate-800/80 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all duration-300 border-2 border-rose-200 dark:border-rose-700 hover:border-rose-400 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-md">
            <div className="flex items-center justify-center mb-2">
              <Mic className="h-10 w-10 text-rose-600 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-2xl font-semibold text-rose-700 dark:text-rose-300 mb-1 tracking-tight">
              {t("cards.behavioral.title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center px-6">
              {t("cards.behavioral.description")}
            </p>
          </div>
        </Link>
        </div>

      <div className="flex flex-col md:flex-row gap-9 mt-6">
         <Link href="/ai-career/dashboard" className="group w-full md:w-96">
          <div className="h-56 bg-blue-50/80 dark:bg-slate-800/80 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all duration-300 border-2 border-blue-200 dark:border-blue-700 hover:border-blue-400 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-md">
            <div className="flex items-center justify-center mb-2">
              <FileText className="h-10 w-10 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <h2 className="text-2xl font-semibold text-blue-700 dark:text-blue-300 mb-1 tracking-tight">
              {t("cards.career.title")}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-center px-6">
              {t("cards.career.description")}
            </p>
          </div>
        </Link>
      </div>
    </main>
  );
}
