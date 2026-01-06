"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, Sparkles, User, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  const [lang, setLang] = useState<string>("en")

  useEffect(() => {
    // Try to get from user context first, fallback to localStorage
    if ((user as any)?.avatarUrl) setAvatar((user as any).avatarUrl)
    if ((user as any)?.name) setName((user as any).name)

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
    if (!(user as any)?.avatarUrl && typeof window !== "undefined") {
      const storedAvatar = localStorage.getItem("avatarUrl")
      if (storedAvatar) setAvatar(storedAvatar)
    }
    if (!(user as any)?.name && typeof window !== "undefined") {
      const storedName = localStorage.getItem("name")
      if (storedName) setName(storedName)
    }
  }, [user])

  // Initialize language from localStorage or browser setting
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = window.localStorage.getItem("lang")
      const initial = stored || (navigator?.language?.slice(0, 2) || "en")
      setLang(initial)
      document.documentElement.lang = initial
    } catch {
      // noop
    }
  }, [])

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
      await Promise.resolve(maybePromise as any)
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

  const handleLanguageChange = (value: string) => {
    if (typeof window === "undefined") return
    try {
      setLang(value)
      window.localStorage.setItem("lang", value)
      document.documentElement.lang = value
      // Also persist as a cookie so the server picks it up
      const oneYear = 60 * 60 * 24 * 365
      document.cookie = `lang=${value}; path=/; max-age=${oneYear}; samesite=lax`
      // Refresh to allow any client components to react if they read lang
      router.refresh()
    } catch (e) {
      console.error("Failed to set language", e)
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-transparent">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-3 rounded-2xl border bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/65
                    flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-3">
          {/* Left: Logo + (mobile actions) */}
          <div className="flex items-center gap-3">
            <Image
              src="/elephantscale-logo.png"
              alt="Elephant Scale"
              onClick={handleSymbol}
              width={100}
              height={40}
              className="h-10 w-auto cursor-pointer"
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

          {/* Center: App badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200/20 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              SmartApply
            </span>
          </div>

          {/* Language Selector (always visible) */}
          <div className="flex items-center sm:ml-auto">
            <Select value={lang} onValueChange={handleLanguageChange}>
              <SelectTrigger aria-label="Language selector" className="w-28 sm:w-36 rounded-full">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇺🇸 English</SelectItem>
                <SelectItem value="es">🇪🇸 Español</SelectItem>
                <SelectItem value="fr">🇫🇷 Français</SelectItem>
                <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                <SelectItem value="hi">🇮🇳 हिन्दी</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Right: Dashboard + Profile + Logout (desktop/tablet only) */}
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