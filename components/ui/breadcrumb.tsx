import * as React from "react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const Breadcrumb = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav aria-label="breadcrumb" className={cn("text-sm text-muted-foreground", className)} {...props} />
)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentProps<"ol">>(
  ({ className, ...props }, ref) => <ol ref={ref} className={cn("flex flex-wrap items-center gap-1.5", className)} {...props} />
)
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("inline-flex items-center gap-1.5", className)} {...props} />
)
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, React.ComponentProps<"a">>(
  ({ className, ...props }, ref) => <a ref={ref} className={cn("hover:text-foreground", className)} {...props} />
)
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbSeparator = ({ className, ...props }: React.ComponentProps<"li">) => (
  <li role="presentation" aria-hidden className={cn("mx-1 select-none text-muted-foreground", className)} {...props}>
    <ChevronRight className="h-4 w-4" />
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentProps<"span">>(
  ({ className, ...props }, ref) => <span ref={ref} aria-current="page" className={cn("font-medium text-foreground", className)} {...props} />
)
BreadcrumbPage.displayName = "BreadcrumbPage"

export { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage }
