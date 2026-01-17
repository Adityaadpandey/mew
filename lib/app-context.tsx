'use client'

import { useSession } from 'next-auth/react'
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'

interface User {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

interface Workspace {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface Document {
  id: string
  title: string
  type: 'DOCUMENT' | 'DIAGRAM' | 'CANVAS'
  isFavorite: boolean
  createdAt: string
  updatedAt: string
  workspace?: { id: string; name: string }
  projectId?: string
}

interface Project {
  id: string
  name: string
  description: string | null
  updatedAt: string
  _count?: { documents: number; tasks: number }
  workspace?: { id: string; name: string; slug: string }
}

interface Folder {
  id: string
  name: string
  parentId: string | null
  documents: { id: string; title: string; type: string }[]
  children: Folder[]
}

interface AppContextType {
  user: User | null
  workspaces: Workspace[]
  currentWorkspace: Workspace | null
  documents: Document[]
  projects: Project[]
  folders: Folder[]
  recentDocuments: Document[]
  favoriteDocuments: Document[]
  isLoading: boolean
  setCurrentWorkspace: (workspace: Workspace) => void
  refreshDocuments: () => Promise<void>
  refreshWorkspaces: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const initializedRef = useRef(false)

  const user = session?.user ? {
    id: session.user.id,
    name: session.user.name ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  } : null

  const refreshWorkspaces = useCallback(async () => {
    if (!session?.user) return

    try {
      // Fetch workspaces and projects in parallel for faster loading
      const [workspacesRes, projectsRes] = await Promise.all([
        fetch('/api/workspaces'),
        fetch('/api/projects'),
      ])

      if (workspacesRes.ok) {
        const data = await workspacesRes.json()
        setWorkspaces(data)
        // Set first workspace if none selected
        setCurrentWorkspace(prev => prev || (data.length > 0 ? data[0] : null))
      }

      // Load projects immediately so dashboard always has them
      if (projectsRes.ok) {
        const data = await projectsRes.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error)
    }
  }, [session?.user])

  const refreshDocuments = useCallback(async () => {
    if (!session?.user || !currentWorkspace) return

    try {
      const [docsRes, projectsRes, foldersRes] = await Promise.all([
        fetch(`/api/documents?workspaceId=${currentWorkspace.id}`),
        // Fetch projects from ALL workspaces where user is a member
        fetch(`/api/projects`),
        fetch(`/api/folders?workspaceId=${currentWorkspace.id}`),
      ])

      if (docsRes.ok) {
        const data = await docsRes.json()
        setDocuments(data)
      }

      if (projectsRes.ok) {
        const data = await projectsRes.json()
        setProjects(data)
      }

      if (foldersRes.ok) {
        const data = await foldersRes.json()
        setFolders(data)
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }, [session?.user, currentWorkspace])

  // Initialize on auth
  useEffect(() => {
    if (initializedRef.current) return

    if (status === 'authenticated') {
      initializedRef.current = true
      refreshWorkspaces().finally(() => setIsLoading(false))
    } else if (status === 'unauthenticated') {
      setIsLoading(false)
      initializedRef.current = true
    }
  }, [status, refreshWorkspaces])

  // Fetch documents when workspace changes
  useEffect(() => {
    if (currentWorkspace && initializedRef.current) {
      refreshDocuments()
    }
  }, [currentWorkspace, refreshDocuments])

  const recentDocuments = [...documents]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  const favoriteDocuments = documents.filter(d => d.isFavorite)

  return (
    <AppContext.Provider value={{
      user,
      workspaces,
      currentWorkspace,
      documents,
      projects,
      folders,
      recentDocuments,
      favoriteDocuments,
      isLoading,
      setCurrentWorkspace,
      refreshDocuments,
      refreshWorkspaces,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
