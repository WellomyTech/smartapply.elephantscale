import React from 'react'

interface Report {
  id: number
  job_description?: string // make optional in case API doesn't return it
  created_at?: string
}

interface JobScanListProps {
  reports: Report[]
}

const JobScanList: React.FC<JobScanListProps> = ({ reports }) => {
  if (!reports || reports.length === 0) {
    return (
      <div className="mt-8 text-center text-gray-500 text-sm">
        No past scans found.
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-4">
      <h2 className="text-lg font-bold text-gray-800">Your Job Scans</h2>
      {reports.map((report) => (
        <div
          key={report.id}
          className="border rounded-xl p-4 bg-white shadow-sm"
        >
          <div className="text-sm text-gray-700 font-semibold">
            Job ID #{report.id}
          </div>

          <div className="text-sm text-gray-600 mt-1 line-clamp-3">
            {report.job_description
              ? `${report.job_description.substring(0, 300)}...`
              : "No description available"}
          </div>

          <div className="text-xs text-gray-400 mt-2">
            Created on:{" "}
            {report.created_at
              ? new Date(report.created_at).toLocaleDateString()
              : "N/A"}
          </div>
        </div>
      ))}
    </div>
  )
}

export default JobScanList
