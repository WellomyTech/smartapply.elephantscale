import React from 'react'

interface Report {
  id: number
  job_title?: string
  job_company?: string
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
    <div className="mt-8 space-y-3">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Your Job Scans</h2>
      {reports.map((report) => (
        <div
          key={report.id}
          className="flex justify-between items-center p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition"
        >
          {/* Left Side: Job Info */}
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {report.job_title || 'Unknown Title'}
            </div>
            <div className="text-sm text-gray-500">
              {report.job_company || 'Unknown Company'}
            </div>
          </div>

          {/* Right Side: Interview Button */}
          <button
            onClick={() => alert(`Start interview for Job ID #${report.id}`)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
          >
            Interview Practice
          </button>
        </div>
      ))}
    </div>
  )
}

export default JobScanList


// import React from 'react'

// interface Report {
//   id: number
//    job_title?: string
//   job_company?: string
//   job_description?: string // make optional in case API doesn't return it
//   created_at?: string
// }

// interface JobScanListProps {
//   reports: Report[]
// }

// const JobScanList: React.FC<JobScanListProps> = ({ reports }) => {
//   if (!reports || reports.length === 0) {
//     return (
//       <div className="mt-8 text-center text-gray-500 text-sm">
//         No past scans found.
//       </div>
//     )
//   }

//   return (
//     <div className="mt-8 space-y-4">
//       <h2 className="text-lg font-bold text-gray-800">Your Job Scans</h2>
//       {reports.map((report) => (
//         <div
//           key={report.id}
//           className="border rounded-xl p-4 bg-white shadow-sm"
//         >
//           <div className="text-sm text-gray-700 font-semibold">
//             Job ID #{report.id}
//           </div>
//            {/* Add job title and company */}
//           <div className="text-base font-bold text-gray-900">
//             {report.job_title ? report.job_title : "Unknown Title"}
//           </div>
//           <div className="text-sm text-gray-500 mb-2">
//             {report.job_company ? report.job_company : "Unknown Company"}
//           </div>

//           <div className="text-sm text-gray-600 mt-1 line-clamp-3">
//             {report.job_description
//               ? `${report.job_description.substring(0, 300)}...`
//               : "No description available"}
//           </div>

//           <div className="text-xs text-gray-400 mt-2">
//             Created on:{" "}
//             {report.created_at
//               ? new Date(report.created_at).toLocaleDateString()
//               : "N/A"}
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }

// export default JobScanList
