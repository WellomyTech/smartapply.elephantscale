import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/AuthProvider"
import { ResumeProvider } from "@/components/ResumeProvider"
import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Smart Job Kit Generator",
  description: "Generate personalized job application materials with AI",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <ResumeProvider>
              <SiteHeader />
              <main className="min-h-[calc(100svh-56px)]">{children}</main>
              <SiteFooter />
              <Analytics />
            </ResumeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
