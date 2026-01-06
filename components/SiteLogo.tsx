'use client'
import Link from 'next/link'

export default function SiteLogo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="WellomyTech Home">
      <img src="/wellomy-logo.webp" alt="WellomyTech" className="h-7" />
    </Link>
  )
}
