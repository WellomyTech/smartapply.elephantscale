"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Pencil, FileText, Upload, BadgeCheck } from "lucide-react";
import { formatLocalFromUTC } from "@/lib/dates";
import { useRouter } from "next/navigation";

type Profile = {
  name: string;
  email: string;
  is_premium?: boolean;
  free_used?: number;
  has_resume?: boolean;
  has_cover_letter?: boolean;
  picture?: string;
  last_resume_uploaded?: string; // <-- Add this
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverLetterFile, setCoverLetterFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter(); // <-- Add this
  const resumeInputRef = useRef<HTMLInputElement | null>(null);
  const coverLetterInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Get email from localStorage
    const email = localStorage.getItem("user_email");
    let picture = "";
    try {
      const socialUserRaw = localStorage.getItem("socialUser");
      if (socialUserRaw) {
        const socialUser = JSON.parse(socialUserRaw);
        if (socialUser.picture) picture = socialUser.picture;
      }
    } catch {}
    if (!email) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_BASE || ""}user-dashboard?user_email=${encodeURIComponent(email)}`)
      .then((res) => res.json())
      .then((data) => {
        setProfile({
          name: data.name || "",
          email: data.email || email,
          is_premium: data.is_premium ?? false,
          free_used: data.free_used ?? 0,
          has_resume: !!data.has_resume,
          has_cover_letter: !!data.has_cover_letter,
          picture: picture,
          last_resume_uploaded: data.last_resume_uploaded, // <-- Add this
        });
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  // Upload handlers (no-op, UI only)
  const onResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setResumeFile(f);
    setError("");
  };
  const onCoverLetterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setCoverLetterFile(f);
    setError("");
  };

  // Helper to check if 24 hours have passed since last upload
  function canUploadResume(lastUploaded?: string) {
    if (!lastUploaded) return true;
    const last = new Date(/[zZ]|[+-]\d{2}:\d{2}$/.test(lastUploaded) ? lastUploaded : `${lastUploaded}Z`).getTime();
    if (isNaN(last)) return true;
    return Date.now() - last >= 24 * 60 * 60 * 1000;
  }

  // Resume upload handler
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("user_email", profile?.email || "");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || ""}upload-resume`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      setResumeFile(file);
      window.location.reload(); // Reload page on success
    } catch (err) {
      setError("Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  // Cover letter upload handler
  const handleCoverLetterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("cover_letter", file);
      formData.append("user_email", profile?.email || "");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE || ""}upload-cover-letter`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) throw new Error("Upload failed");

      setCoverLetterFile(file);
      window.location.reload(); // Reload page on success
    } catch (err) {
      setError("Failed to upload cover letter");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#e0e7ef] to-[#f1f5f9] flex flex-col py-8 md:py-12">
      {/* Profile Title Card */}
      <div className="w-full max-w-7xl px-4 mx-auto mb-8">
        <Card className="shadow-lg border border-gray-100 bg-white/90">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">Profile</span>
            </h1>
            <Button variant="outline" size="sm" className="gap-2">
              <Pencil className="w-4 h-4" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main content with wide max-w-7xl and px-4 for left/right margin, like dashboard */}
      <section className="flex-1 flex flex-col items-center justify-center mt-0">
        <div className="w-full max-w-7xl px-4 mx-auto flex flex-col gap-8">
          {/* User Card */}
          <Card className="bg-white/80 shadow-xl border border-gray-100">
            <CardContent className="flex items-center gap-6 p-8">
              {profile?.picture ? (
                <img
                  src={profile.picture}
                  alt={profile.name}
                  className="h-20 w-20 rounded-full object-cover ring-4 ring-blue-500/20"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-semibold text-white shadow-lg">
                  <User className="w-10 h-10" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-2xl font-bold text-slate-900">{loading ? <span className="animate-pulse bg-gray-200 rounded w-32 h-6 inline-block" /> : profile?.name || "—"}</p>
                <p className="text-base text-gray-500">{loading ? <span className="animate-pulse bg-gray-100 rounded w-40 h-4 inline-block" /> : profile?.email || "—"}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  <BadgeCheck className="w-4 h-4" />
                  {profile?.is_premium ? "Premium" : "Free"}
                </div>
                <div className="text-xs text-gray-500">
                  Free Used: <span className="font-semibold text-gray-700">{profile?.free_used ?? "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Resume */}
            <Card className="bg-white/80 shadow-xl border border-gray-100">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-blue-600">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold">Upload Resume (PDF) *</h2>
                </div>
                {/* 24 hour and premium logic */}
                {profile?.last_resume_uploaded && !canUploadResume(profile.last_resume_uploaded) ? (
                  <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                    You can only upload a resume once every 24 hours.<br />
                    Last uploaded: <span className="font-semibold">{formatLocalFromUTC(profile.last_resume_uploaded)}</span>
                    {!profile?.is_premium && (
                      <div className="mt-2 text-red-700">
                        Upgrade to <span className="font-bold">Premium</span> to unlock more frequent uploads.
                      </div>
                    )}
                  </div>
                ) : profile?.last_resume_uploaded && canUploadResume(profile.last_resume_uploaded) ? (
                  profile?.is_premium ? (
                    <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 mb-2">
                      24 hours have passed since your last upload.<br />
                      You can re-upload your resume if you like.
                    </div>
                  ) : (
                    <div className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                      24 hours have passed since your last upload.<br />
                      <span className="font-semibold">Upgrade to Premium</span> to upload again.
                    </div>
                  )
                ) : null}
                {profile?.has_resume && (
                  <div className="text-center p-3 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-green-700 font-medium text-sm">✓ Resume uploaded</p>
                  </div>
                )}
                <label
                  htmlFor="resume"
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-32 cursor-pointer transition-all duration-300 ${
                    (!canUploadResume(profile?.last_resume_uploaded) || !profile?.is_premium)
                      ? "opacity-60 cursor-not-allowed border-gray-300"
                      : "hover:border-blue-400 hover:bg-blue-50/50 border-gray-300"
                  }`}
                >
                  <Input
                    id="resume"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    ref={resumeInputRef}
                    onChange={handleResumeUpload} // <-- Use new handler
                    disabled={
                      !canUploadResume(profile?.last_resume_uploaded) || !profile?.is_premium || uploading
                    }
                  />
                  {resumeFile ? (
                    <p className="text-sm">{resumeFile.name}</p>
                  ) : (
                    <p className={`text-sm text-muted-foreground`}>
                      {profile?.has_resume
                        ? "Resume uploaded"
                        : uploading
                        ? "Uploading..."
                        : "Click to upload PDF"}
                    </p>
                  )}
                </label>
                {error && (
                  <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-2 mt-2 text-sm">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cover Letter */}
            <Card className="bg-white/80 shadow-xl border border-gray-100">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3 text-purple-600">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <Upload className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-semibold">Upload Cover Letter (PDF)</h2>
                </div>
                <label
                  htmlFor="cover-letter"
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl h-32 cursor-pointer transition-all duration-300 ${
                    !profile?.has_resume || profile?.has_cover_letter
                      ? "opacity-60 cursor-not-allowed border-gray-300"
                      : "hover:border-purple-400 hover:bg-purple-50/50 border-gray-300"
                  }`}
                >
                  <Input
                    id="cover-letter"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    ref={coverLetterInputRef}
                    onChange={handleCoverLetterUpload} // <-- Use new handler
                    disabled={!profile?.has_resume || profile?.has_cover_letter || uploading}
                  />
                  {coverLetterFile ? (
                    <p className="text-sm">{coverLetterFile.name}</p>
                  ) : (
                    <p className={`text-sm text-muted-foreground`}>
                      {!profile?.has_resume
                        ? "Upload resume first to unlock"
                        : profile?.has_cover_letter
                        ? "Cover letter uploaded"
                        : uploading
                        ? "Uploading..."
                        : "Click to upload PDF (optional)"}
                    </p>
                  )}
                </label>
                {error && (
                  <div className="text-red-700 bg-red-50 border border-red-200 rounded-lg p-2 mt-2 text-sm">
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Subscription Details */}
          <Card className="bg-white/80 shadow-xl border border-gray-100">
            <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Subscription Details</h3>
                <ul className="text-gray-700 text-base space-y-1">
                  <li>
                    <span className="font-semibold">Status:</span>{" "}
                    {profile?.is_premium ? (
                      <span className="text-green-600 font-bold">Premium</span>
                    ) : (
                      <span className="text-gray-500">Free</span>
                    )}
                  </li>
                  <li>
                    <span className="font-semibold">Free Credits Used:</span>{" "}
                    {profile?.free_used ?? "—"}
                  </li>
                  <li>
                    <span className="font-semibold">Resume Uploaded:</span>{" "}
                    {profile?.has_resume ? "Yes" : "No"}
                  </li>
                  <li>
                    <span className="font-semibold">Cover Letter Uploaded:</span>{" "}
                    {profile?.has_cover_letter ? "Yes" : "No"}
                  </li>
                </ul>
              </div>
              <div className="flex flex-col items-center gap-2">
                {profile?.is_premium ? (
                  <span className="px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold text-sm flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4" /> Premium Member
                  </span>
                ) : (
                  <span className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-semibold text-sm">
                    Free Plan
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}