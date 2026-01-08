"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, Sparkles, User, Home } from "lucide-react"
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
      "You will be transferred to WellomyTech Main Website. \nDo you want to proceed?"
    );

    if (!confirmed) return; // ❌ No: dismiss

    // ✅ Yes: open in a new tab
    window.open("https://www.wellomytech.com/", "_blank", "noopener,noreferrer");
  };

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const getInitial = () => {
    if (name) return name.charAt(0).toUpperCase()
    return "U"
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/wellomy-logo.webp"
              alt="SmartApply by WellomyTech"
              onClick={handleSymbol}
              width={120}
              height={40}
              className="h-8 w-auto cursor-pointer"
            />

            {/* Mobile actions: Profile, Home, Logout (icon-only, placed next to logo) */}
            <div className="flex items-center gap-2 sm:hidden">
              {/* Profile */}
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-full p-0 flex items-center justify-center border border-gray-200 shadow-sm"
                onClick={handleProfileClick}
                title="Profile"
                aria-label="Profile"
              >
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="rounded-full object-cover w-8 h-8"
                  />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {getInitial()}
                  </span>
                )}
              </Button>

              {/* Home */}
              <Link href="/dashboard" aria-label="Dashboard">
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full w-9 h-9"
                  title="Dashboard"
                >
                  <Home className="h-4 w-4" />
                </Button>
              </Link>

              {/* Logout */}
              <Button
                variant="outline"
                size="icon"
                onClick={handleLogout}
                className="rounded-full w-9 h-9"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Center: App name/logo */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-800 shadow-lg">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-lg font-bold text-white tracking-tight">
                SmartApply
              </span>
            </div>
          </div>

          {/* Right: Dashboard + Profile + Logout (logged in pages only) */}
          {!isHome && (
            <div className="hidden sm:flex items-center gap-2 sm:flex-nowrap">
              {/* Profile (desktop) */}
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full p-0 flex items-center justify-center border border-gray-200 shadow-sm hover:shadow-md transition"
                onClick={handleProfileClick}
                title="Profile"
                aria-label="Profile"
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

              {/* Dashboard (desktop) */}
              <div className="hidden sm:inline-flex">
                <DashboardButton />
              </div>

              {/* Logout (desktop) */}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="hidden sm:inline-flex"
                title="Logout"
              >
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}