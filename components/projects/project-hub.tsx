'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ProjectSkeleton } from '@/components/ui/loading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  FileText,
  GitBranch,
  LayoutDashboard,
  ListTodo,
  MoreHorizontal,
  Users,
  Clock,
  FolderOpen,
  Pencil,
  Check,
  X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { ProjectOverview } from './project-overview'
import { ProjectDocuments } from './project_documents'
import { ProjectTasks } from './project-tasks'
import { ProjectMembers } from './project-members'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface Project {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    documents: number
    tasks: number
  }
}

interface ProjectHubProps {
  projectId: string
}

export function ProjectHub({ projectId }: ProjectHubProps) {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const router = useRouter()

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`)
        if (res.ok) {
          const data = await res.json()
          setProject(data)
        } else {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Failed to fetch project:', error)
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [projectId, router])

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus()
      nameInputRef.current.select()
    }
  }, [isEditingName])

  const handleStartEditName = () => {
    setEditedName(project?.name || '')
    setIsEditingName(true)
  }

  const handleSaveName = async () => {
    if (!project || !editedName.trim()) {
      setIsEditingName(false)
      return
    }

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editedName.trim() }),
      })

      if (res.ok) {
        setProject({ ...project, name: editedName.trim() })
        toast.success('Project name updated')
      } else {
        toast.error('Failed to update project name')
      }
    } catch (error) {
      console.error('Failed to update project name:', error)
      toast.error('Failed to update project name')
    }
    setIsEditingName(false)
  }

  const handleCancelEdit = () => {
    setIsEditingName(false)
    setEditedName('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  if (isLoading) {
    return <ProjectSkeleton />
  }

  if (!project) return null

  const docCount = project._count?.documents || 0
  const taskCount = project._count?.tasks || 0

  return (
    <div className={cn("flex h-full flex-col", isDark ? "bg-zinc-950" : "bg-gray-50/50")}>
      {/* Header */}
      <div className={cn(
        "border-b shrink-0",
        isDark ? "border-zinc-800 bg-zinc-950" : "border-gray-200 bg-white"
      )}>
        <div className="px-6 py-5">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className={cn("mb-4 gap-2 -ml-2 h-8", isDark ? "hover:bg-zinc-800 text-zinc-400" : "text-gray-500")}
            onClick={() => router.push('/projects')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>

          {/* Project Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl shrink-0",
                isDark ? "bg-zinc-800" : "bg-gray-100"
              )}>
                <FolderOpen className={cn("h-6 w-6", isDark ? "text-zinc-400" : "text-gray-500")} />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        ref={nameInputRef}
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSaveName}
                        className={cn(
                          "text-xl font-semibold h-9 px-2 w-[280px]",
                          isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-gray-300"
                        )}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleSaveName}
                      >
                        <Check className="h-4 w-4 text-emerald-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={handleStartEditName}
                      className={cn(
                        "flex items-center gap-2 text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity group",
                        isDark ? "text-white" : "text-gray-900"
                      )}
                    >
                      <span>{project.name}</span>
                      <Pencil className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                    </button>
                  )}
                </div>

                <p className={cn(
                  "text-sm max-w-xl mb-3",
                  isDark ? "text-zinc-500" : "text-gray-500"
                )}>
                  {project.description || 'No description'}
                </p>

                {/* Quick Stats */}
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-1.5">
                    <FileText className={cn("h-4 w-4", isDark ? "text-zinc-500" : "text-gray-400")} />
                    <span className={cn("text-sm", isDark ? "text-zinc-400" : "text-gray-600")}>
                      {docCount} docs
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ListTodo className={cn("h-4 w-4", isDark ? "text-zinc-500" : "text-gray-400")} />
                    <span className={cn("text-sm", isDark ? "text-zinc-400" : "text-gray-600")}>
                      {taskCount} tasks
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className={cn("h-4 w-4", isDark ? "text-zinc-500" : "text-gray-400")} />
                    <span className={cn("text-sm", isDark ? "text-zinc-400" : "text-gray-600")}>
                      Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true }).replace('about ', '')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9",
                isDark ? "hover:bg-zinc-800" : "hover:bg-gray-100"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-5">
            <TabsList className={cn(
              "h-10 p-1 gap-1",
              isDark ? "bg-zinc-900 border border-zinc-800" : "bg-gray-100 border border-gray-200"
            )}>
              <TabsTrigger
                value="overview"
                className={cn(
                  "gap-2 px-3 h-8 text-sm data-[state=active]:shadow-none rounded-md",
                  isDark
                    ? "data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
                    : "data-[state=active]:bg-white data-[state=active]:text-gray-900"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className={cn(
                  "gap-2 px-3 h-8 text-sm data-[state=active]:shadow-none rounded-md",
                  isDark
                    ? "data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
                    : "data-[state=active]:bg-white data-[state=active]:text-gray-900"
                )}
              >
                <FileText className="h-4 w-4" />
                Documents
                {docCount > 0 && (
                  <Badge variant="secondary" className={cn(
                    "ml-1 h-5 px-1.5 text-xs",
                    isDark ? "bg-zinc-700" : "bg-gray-200"
                  )}>
                    {docCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="designs"
                className={cn(
                  "gap-2 px-3 h-8 text-sm data-[state=active]:shadow-none rounded-md",
                  isDark
                    ? "data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
                    : "data-[state=active]:bg-white data-[state=active]:text-gray-900"
                )}
              >
                <GitBranch className="h-4 w-4" />
                Designs
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className={cn(
                  "gap-2 px-3 h-8 text-sm data-[state=active]:shadow-none rounded-md",
                  isDark
                    ? "data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
                    : "data-[state=active]:bg-white data-[state=active]:text-gray-900"
                )}
              >
                <ListTodo className="h-4 w-4" />
                Tasks
                {taskCount > 0 && (
                  <Badge variant="secondary" className={cn(
                    "ml-1 h-5 px-1.5 text-xs",
                    isDark ? "bg-zinc-700" : "bg-gray-200"
                  )}>
                    {taskCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className={cn(
                  "gap-2 px-3 h-8 text-sm data-[state=active]:shadow-none rounded-md",
                  isDark
                    ? "data-[state=active]:bg-zinc-800 data-[state=active]:text-white"
                    : "data-[state=active]:bg-white data-[state=active]:text-gray-900"
                )}
              >
                <Users className="h-4 w-4" />
                Members
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="overview" className="h-full m-0">
            <ProjectOverview projectId={projectId} project={project} />
          </TabsContent>

          <TabsContent value="documents" className="h-full m-0">
            <ProjectDocuments projectId={projectId} filterType="DOCUMENT" />
          </TabsContent>

          <TabsContent value="designs" className="h-full m-0">
            <ProjectDocuments projectId={projectId} filterType="DIAGRAM" />
          </TabsContent>

          <TabsContent value="tasks" className="h-full m-0">
            <ProjectTasks projectId={projectId} />
          </TabsContent>

          <TabsContent value="members" className="h-full m-0">
            <ProjectMembers projectId={projectId} projectName={project.name} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
