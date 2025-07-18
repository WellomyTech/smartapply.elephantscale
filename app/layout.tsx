import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/AuthProvider"
import { ResumeProvider } from "@/components/ResumeProvider"   // <-- add this

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Smart Job Kit Generator",
  description: "Generate personalized job application materials with AI",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ResumeProvider>      {/* <-- wrap here */}
            {children}
          </ResumeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
