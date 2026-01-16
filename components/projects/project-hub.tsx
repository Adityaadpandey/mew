'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ProjectSkeleton } from '@/components/ui/loading'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
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
  Sparkles,
  Users,
  Clock,
  FolderOpen,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ProjectOverview } from './project-overview'
import { ProjectDocuments } from './project-documents'
import { ProjectTasks } from './project-tasks'
import { ProjectMembers } from './project-members'
import { buttonGradients } from '@/lib/design-system'
import { formatDistanceToNow } from 'date-fns'

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

  if (isLoading) {
    return <ProjectSkeleton />
  }

  if (!project) return null

  const docCount = project._count?.documents || 0
  const taskCount = project._count?.tasks || 0

  return (
    <div className={cn("flex h-full flex-col relative", isDark ? "bg-black" : "bg-slate-50")}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20",
          "bg-gradient-to-br from-[#C10801] to-[#F16001]"
        )} />
        <div className={cn(
          "absolute -bottom-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-10",
          "bg-gradient-to-br from-[#F16001] to-[#D9C3AB]"
        )} />
      </div>

      {/* Header */}
      <div className={cn(
        "relative z-10 border-b",
        isDark ? "border-zinc-800/50 bg-black/50 backdrop-blur-xl" : "border-slate-200/50 bg-white/50 backdrop-blur-xl"
      )}>
        <div className="px-8 py-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className={cn("mb-4 gap-2", isDark ? "hover:bg-zinc-800" : "")}
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          {/* Project Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C10801] to-[#F16001] shadow-lg shadow-orange-500/25"
              >
                <FolderOpen className="h-8 w-8 text-white" />
              </motion.div>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className={cn(
                    "text-3xl font-bold tracking-tight",
                    isDark ? "text-white" : "text-slate-900"
                  )}>
                    {project.name}
                  </h1>
                  <Badge className={cn(
                    "px-3 py-1",
                    "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  )}>
                    Active
                  </Badge>
                </div>

                <p className={cn(
                  "text-base max-w-2xl mb-4",
                  isDark ? "text-zinc-400" : "text-slate-600"
                )}>
                  {project.description || 'No description provided'}
                </p>

                {/* Quick Stats */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-lg",
                      isDark ? "bg-orange-500/10" : "bg-orange-100"
                    )}>
                      <FileText className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                      <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>
                        {docCount}
                      </p>
                      <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-slate-500")}>
                        Documents
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-lg",
                      isDark ? "bg-amber-500/10" : "bg-amber-100"
                    )}>
                      <ListTodo className="h-4 w-4 text-amber-500" />
                    </div>
                    <div>
                      <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>
                        {taskCount}
                      </p>
                      <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-slate-500")}>
                        Tasks
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-lg",
                      isDark ? "bg-red-500/10" : "bg-red-100"
                    )}>
                      <Clock className="h-4 w-4 text-red-500" />
                    </div>
                    <div>
                      <p className={cn("text-sm font-semibold", isDark ? "text-white" : "text-slate-900")}>
                        {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                      </p>
                      <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-slate-500")}>
                        Last updated
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
                isDark ? "hover:bg-zinc-800" : "hover:bg-slate-100"
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className={cn(
              "h-12 p-1 gap-1",
              isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white/70 border border-slate-200"
            )}>
              <TabsTrigger
                value="overview"
                className={cn(
                  "gap-2 px-4 data-[state=active]:shadow-none rounded-lg",
                  isDark
                    ? "data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
                    : "data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="documents"
                className={cn(
                  "gap-2 px-4 data-[state=active]:shadow-none rounded-lg",
                  isDark
                    ? "data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
                    : "data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
                )}
              >
                <FileText className="h-4 w-4" />
                Documents
                {docCount > 0 && (
                  <Badge variant="secondary" className={cn(
                    "ml-1 h-5 px-1.5 text-xs",
                    isDark ? "bg-zinc-800" : ""
                  )}>
                    {docCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="designs"
                className={cn(
                  "gap-2 px-4 data-[state=active]:shadow-none rounded-lg",
                  isDark
                    ? "data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
                    : "data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
                )}
              >
                <GitBranch className="h-4 w-4" />
                Designs
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className={cn(
                  "gap-2 px-4 data-[state=active]:shadow-none rounded-lg",
                  isDark
                    ? "data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
                    : "data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
                )}
              >
                <ListTodo className="h-4 w-4" />
                Tasks
                {taskCount > 0 && (
                  <Badge variant="secondary" className={cn(
                    "ml-1 h-5 px-1.5 text-xs",
                    isDark ? "bg-zinc-800" : ""
                  )}>
                    {taskCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className={cn(
                  "gap-2 px-4 data-[state=active]:shadow-none rounded-lg",
                  isDark
                    ? "data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400"
                    : "data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700"
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
