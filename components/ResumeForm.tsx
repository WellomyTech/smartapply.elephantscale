'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from './AuthProvider'

export function ResumeForm() {
  const { user } = useAuth()
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobUrl, setJobUrl] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setResumeFile(file)
  }

  const handleGenerate = async () => {
    if (!resumeFile || !jobUrl) return
    setIsGenerating(true)
    try {
      const formData = new FormData()
      formData.append('resumeFile', resumeFile)
      formData.append('jobUrl', jobUrl)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setResumeFile(null)
      setJobUrl('')
      const fileInput = document.getElementById('resume-upload') as HTMLInputElement | null
      if (fileInput) fileInput.value = ''
    } catch (err) {
      console.error('Generation failed:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const isFormValid = Boolean(resumeFile && jobUrl.trim() && jobUrl.includes('linkedin.com'))

  return (
    <Card className="rounded-2xl border bg-card text-card-foreground shadow">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-xl font-semibold">Generate Your Kit</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-6">
        <div className="space-y-3">
          <Label className="text-sm">Profile</Label>
          <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user?.picture || '/placeholder.svg'} alt={user?.name || 'User'} />
              <AvatarFallback>{user?.name?.split(' ').map((n) => n[0]).join('') || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name || 'Signed in user'}</p>
              <p className="text-sm text-muted-foreground">{user?.email || ''}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resume-upload" className="text-sm">Resume Upload</Label>
          <Input id="resume-upload" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
          {resumeFile && <p className="text-xs text-muted-foreground">Selected: {resumeFile.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="job-url" className="text-sm">Job URL</Label>
          <Input
            id="job-url"
            type="url"
            placeholder="Paste LinkedIn job URL"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
          />
        </div>

        <Button onClick={handleGenerate} disabled={!isFormValid || isGenerating} className="w-full">
          {isFormValid ? (isGenerating ? 'Generating…' : 'Generate Kit') : 'Paste a valid LinkedIn URL'}
        </Button>
      </CardContent>
    </Card>
  )
}
