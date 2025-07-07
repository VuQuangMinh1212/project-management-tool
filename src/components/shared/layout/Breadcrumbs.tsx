"use client"

import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ROUTES } from "@/constants/routes"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname()

  // Auto-generate breadcrumbs from pathname if items not provided
  const breadcrumbItems = items || generateBreadcrumbs(pathname)

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link href={ROUTES.STAFF.DASHBOARD} className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>

      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  let currentPath = ""

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`

    // Skip protected route groups
    if (segment.startsWith("(") && segment.endsWith(")")) {
      return
    }

    const isLast = index === segments.length - 1
    const label = formatSegment(segment)

    breadcrumbs.push({
      label,
      href: isLast ? undefined : currentPath,
    })
  })

  return breadcrumbs
}

function formatSegment(segment: string): string {
  // Handle dynamic routes
  if (segment.startsWith("[") && segment.endsWith("]")) {
    return "Details"
  }

  // Convert kebab-case to Title Case
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}
