'use client'

import { useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function JobKitResultPage() {
  // Dummy content for now
  const resumeText = `
R U C H I T   R A K H O L I Y A
-----------------------------------------------------------------------
Upland, CA • Open to Relocation (Austin, TX – Hybrid) • Mobile: (909) 552-2660
Email: ruchitrakholiya878@gmail.com • LinkedIn: www.linkedin.com/in/ruchit878
Portfolio: www.ruchitrakholiya.com

SUMMARY
Full-stack Software Engineer with 5+ years building web-based enterprise applications using the Microsoft stack (C#, ASP.NET / .NET Core, Web API, SQL Server) plus automation, data visualization, and cloud integration experience across Microsoft 365, SharePoint Online, and Azure services. Deliver DB-to-UI solutions, design reusable components, build automated workflows, and support governed, multi-unit deployments similar to SaaS multi-tenant environments. Quick to pick up new frameworks—currently working in modern component UIs (React/TypeScript) and ramp-ready for Angular. Strong communication, cross-team collaboration, and customer-focused problem solving.

CORE TECHNICAL SKILLS
Languages: C#, JavaScript/TypeScript, Python, Java, PowerShell, HTML/CSS
Frameworks: .NET / .NET Core, ASP.NET MVC, Web API, Entity Framework
Frontend: React (current projects), Bootstrap; comfortable adopting Angular quickly
Messaging & Integration: REST APIs; Kafka (POC / lab experience); Power Automate connectors
Cloud & Enterprise Platforms: Microsoft 365, SharePoint Online (SPFx), Azure AD, Active Directory
Data: SQL Server, MySQL; schema design; reporting/analytics via Power BI
Automation & DevOps: Power Automate, PowerShell scripting, CI-oriented workflows, version control (Git, Bitbucket)
Monitoring / Observability: Kibana, Grafana, OpenSearch, Logstash
Practices: SDLC, Agile/Scrum, code reviews, unit testing, change management, performance optimization

PROFESSIONAL EXPERIENCE
-----------------------------------------------------------------------
WELLOMY INC. – Corona, CA
Software Developer | Sept 2024 – Present
• Build and maintain enterprise business applications using ASP.NET Core/C#, SQL Server, and Microsoft 365 integrations.
• Develop and manage SharePoint Online solutions: site architecture, role-based permissions, document automation, O365 Groups.
• Implement workflow automation with Power Automate (approvals, notifications, data sync) to reduce manual operations.
• Design executive and operational reporting dashboards in Power BI; integrate with SQL and M365 data sources.
• Support secure, scalable deployments; collaborate across product, QA, and infrastructure teams.
Tools: .NET Core, C#, SharePoint Online, Power Automate, Power BI, SQL Server, Azure AD, Git.

CALIFORNIA STATE UNIVERSITY, SAN BERNARDINO – San Bernardino, CA
Instructional Student Assistant (Microsoft 365 / Technical Support) | Jan 2023 – May 2024
• Supported faculty & student adoption of Microsoft 365 collaboration tools (SharePoint, Teams, O365 Groups).
• Authored user guides, documentation, and quick-start materials—improved self-service and reduced recurring tickets.
• Assisted in troubleshooting access, permissions, sync, and integration issues across multiple academic departments.
• Helped prototype automation scripts (PowerShell) and structured guidance for campus technical workshops.

NEEL CODERS – Surat, Gujarat, India
Software Developer | Jul 2020 – Jul 2022
• Developed SharePoint- and Microsoft 365-connected applications for document management and workflow automation.
• Built PowerApps + SQL integrated forms and dashboards for business process digitization.
• Wrote PowerShell scripts for deployment, Azure AD object management, and environment configuration.
• Provided Office 365 Groups and permissions support in multi-department client environments.

NT INFOSOL – Surat, Gujarat, India
Software Developer Intern | Jan 2020 – May 2020
• Assisted in SharePoint Online site development; integrated REST APIs for external data sources.
• Supported debugging and deployment tasks in cloud-connected application environments.

EDUCATION
-----------------------------------------------------------------------
California State University, San Bernardino (CSUSB) – San Bernardino, CA
Master of Science, Computer Science | Aug 2022 – Aug 2024 | GPA: 3.5/4.0

Auro University – Surat, India
Bachelor of Science, Information Technology | Jul 2017 – May 2020 | GPA: 7.91/10

SELECTED PROJECTS
-----------------------------------------------------------------------
Bank Application (ASP.NET | Performance Optimization)
• Built multi-feature online banking prototype (ATM, Telebanking, Internet Banking modules).
• Optimized transaction processing; measured 29% improvement in processing speed during test cycles.

Movie Ticket Booking Website (PHP / MySQL)
• Implemented online ticketing with real-time seat selection & payment flow; helped reduce in-person box office load by 48% (academic simulation metric).

Swapnil Palace – Building Management App (Android / Java / API Validation)
• Android client integrated with backend APIs validated via Postman & SQL Server.
• Dynamic server data retrieval achieved ~89% data accuracy in functional testing.

RECENT TECHNICAL LAB WORK & CONTINUING EDUCATION
-----------------------------------------------------------------------
• Event-Driven Microservices with Kafka 3.7 (Spring Cloud Stream lab; messaging patterns transferable to .NET microservices).
• Spring Cloud Gateway Routing & Filters (architecture concepts for service-oriented & API gateway models).
• Kubernetes & ConfigMaps orchestration lab experience.
• CI/CD Pipeline automation with Jenkins (test + deploy microservices).

CERTIFICATIONS
-----------------------------------------------------------------------
• Microsoft Power Platform Fundamentals
• AWS Cloud Practitioner Essentials
• CCNA Routing & Switching
• Certified Software Project Manager (NPTEL)
• Cryptographic Algorithms for Blockchain Networks
• 3D Animation using Blender (creative/visual)

ADDITIONAL INFORMATION
-----------------------------------------------------------------------
Work Authorization: F‑1 OPT (STEM extension eligible); will require future employer sponsorship.
Soft Skills: Analytical, methodical, deadline‑driven, articulate communicator, collaborative teammate, proactive troubleshooter.
Interests: Cloud automation, aviation technology, data visualization, end‑user enablement.

`
  const coverLetterText = `
Ruchit Rakholiya
1320 Kendra Ln
Upland, CA 91784
Mobile: (909) 552-2660
Email: ruchitrakholiya878@gmail.com
LinkedIn: www.linkedin.com/in/ruchit878
Portfolio: www.ruchitrakholiya.com

July 16, 2025

Hiring Team
CAMP Systems International, Inc.
(Continuum Applied Technology Division)
Austin, TX

Re: Software Engineer (Austin, TX • Hybrid) – Application via LinkedIn

Dear Hiring Team,

I am excited to apply for the Software Engineer position supporting the Continuum Applied Technology division at CAMP Systems International. I recently saw the role on LinkedIn and was immediately drawn to CAMP’s mission of making flight safer and more efficient through data, compliance, and intelligent software—an environment where scalable, high‑quality engineering really matters.

I bring 5+ years of experience building and supporting web‑based enterprise software using the Microsoft stack (C#, ASP.NET / .NET Core, SQL Server), with additional hands‑on work in cloud services, data modeling, automation, and modern JavaScript front‑end frameworks. Across roles at Wellomy Inc., Neel Coders, and California State University, I’ve delivered full‑stack solutions end‑to‑end: database schema design, secure API development, workflow automation, and user‑focused web interfaces.

**Highlights aligned to CAMP’s needs:**
• **Full‑stack Microsoft Development:** Built and maintained enterprise applications in ASP.NET Core/C#, REST APIs, and SQL Server; integrated identity, role‑based access, and compliance‑driven data handling.  
• **Scalable / Multi‑Tenant Concepts:** Designed SharePoint Online and Office 365 solutions spanning multiple business units—segmented data, governed permissions, and reusable component patterns analogous to SaaS tenants.  
• **Automation & Integration:** Power Automate and scripting (PowerShell, REST) to streamline data sync, notifications, and approval flows across systems.  
• **Messaging & Event Patterns:** Recent project and lab work with event‑driven architectures (Kafka) and logging/monitoring stacks (OpenSearch, Grafana, Kibana) to support resilient, observable services.  
• **UI Engineering Experience:** Professional work in Microsoft 365 web components and current projects using modern component frameworks (React/TypeScript), making me ramp‑ready for Angular in your next‑gen platform.

I thrive in collaborative, cross‑functional teams; I’m comfortable reviewing architecture, proposing design improvements, writing automated tests, and mentoring peers when needed. CAMP’s culture of curiosity, ownership, and technical excellence strongly matches the way I like to work.

I am open to relocation to Austin, TX, and to the hybrid schedule described. I would welcome the opportunity to discuss how my background in .NET development, automation, and data‑centric applications can support CAMP’s next generation platform.

Thank you for your time and consideration. I look forward to speaking with you.

Sincerely,

Ruchit Rakholiya

`

  const downloadFile = useCallback((filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  return (
    // changed from max-w-5xl to w-full so it fills the page
    <div className="w-full px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-center">
        Your Generated Documents
      </h1>

      {/* two-column grid that spans full width */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {/* Resume */}
        <Card className="w-full shadow-lg">
          <CardContent className="space-y-4">
            <h2 className="text-2xl font-semibold">Resume</h2>
            <pre className="bg-gray-50 p-4 rounded-md text-sm whitespace-pre-wrap">
              {resumeText}
            </pre>
            <Button onClick={() => downloadFile('resume.txt', resumeText)}>
              Download Resume
            </Button>
          </CardContent>
        </Card>

        {/* Cover Letter */}
        <Card className="w-full shadow-lg">
          <CardContent className="space-y-4">
            <h2 className="text-2xl font-semibold">Cover Letter</h2>
            <pre className="bg-gray-50 p-4 rounded-md text-sm whitespace-pre-wrap">
              {coverLetterText}
            </pre>
            <Button onClick={() => downloadFile('cover-letter.txt', coverLetterText)}>
              Download Cover Letter
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
