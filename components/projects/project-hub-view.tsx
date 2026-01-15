'use client'

import { KanbanBoard } from '@/components/tasks/kanban-board'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Layout, ListTodo, Presentation, Settings, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { ProjectDesigns } from './project-designs'
import { ProjectDocs } from './project-docs'
import { ProjectOverview } from './project-overview'

interface ProjectDetails {
  id: string
  name: string
  description: string
  workspaceId: string
  workspace: {
    members: { user: { image: string } }[]
  }
}

export function ProjectHubView({ projectId }: { projectId: string }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [project, setProject] = useState<ProjectDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`)
        if (res.ok) {
          const data = await res.json()
          setProject(data)
        } else {
             // Handle non-200 responses
             if (res.status === 404) setError('Project not found')
             else if (res.status === 403) setError('Access denied')
             else setError('Failed to load project')
        }
      } catch (error) {
        console.error('Failed to fetch project:', error)
        setError('Something went wrong')
      } finally {
        setIsLoading(false)
      }
    }
    fetchProject()
  }, [projectId])

  if (isLoading) {
      return (
          <div className="flex h-full items-center justify-center bg-background/50">
              <div className="flex flex-col items-center gap-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  <p className="text-muted-foreground animate-pulse">Loading project...</p>
              </div>
          </div>
      )
  }

  if (error || !project) {
      return (
          <div className="flex h-full items-center justify-center bg-background/50">
              <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                      <Presentation className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold">{error || 'Project not found'}</h3>
                  <p className="text-muted-foreground max-w-xs">
                      The project you are looking for does not exist or you do not have permission to view it.
                  </p>
                  <Button variant="outline" onClick={() => window.location.href = '/'}>
                      Return to Dashboard
                  </Button>
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col h-full bg-background/50">
      {/* Project Header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/20">
            {project.name.substring(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Active Project
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-2 mr-4">
            {project.workspace.members?.slice(0, 3).map((m, i) => (
              <Avatar key={i} className="border-2 border-background w-8 h-8">
                <AvatarImage src={m.user?.image || `https://i.pravatar.cc/150?u=${i}`} />
                <AvatarFallback>U{i}</AvatarFallback>
              </Avatar>
            ))}
            {(project.workspace.members?.length || 0) > 3 && (
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                +{(project.workspace.members?.length || 0) - 3}
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 border-b border-white/5 bg-background/30 backdrop-blur-sm sticky top-0 z-10">
          <TabsList className="h-12 bg-transparent gap-6 p-0">
            <ProjectTab value="overview" icon={<Layout className="h-4 w-4" />} label="Overview" />
            <ProjectTab value="docs" icon={<FileText className="h-4 w-4" />} label="Docs & Files" />
            <ProjectTab value="designs" icon={<Presentation className="h-4 w-4" />} label="Designs" />
            <ProjectTab value="tasks" icon={<ListTodo className="h-4 w-4" />} label="Tasks" />
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-black/20">
          <TabsContent value="overview" className="h-full m-0 p-8 outline-none">
            <ProjectOverview projectId={projectId} />
          </TabsContent>

          <TabsContent value="docs" className="h-full m-0 p-0 outline-none">
            <ProjectDocs projectId={projectId} workspaceId={project.workspaceId} />
          </TabsContent>

          <TabsContent value="designs" className="h-full m-0 p-0 outline-none">
             <ProjectDesigns projectId={projectId} workspaceId={project.workspaceId} />
          </TabsContent>

          <TabsContent value="tasks" className="h-full m-0 p-0 outline-none">
             <div className="h-full p-8">
               <KanbanBoard projectId={projectId} />
             </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

function ProjectTab({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:text-primary border-b-2 border-transparent rounded-none px-2 h-full gap-2 transition-all hover:text-foreground"
    >
      {icon}
      {label}
    </TabsTrigger>
  )
}
