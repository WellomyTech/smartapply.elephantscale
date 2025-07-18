// lib/endpoints.ts

export interface SkillsMatchItem {
  skill: string;
  in_job: boolean;
  in_resume: boolean;
}

export interface CompareApiResponse {
  skills_match: SkillsMatchItem[];
  gaps: string[];
  bonus_points: string[];
  recommendations: string[];
  google_doc_link: string;
}

export interface CompareApiInput {
  resume: File;
  jobUrl?: string;
  description?: string;
  email: string;
}

export async function compareResumeJob(
  data: CompareApiInput
): Promise<CompareApiResponse> {
  const form = new FormData();
  form.append('resume', data.resume);
  if (data.jobUrl) form.append('jobUrl', data.jobUrl);
  if (data.description) form.append('description', data.description);
  form.append('email', data.email);

  const res = await fetch('http://127.0.0.1:8000/api/compare-resume-job', {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json();
}
