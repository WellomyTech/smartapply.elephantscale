import React from "react";
import { Briefcase, FileText } from "lucide-react";

interface JobScanCardProps {
  jobTitle: string;
  companyName: string;
  location?: string;
  date?: string;
  status?: string;
}

export default function JobScanCard({
  jobTitle,
  companyName,
  location,
  date,
  status,
}: JobScanCardProps) {
  return (
    <div className="h-56 bg-white/80 dark:bg-slate-800/80 rounded-2xl shadow-xl flex flex-col items-center justify-center transition-all duration-300 border-2 border-blue-100 dark:border-slate-700 hover:border-blue-400 hover:shadow-2xl hover:-translate-y-1 backdrop-blur-md px-6">
      <div className="flex items-center justify-center mb-2">
        <Briefcase className="h-10 w-10 text-blue-600" />
      </div>
      <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-1 tracking-tight text-center">
        {jobTitle}
      </h2>
      <p className="text-md text-purple-700 dark:text-purple-300 font-medium mb-1 text-center">
        {companyName}
      </p>
      {location && (
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{location}</p>
      )}
      {date && (
        <p className="text-xs text-muted-foreground text-center">{date}</p>
      )}
      {status && (
        <span className="mt-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
          {status}
        </span>
      )}
    </div>
  );
}