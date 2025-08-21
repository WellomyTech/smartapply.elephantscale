'use client'
export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogOut, ExternalLink, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import DashboardButton from '@/components/DashboardButton'

export default function JobKitResultPage() {
  const API_KEY = process.env.NEXT_PUBLIC_API_BASE
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()

  // Show job link if you want
  const [jobLink, setJobLink] = useState<string | null>(null)
  // Store results from localStorage
  const [resumeText, setResumeText] = useState<string | null>(null)
  const [coverLetterText, setCoverLetterText] = useState<string | null>(null)

  // NEW: spinner states for downloads
  const [downloadingResume, setDownloadingResume] = useState(false)
  const [downloadingCover, setDownloadingCover] = useState(false)

  useEffect(() => {
    // Get jobLink from localStorage (optional)
    setJobLink(localStorage.getItem('jobLink') || null)
    // Load AI-generated resume/cover from localStorage
    setResumeText(localStorage.getItem('generated_resume') || null)
    setCoverLetterText(localStorage.getItem('generated_cover_letter') || null)
  }, [])

  if (!isLoading && !user) {
    router.replace('/')
    return null
  }
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    localStorage.clear() // Clears all localStorage for this domain
  }

  // Fallback dummy if nothing found (for dev/testing)
  const fallbackResume = `Your resume will appear here.`
  const fallbackCover = `Your cover letter will appear here.`

  const downloadResumePdf = async () => {
    const latex = localStorage.getItem('latex_resume')
    if (!latex) {
      alert('No LaTeX resume found!')
      return
    }

    const response = await fetch('https://latex.ytotech.com/builds/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        compiler: 'pdflatex',
        resources: [{ content: latex, main: true, file: 'resume.tex' }],
      }),
    })

    if (!response.ok) {
      alert('PDF generation failed')
      return
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resume.pdf'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const downloadResumeDocx = async () => {
    const API_KEY = process.env.NEXT_PUBLIC_API_BASE
    const reportId = localStorage.getItem('report_id')

    if (!reportId) {
      alert('No report_id found in localStorage!')
      return
    }

    setDownloadingResume(true) // start spinner
    try {
      const response = await fetch(`${API_KEY}download-custom-resume-docx?report_id=${reportId}`)
      if (!response.ok) {
        alert('Failed to generate/download resume DOCX')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resume.docx'
      document.body.appendChild(a) // Needed for Firefox
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Resume download failed!')
      console.error(err)
    } finally {
      setDownloadingResume(false) // stop spinner
    }
  }

  const downloadCoverLetterDocx = async () => {
    const coverLetter = localStorage.getItem('generated_cover_letter')
    if (!coverLetter) {
      alert('No cover letter found in localStorage!')
      return
    }

    setDownloadingCover(true) // start spinner
    const formData = new FormData()
    formData.append('cover_letter_text', coverLetter)

    try {
      const response = await fetch(`${API_KEY}generate-cover-letter-pdf`, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        throw new Error('Failed to generate cover letter DOCX')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'cover_letter.docx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      alert('Cover letter download failed!')
      console.error(err)
    } finally {
      setDownloadingCover(false) // stop spinner
    }
  }

  const download = (name: string, txt: string) => {
    const blob = new Blob([txt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#eef5ff] m-12">
      {/* Top Bar */}
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Genertaed Resume & Cover Letter</h1>
        </div>
        <div className="flex gap-2">
          <DashboardButton />
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      {/* 2 Boxes (side by side, scrollable) */}
      <main className="flex flex-row gap-8 w-full h-[calc(100vh-10rem)]">
        {/* Resume */}
        <Card className="flex-1 h-full flex flex-col shadow-lg">
          <CardContent className="flex flex-col h-full">
            <h2 className="text-2xl font-semibold mb-2">Resume</h2>
            <div className="flex-1 bg-gray-50 rounded-md p-4 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap break-words">
                {resumeText || fallbackResume}
              </pre>
            </div>
            <Button
              className="mt-4"
              onClick={downloadResumeDocx}
              disabled={!resumeText || downloadingResume}
              aria-busy={downloadingResume}
            >
              {downloadingResume ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" /> Preparing download…
                </>
              ) : (
                'Download Resume (.docx)'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Cover Letter (if provided) */}
        <Card className="flex-1 h-full flex flex-col shadow-lg">
          <CardContent className="flex flex-col h-full">
            <h2 className="text-2xl font-semibold mb-2">Cover Letter</h2>
            <div className="flex-1 bg-gray-50 rounded-md p-4 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap break-words">
                {coverLetterText || fallbackCover}
              </pre>
            </div>
            <Button
              className="mt-4"
              onClick={downloadCoverLetterDocx}
              disabled={!coverLetterText || downloadingCover}
              aria-busy={downloadingCover}
            >
              {downloadingCover ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" /> Preparing download…
                </>
              ) : (
                'Download Cover Letter (.docx)'
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}



// 'use client'
// export const dynamic = 'force-dynamic'

// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/components/AuthProvider'
// import { Card, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { LogOut, ExternalLink } from 'lucide-react'
// import { useEffect, useState } from 'react'
// import DashboardButton from '@/components/DashboardButton'

// export default function JobKitResultPage() {

//   const API_KEY  = process.env.NEXT_PUBLIC_API_BASE
//   const router = useRouter()
//   const { user, isLoading, logout } = useAuth()

//   // Show job link if you want
//   const [jobLink, setJobLink] = useState<string | null>(null)
//   // Store results from localStorage
//   const [resumeText, setResumeText] = useState<string | null>(null)
//   const [coverLetterText, setCoverLetterText] = useState<string | null>(null)

//   useEffect(() => {
//     // Get jobLink from localStorage (optional)
//     setJobLink(localStorage.getItem('jobLink') || null)
//     // Load AI-generated resume/cover from localStorage
//     setResumeText(localStorage.getItem('generated_resume') || null)
//     setCoverLetterText(localStorage.getItem('generated_cover_letter') || null)
//   }, [])

//   if (!isLoading && !user) {
//     router.replace('/')
//     return null
//   }
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
//       </div>
//     )
//   }


//   const handleLogout = () => {
//     logout()
    
//     localStorage.clear(); // This clears all localStorage for this domain

//     // add any other keys you want to clear!
//   }


//   // Fallback dummy if nothing found (for dev/testing)
//   const fallbackResume = `Your resume will appear here.`
//   const fallbackCover = `Your cover letter will appear here.`


//   const downloadResumePdf = async () => {
//   const latex = localStorage.getItem("latex_resume");
//   if (!latex) {
//     alert("No LaTeX resume found!");
//     return;
//   }

//   const response = await fetch("https://latex.ytotech.com/builds/sync", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       compiler: "pdflatex",
//       resources: [{ content: latex, main: true, file: "resume.tex" }],
//     }),
//   });

//   if (!response.ok) {
//     alert("PDF generation failed");
//     return;
//   }

//   const blob = await response.blob();
//   const url = window.URL.createObjectURL(blob);
//   const a = document.createElement("a");
//   a.href = url;
//   a.download = "resume.pdf";
//   a.click();
//   window.URL.revokeObjectURL(url);
// };


// const downloadResumeDocx = async () => {
//   const API_KEY = process.env.NEXT_PUBLIC_API_BASE;
//   const reportId = localStorage.getItem("report_id");

//   if (!reportId) {
//     alert("No report_id found in localStorage!");
//     return;
//   }

//   try {
//     const response = await fetch(`${API_KEY}download-custom-resume-docx?report_id=${reportId}`);
//     if (!response.ok) {
//       alert("Failed to generate/download resume DOCX");
//       return;
//     }

//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "resume.docx";
//     document.body.appendChild(a); // Needed for Firefox
//     a.click();
//     a.remove();
//     window.URL.revokeObjectURL(url);
//   } catch (err) {
//     alert("Resume download failed!");
//     console.error(err);
//   }
// };




// //   const downloadResumeDocx = async () => {
// //   const resumeMarkdown = localStorage.getItem('generated_resume');
// //   if (!resumeMarkdown) {
// //     alert("No resume found in localStorage!");
// //     return;
// //   }
// //   // Prepare form data for the backend
// //   const formData = new FormData();
// //   formData.append('resume_text', resumeMarkdown);

// //   try {
// //     const response = await fetch(`${API_KEY}generate-resume-pdf`, {
// //       method: 'POST',
// //       body: formData,
// //     });
// //     if (!response.ok) {
// //       throw new Error('Failed to generate resume DOCX');
// //     }
// //     const blob = await response.blob();
// //     const url = window.URL.createObjectURL(blob);
// //     const a = document.createElement('a');
// //     a.href = url;
// //     a.download = 'resume.docx';
// //     document.body.appendChild(a);
// //     a.click();
// //     a.remove();
// //     window.URL.revokeObjectURL(url);
// //   } catch (err) {
// //     alert('Resume download failed!');
// //     console.error(err);
// //   }
// // };


// const downloadCoverLetterDocx = async () => {
//   const coverLetter = localStorage.getItem('generated_cover_letter');
//   if (!coverLetter) {
//     alert("No cover letter found in localStorage!");
//     return;
//   }
//   const formData = new FormData();
//   formData.append('cover_letter_text', coverLetter);

//   try {
//     const response = await fetch(`${API_KEY}generate-cover-letter-pdf`, {
//       method: 'POST',
//       body: formData,
//     });
//     if (!response.ok) {
//       throw new Error('Failed to generate cover letter DOCX');
//     }
//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = 'cover_letter.docx';
//     document.body.appendChild(a);
//     a.click();
//     a.remove();
//     window.URL.revokeObjectURL(url);
//   } catch (err) {
//     alert('Cover letter download failed!');
//     console.error(err);
//   }
// };



//   const download = (name: string, txt: string) => {
//     const blob = new Blob([txt], { type: 'text/plain' })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement('a')
//     a.href = url
//     a.download = name
//     a.click()
//     URL.revokeObjectURL(url)
//   }

//   return (
//     <div className="min-h-screen bg-[#eef5ff] m-12">
//       {/* Top Bar */}
//       <header className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">
//             Genertaed Resume & Cover Letter
//           </h1>
//         </div>
//         <div className="flex gap-2">
//           <DashboardButton />
//           <Button variant="outline" onClick={handleLogout}>
//             <LogOut className="mr-2 h-4 w-4" /> Logout
//           </Button>
//         </div>
//       </header>

//       {/* 2 Boxes (side by side, scrollable) */}
//       <main className="flex flex-row gap-8 w-full h-[calc(100vh-10rem)]">
//         {/* Resume */}
//         <Card className="flex-1 h-full flex flex-col shadow-lg">
//           <CardContent className="flex flex-col h-full">
//             <h2 className="text-2xl font-semibold mb-2">Resume</h2>
//             <div className="flex-1 bg-gray-50 rounded-md p-4 overflow-y-auto">
//               <pre className="text-sm whitespace-pre-wrap break-words">
//                 {resumeText || fallbackResume}
//               </pre>
//             </div>
//             <Button
//               className="mt-4"
//               onClick={downloadResumeDocx}
//               disabled={!resumeText}
//             >
//               Download Resume (.docx)
//             </Button>
//           </CardContent>
//         </Card>

//         {/* Cover Letter (if provided) */}
//         <Card className="flex-1 h-full flex flex-col shadow-lg">
//           <CardContent className="flex flex-col h-full">
//             <h2 className="text-2xl font-semibold mb-2">Cover Letter</h2>
//             <div className="flex-1 bg-gray-50 rounded-md p-4 overflow-y-auto">
//               <pre className="text-sm whitespace-pre-wrap break-words">
//                 {coverLetterText || fallbackCover}
//               </pre>
//             </div>
//             <Button
//               className="mt-4"
//               onClick={downloadCoverLetterDocx}
//               disabled={!coverLetterText}
//             >
//               Download Cover Letter (.docx)
//             </Button>

//           </CardContent>
//         </Card>
//       </main>
//     </div>
//   )
// }














// 'use client'
// export const dynamic = 'force-dynamic'

// import { useRouter } from 'next/navigation'
// import { useAuth } from '@/components/AuthProvider'
// import { Card, CardContent } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { LogOut, ExternalLink } from 'lucide-react'
// import { useEffect, useState } from 'react'

// export default function JobKitResultPage() {
//   const router = useRouter()
//   const { user, isLoading, logout } = useAuth()

//   // Get jobLink from localStorage (set in previous page)
//   const [jobLink, setJobLink] = useState<string | null>(null)
//   useEffect(() => {
//     const storedLink = localStorage.getItem('jobLink')
//     setJobLink(storedLink)
//   }, [])

//   if (!isLoading && !user) {
//     router.replace('/')
//     return null
//   }
//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-[#eef5ff] flex items-center justify-center">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
//       </div>
//     )
//   }

//   // Your dummy text (put your actual text here)
//   const resumeText = `R U C H I T   R A K H O L I Y A
// -----------------------------------------------------------------------
// Upland, CA • Open to Relocation (Austin, TX – Hybrid) • Mobile: (909) 552-2660
// Email: ruchitrakholiya878@gmail.com • LinkedIn: www.linkedin.com/in/ruchit878
// Portfolio: www.ruchitrakholiya.com

// SUMMARY
// Full-stack Software Engineer with 5+ years building web-based enterprise applications using the Microsoft stack (C#, ASP.NET / .NET Core, Web API, SQL Server) plus automation, data visualization, and cloud integration experience across Microsoft 365, SharePoint Online, and Azure services. Deliver DB-to-UI solutions, design reusable components, build automated workflows, and support governed, multi-unit deployments similar to SaaS multi-tenant environments. Quick to pick up new frameworks—currently working in modern component UIs (React/TypeScript) and ramp-ready for Angular. Strong communication, cross-team collaboration, and customer-focused problem solving.

// CORE TECHNICAL SKILLS
// Languages: C#, JavaScript/TypeScript, Python, Java, PowerShell, HTML/CSS
// Frameworks: .NET / .NET Core, ASP.NET MVC, Web API, Entity Framework
// Frontend: React (current projects), Bootstrap; comfortable adopting Angular quickly
// Messaging & Integration: REST APIs; Kafka (POC / lab experience); Power Automate connectors
// Cloud & Enterprise Platforms: Microsoft 365, SharePoint Online (SPFx), Azure AD, Active Directory
// Data: SQL Server, MySQL; schema design; reporting/analytics via Power BI
// Automation & DevOps: Power Automate, PowerShell scripting, CI-oriented workflows, version control (Git, Bitbucket)
// Monitoring / Observability: Kibana, Grafana, OpenSearch, Logstash
// Practices: SDLC, Agile/Scrum, code reviews, unit testing, change management, performance optimization

// PROFESSIONAL EXPERIENCE
// -----------------------------------------------------------------------
// WELLOMY INC. – Corona, CA
// Software Developer | Sept 2024 – Present
// • Build and maintain enterprise business applications using ASP.NET Core/C#, SQL Server, and Microsoft 365 integrations.
// • Develop and manage SharePoint Online solutions: site architecture, role-based permissions, document automation, O365 Groups.
// • Implement workflow automation with Power Automate (approvals, notifications, data sync) to reduce manual operations.
// • Design executive and operational reporting dashboards in Power BI; integrate with SQL and M365 data sources.
// • Support secure, scalable deployments; collaborate across product, QA, and infrastructure teams.
// Tools: .NET Core, C#, SharePoint Online, Power Automate, Power BI, SQL Server, Azure AD, Git.

// CALIFORNIA STATE UNIVERSITY, SAN BERNARDINO – San Bernardino, CA
// Instructional Student Assistant (Microsoft 365 / Technical Support) | Jan 2023 – May 2024
// • Supported faculty & student adoption of Microsoft 365 collaboration tools (SharePoint, Teams, O365 Groups).
// • Authored user guides, documentation, and quick-start materials—improved self-service and reduced recurring tickets.
// • Assisted in troubleshooting access, permissions, sync, and integration issues across multiple academic departments.
// • Helped prototype automation scripts (PowerShell) and structured guidance for campus technical workshops.

// NEEL CODERS – Surat, Gujarat, India
// Software Developer | Jul 2020 – Jul 2022
// • Developed SharePoint- and Microsoft 365-connected applications for document management and workflow automation.
// • Built PowerApps + SQL integrated forms and dashboards for business process digitization.
// • Wrote PowerShell scripts for deployment, Azure AD object management, and environment configuration.
// • Provided Office 365 Groups and permissions support in multi-department client environments.

// NT INFOSOL – Surat, Gujarat, India
// Software Developer Intern | Jan 2020 – May 2020
// • Assisted in SharePoint Online site development; integrated REST APIs for external data sources.
// • Supported debugging and deployment tasks in cloud-connected application environments.

// EDUCATION
// -----------------------------------------------------------------------
// California State University, San Bernardino (CSUSB) – San Bernardino, CA
// Master of Science, Computer Science | Aug 2022 – Aug 2024 | GPA: 3.5/4.0

// Auro University – Surat, India
// Bachelor of Science, Information Technology | Jul 2017 – May 2020 | GPA: 7.91/10

// SELECTED PROJECTS
// -----------------------------------------------------------------------
// Bank Application (ASP.NET | Performance Optimization)
// • Built multi-feature online banking prototype (ATM, Telebanking, Internet Banking modules).
// • Optimized transaction processing; measured 29% improvement in processing speed during test cycles.

// Movie Ticket Booking Website (PHP / MySQL)
// • Implemented online ticketing with real-time seat selection & payment flow; helped reduce in-person box office load by 48% (academic simulation metric).

// Swapnil Palace – Building Management App (Android / Java / API Validation)
// • Android client integrated with backend APIs validated via Postman & SQL Server.
// • Dynamic server data retrieval achieved ~89% data accuracy in functional testing.

// RECENT TECHNICAL LAB WORK & CONTINUING EDUCATION
// -----------------------------------------------------------------------
// • Event-Driven Microservices with Kafka 3.7 (Spring Cloud Stream lab; messaging patterns transferable to .NET microservices).
// • Spring Cloud Gateway Routing & Filters (architecture concepts for service-oriented & API gateway models).
// • Kubernetes & ConfigMaps orchestration lab experience.
// • CI/CD Pipeline automation with Jenkins (test + deploy microservices).

// CERTIFICATIONS
// -----------------------------------------------------------------------
// • Microsoft Power Platform Fundamentals
// • AWS Cloud Practitioner Essentials
// • CCNA Routing & Switching
// • Certified Software Project Manager (NPTEL)
// • Cryptographic Algorithms for Blockchain Networks
// • 3D Animation using Blender (creative/visual)

// ADDITIONAL INFORMATION
// -----------------------------------------------------------------------
// Work Authorization: F‑1 OPT (STEM extension eligible); will require future employer sponsorship.
// Soft Skills: Analytical, methodical, deadline‑driven, articulate communicator, collaborative teammate, proactive troubleshooter.
// Interests: Cloud automation, aviation technology, data visualization, end‑user enablement.

// `
//   const coverLetterText = `Ruchit Rakholiya
// 1320 Kendra Ln
// Upland, CA 91784
// Mobile: (909) 552-2660
// Email: ruchitrakholiya878@gmail.com
// LinkedIn: www.linkedin.com/in/ruchit878
// Portfolio: www.ruchitrakholiya.com

// July 16, 2025

// Hiring Team
// CAMP Systems International, Inc.
// (Continuum Applied Technology Division)
// Austin, TX

// Re: Software Engineer (Austin, TX • Hybrid) – Application via LinkedIn

// Dear Hiring Team,

// I am excited to apply for the Software Engineer position supporting the Continuum Applied Technology division at CAMP Systems International. I recently saw the role on LinkedIn and was immediately drawn to CAMP’s mission of making flight safer and more efficient through data, compliance, and intelligent software—an environment where scalable, high‑quality engineering really matters.

// I bring 5+ years of experience building and supporting web‑based enterprise software using the Microsoft stack (C#, ASP.NET / .NET Core, SQL Server), with additional hands‑on work in cloud services, data modeling, automation, and modern JavaScript front‑end frameworks. Across roles at Wellomy Inc., Neel Coders, and California State University, I’ve delivered full‑stack solutions end‑to‑end: database schema design, secure API development, workflow automation, and user‑focused web interfaces.

// **Highlights aligned to CAMP’s needs:**
// • **Full‑stack Microsoft Development:** Built and maintained enterprise applications in ASP.NET Core/C#, REST APIs, and SQL Server; integrated identity, role‑based access, and compliance‑driven data handling.  
// • **Scalable / Multi‑Tenant Concepts:** Designed SharePoint Online and Office 365 solutions spanning multiple business units—segmented data, governed permissions, and reusable component patterns analogous to SaaS tenants.  
// • **Automation & Integration:** Power Automate and scripting (PowerShell, REST) to streamline data sync, notifications, and approval flows across systems.  
// • **Messaging & Event Patterns:** Recent project and lab work with event‑driven architectures (Kafka) and logging/monitoring stacks (OpenSearch, Grafana, Kibana) to support resilient, observable services.  
// • **UI Engineering Experience:** Professional work in Microsoft 365 web components and current projects using modern component frameworks (React/TypeScript), making me ramp‑ready for Angular in your next‑gen platform.

// I thrive in collaborative, cross‑functional teams; I’m comfortable reviewing architecture, proposing design improvements, writing automated tests, and mentoring peers when needed. CAMP’s culture of curiosity, ownership, and technical excellence strongly matches the way I like to work.

// I am open to relocation to Austin, TX, and to the hybrid schedule described. I would welcome the opportunity to discuss how my background in .NET development, automation, and data‑centric applications can support CAMP’s next generation platform.

// Thank you for your time and consideration. I look forward to speaking with you.

// Sincerely,

// Ruchit Rakholiya

// `

//   const download = (name: string, txt: string) => {
//     const blob = new Blob([txt], { type: 'text/plain' })
//     const url = URL.createObjectURL(blob)
//     const a = document.createElement('a')
//     a.href = url
//     a.download = name
//     a.click()
//     URL.revokeObjectURL(url)
//   }

//   return (
//     <div className="min-h-screen bg-[#eef5ff] m-12">
//       {/* Top Bar */}
//       <header className="flex items-center justify-between w-full mb-8">
//         <div className="flex items-center gap-4">
//            <h1 className="text-2xl font-bold text-gray-900">
//             Smart Job Kit Generator
//           </h1>
//           {/* Job Link Button if jobLink exists */}

//         </div>
//                   {jobLink && (
//             <Button
//               variant="outline"
//               className="flex items-center"
//               onClick={() => window.open(jobLink, '_blank')}
//             >
//               <ExternalLink className="mr-2 h-4 w-4" />
//               Job Link
//             </Button>
//           )}
//         <Button variant="outline" onClick={logout}>
//           <LogOut className="mr-2 h-4 w-4" />
//           Logout
//         </Button>
//       </header>

//       {/* 2 Fixed Boxes (side by side, equal size, scrollable vertically, wrap lines) */}
//       <main className="flex flex-row gap-8 w-full h-[calc(100vh-10rem)]">
//         {/* Resume */}
//         <Card className="flex-1 h-full flex flex-col shadow-lg">
//           <CardContent className="flex flex-col h-full">
//             <h2 className="text-2xl font-semibold mb-2">Resume</h2>
//             <div className="flex-1 bg-gray-50 rounded-md p-4 overflow-y-auto">
//               {/* Wrapped text inside fixed box, vertical scroll only */}
//               <pre className="text-sm whitespace-pre-wrap break-words">{resumeText}</pre>
//             </div>
//             <Button className="mt-4" onClick={() => download('resume.txt', resumeText)}>
//               Download Resume
//             </Button>
//           </CardContent>
//         </Card>

//         {/* Cover Letter */}
//         <Card className="flex-1 h-full flex flex-col shadow-lg">
//           <CardContent className="flex flex-col h-full">
//             <h2 className="text-2xl font-semibold mb-2">Cover Letter</h2>
//             <div className="flex-1 bg-gray-50 rounded-md p-4 overflow-y-auto">
//               {/* Wrapped text inside fixed box, vertical scroll only */}
//               <pre className="text-sm whitespace-pre-wrap break-words">{coverLetterText}</pre>
//             </div>
//             <Button className="mt-4" onClick={() => download('cover-letter.txt', coverLetterText)}>
//               Download Cover Letter
//             </Button>
//           </CardContent>
//         </Card>
//       </main>
//     </div>
//   )
// }
