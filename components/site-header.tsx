"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, Sparkles, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import DashboardButton from "@/components/DashboardButton"
import { useEffect, useState } from "react"

export default function SiteHeader() {
  const { logout, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === "/"

  // Get profile info from localStorage or user context
  const [avatar, setAvatar] = useState<string | null>(null)
  const [name, setName] = useState<string>("")

  useEffect(() => {
    // Try to get from user context first, fallback to localStorage
    if (user?.avatarUrl) setAvatar(user.avatarUrl)
    if (user?.name) setName(user.name)

    // Try to get from keySocialUser in localStorage
    if (typeof window !== "undefined") {
      try {
        const socialUserRaw = localStorage.getItem("socialUser")
        if (socialUserRaw) {
          const socialUser = JSON.parse(socialUserRaw)
          if (socialUser.picture) setAvatar(socialUser.picture)
          if (socialUser.name) setName(socialUser.name)
        }
      } catch {}
    }

    // Fallbacks
    if (!user?.avatarUrl && typeof window !== "undefined") {
      const storedAvatar = localStorage.getItem("avatarUrl")
      if (storedAvatar) setAvatar(storedAvatar)
    }
    if (!user?.name && typeof window !== "undefined") {
      const storedName = localStorage.getItem("name")
      if (storedName) setName(storedName)
    }
  }, [user])

  const handleLogout = async () => {
    if (typeof window === "undefined") return
    const confirmed = window.confirm(
      "Are you sure you want to log out?"
    )
    if (!confirmed) return // ❌ No: dismiss

    try {
      window.localStorage.clear() // ✅ wipe everything
    } catch (e) {
      console.error("Failed to clear localStorage", e)
    }

    try {
      // supports both sync/async logout
      const maybePromise = logout()
      if (maybePromise instanceof Promise) await maybePromise
    } finally {
      router.push("/") // ✅ Yes: go to home
    }
  }

  const handleSymbol = () => {
    if (typeof window === "undefined") return;

    const confirmed = window.confirm(
      "You will be transferred to Elephant Scale Main Website. \nDo you want to proceed?"
    );

    if (!confirmed) return; // ❌ No: dismiss

    // ✅ Yes: open in a new tab
    window.open("https://elephantscale.com/", "_blank", "noopener,noreferrer");
  };

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const getInitial = () => {
    if (name) return name.charAt(0).toUpperCase()
    return "U"
  }

  return (
    <header className="sticky top-0 z-40 bg-transparent">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-3 rounded-2xl border bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/65
                    flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-3">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/elephantscale-logo.png"
              alt="Elephant Scale"
              onClick={handleSymbol}
              width={100}
              height={40}
              className="h-10 w-auto cursor-pointer"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
            SmartApply
          </span>
        </div>

          {/* Right: Dashboard + Profile + Logout */}
          {!isHome && (
            <div className="flex flex-wrap gap-2 sm:flex-nowrap items-center">
             
              {/* Profile Button */}
              <Button
                variant="ghost"
                className="w-10 h-10 rounded-full p-0 flex items-center justify-center border border-gray-200 shadow-sm hover:shadow-md transition"
                onClick={handleProfileClick}
                title="Profile"
              >
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Profile"
                    width={36}
                    height={36}
                    className="rounded-full object-cover w-9 h-9"
                  />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {getInitial()}
                  </span>
                )}
              </Button>
               <DashboardButton className="w-full sm:w-auto" />
              <Button variant="outline" onClick={handleLogout} className="w-full sm:w-auto">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}