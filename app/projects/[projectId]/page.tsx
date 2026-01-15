'use client'

import { ProjectHub } from '@/components/projects/project-hub'
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'
import { SearchModal } from '@/components/search-modal'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { useParams } from 'next/navigation'

export default function ProjectPage() {
  const params = useParams()
  const projectId = params.projectId as string

  return (
    <>
      <SearchModal />
      <KeyboardShortcuts />
      <DashboardLayout>
        <ProjectHub projectId={projectId} />
      </DashboardLayout>
    </>
  )
}
