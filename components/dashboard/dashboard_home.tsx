'use client'

import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DashboardSkeleton } from '@/components/ui/loading'
import { useApp } from '@/lib/app-context'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  FileText,
  FolderKanban,
  GitBranch,
  LayoutGrid,
  ListTodo,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Task {
  id: string
  title: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  projectId: string
  project?: { name: string }
  dueDate?: string
}

interface Document {
  id: string
  title: string
  type: 'DOCUMENT' | 'DIAGRAM' | 'CANVAS'
  updatedAt: string
}

interface Activity {
  id: string
  action: string
  targetType: string
  createdAt: string
  user: {
    name: string | null
    image: string | null
    avatar: string | null
  }
}

interface Project {
  id: string
  name: string
  description: string | null
  _count?: { documents: number; tasks: number }
}

export function DashboardHome() {
  const { user, projects, isLoading: appLoading } = useApp()
  const [tasks, setTasks] = useState<Task[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const router = useRouter()

  useEffect(() => {
    if (!user?.id) return

    const fetchData = async () => {
      try {
        const [tasksRes, docsRes, activityRes] = await Promise.all([
          fetch(`/api/tasks?assigneeId=${user.id}&limit=10&status=TODO,IN_PROGRESS,BLOCKED`),
          fetch('/api/documents?limit=6'),
          fetch('/api/activity?limit=8')
        ])

        if (tasksRes.ok) {
          const data = await tasksRes.json()
          setTasks(data.data || [])
        }
        if (docsRes.ok) setDocuments(await docsRes.json())
        if (activityRes.ok) setActivities(await activityRes.json())
      } catch (err) {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  if (loading || appLoading) return <DashboardSkeleton />

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening'
  const priorityTasks = tasks.filter(t => t.priority === 'URGENT' || t.priority === 'HIGH').slice(0, 4)
  const totalTasks = projects.reduce((sum, p) => sum + (p._count?.tasks || 0), 0)
  const totalDocs = projects.reduce((sum, p) => sum + (p._count?.documents || 0), 0)

  return (
    <ScrollArea className="h-full">
      <div className={cn("min-h-full", isDark ? "bg-zinc-950" : "bg-gray-50/50")}>
        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className={cn("text-2xl font-semibold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
                {greeting}, {user?.name?.split(' ')[0]}
              </h1>
              <p className={cn("text-sm mt-1", isDark ? "text-zinc-500" : "text-gray-500")}>
                Here's what's happening across your projects
              </p>
            </div>
            <Button
              onClick={() => setCreateProjectOpen(true)}
              className={cn(
                "gap-2 h-9",
                isDark
                  ? "bg-white text-black hover:bg-gray-100"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              )}
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className={cn(
              "flex items-center gap-3 p-4 rounded-lg border",
              isDark ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600"
            )}>
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
              <Button size="sm" variant="ghost" onClick={() => window.location.reload()} className="ml-auto gap-2">
                <RefreshCw className="h-3 w-3" /> Retry
              </Button>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Projects"
              value={projects.length}
              icon={<FolderKanban className="h-4 w-4" />}
              isDark={isDark}
            />
            <StatCard
              label="Tasks"
              value={totalTasks}
              icon={<ListTodo className="h-4 w-4" />}
              isDark={isDark}
            />
            <StatCard
              label="Documents"
              value={totalDocs}
              icon={<FileText className="h-4 w-4" />}
              isDark={isDark}
            />
            <StatCard
              label="Priority Items"
              value={priorityTasks.length}
              icon={<Zap className="h-4 w-4" />}
              isDark={isDark}
              highlight
            />
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Projects Column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Projects Section */}
              <Card className={cn("border", isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-200")}>
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <CardTitle className={cn("text-base font-medium", isDark ? "text-white" : "text-gray-900")}>
                    Your Projects
                  </CardTitle>
                  <Link href="/projects">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs h-7">
                      View all <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="pt-0">
                  {projects.length === 0 ? (
                    <div className={cn("text-center py-12 rounded-lg border-2 border-dashed", isDark ? "border-zinc-800" : "border-gray-200")}>
                      <FolderKanban className={cn("h-10 w-10 mx-auto mb-3", isDark ? "text-zinc-600" : "text-gray-400")} />
                      <p className={cn("text-sm font-medium", isDark ? "text-zinc-400" : "text-gray-600")}>No projects yet</p>
                      <Button
                        size="sm"
                        className="mt-4 gap-2"
                        onClick={() => setCreateProjectOpen(true)}
                      >
                        <Plus className="h-3 w-3" /> Create your first project
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {projects.slice(0, 4).map((project) => (
                        <ProjectCard key={project.id} project={project} isDark={isDark} onClick={() => router.push(`/projects/${project.id}`)} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Priority Tasks */}
              <Card className={cn("border", isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-200")}>
                <CardHeader className="flex flex-row items-center justify-between py-4">
                  <div className="flex items-center gap-2">
                    <CardTitle className={cn("text-base font-medium", isDark ? "text-white" : "text-gray-900")}>
                      Priority Tasks
                    </CardTitle>
                    {priorityTasks.length > 0 && (
                      <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-xs">
                        {priorityTasks.length}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {priorityTasks.length === 0 ? (
                    <div className={cn("text-center py-8", isDark ? "text-zinc-500" : "text-gray-500")}>
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                      <p className="text-sm">All caught up! No priority tasks.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {priorityTasks.map((task) => (
                        <TaskRow key={task.id} task={task} isDark={isDark} onClick={() => router.push(`/projects/${task.projectId}`)} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">

              {/* Recent Files */}
              <Card className={cn("border", isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-200")}>
                <CardHeader className="py-4">
                  <CardTitle className={cn("text-base font-medium", isDark ? "text-white" : "text-gray-900")}>
                    Recent Files
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {documents.length === 0 ? (
                    <p className={cn("text-sm text-center py-6", isDark ? "text-zinc-500" : "text-gray-500")}>
                      No recent files
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {documents.slice(0, 5).map((doc) => (
                        <FileRow key={doc.id} doc={doc} isDark={isDark} onClick={() => router.push(`/?documentId=${doc.id}`)} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Activity */}
              <Card className={cn("border", isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-200")}>
                <CardHeader className="py-4">
                  <CardTitle className={cn("text-base font-medium", isDark ? "text-white" : "text-gray-900")}>
                    Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {activities.length === 0 ? (
                    <p className={cn("text-sm text-center py-6", isDark ? "text-zinc-500" : "text-gray-500")}>
                      No recent activity
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {activities.slice(0, 5).map((activity) => (
                        <ActivityRow key={activity.id} activity={activity} isDark={isDark} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <CreateProjectDialog open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
      </div>
    </ScrollArea>
  )
}

function StatCard({ label, value, icon, isDark, highlight }: {
  label: string
  value: number
  icon: React.ReactNode
  isDark: boolean
  highlight?: boolean
}) {
  return (
    <div className={cn(
      "p-4 rounded-xl border transition-colors",
      isDark
        ? "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
        : "bg-white border-gray-200 hover:border-gray-300",
      highlight && (isDark ? "border-orange-500/30" : "border-orange-200")
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-zinc-500" : "text-gray-500")}>
          {label}
        </span>
        <div className={cn(
          "p-1.5 rounded-md",
          highlight
            ? "bg-orange-500/10 text-orange-500"
            : isDark ? "bg-zinc-800 text-zinc-400" : "bg-gray-100 text-gray-500"
        )}>
          {icon}
        </div>
      </div>
      <p className={cn("text-2xl font-semibold", isDark ? "text-white" : "text-gray-900")}>
        {value}
      </p>
    </div>
  )
}

function ProjectCard({ project, isDark, onClick }: { project: Project; isDark: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-4 rounded-lg border transition-all group",
        isDark
          ? "bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-800 hover:border-zinc-600"
          : "bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className={cn("font-medium text-sm truncate pr-2", isDark ? "text-white" : "text-gray-900")}>
          {project.name}
        </h3>
        <ArrowUpRight className={cn(
          "h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
          isDark ? "text-zinc-400" : "text-gray-400"
        )} />
      </div>
      <p className={cn("text-xs line-clamp-1 mb-3", isDark ? "text-zinc-500" : "text-gray-500")}>
        {project.description || 'No description'}
      </p>
      <div className="flex items-center gap-3 text-xs">
        <span className={cn("flex items-center gap-1", isDark ? "text-zinc-400" : "text-gray-500")}>
          <FileText className="h-3 w-3" /> {project._count?.documents || 0}
        </span>
        <span className={cn("flex items-center gap-1", isDark ? "text-zinc-400" : "text-gray-500")}>
          <ListTodo className="h-3 w-3" /> {project._count?.tasks || 0}
        </span>
      </div>
    </button>
  )
}

function TaskRow({ task, isDark, onClick }: { task: Task; isDark: boolean; onClick: () => void }) {
  const priorityColors = {
    URGENT: 'bg-red-500',
    HIGH: 'bg-orange-500',
    MEDIUM: 'bg-yellow-500',
    LOW: 'bg-gray-400'
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left",
        isDark ? "hover:bg-zinc-800" : "hover:bg-gray-50"
      )}
    >
      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", priorityColors[task.priority])} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", isDark ? "text-white" : "text-gray-900")}>
          {task.title}
        </p>
        <p className={cn("text-xs truncate", isDark ? "text-zinc-500" : "text-gray-500")}>
          {task.project?.name}
        </p>
      </div>
      {task.priority === 'URGENT' && (
        <Badge className="bg-red-500/10 text-red-500 border-0 text-[10px] shrink-0">URGENT</Badge>
      )}
    </button>
  )
}

function FileRow({ doc, isDark, onClick }: { doc: Document; isDark: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-2 rounded-md transition-colors text-left",
        isDark ? "hover:bg-zinc-800" : "hover:bg-gray-50"
      )}
    >
      <div className={cn(
        "p-1.5 rounded",
        doc.type === 'DIAGRAM'
          ? "bg-purple-500/10 text-purple-500"
          : "bg-blue-500/10 text-blue-500"
      )}>
        {doc.type === 'DIAGRAM' ? <GitBranch className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm truncate", isDark ? "text-white" : "text-gray-900")}>
          {doc.title}
        </p>
      </div>
      <span className={cn("text-[10px] shrink-0", isDark ? "text-zinc-600" : "text-gray-400")}>
        {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true }).replace('about ', '')}
      </span>
    </button>
  )
}

function ActivityRow({ activity, isDark }: { activity: Activity; isDark: boolean }) {
  return (
    <div className="flex items-start gap-2.5">
      <Avatar className="h-6 w-6 shrink-0">
        <AvatarImage src={activity.user.avatar || activity.user.image || undefined} />
        <AvatarFallback className="text-[10px]">
          {activity.user.name?.[0] || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className={cn("text-xs leading-relaxed", isDark ? "text-zinc-400" : "text-gray-600")}>
          <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
            {activity.user.name}
          </span>
          {' '}{activity.action}{' '}
          <span className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
            {activity.targetType}
          </span>
        </p>
        <p className={cn("text-[10px] mt-0.5", isDark ? "text-zinc-600" : "text-gray-400")}>
          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  )
}
