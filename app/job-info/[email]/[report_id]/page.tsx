'use client'
export const dynamic = 'force-dynamic'

import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut, Loader2, ExternalLink } from 'lucide-react'
import { useEffect, useState } from 'react'
import DashboardButton from '@/components/DashboardButton'

import { useEntitlement } from "@/hooks/useEntitlement"
import PricingModal from "@/components/PricingButtons"

function safeJsonArray(val: any): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  try {
    const arr = JSON.parse(val)
    if (Array.isArray(arr)) return arr
    return []
  } catch {
    return []
  }
}

export default function JobInfoPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE
  const router = useRouter()
  const params = useParams()
  const { user, isLoading, logout } = useAuth()

  const email = Array.isArray(params.email) ? params.email[0] : params.email
  const report_id = Array.isArray(params.report_id) ? params.report_id[0] : params.report_id

  const [jobData, setJobData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSkills, setShowSkills] = useState(false)
  const [workedOn, setWorkedOn] = useState<boolean[]>([])
  const [generating, setGenerating] = useState(false)

    const {
    isLoading: entLoading,
    isPremium,
    canGenerate,
    freeRemain,
  } = useEntitlement()
  const [showPaywall, setShowPaywall] = useState(false)


  useEffect(() => {
    if (!report_id || !email) return
    fetch(`${API_URL}user-dashboard?user_email=${email}&report_id=${report_id}`)
      .then((res) => res.json())
      .then((data) => {
  if (data?.report) {
    // Parse JSON strings if needed
    let report = { ...data.report };
    try {
      if (typeof report.skills_match === "string") {
        report.skills_match = JSON.parse(report.skills_match);
      }
    } catch {}
    try {
      if (typeof report.gaps === "string") {
        report.gaps = JSON.parse(report.gaps);
      }
    } catch {}

    setJobData(report);
    localStorage.setItem('report_id', report.id || report.report_id || report_id)
  }
  setLoading(false)
})

      .catch(() => setLoading(false))
  }, [report_id, email, API_URL])

  // Sync workedOn with gaps count (reset when jobData.gaps changes)
  useEffect(() => {
    if (!jobData) return
    const gaps = safeJsonArray(jobData.gaps)
    setWorkedOn(Array(gaps.length).fill(false))
  }, [jobData?.gaps])

  if (isLoading || loading || !jobData) {
    return (
      <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (!user) {
    router.replace('/')
    return null
  }

  const handleLogout = () => {
    logout()
    localStorage.clear()
  }




  // =============== GENERATE RESUME ===============
  async function handleGenerateResume() {
    if (!user?.email || !jobData) return

    const gaps = safeJsonArray(jobData.gaps)
    const selectedSkills = gaps
      .map((skill, idx) => workedOn[idx] ? skill : null)
      .filter(Boolean)

    if (selectedSkills.length === 0) {
      alert("Please select at least one skill you have worked on.")
      return
    }

    const jobInfoToSend = jobData.job_link ? jobData.job_link : jobData.job_description
    const email = localStorage.getItem('user_email') || ''

    const form = new FormData()
    form.append('user_email', email)
    form.append('additional_skills', selectedSkills.join(', '))
    form.append('job_description', jobInfoToSend)
    if (jobData.id || jobData.report_id) {
      form.append('report_id', (jobData.id || jobData.report_id).toString())
    }

    setGenerating(true)
    try {
      const res = await fetch(`${API_URL}generate-resume`, {
        method: 'POST',
        body: form,
        headers: { accept: 'application/json' }
      })
      const data = await res.json()
      if (data.updated_resume) {
        localStorage.setItem('generated_resume', data.updated_resume)
        if (data.cover_letter) localStorage.setItem('generated_cover_letter', data.cover_letter)
        router.push('/job-kit/result')
      } else {
        alert("No resume generated.")
      }
    } catch (err) {
      alert("Failed to generate resume.")
      console.error(err)
    } finally {
      setGenerating(false)
    }
  }

  const downloadResumeDocx = async () => {
    const API_KEY = process.env.NEXT_PUBLIC_API_BASE;
    const reportId = localStorage.getItem("report_id");
    if (!reportId) {
      alert("No report_id found in localStorage!");
      return;
    }
    try {
      const response = await fetch(`${API_KEY}download-custom-resume-docx?report_id=${reportId}`);
      if (!response.ok) {
        alert("Failed to generate/download resume DOCX");
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.docx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Resume download failed!");
      console.error(err);
    }
  };

  const downloadCoverLetterDocx = async () => {
    const coverLetter = localStorage.getItem('generated_cover_letter');
    if (!coverLetter) {
      alert("No cover letter found in localStorage!");
      return;
    }
    const formData = new FormData();
    formData.append('cover_letter_text', coverLetter);
    try {
      const response = await fetch(`${API_URL}generate-cover-letter-pdf`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to generate cover letter DOCX');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'cover_letter.docx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Cover letter download failed!');
      console.error(err);
    }
  };

  // Always show job meta
  const jobMeta = (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold">{jobData?.job_title || 'Unknown Title'}</h2>
      <p className="text-gray-600">{jobData?.job_company || 'Unknown Company'}</p>
      {jobData?.job_link && (
        <a
          className="inline-flex items-center gap-2 mt-2 text-blue-600 hover:underline"
          href={jobData.job_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink className="h-4 w-4" /> View Job Posting
        </a>
      )}
      <p className="mt-3 text-gray-800 whitespace-pre-wrap">
        {jobData?.job_description}
      </p>
    </div>
  )

  // ----- RENDER -----
  const gaps = safeJsonArray(jobData.gaps)
  const skills_match = Array.isArray(jobData.skills_match) ? jobData.skills_match : []

  // === 1. If showSkills is true, show the skills match UI ===
  if (showSkills) {
    return (
      <div className="min-h-screen bg-[#eef5ff] p-8">
        <header className="flex items-center justify-between max-w-5xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Job Info
            </h1>
          </div>
          <div className="flex gap-2">
            <DashboardButton />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </header>
        {jobMeta}
        <div className="max-w-2xl mx-auto mt-8">
          <Card className="shadow-lg">
            <CardContent>
              <h3 className="text-2xl font-semibold mb-4">Skills Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Skill</th>
                      <th className="px-3 py-2 text-center">In Job</th>
                      <th className="px-3 py-2 text-center">In Resume</th>
                      <th className="px-3 py-2 text-center">Have You Worked On It?</th>
                    </tr>
                  </thead>

                  <tbody>
  {Array.isArray(skills_match) && skills_match
    .filter(({ in_job }) => in_job)
    .map(({ skill, in_job, in_resume }, i) => {
      // Only show radio if in gaps
      const showRadio = gaps.includes(skill)
      return (
        <tr key={skill} className="even:bg-gray-50">
          <td className="px-3 py-2">{skill}</td>
          <td className="px-3 py-2 text-center">
            {in_job
              ? <span className="text-green-600">✔</span>
              : <span className="text-red-600">✘</span>}
          </td>
          <td className="px-3 py-2 text-center">
            {in_resume
              ? <span className="text-green-600">✔</span>
              : <span className="text-red-600">✘</span>}
          </td>
          <td className="px-3 py-2 text-center">
            {showRadio ? (
              <div className="flex justify-center space-x-4">
                <label className="inline-flex items-center space-x-1">
                  <input
                    type="radio"
                    name={`worked-${i}`}
                    checked={workedOn[i] === true}
                    onChange={() =>
                      setWorkedOn(arr => {
                        const copy = [...arr]
                        copy[i] = true
                        return copy
                      })
                    }
                    className="form-radio h-4 w-4"
                  />
                  <span>Yes</span>
                </label>
                <label className="inline-flex items-center space-x-1">
                  <input
                    type="radio"
                    name={`worked-${i}`}
                    checked={workedOn[i] === false}
                    onChange={() =>
                      setWorkedOn(arr => {
                        const copy = [...arr]
                        copy[i] = false
                        return copy
                      })
                    }
                    className="form-radio h-4 w-4"
                  />
                  <span>No</span>
                </label>
              </div>
            ) : null}
          </td>
        </tr>
      )
    })}
</tbody>

                  {/* <tbody>
                    {gaps.map((gapSkill: string, i: number) => {
                      const skillObj = skills_match.find((s: any) => s.skill === gapSkill) || {}
                      return (
                        <tr key={gapSkill} className="even:bg-gray-50">
                          <td className="px-3 py-2">{gapSkill}</td>
                          <td className="px-3 py-2 text-center">
                            <span className="text-green-600">✔</span> 
                          </td>
                          <td className="px-3 py-2 text-center">
                            {skillObj?.in_resume ? (
                              <span className="text-green-600">✔</span>
                            ) : (
                              <span className="text-red-600">✘</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex justify-center space-x-4">
                              <label className="inline-flex items-center space-x-1">
                                <input
                                  type="radio"
                                  name={`worked-${i}`}
                                  checked={workedOn[i] === true}
                                  onChange={() =>
                                    setWorkedOn(arr => {
                                      const copy = [...arr]
                                      copy[i] = true
                                      return copy
                                    })
                                  }
                                  className="form-radio h-4 w-4"
                                />
                                <span>Yes</span>
                              </label>
                              <label className="inline-flex items-center space-x-1">
                                <input
                                  type="radio"
                                  name={`worked-${i}`}
                                  checked={workedOn[i] === false}
                                  onChange={() =>
                                    setWorkedOn(arr => {
                                      const copy = [...arr]
                                      copy[i] = false
                                      return copy
                                    })
                                  }
                                  className="form-radio h-4 w-4"
                                />
                                <span>No</span>
                              </label>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody> */}
                </table>
              </div>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md mt-8"
                onClick={handleGenerateResume}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" /> Generating Resume...
                  </>
                ) : (
                  'Generate Resume and Cover Letter'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // === 2. If resume and cover letter exist, show them and the new button ===
  if (jobData?.updated_resume && jobData?.cover_letter) {
    return (
      <div className="min-h-screen bg-[#eef5ff] p-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Job Info
            </h1>
          </div>
          <div className="flex gap-2">
            <DashboardButton />
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </header>
        {jobMeta}
        {/* Reselect/Add Skills button */}
        <div className="flex justify-center mt-4 mb-8">
          <Button
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
              onClick={() => {
                if (!isPremium) {
                  setShowPaywall(true)
                } else {
                  setShowSkills(true)
                }
              }}
            >
              Reselect/Add Skills
            </Button>
            <PricingModal open={showPaywall} onOpenChange={setShowPaywall} />



        </div>
        <main className="flex flex-row gap-8 w-full h-[calc(100vh-18rem)]">
          {/* Resume */}
          <Card className="flex-1 h-full flex flex-col shadow-lg">
            <CardContent className="flex flex-col h-full">
              <h2 className="text-2xl font-semibold mb-2">Resume</h2>
              <div className="flex-1 bg-gray-50 rounded-md p-4 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap break-words">
                  {jobData.updated_resume}
                </pre>
              </div>
              <Button className="mt-4" onClick={downloadResumeDocx}>
                Download Resume (.docx)
              </Button>
            </CardContent>
          </Card>
          {/* Cover Letter */}
          <Card className="flex-1 h-full flex flex-col shadow-lg">
            <CardContent className="flex flex-col h-full">
              <h2 className="text-2xl font-semibold mb-2">Cover Letter</h2>
              <div className="flex-1 bg-gray-50 rounded-md p-4 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap break-words">
                  {jobData.cover_letter}
                </pre>
              </div>
              <Button className="mt-4" onClick={downloadCoverLetterDocx}>
                Download Cover Letter (.docx)
              </Button>
            </CardContent>
          </Card>
        </main>  
      </div>

    )
  }

  // === 3. If resume/cover missing and showSkills is false (your original logic) ===
  return (
    <div className="min-h-screen bg-[#eef5ff] p-8">
      <header className="flex items-center justify-between max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Job Info
          </h1>
        </div>
        <div className="flex gap-2">
          <DashboardButton />
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>
      {jobMeta}
      {/* Show Continue button until user wants to start skills match */}
      <div className="flex flex-col items-center gap-4 mt-10">
        <div className="text-lg text-gray-700">Resume and/or cover letter not found for this job.</div>
        <Button
          size="lg"
          className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
          onClick={() => setShowSkills(true)}
        >
          Continue to Skills Match
        </Button>
      </div>
    </div>
  )
}



// 'use client'
// export const dynamic = 'force-dynamic'

// import { useRouter, useParams } from 'next/navigation'
// import { useAuth } from '@/components/AuthProvider'
// import { Card, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { LogOut } from 'lucide-react'
// import { useEffect, useState } from 'react'

// export default function JobInfoPage() {
//   const API_URL = process.env.NEXT_PUBLIC_API_BASE
//   const router = useRouter()
//   const params = useParams()
//   const { user, isLoading, logout } = useAuth()

//   const email = Array.isArray(params.email) ? params.email[0] : params.email
//   const report_id = Array.isArray(params.report_id) ? params.report_id[0] : params.report_id

//   const [jobData, setJobData] = useState<any | null>(null)
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     if (!report_id || !email) return
//     fetch(
//       `${API_URL}user-dashboard?user_email=${email}&report_id=${report_id}`
//     )
//       .then((res) => res.json())
//       .then((data) => {
//         if (data?.report) {
//           setJobData(data.report)
//         }
//         setLoading(false)
//       })
//       .catch(() => setLoading(false))
//   }, [report_id, email, API_URL])

//   if (!isLoading && !user) {
//     router.replace('/')
//     return null
//   }
//   if (isLoading || loading) {
//     return (
//       <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
//       </div>
//     )
//   }

//   const handleLogout = () => {
//     logout()
//     localStorage.clear()
//   }

//   // ✅ Download Resume DOCX
//   const downloadResumeDocx = async () => {
//     if (!report_id) return alert('No report ID found!')
//     try {
//       const response = await fetch(
//         `${API_URL}download-custom-resume-docx?report_id=${report_id}`
//       )
//       if (!response.ok) throw new Error('Download failed')
//       const blob = await response.blob()
//       const url = URL.createObjectURL(blob)
//       const a = document.createElement('a')
//       a.href = url
//       a.download = 'resume.docx'
//       a.click()
//       URL.revokeObjectURL(url)
//     } catch (err) {
//       alert('Failed to download resume!')
//     }
//   }

//   // ✅ Download Cover Letter DOCX
//   const downloadCoverLetterDocx = async () => {
//     if (!report_id) return alert('No report ID found!')
//     try {
//       const response = await fetch(
//         `${API_URL}download-custom-cover-docx?report_id=${report_id}`
//       )
//       if (!response.ok) throw new Error('Download failed')
//       const blob = await response.blob()
//       const url = URL.createObjectURL(blob)
//       const a = document.createElement('a')
//       a.href = url
//       a.download = 'cover_letter.docx'
//       a.click()
//       URL.revokeObjectURL(url)
//     } catch (err) {
//       alert('Failed to download cover letter!')
//     }
//   }

//   return (
//     <div className="min-h-screen bg-[#eef5ff] p-8">
//       {/* Top Bar */}
//       <header className="flex items-center justify-between mb-8">
//         <h1 className="text-2xl font-bold">Job Info</h1>
//         <Button variant="outline" onClick={handleLogout}>
//           <LogOut className="mr-2 h-4 w-4" /> Logout
//         </Button>
//       </header>

//       {/* Job Info */}
//       <div className="bg-white rounded-xl shadow-md p-6 mb-6">
//         <h2 className="text-xl font-semibold">{jobData?.job_title}</h2>
//         <p className="text-gray-600">{jobData?.job_company}</p>
        
//         <p className="text-gray-600">{jobData?.job_link}</p>

//         <p className="mt-3 text-gray-800 whitespace-pre-wrap">
//           {jobData?.job_description}
//         </p>
//       </div>

//       {/* Resume & Cover Letter Side by Side */}
//       <main className="flex flex-row gap-8 w-full h-[calc(100vh-18rem)]">
//         {/* Resume */}
//         <Card className="flex-1 h-full flex flex-col shadow-lg">
//           <CardContent className="flex flex-col h-full">
//             <h2 className="text-2xl font-semibold mb-2">Resume</h2>
//             <div className="flex-1 bg-gray-50 rounded-md p-4 overflow-y-auto">
//               <pre className="text-sm whitespace-pre-wrap break-words">
//                 {jobData?.updated_resume || 'No resume found'}
//               </pre>
//             </div>
//             <Button className="mt-4" onClick={downloadResumeDocx}>
//               Download Resume (.docx)
//             </Button>
//           </CardContent>
//         </Card>

//         {/* Cover Letter */}
//         <Card className="flex-1 h-full flex flex-col shadow-lg">
//           <CardContent className="flex flex-col h-full">
//             <h2 className="text-2xl font-semibold mb-2">Cover Letter</h2>
//             <div className="flex-1 bg-gray-50 rounded-md p-4 overflow-y-auto">
//               <pre className="text-sm whitespace-pre-wrap break-words">
//                 {jobData?.cover_letter || 'No cover letter found'}
//               </pre>
//             </div>
//             <Button className="mt-4" onClick={downloadCoverLetterDocx}>
//               Download Cover Letter (.docx)
//             </Button>
//           </CardContent>
//         </Card>
        
//       </main>
//     </div>
//   )
// }
