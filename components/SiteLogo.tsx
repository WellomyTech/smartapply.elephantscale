'use client'
import Link from 'next/link'

export default function SiteLogo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="Elephant Scale Home">
      <img src="/brand/logo-es-dark.svg" alt="Elephant Scale" className="h-7 dark:hidden" />
      <img src="/brand/logo-es-light.svg" alt="Elephant Scale" className="h-7 hidden dark:block" />
    </Link>
  )
}
