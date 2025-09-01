'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
<<<<<<< HEAD
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
=======
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369

interface Report {
  id: number
  job_title?: string
  job_company?: string
}

interface JobScanListProps {
  reports: Report[]
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE

<<<<<<< HEAD
export default function JobScanList({ reports }: JobScanListProps) {
=======
const JobScanList: React.FC<JobScanListProps> = ({ reports }) => {
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
  const router = useRouter()

  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
<<<<<<< HEAD
  const [generatingId, setGeneratingId] = useState<number | string | null>(null)

  // async function fetchResumeInfo(reportId: number) {
  //   setLoading(True)
  //   try {
  //     const userEmail = localStorage.getItem('user_email')
  //     const res = await fetch(`${API_URL}user-dashboard?user_email=${userEmail}&report_id=${reportId}`)
  //     const data = await res.json()
  //     if (data?.report) {
  //       setSelectedReport(data.report)
  //       setIsModalOpen(true)
  //     } else {
  //       alert('No data found!')
  //     }
  //   } catch (err) {
  //     console.error('Error fetching resume info:', err)
  //     alert('Failed to fetch data')
  //   } finally {
  //     setLoading(False)
  //   }
  // }

  const handleInterview = async (reportId: number, jobTitle?: string, companyName?: string) => {
    setGeneratingId(reportId)
=======

  const fetchResumeInfo = async (reportId: number) => {
    setLoading(true)
    try {
      const userEmail = localStorage.getItem('user_email')
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

  const [generatingId, setGeneratingId] = useState<number | string | null>(null);

  const handleInterview = async (reportId: number, jobTitle?: string, companyName?: string) => {
    setGeneratingId(reportId);
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
    try {
      const response = await fetch(`${API_URL}generate-interview-questions`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ report_id: String(reportId) }),
<<<<<<< HEAD
      })
      if (!response.ok) throw new Error('Failed to generate questions')

      localStorage.setItem('report_id', String(reportId))
      localStorage.setItem('job_title', jobTitle || '')
      localStorage.setItem('company_name', companyName || '')

      router.push(`/interview?report_id=${reportId}`)
    } catch (err) {
      alert('Error generating questions. Please try again.')
    } finally {
      setGeneratingId(null)
    }
  }

  const handleViewQA = (reportId: number, jobTitle?: string, companyName?: string) => {
    localStorage.setItem('report_id', String(reportId))
    localStorage.setItem('job_title', jobTitle || '')
    localStorage.setItem('company_name', companyName || '')
    router.push(`/QA?report_id=${reportId}`)
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground text-sm">
        No past scans found.
      </div>
    )
  }

  return (
  <div className="mt-8 space-y-3">
    <h2 className="text-xl font-semibold text-foreground mb-2">Your Job Scans</h2>

    <div className="grid gap-3">
      {reports.map((report) => (
        <Card key={report.id} className="border bg-card text-card-foreground shadow-sm">
          {/* Mobile-first: stack; desktop: row */}
          <CardContent className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Job title + company */}
            <div className="min-w-0">
              <div className="text-sm font-semibold break-words">
                {report.job_title || 'Untitled role'}
              </div>
              <div className="text-xs text-muted-foreground break-words">
                {report.job_company || '—'}
              </div>
            </div>

            {/* Right: actions (full-width on mobile, inline on ≥sm) */}
            <div className="flex flex-wrap gap-2 sm:flex-nowrap sm:justify-end w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => {
                  const userEmail =
                    localStorage.getItem('user_email') || localStorage.getItem('userEmail')
                  if (!userEmail) {
                    alert('User email not found!')
                    return
                  }
                  router.push(`/job-info/${encodeURIComponent(userEmail)}/${report.id}`)
                }}
              >
                Resume Info
              </Button>

              <Button
                variant="secondary"
                className="w-full sm:w-auto"
                onClick={() => handleViewQA(report.id, report.job_title, report.job_company)}
              >
                Interview Q&A
              </Button>

              <Button
                className="w-full sm:w-auto"
                onClick={() => handleInterview(report.id, report.job_title, report.job_company)}
                disabled={generatingId === report.id}
              >
                {generatingId === report.id ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating…
                  </span>
                ) : (
                  'Mock Interview'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Dialog unchanged below */}
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Resume Info</DialogTitle>
          <DialogDescription>Details from your previous scan.</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading…
          </div>
        ) : selectedReport ? (
          <div className="space-y-3">
            <p><strong>Job Title:</strong> {selectedReport.job_title}</p>
            <p><strong>Company:</strong> {selectedReport.job_company}</p>
            <p className="text-sm"><strong>Description:</strong></p>
            <pre className="bg-muted rounded p-3 whitespace-pre-wrap break-words text-sm">
              {selectedReport.job_description}
            </pre>
            <div className="grid gap-3">
              <div>
                <p className="font-medium text-sm">Skills Match</p>
                <pre className="bg-muted rounded p-3 whitespace-pre-wrap break-words text-xs">
                  {JSON.stringify(selectedReport.skills_match, null, 2)}
                </pre>
              </div>
              <div>
                <p className="font-medium text-sm">Gaps</p>
                <pre className="bg-muted rounded p-3 whitespace-pre-wrap break-words text-xs">
                  {JSON.stringify(selectedReport.gaps, null, 2)}
                </pre>
              </div>
              <div>
                <p className="font-medium text-sm">Bonus Points</p>
                <pre className="bg-muted rounded p-3 whitespace-pre-wrap break-words text-xs">
                  {JSON.stringify(selectedReport.bonus_points, null, 2)}
                </pre>
              </div>
              <div>
                <p className="font-medium text-sm">Recommendations</p>
                <pre className="bg-muted rounded p-3 whitespace-pre-wrap break-words text-xs">
                  {JSON.stringify(selectedReport.recommendations, null, 2)}
                </pre>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  </div>
)

}
=======
      });

      if (!response.ok) throw new Error('Failed to generate questions');

      localStorage.setItem('report_id', String(reportId));
      localStorage.setItem('job_title', jobTitle || "");
      localStorage.setItem('company_name', companyName || "");

      router.push(`/interview?report_id=${reportId}`);
    } catch (err) {
      alert('Error generating questions. Please try again.');
    } finally {
      setGeneratingId(null);
    }
  };

  // NEW: route to QA page; page will POST to /generate-question-answers
  const handleViewQA = (reportId: number, jobTitle?: string, companyName?: string) => {
    localStorage.setItem('report_id', String(reportId));
    localStorage.setItem('job_title', jobTitle || '');
    localStorage.setItem('company_name', companyName || '');
    router.push(`/QA?report_id=${reportId}`);
  };

  return (
    <div className="mt-8 space-y-3">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Your Job Scans</h2>

      {reports.map((report) => (
        <div key={report.id} className="border rounded-xl p-4 bg-white shadow-sm flex justify-between items-center">
          <div>
            <div className="text-sm text-gray-700 font-semibold">{report.job_title}</div>
            <div className="text-xs text-gray-500">{report.job_company}</div>
          </div>
          <div className="flex gap-2">
            {/* Resume Info button */}
            <button
              onClick={() => {
                const userEmail = localStorage.getItem('user_email') || localStorage.getItem('userEmail');
                if (!userEmail) {
                  alert('User email not found!');
                  return;
                }
                router.push(`/job-info/${encodeURIComponent(userEmail)}/${report.id}`);
              }}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
            >
              Resume Info
            </button>

            {/* Interview Q&A button */}
            <button
              onClick={() => handleViewQA(report.id, report.job_title, report.job_company)}
              className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
            >
              Interview Q&A
            </button>
            
            {/* Mock Interview button */}
            <button
              onClick={() => handleInterview(report.id, report.job_title, report.job_company)}
              disabled={generatingId === report.id}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
            >
              {generatingId === report.id ? "Generating questions..." : "Mock Interview"}
            </button>


            
          </div>
        </div>
      ))}

      {/* Modal for Resume Info (unchanged) */}
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
              <p><strong>Job Title:</strong> {selectedReport.job_title}</p>
              <p><strong>Company:</strong> {selectedReport.job_company}</p>
              <p><strong>Description:</strong> {selectedReport.job_description}</p>
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

// 'use client'
// import React, { useState } from 'react'
// import { useRouter } from 'next/navigation'

// interface Report {
//   id: number
//   job_title?: string
//   job_company?: string
// }

// interface JobScanListProps {
//   reports: Report[]
// }


// const API_URL = process.env.NEXT_PUBLIC_API_BASE

// const JobScanList: React.FC<JobScanListProps> = ({ reports }) => {

//     const router = useRouter()


//   const [selectedReport, setSelectedReport] = useState<any | null>(null)
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [loading, setLoading] = useState(false)
  

//   const fetchResumeInfo = async (reportId: number) => {
//     setLoading(true)
//     try {
//       const userEmail = localStorage.getItem('user_email') // ✅ Ensure you save email in localStorage
//       const res = await fetch(
//         `${API_URL}user-dashboard?user_email=${userEmail}&report_id=${reportId}`
//       )
//       const data = await res.json()
//       if (data?.report) {
//         setSelectedReport(data.report)
//         setIsModalOpen(true)
//       } else {
//         alert('No data found!')
//       }
//     } catch (error) {
//       console.error('Error fetching resume info:', error)
//       alert('Failed to fetch data')
//     }
//     setLoading(false)
//   }

//   if (!reports || reports.length === 0) {
//     return (
//       <div className="mt-8 text-center text-gray-500 text-sm">
//         No past scans found.
//       </div>
//     )
//   }

// const [generatingId, setGeneratingId] = useState<number | string | null>(null);

// const handleInterview = async (reportId, jobTitle, companyName) => {
//   setGeneratingId(reportId);
//   try {
//     const response = await fetch(`${API_URL}generate-interview-questions`, {
//       method: 'POST',
//       headers: {
//         'Accept': 'application/json',
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       body: new URLSearchParams({ report_id: String(reportId) }),
//     });

//     if (!response.ok) throw new Error('Failed to generate questions');

//     // Save to localStorage
//     localStorage.setItem('report_id', String(reportId));
//     localStorage.setItem('job_title', jobTitle || "");
//     localStorage.setItem('company_name', companyName || "");

//     router.push(`/interview?report_id=${reportId}`);
//   } catch (err) {
//     alert('Error generating questions. Please try again.');
//   } finally {
//     setGeneratingId(null);
//   }
// };

//   const handleViewQA = (reportId: number, jobTitle?: string, companyName?: string) => {
//     // Persist context for the QA page header
//     localStorage.setItem('report_id', String(reportId));
//     localStorage.setItem('job_title', jobTitle || '');
//     localStorage.setItem('company_name', companyName || '');
//     router.push(`/QA?report_id=${reportId}`);
//   };



//   return (
//     <div className="mt-8 space-y-3">
//       <h2 className="text-xl font-bold text-gray-800 mb-4">Your Job Scans</h2>

// {reports.map((report) => (
//   <div key={report.id} className="border rounded-xl p-4 bg-white shadow-sm flex justify-between items-center">
//     <div>
//       <div className="text-sm text-gray-700 font-semibold">{report.job_title}</div>
//       <div className="text-xs text-gray-500">{report.job_company}</div>
//     </div>
//     <div className="flex gap-2">
//       <button
//   onClick={() => handleInterview(report.id, report.job_title, report.job_company)}
//   disabled={generatingId === report.id}
//   className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
// >
//   {generatingId === report.id ? "Generating questions..." : "Interview"}
// </button>

//             <button
//               onClick={() => handleViewQA(report.id, report.job_title, report.job_company)}
//               className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition"
//             >
//               Interview Q&A
//             </button>


//        <button
//               onClick={() => {
//                 const userEmail = localStorage.getItem('user_email') || localStorage.getItem('userEmail');
//                 if (!userEmail) {
//                   alert('User email not found!');
//                   return;
//                 }
//                 router.push(`/job-info/${encodeURIComponent(userEmail)}/${report.id}`);
//               }}
//               className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
//             >
//               Resume Info
//             </button>
            
//     </div>
//   </div>
// ))}


//       {/* ✅ Modal for Resume Info */}
//       {isModalOpen && selectedReport && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-lg max-w-lg w-full relative max-h-[80vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
//               <h3 className="text-xl font-bold">Resume Info</h3>
//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="text-red-500 font-bold text-lg hover:text-red-700"
//               >
//                 ✕
//               </button>
//             </div>

//             <div className="p-4 space-y-2">
//               <p>
//                 <strong>Job Title:</strong> {selectedReport.job_title}
//               </p>
//               <p>
//                 <strong>Company:</strong> {selectedReport.job_company}
//               </p>
//               <p>
//                 <strong>Description:</strong> {selectedReport.job_description}
//               </p>

//               <p>
//                 <strong>Skills Match:</strong>{' '}
//                 <pre className="whitespace-pre-wrap break-words bg-gray-100 p-2 rounded-lg">
//                   {JSON.stringify(selectedReport.skills_match, null, 2)}
//                 </pre>
//               </p>

//               <p>
//                 <strong>Gaps:</strong>{' '}
//                 <pre className="whitespace-pre-wrap break-words bg-gray-100 p-2 rounded-lg">
//                   {JSON.stringify(selectedReport.gaps, null, 2)}
//                 </pre>
//               </p>

//               <p>
//                 <strong>Bonus Points:</strong>{' '}
//                 <pre className="whitespace-pre-wrap break-words bg-gray-100 p-2 rounded-lg">
//                   {JSON.stringify(selectedReport.bonus_points, null, 2)}
//                 </pre>
//               </p>

//               <p>
//                 <strong>Recommendations:</strong>{' '}
//                 <pre className="whitespace-pre-wrap break-words bg-gray-100 p-2 rounded-lg">
//                   {JSON.stringify(selectedReport.recommendations, null, 2)}
//                 </pre>
//               </p>

//               <button
//                 onClick={() => setIsModalOpen(false)}
//                 className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   )
// }

// export default JobScanList

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
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
