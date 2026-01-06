// components/site-footer.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

export default function SiteFooter() {
  const year = new Date().getFullYear()
  const [showLogo, setShowLogo] = useState(true)

  return (
    <footer className="mt-16 border-t bg-[hsl(var(--footer))] text-white">
      <div className="container flex flex-col items-center justify-between gap-4 py-4 text-sm text-white/7F0 md:flex-row">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            {showLogo && (
              <Image
                src="/wellomy-logo.webp"
                alt="WellomyTech"
                width={32}
                height={32}
                className="hidden sm:block"
                onError={() => setShowLogo(false)}
                priority
              />
            )}
            <span className="text-lg font-semibold">WellomyTech</span>
          </div>

          <p className="mt-4 max-w-prose text-sm leading-6 text-white/80">
            WellomyTech helps organizations prepare, deploy, and manage AI systems in a practical, secure, and cost-controlled way.
            We deliver project-based AI and technology services focused on real business outcomes.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Company</h4>
          <ul className="space-y-2 text-white/80">
            <li><a href="https://www.wellomytech.com/about" target="_blank" rel="noreferrer">About</a></li>
            <li><a href="https://www.wellomytech.com/contact" target="_blank" rel="noreferrer">Contact</a></li>
            <li><a href="https://www.wellomytech.com/blog" target="_blank" rel="noreferrer">Blog</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Resources</h4>
          <ul className="space-y-2 text-white/80">
            <li><a href="https://www.wellomytech.com/frameworks" target="_blank" rel="noreferrer">AI Frameworks</a></li>
            <li><a href="https://www.wellomytech.com/services/ai-data-readiness" target="_blank" rel="noreferrer">Data Readiness</a></li>
            <li><a href="https://www.wellomytech.com/services/ai-advisory" target="_blank" rel="noreferrer">AI Advisory</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-4 py-4 text-sm text-white/70 md:flex-row">
          <p>© {year} WellomyTech. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://www.wellomytech.com/privacy" target="_blank" rel="noreferrer">Privacy</a>
            <a href="https://www.wellomytech.com/terms" target="_blank" rel="noreferrer">Terms</a>
            <a href="https://www.wellomytech.com/cookies" target="_blank" rel="noreferrer">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
