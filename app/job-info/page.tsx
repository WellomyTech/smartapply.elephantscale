'use client';
import { useState } from 'react';
import { compareResumeJob, CompareApiResponse } from '@/lib/endpoints';
import { useRouter } from 'next/navigation';

export default function JobInfoPage() {
  const [resume, setResume] = useState<File | null>(null);
  const [jobUrl, setJobUrl] = useState('');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resume || !email) {
      setError('Please upload a resume and provide your email.');
      return;
    }
    setError('');
    try {
      const result = await compareResumeJob({
        resume,
        jobUrl,
        description,
        email,
      });
      // Store the result in localStorage or pass as state
      localStorage.setItem('jobKitResult', JSON.stringify(result));
      router.push('/job-kit');
    } catch (err: any) {
      setError(err.message || 'Error occurred.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto mt-10 p-4 border rounded">
      <label className="block font-semibold">Resume (PDF or DOCX):</label>
      <input type="file" accept=".pdf,.doc,.docx" onChange={e => setResume(e.target.files?.[0] || null)} required />
      
      <label className="block font-semibold">Job Link:</label>
      <input type="url" value={jobUrl} onChange={e => setJobUrl(e.target.value)} placeholder="Paste job posting URL" className="w-full border p-2 rounded" />
      
      <label className="block font-semibold">Or Paste Job Description:</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full border p-2 rounded" placeholder="Paste the job description" />

      <label className="block font-semibold">Your Email:</label>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full border p-2 rounded" />

      {error && <div className="text-red-600">{error}</div>}

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Compare Resume</button>
    </form>
  );
}




// 'use client'
// import { useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { Button } from '@/components/ui/button'
// import { Card, CardContent } from '@/components/ui/card'
// import { LogOut } from 'lucide-react'
// import { useAuth } from '@/components/AuthProvider'

// export default function JobInfoPage() {
//   const router = useRouter()
//   const { user, isLoading, logout } = useAuth()
//   const [description, setDescription] = useState('')
//   const [jobLink, setJobLink] = useState('')

//   // Guard: redirect if not logged in
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

//   // Only allow ONE field to be filled at a time
//   const canContinue =
//     (!!description && !jobLink) || (!description && !!jobLink)

//   const handleContinue = () => {
//     if (description) {
//       localStorage.setItem('jobDescription', description.trim())
//       localStorage.removeItem('jobLink')
//     } else if (jobLink) {
//       localStorage.setItem('jobLink', jobLink.trim())
//       localStorage.removeItem('jobDescription')
//     }
//     router.push('/job-kit')
//   }

//   return (
//     <div className="min-h-screen bg-[#eef5ff] px-4 py-6 space-y-8">
//       {/* Top Bar */}
//       <header className="flex items-center justify-between max-w-5xl mx-auto">
//         <h1 className="text-2xl font-bold text-gray-900">Smart Job Kit Generator</h1>
//         <Button variant="outline" onClick={logout}>
//           <LogOut className="mr-2 h-4 w-4" />
//           Logout
//         </Button>
//       </header>
//       {/* Card */}
//       <main className="flex items-center justify-center">
//         <Card className="max-w-md w-full shadow-lg">
//           <CardContent className="space-y-6 p-8">
//             <h2 className="text-xl font-bold text-gray-900 mb-2">
//               Add Job Description or Job Link
//             </h2>
//             <div>
//               <label className="block text-gray-700 font-medium mb-1">
//                 Job Description
//               </label>
//               <textarea
//                 className="w-full border p-2 rounded resize-none"
//                 rows={5}
//                 placeholder="Paste the job description here"
//                 value={description}
//                 onChange={e => {
//                   setDescription(e.target.value)
//                   if (e.target.value) setJobLink('')
//                 }}
//                 disabled={!!jobLink}
//               />
//             </div>
//             <div>
//               <label className="block text-gray-700 font-medium mb-1">
//                 Job Link
//               </label>
//               <input
//                 type="url"
//                 className="w-full border p-2 rounded"
//                 placeholder="Paste the LinkedIn job link here"
//                 value={jobLink}
//                 onChange={e => {
//                   setJobLink(e.target.value)
//                   if (e.target.value) setDescription('')
//                 }}
//                 disabled={!!description}
//               />
//             </div>
//             <Button
//               className="w-full"
//               disabled={!canContinue}
//               onClick={handleContinue}
//             >
//               Continue
//             </Button>
//           </CardContent>
//         </Card>
//       </main>
//     </div>
//   )
// }
