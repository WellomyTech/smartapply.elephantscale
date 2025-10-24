// Premium report generation service

// Default to the public Azure endpoints if environment variables are not provided.
const REPORT_API =
  process.env.NEXT_PUBLIC_REPORT_API ||
  'https://resumetool-e9hzh8dycbamhma2.westus-01.azurewebsites.net/resume_assessment/generate-report'
const PSYCH_REPORT_API =
  process.env.NEXT_PUBLIC_PSYCH_REPORT_API ||
  'https://resumetool-e9hzh8dycbamhma2.westus-01.azurewebsites.net/resume_assessment/generate-psychometric-report'

type ResumeData = {
  skills?: string[]
  experience?: string
  industry?: string
  education?: string
  currentRole?: string
  rawText?: string
  fileName?: string
}

export class PremiumReportService {
  static async generatePremiumReport(
    resumeData: ResumeData,
    psychometricResults: any,
    analysisType: string
  ) {
    const kind = (analysisType || 'quick').toLowerCase()

    if (kind === 'quick') {
      if (!REPORT_API) throw new Error('NEXT_PUBLIC_REPORT_API is not set')

      const params = new URLSearchParams()
      params.set('resume_text', resumeData?.rawText ?? '')
      params.set('analysisType', 'quick')

      const res = await fetch(REPORT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: params.toString(),
      })

      if (!res.ok) {
        const msg = await res.text().catch(() => '')
        throw new Error(`Report API failed: ${res.status} ${msg}`)
      }

      const data = await res.json()
      return Array.isArray(data) ? data[0] : data
    }

    // Detailed: call backend psychometric report API with form data (same style as quick)
    if (!PSYCH_REPORT_API) throw new Error('NEXT_PUBLIC_PSYCH_REPORT_API is not set')
    const orderedAnswers = Array.from({ length: 15 }, (_, i) => (psychometricResults?.answers?.[i + 1] ?? '') as string)
    const params = new URLSearchParams()
    params.set('resume_text', resumeData?.rawText ?? '')
    params.set('analysisType', 'detailed')
    params.set('answers', orderedAnswers.join(','))

    const res = await fetch(PSYCH_REPORT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: params.toString(),
    })
    if (!res.ok) {
      const msg = await res.text().catch(() => '')
      throw new Error(`Psychometric Report API failed: ${res.status} ${msg}`)
    }
    const apiData = await res.json()

    // Merge with defaults to guarantee sections for detailed view
    const defaults = buildDetailedReport(resumeData, psychometricResults)
    return {
      ...defaults,
      ...apiData,
      executiveSummary: { ...defaults.executiveSummary, ...apiData?.executiveSummary },
      marketPosition: { ...defaults.marketPosition, ...apiData?.marketPosition },
      skillsIntelligence: { ...defaults.skillsIntelligence, ...apiData?.skillsIntelligence },
      careerStrategy: { ...defaults.careerStrategy, ...apiData?.careerStrategy },
      personalityAnalysis: apiData?.personalityAnalysis ?? defaults.personalityAnalysis,
      psychometricInsights: apiData?.psychometricInsights ?? defaults.psychometricInsights,
      industryFit: apiData?.industryFit ?? defaults.industryFit,
      careerPaths: apiData?.careerPaths ?? apiData?.personalityMatchedCareerPaths ?? defaults.careerPaths,
      alternativeCareers: apiData?.alternativeCareers ?? defaults.alternativeCareers,
      actionPlanDetailed: apiData?.actionPlanDetailed ?? defaults.actionPlanDetailed,
      aiProofSkills: apiData?.aiProofSkills ?? defaults.aiProofSkills,
      riskAssessment: apiData?.riskAssessment ?? defaults.riskAssessment,
      recommendations: apiData?.recommendations ?? defaults.recommendations,
      nextSteps: apiData?.nextSteps ?? defaults.nextSteps,
    }
  }
}

