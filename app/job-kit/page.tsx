// app/job-kit/page.tsx
'use client'
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { useState } from 'react'
import jobKitData from '@/data/jobKit.json'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'
import { LogOut } from 'lucide-react'

export default function JobKitPage() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()

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

  // Track “Have you worked on it?” answers
  const [workedOn, setWorkedOn] = useState<boolean[]>(
    () => jobKitData.skills_match.map((s) => s.in_resume)
  )
  const handleWorkedChange = (i: number, v: boolean) =>
    setWorkedOn((arr) => { const t = [...arr]; t[i] = v; return t })

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
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold">🔍 Job Requirements vs Your Resume</h2>
          <p className="text-gray-600">
            Here’s how your resume stacks up against the job requirements.
          </p>
        </div>

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
                    <th className="px-3 py-2 text-center">
                      Have You Worked On It?
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobKitData.skills_match.map(({ skill, in_job, in_resume }, i) => (
                    <tr key={skill} className="even:bg-gray-50">
                      <td className="px-3 py-2">{skill}</td>
                      <td className="px-3 py-2 text-center">
                        {in_job
                          ? <Check className="inline h-5 w-5 text-green-600"/>
                          : <X className="inline h-5 w-5 text-red-600"/>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {in_resume
                          ? <Check className="inline h-5 w-5 text-green-600"/>
                          : <X className="inline h-5 w-5 text-red-600"/>}
                      </td>
                      <td className="px-3 py-2 text-center">
                        {in_resume
                          ? 'Yes'
                          : (
                            <div className="flex justify-center space-x-4">
                              <label className="inline-flex items-center space-x-1">
                                <input
                                  type="radio"
                                  name={`worked-${i}`}
                                  checked={workedOn[i]}
                                  onChange={() => handleWorkedChange(i, true)}
                                  className="form-radio h-4 w-4"
                                />
                                <span>Yes</span>
                              </label>
                              <label className="inline-flex items-center space-x-1">
                                <input
                                  type="radio"
                                  name={`worked-${i}`}
                                  checked={!workedOn[i]}
                                  onChange={() => handleWorkedChange(i, false)}
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
              {jobKitData.bonus_points.map((bp) => (
                <li key={bp}>{bp}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Next Step */}
        <div className="text-center">
          <Button size="lg" onClick={() => router.push('/job-kit/result')}>
            Generate Job Kit
          </Button>
        </div>
      </main>
    </div>
  )
}
