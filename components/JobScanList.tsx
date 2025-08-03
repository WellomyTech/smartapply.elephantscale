'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Report {
  id: number
  job_title?: string
  job_company?: string
}

interface JobScanListProps {
  reports: Report[]
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE

const JobScanList: React.FC<JobScanListProps> = ({ reports }) => {

    const router = useRouter()

  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchResumeInfo = async (reportId: number) => {
    setLoading(true)
    try {
      const userEmail = localStorage.getItem('user_email') // ✅ Ensure you save email in localStorage
      const res = await fetch(
        `${API_URL}user-dashboard?user_email=${userEmail}&report_id=${reportId}`
      )
      const data = await res.json()
      if (data?.report) {
        setSelectedReport(data.report)
        setIsModalOpen(true)
      } else {
        alert('No data found!')
      }
    } catch (error) {
      console.error('Error fetching resume info:', error)
      alert('Failed to fetch data')
    }
    setLoading(false)
  }

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

          {/* Right Side: Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => alert(`Start interview for Job ID #${report.id}`)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              Interview
            </button>

           <button
              onClick={() => {
                const userEmail = localStorage.getItem('user_email') || localStorage.getItem('userEmail');
                if (!userEmail) {
                  alert('User email not found!');
                  return;
                }
                router.push(`/job-info?email=${encodeURIComponent(userEmail)}&report_id=${report.id}`);
              }}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
            >
              Resume Info
            </button>

          </div>
        </div>
      ))}

      {/* ✅ Modal for Resume Info */}
      {isModalOpen && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full relative max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h3 className="text-xl font-bold">Resume Info</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-red-500 font-bold text-lg hover:text-red-700"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-2">
              <p>
                <strong>Job Title:</strong> {selectedReport.job_title}
              </p>
              <p>
                <strong>Company:</strong> {selectedReport.job_company}
              </p>
              <p>
                <strong>Description:</strong> {selectedReport.job_description}
              </p>

              <p>
                <strong>Skills Match:</strong>{' '}
                <pre className="whitespace-pre-wrap break-words bg-gray-100 p-2 rounded-lg">
                  {JSON.stringify(selectedReport.skills_match, null, 2)}
                </pre>
              </p>

              <p>
                <strong>Gaps:</strong>{' '}
                <pre className="whitespace-pre-wrap break-words bg-gray-100 p-2 rounded-lg">
                  {JSON.stringify(selectedReport.gaps, null, 2)}
                </pre>
              </p>

              <p>
                <strong>Bonus Points:</strong>{' '}
                <pre className="whitespace-pre-wrap break-words bg-gray-100 p-2 rounded-lg">
                  {JSON.stringify(selectedReport.bonus_points, null, 2)}
                </pre>
              </p>

              <p>
                <strong>Recommendations:</strong>{' '}
                <pre className="whitespace-pre-wrap break-words bg-gray-100 p-2 rounded-lg">
                  {JSON.stringify(selectedReport.recommendations, null, 2)}
                </pre>
              </p>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