function buildDetailedReport(resume: ResumeData, psychometric: any) {
  const skills = (resume.skills || []).slice(0, 12)
  const industry = resume.industry || 'Technology'
  const years = resume.experience || '3-5 years'

  const topTraits =
    psychometric?.personalityProfile?.dominantTraits ||
    [
      { trait: 'Analytical', score: 78 },
      { trait: 'Adaptive', score: 74 },
      { trait: 'Collaborative', score: 70 },
    ]

  const personalityType =
    psychometric?.personalityType || 'Adaptive Professional'

  // Build personalityAnalysis to match report page expectations
  const personalityAnalysis = {
    profile: {
      type: personalityType,
      description:
        psychometric?.personalityProfile?.description ||
        'A well-rounded professional with diverse strengths',
      dominantTraits:
        psychometric?.personalityProfile?.dominantTraits || topTraits,
      allTraits:
        psychometric?.personalityProfile?.allTraits ||
        [
          ...topTraits,
          { trait: 'Practical', score: 65 },
          { trait: 'Strategic', score: 62 },
        ],
    },
  }

  // Personality-matched career paths with richer fields for UI
  const personalityMatchedCareerPaths = [
    {
      title: 'Full Stack Developer',
      matchReason: 'Balances analytical depth with collaborative delivery',
      description:
        'Own end-to-end features across frontend and backend with a strong focus on user value.',
      skills: ['JavaScript', 'React', 'Node.js', 'Cloud'],
      salaryRange: '$95,000 - $125,000',
      growthPotential: 'High',
      nextSteps: ['System design practice', 'Cloud certification', 'Ship a full-stack side project'],
      aiProofReason:
        'High degree of cross-functional collaboration, system thinking, and ambiguity handling',
      score: 87,
    },
    {
      title: 'Data Engineer',
      matchReason: 'Analytical, detail-oriented, strong backend fundamentals',
      description:
        'Design reliable data pipelines and infrastructure for analytics and ML workloads.',
      skills: ['Python', 'SQL', 'ETL', 'Airflow'],
      salaryRange: '$105,000 - $140,000',
      growthPotential: 'High',
      nextSteps: ['Build an ETL pipeline', 'Optimize SQL workloads', 'Learn Spark'],
      aiProofReason:
        'Complex system integration, data quality, and platform reliability remain human-driven',
      score: 84,
    },
    {
      title: 'SRE/DevOps Engineer',
      matchReason: 'Adaptive and practical under pressure; improves systems reliability',
      description:
        'Build and maintain resilient systems with strong observability and automation.',
      skills: ['CI/CD', 'Kubernetes', 'Observability'],
      salaryRange: '$105,000 - $145,000',
      growthPotential: 'Medium-High',
      nextSteps: ['Set up GitHub Actions', 'Deploy a K8s cluster', 'Instrument tracing'],
      aiProofReason:
        'Incident response, trade-off decisions, and reliability strategy require human judgment',
      score: 82,
    },
  ]

  // Career strategy section expected by UI
  const careerStrategy = {
    aiStrategies: [
      {
        strategy: 'Leverage AI for boilerplate and code reviews',
        description:
          'Adopt AI-assisted coding for low-level tasks to free time for architecture and quality.',
        impact: 'Very High',
        timeframe: '0-1 month',
      },
      {
        strategy: 'Publish a portfolio with measurable outcomes',
        description:
          'Build credibility with projects showing latency, reliability, or cost improvements.',
        impact: 'High',
        timeframe: '1-2 months',
      },
      {
        strategy: 'Target high-ROI skills with certifications',
        description:
          'Certify in cloud/data tracks to validate capabilities and boost interview conversion.',
        impact: 'High',
        timeframe: '2-3 months',
      },
    ],
    timelineRoadmap: {
      'Month 1': [
        'Assess current gaps (cloud, data, system design)',
        'Set up CI/CD and observability for a demo app',
        'Draft 2-page learning plan',
      ],
      'Month 2': [
        'Complete cloud fundamentals certification',
        'Build an end-to-end feature with metrics',
        'Publish a technical case study on results',
      ],
      'Month 3': [
        'Implement a small ETL/data pipeline project',
        'Practice system design weekly',
        'Apply to roles matching portfolio strengths',
      ],
    },
  }

  // AI-proof skills bars
  const aiProofSkills = [
    { skill: 'System Design & Architecture', strength: 85 },
    { skill: 'Cross-functional Collaboration', strength: 80 },
    { skill: 'Problem Decomposition', strength: 82 },
    { skill: 'Reliability & Observability', strength: 78 },
    { skill: 'Stakeholder Communication', strength: 76 },
  ]

  return {
    // Everything in Quick Report (representative values)
    executiveSummary: {
      overview:
        `The candidate is a ${resume.currentRole || 'Software Professional'} with ${years} of experience in ${industry}. ` +
        `Skill set includes ${skills.slice(0, 5).join(', ') || 'core engineering competencies'}.`,
      keyFindings: [
        'Demonstrated versatility across tools and domains',
        'Transferable skills map to adjacent roles with higher demand',
        'High growth potential with focused upskilling',
      ],
    },
    marketPosition: {
      currentValue: {
        currentEstimate: 85000,
        improvementPotential: 'High',
      },
      salaryBenchmarks: {
        percentiles: { p25: 76000, p50: 85000, p75: 98000, p90: 115000 },
        growth: '7% annually',
        companies: ['Google', 'Microsoft', 'Amazon', 'Meta', 'NVIDIA'],
      },
      negotiationInsights: {
        salaryNegotiationRoom: 'Up to 12% with proof of impact',
        keyLeveragePoints: [
          'Cross-functional collaboration',
          'Breadth across cloud and backend',
          'Recent wins and quantifiable outcomes',
        ],
        bestTimeToNegotiate: 'Offer stage or performance review cycle',
      },
    },
    skillsIntelligence: {
      currentSkills: skills.map((s) => ({
        skill: s,
        demand: ['High', 'Moderate'][Math.random() > 0.4 ? 0 : 1],
        growth: ['Rapid', 'Stable'][Math.random() > 0.5 ? 0 : 1],
        avgSalaryBoost: `${[5, 8, 10, 12, 15][Math.floor(Math.random() * 5)]}%`,
        jobs: 1200 + Math.floor(Math.random() * 2000),
      })),
      skillGaps: [
        { skill: 'Machine Learning', priority: 'High', salaryImpact: '18%', timeToAcquire: '4-6 months' },
        { skill: 'DevOps', priority: 'Medium', salaryImpact: '12%', timeToAcquire: '3-4 months' },
        { skill: 'System Design', priority: 'High', salaryImpact: '15%', timeToAcquire: '2-3 months' },
      ],
      skillsROI: [
        { skill: 'Cloud (AWS/Azure)', currentValue: '90000', investmentCost: '1800', roi: '40%', paybackPeriod: '9 months' },
        { skill: 'System Design', currentValue: '95000', investmentCost: '800', roi: '60%', paybackPeriod: '5 months' },
      ],
    },

    // Psychometric/detailed-only sections
    psychometricInsights: {
      personalityType,
      topTraits,
      narrative:
        `${personalityType} with strengths in ` +
        `${topTraits.map((t: any) => t.trait).slice(0, 3).join(', ')}. ` +
        `Leverages structured problem-solving and adaptability to deliver results.`,
    },
    industryFit: {
      baseIndustry: industry,
      fitByIndustry: [
        { industry: industry, fit: 86, rationale: 'Background alignment and skills transferability' },
        { industry: 'FinTech', fit: 78, rationale: 'Strong programming + data skills' },
        { industry: 'Healthcare Tech', fit: 72, rationale: 'High compliance/quality mindset' },
        { industry: 'AI/ML Platforms', fit: 70, rationale: 'Analytical trait + interest in ML upskilling' },
      ],
    },
    personalityMatchedCareerPaths,
    alternativeCareers: [
      {
        title: 'Solutions Architect',
        why: 'Leverages communication + system design for business outcomes',
        entryPlan: ['Shadow SA calls', 'Certify in cloud architecture', 'Design reference architectures'],
      },
      {
        title: 'Product Engineer',
        why: 'Bridges product thinking with engineering execution',
        entryPlan: ['Write PRDs for side projects', 'A/B test features', 'Analyze product analytics'],
      },
    ],
    actionPlanDetailed: {
      '0-3 months': [
        'Complete Cloud Practitioner certification',
        'Finish one end-to-end project showcasing system design',
        'Start weekly LeetCode/system design practice',
      ],
      '3-6 months': [
        'Contribute to open-source or OSS docs',
        'Build ETL/data project and publish a case study',
      ],
      '6-12 months': [
        'Apply to roles targeting platform/data teams',
        'Negotiate with portfolio of projects and quantified impact',
      ],
      resources: [
        { title: 'System Design Primer', type: 'GitHub', url: 'https://github.com/donnemartin/system-design-primer' },
        { title: 'AWS SA Associate', type: 'Certification', url: 'https://aws.amazon.com/certification/' },
        { title: 'Data Engineering Zoomcamp', type: 'Course', url: 'https://github.com/DataTalksClub/data-engineering-zoomcamp' },
      ],
    },
    riskAssessment: {
      automationRisk: { level: 'Low', score: 3, reasoning: 'Core software roles remain resilient with AI-augmented workflows' },
    },
    recommendations: [
      'Focus on one high-ROI skill at a time (cloud or data)',
      'Quantify outcomes in resume (latency reduced, cost saved, reliability improved)',
      'Showcase end-to-end ownership via public projects',
    ],
    nextSteps: [
      'Publish 1-2 portfolio projects',
      'Schedule certification exam',
      'Target companies with aligned tech stacks',
    ],

    // Fields matching report page expectations for detailed mode
    personalityAnalysis,
    careerStrategy,
    careerPaths: personalityMatchedCareerPaths,
    aiProofSkills,
  }
}
