'use client'
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useResume } from '@/components/ResumeProvider'
import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, LogOut, Loader2 } from 'lucide-react'

// ---- API call for compare endpoint ----
interface SkillsMatchItem {
  skill: string;
  in_job: boolean;
  in_resume: boolean;
}
interface CompareApiResponse {
  skills_match: SkillsMatchItem[];
  gaps: string[];
  bonus_points: string[];
  recommendations: string[];
  google_doc_link: string;
  raw?: string;
  error?: string;
}

async function compareResumeJob({
  resumeFile,
  jobDescription,
  jobUrl,
  email
}: {
  resumeFile: File,
  jobDescription: string,
  jobUrl?: string,
  email: string
}) {
  const form = new FormData();
  form.append('job_description', jobDescription);
  form.append('job_link', jobUrl || '');
  form.append('user_email', email);

  const res = await fetch('https://api-705060578323.us-central1.run.app/compare-resume-job', {
    method: 'POST',
    body: form,
    headers: {
      'accept': 'application/json',
    },
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    throw new Error('Could not parse API response.');
  }

  if (!res.ok || data.error) {
    return { error: data.error || 'Unknown error', raw: data.raw, google_doc_link: data.google_doc_link };
  }
  return data
}

export default function JobKitPage() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const { resumeFile } = useResume();

  // UI states
  const [jobUrl, setJobUrl] = useState('')
  const [description, setDescription] = useState('')
  const [email, setEmail] = useState(user?.email ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CompareApiResponse | null>(null)
  const [workedOn, setWorkedOn] = useState<boolean[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);

  useEffect(() => {
    if (user?.email) setEmail(user.email)
  }, [user]);

  useEffect(() => {
    if (result) {
      setWorkedOn(result.skills_match.map(s => s.in_resume));
    }
  }, [result]);

  // Redirect if not logged in
  if (!isLoading && !user) {
    router.replace('/')
    return null
  }
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }
  // if (!resumeFile) {
  //   router.replace('/dashboard')
  //   return null
  // }

  // Form handler
  async function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const compareResult = await compareResumeJob({
        resumeFile,
        jobUrl: jobUrl || undefined,
        jobDescription: description || undefined,
        email,
      });

      if ('error' in compareResult) {
        setError(compareResult.error);
        setResult({
          skills_match: [],
          gaps: [],
          bonus_points: [],
          recommendations: [],
          google_doc_link: compareResult.google_doc_link,
          raw: compareResult.raw
        } as CompareApiResponse);
      } else {
        setResult(compareResult);
      }

    } catch (err: any) {
      setError(err.message ?? 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }

  // Generate Resume API
  async function handleGenerateResume() {
    if (!user?.email || !result) return;

    const selectedSkills = result.skills_match
      .filter((_, idx) => workedOn[idx])
      .map((item) => item.skill);

    if (selectedSkills.length === 0) {
      alert("Please select at least one skill you have worked on.");
      return;
    }

    const form = new FormData();
    form.append('user_email', user.email);
    form.append('skills', selectedSkills.join(', '));

    setGenerating(true);
    setGeneratedResume(null);
    try {
      const res = await fetch('https://api-705060578323.us-central1.run.app/generate-resume', {
        method: 'POST',
        body: form,
        headers: { accept: 'application/json' },
      });

      const data = await res.json();
      if (data.updated_resume) {
        
        localStorage.setItem('generated_resume', data.updated_resume);
        setGeneratedResume(data.updated_resume);
        router.push('/job-kit/result');
        
      } else {
        alert("No resume generated.");
      }
    } catch (err) {
      alert("Failed to generate resume.");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#eef5ff] px-4 py-6 space-y-8">
      {/* Top Bar */}
      <header className="flex items-center justify-between max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900">
          Smart Job Kit Generator
        </h1>
        <Button variant="outline" onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto space-y-12">
        {/* Form to enter Job Link / Description */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <form onSubmit={handleCompare} className="space-y-4">
              <h2 className="text-xl font-semibold mb-2">Enter Job Info</h2>
              <label className="block font-semibold">Job Link:</label>
              <input
                type="url"
                value={jobUrl}
                onChange={e => setJobUrl(e.target.value)}
                placeholder="Paste job posting URL"
                className="w-full border p-2 rounded"
              />
              <div className="text-center text-gray-400">or</div>
              <label className="block font-semibold">Job Description:</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="w-full border p-2 rounded"
                placeholder="Paste the job description"
              />
              <label className="block font-semibold">Your Email:</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full border p-2 rounded"
              />
              {error && <div className="text-red-600">{error}</div>}
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading || (!jobUrl && !description)}
              >
                {loading
                  ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Comparing...</>
                  : 'Compare Resume'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <div className="space-y-12">
            {/* Skills Table */}
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
                      {result.skills_match.map(({ skill, in_job, in_resume }, i) => (
                        <tr key={skill} className="even:bg-gray-50">
                          <td className="px-3 py-2">{skill}</td>
                          <td className="px-3 py-2 text-center">
                            {in_job
                              ? <Check className="inline h-5 w-5 text-green-600" />
                              : <X className="inline h-5 w-5 text-red-600" />}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {in_resume
                              ? <Check className="inline h-5 w-5 text-green-600" />
                              : <X className="inline h-5 w-5 text-red-600" />}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {in_job && in_resume ? (
                              "" // empty cell when both are true
                            ) : (
                              <div className="flex justify-center space-x-4">
                                <label className="inline-flex items-center space-x-1">
                                  <input
                                    type="radio"
                                    name={`worked-${i}`}
                                    checked={workedOn[i] === true}
                                    onChange={() =>
                                      setWorkedOn(arr => {
                                        const copy = [...arr];
                                        copy[i] = true;
                                        return copy;
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
                                        const copy = [...arr];
                                        copy[i] = false;
                                        return copy;
                                      })
                                    }
                                    className="form-radio h-4 w-4"
                                  />
                                  <span>No</span>
                                </label>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Bonus Points */}
            <Card className="shadow-lg">
              <CardContent>
                <h3 className="text-2xl font-semibold mb-4">Bonus Points</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {result.bonus_points.map((bp) => (
                    <li key={bp}>{bp}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Button
              size="lg"
              className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
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

            {generatedResume && (
              <Card className="shadow-lg">
                <CardContent>
                  <h3 className="text-2xl font-semibold mb-4">Your AI-Tailored Resume</h3>
                  <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                    {generatedResume}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  )
}























// // app/job-kit/page.tsx
// 'use client'
// export const dynamic = 'force-dynamic'

// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/components/AuthProvider'
// import { useResume } from '@/components/ResumeProvider'
// import { useState } from 'react'
// import { Card, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Check, X, LogOut, Loader2 } from 'lucide-react'
// import { useEffect } from 'react';


// // ---- API call for compare endpoint ----
// interface SkillsMatchItem {
//   skill: string;
//   in_job: boolean;
//   in_resume: boolean;
// }
// interface CompareApiResponse {
//   skills_match: SkillsMatchItem[];
//   gaps: string[];
//   bonus_points: string[];
//   recommendations: string[];
//   google_doc_link: string;
  
//   raw?: string;      // <-- add this line
//   error?: string;    
// }

// async function compareResumeJob({
//   resumeFile,
//   jobDescription,
//   jobUrl
// }: {
//   resumeFile: File,
//   jobDescription: string,
//   jobUrl?: string,
// }) {
//   const form = new FormData();
//   //form.append('resume_file', resumeFile);           // (If you later want to add file support)
//   form.append('job_description', jobDescription);   // Text
//   form.append('job_link', jobUrl || '');         // <-- NAME MATCHED
//   form.append('user_email', "ruchitrakholiya878@gmail.com");                 // <-- NAME MATCHED

//   const res = await fetch('http://127.0.0.1:8000/compare-resume-job', {
//     method: 'POST',
//     body: form,
//     headers: {
//       'accept': 'application/json',
//     },
//   });






// // const form = new FormData();
// // form.append('resume_file', resumeFile);           // File object, not string
// // form.append('job_description', jobDescription);   // String
// // form.append('job_url', jobUrl || 'N/A');          // String


// // console.log("jobDescription value before API:", jobDescription);

// // // If you want to add headers like in curl:
// // const res = await fetch('http://127.0.0.1:8000/compare-resume-job', {
// //   method: 'POST',
// //   body: form,
// //   credentials: 'include', // if your backend needs cookies/auth
// //   headers: {
// //     // DO NOT set Content-Type for FormData, browser will do it!
// //     'accept': 'application/json',
// //     'linkedin-id': '123', // replace with your logic or context!
// //     'email': 'ruchitrakholiya878@gmail.com', // replace with user's email!
// //   },
// // });


//   let data;
//   try {
//     data = await res.json();
//   } catch (e) {
//     throw new Error('Could not parse API response.');
//   }

//   if (!res.ok || data.error) {
//     // error from API
//     return { error: data.error || 'Unknown error', raw: data.raw, google_doc_link: data.google_doc_link };
//   }
//   return data
// }

// export default function JobKitPage() {
  
//   const router = useRouter()
//   const { user, isLoading, logout } = useAuth()
//   //const { resumeFile } = useResume()
  
// const { resumeFile } = useResume();

//   // UI states
//   const [jobUrl, setJobUrl] = useState('')
//   const [description, setDescription] = useState('')
//   const [email, setEmail] = useState(user?.email ?? '')
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState('')
//   const [result, setResult] = useState<CompareApiResponse | null>(null)

//   const [workedOn, setWorkedOn] = useState<boolean[]>([]);

//   useEffect(() => {
//   if (result) {
//     setWorkedOn(result.skills_match.map(s => s.in_resume));
//   }
// }, [result]);


//   // Redirect if not logged in
//   if (!isLoading && !user) {
//     router.replace('/')
//     return null
//   }
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
//       </div>
//     )
//   }
//   // if (!resumeFile) {
//   //   // If no resume uploaded, force user back to dashboard
//   //   router.replace('/dashboard')
//   //   return null
//   // }

//   // Form handler
//   async function handleCompare(e: React.FormEvent) {
//     e.preventDefault();
//     setError('');
//     setResult(null);
//     setLoading(true);
//     try {
      
//       console.log("Submitting:", { jobDescription: description, resumeFile, jobUrl });

//       const compareResult = await compareResumeJob({
//         resumeFile,
//         jobUrl: jobUrl || undefined,
//         jobDescription: description || undefined, // <-- FIXED!
//         email,
//       });

//       if ('error' in compareResult) {
//   setError(compareResult.error);
//   setResult({
//     skills_match: [],
//     gaps: [],
//     bonus_points: [],
//     recommendations: [],
//     google_doc_link: compareResult.google_doc_link,
//     raw: compareResult.raw // <-- add this!
//   } as CompareApiResponse);
// } else {
//   setResult(compareResult);
// }

//       } catch (err: any) {
//         setError(err.message ?? 'An error occurred.');
//       } finally {
//         setLoading(false);
//       }
//     }

//     const GeenrateResume = () => {
//     router.push('/job-kit/result')
//   }


//   return (
//     <div className="min-h-screen bg-[#eef5ff] px-4 py-6 space-y-8">
//       {/* Top Bar */}
//       <header className="flex items-center justify-between max-w-5xl mx-auto">
//         <h1 className="text-2xl font-bold text-gray-900">
//           Smart Job Kit Generator
//         </h1>
//         <Button variant="outline" onClick={logout}>
//           <LogOut className="mr-2 h-4 w-4" />
//           Logout
//         </Button>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-4xl mx-auto space-y-12">
//         {/* Form to enter Job Link / Description */}
//         <Card className="shadow-lg">
//           <CardContent className="p-6">
//             <form onSubmit={handleCompare} className="space-y-4">
//               <h2 className="text-xl font-semibold mb-2">Enter Job Info</h2>
//               <label className="block font-semibold">Job Link:</label>
//               <input
//                 type="url"
//                 value={jobUrl}
//                 onChange={e => setJobUrl(e.target.value)}
//                 placeholder="Paste job posting URL"
//                 className="w-full border p-2 rounded"
//               />
//               <div className="text-center text-gray-400">or</div>
//               <label className="block font-semibold">Job Description:</label>
//               <textarea
//                 value={description}
//                 onChange={e => setDescription(e.target.value)}
//                 rows={4}
//                 className="w-full border p-2 rounded"
//                 placeholder="Paste the job description"
//               />
//               <label className="block font-semibold">Your Email:</label>
//               <input
//                 type="email"
//                 value={email}
//                 onChange={e => setEmail(e.target.value)}
//                 required
//                 className="w-full border p-2 rounded"
//               />
//               {error && <div className="text-red-600">{error}</div>}
//               <Button
//                 type="submit"
//                 size="lg"
//                 className="w-full"
//                 disabled={loading || (!jobUrl && !description)}
//               >
//                 {loading
//                   ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Comparing...</>
//                   : 'Compare Resume'}
//               </Button>
//             </form>
//           </CardContent>
//         </Card>


//         {error && (
//             <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//               <strong className="font-bold">Error:</strong> {error}
//               {result?.google_doc_link && (
//                 <div className="mt-2">
//                   <a
//                     href={result.google_doc_link}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="underline text-blue-600 font-semibold"
//                   >
//                     View your document on Google Docs
//                   </a>
//                 </div>
//               )}
//               {result?.raw && (
//                 <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
//                   {result.raw}
//                 </pre>
//               )}
//             </div>
//           )}
//         {/* Results */}
//         {result && (
//           <div className="space-y-12">
//             {/* Skills Table */}
//             <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Skills Comparison</h3>
//                 <div className="overflow-x-auto">
//                   <table className="w-full table-auto border-collapse">
//                     <thead className="bg-gray-100">
//                       <tr>
//                         <th className="px-3 py-2 text-left">Skill</th>
//                         <th className="px-3 py-2 text-center">In Job</th>
//                         <th className="px-3 py-2 text-center">In Resume</th>
//                         <th className="px-3 py-2 text-center">Have You Worked On It?</th>
//                       </tr>
//                     </thead>

//                    <tbody>
//                       {result.skills_match.map(({ skill, in_job, in_resume }, i) => (
//                         <tr key={skill} className="even:bg-gray-50">
//                           <td className="px-3 py-2">{skill}</td>
//                           <td className="px-3 py-2 text-center">
//                             {in_job
//                               ? <Check className="inline h-5 w-5 text-green-600"/>
//                               : <X className="inline h-5 w-5 text-red-600"/>}
//                           </td>
//                           <td className="px-3 py-2 text-center">
//                             {in_resume
//                               ? <Check className="inline h-5 w-5 text-green-600"/>
//                               : <X className="inline h-5 w-5 text-red-600"/>}
//                           </td>
//                           <td className="px-3 py-2 text-center">
//                             {in_job && in_resume ? (
//                               "" // empty cell when both are true
//                             ) : in_resume ? (
//                               "Yes"
//                             ) : (
//                               <div className="flex justify-center space-x-4">
//                                 <label className="inline-flex items-center space-x-1">
//                                   <input
//                                     type="radio"
//                                     name={`worked-${i}`}
//                                     checked={workedOn[i] === true}
//                                     onChange={() =>
//                                       setWorkedOn(arr => {
//                                         const copy = [...arr];
//                                         copy[i] = true;
//                                         return copy;
//                                       })
//                                     }
//                                     className="form-radio h-4 w-4"
//                                   />
//                                   <span>Yes</span>
//                                 </label>
//                                 <label className="inline-flex items-center space-x-1">
//                                   <input
//                                     type="radio"
//                                     name={`worked-${i}`}
//                                     checked={workedOn[i] === false}
//                                     onChange={() =>
//                                       setWorkedOn(arr => {
//                                         const copy = [...arr];
//                                         copy[i] = false;
//                                         return copy;
//                                       })
//                                     }
//                                     className="form-radio h-4 w-4"
//                                   />
//                                   <span>No</span>
//                                 </label>
//                               </div>
//                             )}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>


//                   </table>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Skill Gaps
//             <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Skill Gaps</h3>
//                 <ul className="list-disc list-inside space-y-1 text-gray-700">
//                   {result.gaps.map((gap) => (
//                     <li key={gap}>{gap}</li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card> */}

//             {/* Bonus Points */}
//             <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Bonus Points</h3>
//                 <ul className="list-disc list-inside space-y-2 text-gray-700">
//                   {result.bonus_points.map((bp) => (
//                     <li key={bp}>{bp}</li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card>

//             {/* Recommendations */}
//             {/* <Card className="shadow-lg">
//               <CardContent>
//                 <h3 className="text-2xl font-semibold mb-4">Recommendations</h3>
//                 <ul className="list-decimal list-inside space-y-2 text-gray-700">
//                   {result.recommendations.map((rec) => (
//                     <li key={rec}>{rec}</li>
//                   ))}
//                 </ul>
//               </CardContent>
//             </Card> */}

//             {/* Google Doc Link */}
//             {/* <div className="text-center mt-4">
//               <a
//                 href={result.google_doc_link}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="underline text-blue-600 font-semibold"
//               >
//                 View AI-tailored Resume (Google Doc)
//               </a>
//             </div> */}

//             <Button
//           size="lg"
//           className="w-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-md"
//           onClick={GeenrateResume}
//         >
//           Generate Resume and Cover Letter
//         </Button>
//           </div>
//         )}
//       </main>
//     </div>
    
//   )
// }
