'use client'

import { ChevronRight, Home, LayoutDashboard } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Fragment, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface BreadcrumbItem {
  label: string
  href: string
  icon?: React.ReactNode
}

interface AppBreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
}

// Route to label mappings
const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  'projects': 'Projects',
  'documents': 'Documents',
  'designs': 'Designs',
  'invitations': 'Invitations',
  'api-docs': 'API Docs',
  'settings': 'Settings',
  'auth': 'Authentication',
}

export function AppBreadcrumb({ items: customItems, className }: AppBreadcrumbProps) {
  const pathname = usePathname()

  const items = useMemo(() => {
    if (customItems) return customItems

    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
    ]

    let path = ''
    for (const segment of segments) {
      path += `/${segment}`

      // Skip dynamic segments for now - they'll be replaced with actual names
      const label = routeLabels[segment] ||
        (segment.length > 20 ? `${segment.slice(0, 8)}...` : segment)

      breadcrumbs.push({ label, href: path })
    }

    return breadcrumbs
  }, [pathname, customItems])

  if (items.length <= 1) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-1 text-sm",
        className
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        const isFirst = index === 0

        return (
          <Fragment key={item.href}>
            {index > 0 && (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
            )}

            {isLast ? (
              <motion.span
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "font-medium text-foreground truncate max-w-[200px]",
                  "flex items-center gap-1.5"
                )}
              >
                {item.icon}
                {item.label}
              </motion.span>
            ) : (
              <Link
                href={item.href}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors",
                  "flex items-center gap-1.5 truncate max-w-[150px]",
                  isFirst && "text-muted-foreground/70"
                )}
              >
                {item.icon}
                <span className={isFirst ? "sr-only sm:not-sr-only" : ""}>
                  {item.label}
                </span>
              </Link>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

// Simplified breadcrumb for project pages
export function ProjectBreadcrumb({
  projectName,
  projectId,
  currentTab,
}: {
  projectName: string
  projectId: string
  currentTab?: string
}) {
  const items: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
    { label: 'Projects', href: '/' },
    { label: projectName, href: `/projects/${projectId}` },
  ]

  if (currentTab) {
    items.push({ label: currentTab, href: `/projects/${projectId}` })
  }

  return <AppBreadcrumb items={items} />
}

// Simplified breadcrumb for document pages
export function DocumentBreadcrumb({
  documentTitle,
  documentId,
  projectName,
  projectId,
}: {
  documentTitle: string
  documentId: string
  projectName?: string
  projectId?: string
}) {
  const items: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
  ]

  if (projectName && projectId) {
    items.push(
      { label: projectName, href: `/projects/${projectId}` },
    )
  }

  items.push({ label: documentTitle, href: `/documents/${documentId}` })

  return <AppBreadcrumb items={items} />
}
