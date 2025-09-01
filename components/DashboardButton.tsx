'use client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function DashboardButton({ className = '' }: { className?: string }) {
  const router = useRouter()

  function handleDashboardClick() {
<<<<<<< HEAD
=======
    // List all app-specific keys (but NOT auth/session keys)
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
    const appKeys = [
      'has_resume',
      'has_cover_letter',
      'resume_file_name',
      'cover_letter_file_name',
      'resume_file',
      'cover_letter_file',
      'generated_resume',
      'generated_cover_letter',
      'compare_result',
      'worked_on',
      'job_url',
      'job_description',
      'report_id',
      'latex_resume',
      'latex_cover',
<<<<<<< HEAD
=======
      // Add more if your app uses more!
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
    ]
    appKeys.forEach((key) => localStorage.removeItem(key))
    router.push('/dashboard')
  }

  return (
<<<<<<< HEAD
    <Button variant="outline" className={`flex items-center gap-2 ${className}`} onClick={handleDashboardClick}>
=======
    <Button
      variant="outline"
      className={`flex items-center gap-2 ${className}`}
      onClick={handleDashboardClick}
    >
>>>>>>> d324444a4b6816f0bc4e5b67cf0ef767a6613369
      <Home className="w-4 h-4" />
      Dashboard
    </Button>
  )
}
