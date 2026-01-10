'use client'

import { TopNavigation } from './top-navigation'
import { LeftSidebar } from './left-sidebar'
import { RightSidebarNew } from './right-sidebar-new'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  
  return (
    <div className={cn("flex h-screen flex-col overflow-hidden", isDark ? "bg-black" : "bg-white")}>
      <TopNavigation />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <main className="flex-1 overflow-hidden">{children}</main>
        <RightSidebarNew />
      </div>
    </div>
  )
}
