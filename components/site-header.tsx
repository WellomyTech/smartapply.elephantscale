"use client"

import Link from "next/link"
import Image from "next/image"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { NAV_ITEMS } from "@/lib/site-nav"

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/65">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {/* Drop your ES logo as /public/elephantscale-logo.svg (fallback to text if missing) */}
          <Image
            src="/elephantscale-logo.svg"
            alt="Elephant Scale"
            width={28}
            height={28}
            className="hidden sm:block"
            onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
          />
          <span className="text-xl font-semibold tracking-tight">Elephant Scale</span>
        </Link>

        <div className="hidden md:flex items-center gap-2">
          <NavigationMenu>
            <NavigationMenuList>
              {NAV_ITEMS.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref target={item.external ? "_blank" : undefined}>
                    <NavigationMenuLink className="px-3 py-2 text-sm text-foreground/80 hover:text-foreground">
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <Button asChild className="ml-2">
            <Link href="/">SmartApply</Link>
          </Button>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-6 grid gap-3">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    className="text-base text-foreground/90 hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
                <Button asChild className="mt-2">
                  <Link href="/">SmartApply</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
