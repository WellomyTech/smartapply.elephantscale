"use client";

import { type AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export async function getPostLoginPath(): Promise<string> {
  try {
    let email = typeof window !== "undefined" ? localStorage.getItem("user_email") || "" : "";
    if (!email && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('socialUser');
        if (raw) {
          const u = JSON.parse(raw);
          if (u?.email) email = u.email as string;
        }
      } catch {}
    }
    const resp = await fetch(`/api/me/resume-status${email ? `?user_email=${encodeURIComponent(email)}` : ""}`, {
      cache: "no-store",
      headers: email ? { "x-user-email": email } : undefined,
      credentials: "same-origin",
    });
    if (resp.status === 401) return "/";
    const data = await resp.json();
    const has = !!(data?.hasResume);
    return has ? "/job-suggestions" : "/upload?from=login=1";
  } catch {
    return "/upload?from=login=1&err=resumeStatus";
  }
}

export async function redirectAfterLogin(router: AppRouterInstance) {
  const path = await getPostLoginPath();
  router.replace(path);
}
