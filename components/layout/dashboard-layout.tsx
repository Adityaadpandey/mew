'use client'

import { TopNavigation } from './top-navigation'
import { LeftSidebar } from './left-sidebar'
import { RightSidebarNew } from './right-sidebar-new'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface DashboardLayoutProps {
  children: React.ReactNode
}

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const pathname = usePathname()

  return (
    <div className={cn(
      "flex h-screen flex-col overflow-hidden",
      isDark ? "bg-black" : "bg-[#FAFAFA]"
    )}>
      <TopNavigation />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={{
                initial: { opacity: 0, y: 8 },
                animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } },
                exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] } },
              }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <RightSidebarNew />
      </div>
    </div>
  )
}
