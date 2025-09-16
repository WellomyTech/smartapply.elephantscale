'use client'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'

export default function DashboardButton({ className = '' }: { className?: string }) {
  const pathname = usePathname()

  function handleDashboardClick() {
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
    ]
    appKeys.forEach((key) => localStorage.removeItem(key))

    if (pathname === '/home') {
      // ✅ Already on dashboard → force full reload
      window.location.reload()
    } else {
      // ✅ Navigate to dashboard with full reload
      window.location.href = '/home'
    }
  }

  return (
    <Button
      variant="outline"
      className={`flex items-center gap-2 ${className}`}
      onClick={handleDashboardClick}
    >
      <Home className="w-4 h-4" />
      
    </Button>
  )
}
