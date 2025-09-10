"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/AuthProvider"
import DashboardButton from "@/components/DashboardButton"

export default function SiteHeader() {
  const { logout } = useAuth()
  const pathname = usePathname()
  const isHome = pathname === "/"
  

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

  
return (
 <header className="sticky top-0 z-40 bg-transparent">
  {/* Outer container limits width to match your page content */}
  <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
    {/* The actual header bar */}
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

      {/* Right: Dashboard + Logout */}
      {!isHome && (
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
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