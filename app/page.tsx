'use client'

import { EditorView } from '@/components/editor/editor-view'
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'
import { LandingPage } from '@/components/landing/landing-page'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SearchModal } from '@/components/search-modal'
import { useApp } from '@/lib/app-context'
import { Loader2 } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const { status } = useSession()
  const router = useRouter()
  const { isLoading, currentWorkspace, refreshWorkspaces } = useApp()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  // Create default workspace if none exists
  useEffect(() => {
    const createDefaultWorkspace = async () => {
      if (status === 'authenticated' && !isLoading && !currentWorkspace) {
        try {
          const res = await fetch('/api/workspaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'My Workspace', icon: '🏠' }),
          })
          if (res.ok) {
            refreshWorkspaces()
          }
        } catch (error) {
          console.error('Failed to create workspace:', error)
        }
      }
    }
    createDefaultWorkspace()
  }, [status, isLoading, currentWorkspace, refreshWorkspaces])

  // Don't auto-select document - let user choose from dashboard

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#2B5CE6]" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return <LandingPage />
  }

  return (
    <>
      <SearchModal />
      <KeyboardShortcuts />
      <DashboardLayout>
        <EditorView />
      </DashboardLayout>
    </>
  )
}
