'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  FileText,
  GitBranch,
  LayoutDashboard,
  ListTodo,
  MoreHorizontal,
  Settings,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ProjectOverview } from './project-overview'
import { ProjectDocuments } from './project-documents'
import { ProjectTasks } from './project-tasks'
import { ProjectMembers } from './project-members'
import { getProjectColor } from '@/lib/design-system'

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
          router.push('/')
        }
      } catch (error) {
        console.error('Failed to fetch project:', error)
        router.push('/')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [projectId, router])

  if (isLoading) {
    return (
      <div className={cn("flex h-full flex-col", isDark ? "bg-black" : "bg-slate-50")}>
        <div className="p-8 space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!project) return null

  const color = getProjectColor(parseInt(projectId.slice(-2), 36) % 8)
  const docCount = project._count?.documents || 0
  const taskCount = project._count?.tasks || 0

  return (
    <div className={cn("flex h-full flex-col relative", isDark ? "bg-black" : "bg-slate-50")}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-10",
          isDark ? "bg-[#E85002]" : "bg-[#F16001]"
        )} />
        <div className={cn(
          "absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-10",
          isDark ? "bg-[#E85002]" : "bg-[#F16001]"
        )} />
      </div>

      {/* Header */}
      <div className={cn(
        "relative z-10 border-b",
        isDark ? "border-neutral-800/50 bg-black/50 backdrop-blur-xl" : "border-slate-200/50 bg-white/50 backdrop-blur-xl"
      )}>
        <div className="px-8 py-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 gap-2"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          {/* Project Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={cn(
                "flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br",
                color.gradient
              )}>
                <LayoutDashboard className="h-8 w-8 text-white" />
              </div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className={cn(
                    "text-3xl font-bold tracking-tight",
                    isDark ? "text-white" : "text-slate-900"
                  )}>
                    {project.name}
                  </h1>
                  <Badge variant="secondary" className={cn(
                    "px-3 py-1",
                    isDark ? "bg-neutral-800/50 text-neutral-300" : "bg-slate-100 text-slate-600"
                  )}>
                    Active
                  </Badge>
                </div>

                <p className={cn(
                  "text-base max-w-2xl",
                  isDark ? "text-neutral-400" : "text-slate-600"
                )}>
                  {project.description || 'No description provided'}
                </p>

                {/* Quick Stats */}
                <div className="flex items-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-lg",
                      isDark ? "bg-neutral-800" : "bg-slate-100"
                    )}>
                      <FileText className={cn("h-4 w-4", isDark ? "text-neutral-400" : "text-slate-500")} />
                    </div>
                    <div>
                      <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                        {docCount}
                      </p>
                      <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
                        Documents
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-lg",
                      isDark ? "bg-neutral-800" : "bg-slate-100"
                    )}>
                      <ListTodo className={cn("h-4 w-4", isDark ? "text-neutral-400" : "text-slate-500")} />
                    </div>
                    <div>
                      <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                        {taskCount}
                      </p>
                      <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
                        Tasks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-lg",
                      isDark ? "bg-neutral-800" : "bg-slate-100"
                    )}>
                      <Users className={cn("h-4 w-4", isDark ? "text-neutral-400" : "text-slate-500")} />
                    </div>
                    <div>
                      <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                        3
                      </p>
                      <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
                        Members
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10",
                isDark ? "hover:bg-neutral-800" : "hover:bg-slate-100"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className={cn(
              "h-12 p-1",
              isDark ? "bg-neutral-900/50" : "bg-white/70"
            )}>
              <TabsTrigger value="overview" className="gap-2 px-4">
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="documents" className="gap-2 px-4">
                <FileText className="h-4 w-4" />
                Documents
                {docCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {docCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="designs" className="gap-2 px-4">
                <GitBranch className="h-4 w-4" />
                Designs
              </TabsTrigger>
              <TabsTrigger value="tasks" className="gap-2 px-4">
                <ListTodo className="h-4 w-4" />
                Tasks
                {taskCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {taskCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="members" className="gap-2 px-4">
                <Users className="h-4 w-4" />
                Members
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="overview" className="h-full m-0">
            <ProjectOverview projectId={projectId} project={project} />
          </TabsContent>
          
          <TabsContent value="documents" className="h-full m-0">
            <ProjectDocuments projectId={projectId} />
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
