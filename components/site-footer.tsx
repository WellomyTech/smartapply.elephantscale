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
      <div className="container grid gap-10 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            {showLogo && (
              <Image
                src="/elephantscale-logo-white.svg"
                alt="Elephant Scale"
                width={32}
                height={32}
                className="hidden sm:block"
                onError={() => setShowLogo(false)}
                priority
              />
            )}
            <span className="text-lg font-semibold">Elephant Scale</span>
          </div>

          <p className="mt-4 max-w-prose text-sm leading-6 text-white/80">
            ElephantScale delivers expert-led AI training and practical upskilling for teams and professionals.
            Our mission is to help you build hands-on skills with modern tools and workflows.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Company</h4>
          <ul className="space-y-2 text-white/80">
            <li><a href="https://elephantscale.com/team" target="_blank" rel="noreferrer">Team</a></li>
            <li><a href="https://elephantscale.com/contact" target="_blank" rel="noreferrer">Contact</a></li>
            <li><a href="https://elephantscale.com/blog" target="_blank" rel="noreferrer">Blog</a></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Resources</h4>
          <ul className="space-y-2 text-white/80">
            <li><a href="https://elephantscale.com/webinars" target="_blank" rel="noreferrer">Webinars</a></li>
            <li><a href="https://elephantscale.com/resources" target="_blank" rel="noreferrer">Resources</a></li>
            <li><a href="https://elephantscale.com/ai-automations" target="_blank" rel="noreferrer">AI Automations</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-4 py-4 text-sm text-white/70 md:flex-row">
          <p>© {year} Elephant Scale. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="https://elephantscale.com/privacy" target="_blank" rel="noreferrer">Privacy</a>
            <a href="https://elephantscale.com/terms" target="_blank" rel="noreferrer">Terms</a>
            <a href="https://elephantscale.com/cookies" target="_blank" rel="noreferrer">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
