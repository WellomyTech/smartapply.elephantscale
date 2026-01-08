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
  metadataBase: new URL('https://smartapply.wellomytech.com'),
  title: {
    default: "SmartApply by WellomyTech | AI-Powered Job Application Platform",
    template: "%s | SmartApply by WellomyTech"
  },
  description: "Transform your job search with SmartApply - AI-powered resume optimization, interview preparation, and job matching. Create ATS-friendly resumes, practice with AI interview agents, and land your dream job faster. Free to start.",
  keywords: [
    "AI resume builder",
    "job application platform",
    "ATS resume optimization",
    "interview preparation",
    "AI interview practice",
    "job search tools",
    "resume generator",
    "cover letter generator",
    "technical interview prep",
    "behavioral interview practice",
    "job matching",
    "career tools",
    "AI job search",
    "resume optimization",
    "job application assistant",
    "free resume builder",
    "online resume maker",
    "job search assistant",
    "career development tools",
    "interview coaching"
  ],
  authors: [{ name: "WellomyTech", url: "https://www.wellomytech.com" }],
  creator: "WellomyTech",
  publisher: "WellomyTech",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://smartapply.wellomytech.com",
    siteName: "SmartApply",
    title: "SmartApply - AI-Powered Job Application Platform | Free Resume Builder & Interview Prep",
    description: "Transform your job search with AI-powered resume optimization, interview preparation, and intelligent job matching. Land your dream job faster with SmartApply.",
    images: [
      {
        url: "/wellomy-logo.webp",
        width: 1200,
        height: 630,
        alt: "SmartApply by WellomyTech - AI-Powered Job Application Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@WellomyTech",
    title: "SmartApply - AI-Powered Job Application Platform",
    description: "Transform your job search with AI-powered resume optimization, interview preparation, and job matching. Free to start!",
    images: ["/wellomy-logo.webp"],
    creator: "@WellomyTech",
  },
  alternates: {
    canonical: "https://smartapply.wellomytech.com",
  },
  category: "Career & Employment",
  applicationName: "SmartApply",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/wellomy-favicon.png',
    shortcut: '/wellomy-favicon.png',
    apple: '/wellomy-favicon.png',
  },
}

import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400','500','600','700'],
  variable: '--font-poppins',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://smartapply.wellomytech.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="icon" href="/wellomy-logo.webp" />
        <link rel="apple-touch-icon" href="/wellomy-logo.webp" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://smartapply.wellomytech.com" />
        <meta property="og:site_name" content="SmartApply" />
        <meta name="description" content="Transform your job search with SmartApply - AI-powered resume optimization, interview preparation, and job matching. Create ATS-friendly resumes, practice with AI interview agents, and land your dream job faster. Free to start." />
        <meta name="keywords" content="AI resume builder, job application platform, ATS resume optimization, interview preparation, AI interview practice, job search tools, resume generator, cover letter generator, technical interview prep, behavioral interview practice, job matching, career tools, AI job search, resume optimization, job application assistant, free resume builder, online resume maker, job search assistant, career development tools, interview coaching" />
        <meta name="author" content="WellomyTech" />
        <meta name="publisher" content="WellomyTech" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="7 days" />
        <meta name="rating" content="General" />
        <meta name="distribution" content="global" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@WellomyTech" />
        <meta name="twitter:title" content="SmartApply - AI-Powered Job Application Platform" />
        <meta name="twitter:description" content="Transform your job search with AI-powered resume optimization, interview preparation, and job matching. Free to start!" />
        <meta name="twitter:image" content="https://smartapply.wellomytech.com/wellomy-logo.webp" />
        <meta name="twitter:creator" content="@WellomyTech" />
        <meta property="og:image" content="https://smartapply.wellomytech.com/wellomy-logo.webp" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="SmartApply by WellomyTech - AI-Powered Job Application Platform" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "SmartApply",
              "alternateName": "SmartApply by WellomyTech",
              "description": "AI-powered job application platform for resume optimization, interview preparation, and job matching. Create ATS-friendly resumes, practice interviews with AI agents, and land your dream job faster.",
              "url": "https://smartapply.wellomytech.com",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web Browser",
              "browserRequirements": "Requires JavaScript. Requires HTML5.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "description": "Free to start with premium options available",
                "priceValidUntil": "2026-12-31"
              },
              "creator": {
                "@type": "Organization",
                "name": "WellomyTech",
                "url": "https://www.wellomytech.com",
                "logo": "https://smartapply.wellomytech.com/wellomy-logo.webp",
                "sameAs": [
                  "https://www.wellomytech.com"
                ]
              },
              "featureList": [
                "AI Resume Generation",
                "ATS Optimization",
                "Cover Letter Generation",
                "Technical Interview Practice",
                "Behavioral Interview Preparation",
                "Job Matching",
                "Application Tracking",
                "Job Kit Scanner",
                "Skills Gap Analysis"
              ],
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "1250",
                "bestRating": "5",
                "worstRating": "1"
              },
              "screenshot": "https://smartapply.wellomytech.com/wellomy-logo.webp",
              "softwareVersion": "1.0",
              "datePublished": "2024-01-01",
              "dateModified": "2026-01-06",
              "inLanguage": "en-US",
              "potentialAction": {
                "@type": "UseAction",
                "target": {
                  "@type": "EntryPoint",
                  "urlTemplate": "https://smartapply.wellomytech.com",
                  "actionPlatform": [
                    "http://schema.org/DesktopWebPlatform",
                    "http://schema.org/MobileWebPlatform"
                  ]
                }
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "WellomyTech",
              "url": "https://www.wellomytech.com",
              "logo": "https://smartapply.wellomytech.com/wellomy-logo.webp",
              "description": "WellomyTech provides innovative AI-powered solutions for job seekers and career development.",
              "sameAs": [
                "https://www.wellomytech.com"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Support",
                "url": "https://www.wellomytech.com"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "https://smartapply.wellomytech.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Dashboard",
                  "item": "https://smartapply.wellomytech.com/dashboard"
                },
                {
                  "@type": "ListItem",
                  "position": 3,
                  "name": "Resume Builder",
                  "item": "https://smartapply.wellomytech.com/dashboard/resume"
                }
              ]
            })
          }}
        />
      </head>
      {/* Add suppressHydrationWarning to body to avoid extension-induced mismatches */}
      <body suppressHydrationWarning className={`${inter.className} ${poppins.variable}`}>
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
