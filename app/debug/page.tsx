'use client'

import { useApp } from '@/lib/app-context'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export default function DebugPage() {
  const { data: session } = useSession()
  const { workspaces, currentWorkspace, projects, user } = useApp()
  const [projectMembers, setProjectMembers] = useState<any[]>([])
  const [workspaceMembers, setWorkspaceMembers] = useState<any[]>([])

  useEffect(() => {
    const fetchDebugData = async () => {
      if (!session?.user?.id) return

      try {
        // Fetch all project memberships
        const projectsRes = await fetch('/api/debug/project-members')
        if (projectsRes.ok) {
          const data = await projectsRes.json()
          setProjectMembers(data)
        }

        // Fetch all workspace memberships
        const workspacesRes = await fetch('/api/debug/workspace-members')
        if (workspacesRes.ok) {
          const data = await workspacesRes.json()
          setWorkspaceMembers(data)
        }
      } catch (error) {
        console.error('Failed to fetch debug data:', error)
      }
    }

    fetchDebugData()
  }, [session?.user?.id])

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Debug Information</h1>

      <div className="space-y-8">
        {/* User Info */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* Workspaces */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Workspaces ({workspaces.length})</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(workspaces, null, 2)}
          </pre>
        </div>

        {/* Current Workspace */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Current Workspace</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(currentWorkspace, null, 2)}
          </pre>
        </div>

        {/* Projects */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Projects ({projects.length})</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(projects, null, 2)}
          </pre>
        </div>

        {/* Project Memberships */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Project Memberships ({projectMembers.length})</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(projectMembers, null, 2)}
          </pre>
        </div>

        {/* Workspace Memberships */}
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Workspace Memberships ({workspaceMembers.length})</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(workspaceMembers, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
