'use client'

import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardSkeleton } from '@/components/ui/loading'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp } from '@/lib/app-context'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  FolderKanban,
  GitBranch,
  ListTodo,
  Plus,
  RefreshCw,
  Zap
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
      <div className={cn("min-h-full", isDark ? "bg-black" : "bg-white")}>
        <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 pb-6">
            <div>
              <h1 className={cn("text-2xl font-bold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
                {greeting}, {user?.name?.split(' ')[0]}
              </h1>
              <p className={cn("text-sm mt-1", isDark ? "text-neutral-500" : "text-gray-500")}>
                Overview of your workspace
              </p>
            </div>
            <Button
              onClick={() => setCreateProjectOpen(true)}
              className={cn(
                "gap-2 h-9",
                isDark
                  ? "bg-white text-black hover:bg-gray-200"
                  : "bg-black text-white hover:bg-gray-800"
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Projects Column */}
            <div className="lg:col-span-2 space-y-8">

              {/* Projects Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>Projects</h2>
                   <Link href="/projects">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 text-gray-500">
                      View all <ArrowUpRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>

                {projects.length === 0 ? (
                    <div className={cn("text-center py-12 rounded-xl border border-dashed", isDark ? "border-zinc-800 bg-zinc-900/50" : "border-gray-200 bg-gray-50")}>
                      <FolderKanban className={cn("h-10 w-10 mx-auto mb-3 opacity-20", isDark ? "text-white" : "text-black")} />
                      <p className={cn("text-sm font-medium", isDark ? "text-zinc-400" : "text-gray-600")}>No projects yet</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-4 gap-2"
                        onClick={() => setCreateProjectOpen(true)}
                      >
                        <Plus className="h-3 w-3" /> Create your first project
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {projects.slice(0, 4).map((project) => (
                        <ProjectCard key={project.id} project={project} isDark={isDark} onClick={() => router.push(`/projects/${project.id}`)} />
                      ))}
                    </div>
                  )}
              </div>

              {/* Priority Tasks */}
             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>Priority Tasks</h2>
                      {priorityTasks.length > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                          {priorityTasks.length}
                        </span>
                      )}
                    </div>
                </div>

                 <Card className={cn("border-none shadow-none", isDark ? "bg-transparent" : "bg-transparent")}>
                  <CardContent className="p-0">
                    {priorityTasks.length === 0 ? (
                      <div className={cn("text-center py-8 border rounded-xl border-dashed", isDark ? "border-zinc-800 text-zinc-500" : "border-gray-200 text-gray-400")}>
                        <CheckCircle2 className="h-6 w-6 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">All caught up</p>
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
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">

              {/* Recent Files */}
              <div className="space-y-4">
                 <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>Recent Files</h2>
                 <Card className={cn("border-0 shadow-none bg-transparent")}>
                  <CardContent className="p-0">
                    {documents.length === 0 ? (
                      <p className={cn("text-sm text-center py-6 border rounded-xl border-dashed", isDark ? "border-zinc-800 text-zinc-500" : "border-gray-200 text-gray-500")}>
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
              </div>

              {/* Activity */}
              <div className="space-y-4">
                 <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>Activity</h2>
                 <Card className={cn("border-0 shadow-none bg-transparent")}>
                  <CardContent className="p-0">
                    {activities.length === 0 ? (
                      <p className={cn("text-sm text-center py-6 border rounded-xl border-dashed", isDark ? "border-zinc-800 text-zinc-500" : "border-gray-200 text-gray-500")}>
                        No recent activity
                      </p>
                    ) : (
                      <div className="space-y-4">
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
      "p-5 rounded-xl border transition-all",
      isDark
        ? "bg-zinc-900 border-zinc-800"
        : "bg-white border-gray-100 shadow-sm",
      highlight && (isDark ? "border-orange-500/20" : "border-orange-100 bg-orange-50/30")
    )}>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "p-2 rounded-lg",
          highlight
            ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
            : isDark ? "bg-zinc-800 text-zinc-400" : "bg-gray-50 text-gray-500"
        )}>
          {icon}
        </div>
        <span className={cn("text-sm font-medium", isDark ? "text-zinc-400" : "text-gray-500")}>
          {label}
        </span>
      </div>
      <p className={cn("text-3xl font-bold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
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
        "w-full text-left p-5 rounded-xl border transition-all group",
        isDark
          ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
          : "bg-white border-gray-100 hover:border-gray-300 hover:shadow-md"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="h-8 w-8 rounded-lg bg-gray-50 dark:bg-zinc-800 flex items-center justify-center border border-gray-100 dark:border-zinc-700">
             <span className="text-xs font-bold">{project.name.charAt(0)}</span>
        </div>
        <ArrowUpRight className={cn(
          "h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
          isDark ? "text-zinc-400" : "text-gray-400"
        )} />
      </div>

      <h3 className={cn("font-semibold text-base mb-1 truncate", isDark ? "text-white" : "text-gray-900")}>
          {project.name}
      </h3>
      <p className={cn("text-sm line-clamp-2 mb-4 h-10", isDark ? "text-zinc-500" : "text-gray-500")}>
        {project.description || 'No description provided.'}
      </p>

      <div className="flex items-center gap-4 text-xs pt-3 border-t border-gray-50 dark:border-zinc-800">
        <span className={cn("flex items-center gap-1.5", isDark ? "text-zinc-400" : "text-gray-500")}>
          <FileText className="h-3.5 w-3.5" /> {project._count?.documents || 0} docs
        </span>
        <span className={cn("flex items-center gap-1.5", isDark ? "text-zinc-400" : "text-gray-500")}>
          <ListTodo className="h-3.5 w-3.5" /> {project._count?.tasks || 0} tasks
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
        "w-full flex items-center gap-4 p-3 rounded-lg transition-colors text-left border",
        isDark ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800" : "bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm"
      )}
    >
      <div className={cn("w-2 h-2 rounded-full shrink-0", priorityColors[task.priority])} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate", isDark ? "text-white" : "text-gray-900")}>
          {task.title}
        </p>
        <p className={cn("text-xs truncate mt-0.5", isDark ? "text-zinc-500" : "text-gray-500")}>
          {task.project?.name}
        </p>
      </div>
      {task.priority === 'URGENT' && (
        <Badge variant="outline" className="border-red-200 text-red-600 bg-red-50 text-[10px] shrink-0 font-medium">URGENT</Badge>
      )}
    </button>
  )
}

function FileRow({ doc, isDark, onClick }: { doc: Document; isDark: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-left group",
        isDark ? "hover:bg-zinc-800" : "hover:bg-gray-50"
      )}
    >
      <div className={cn(
        "p-2 rounded-md transition-colors",
        doc.type === 'DIAGRAM'
          ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
          : "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
      )}>
        {doc.type === 'DIAGRAM' ? <GitBranch className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium truncate group-hover:text-black dark:group-hover:text-white transition-colors", isDark ? "text-zinc-300" : "text-gray-700")}>
          {doc.title}
        </p>
        <p className={cn("text-[10px]", isDark ? "text-zinc-600" : "text-gray-400")}>
             {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true }).replace('about ', '')}
        </p>
      </div>
    </button>
  )
}

function ActivityRow({ activity, isDark }: { activity: Activity; isDark: boolean }) {
  return (
    <div className="flex items-start gap-3 py-1">
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        <AvatarImage src={activity.user.avatar || activity.user.image || undefined} />
        <AvatarFallback className="text-[10px] bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400">
          {activity.user.name?.[0] || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className={cn("text-xs leading-relaxed", isDark ? "text-zinc-400" : "text-gray-600")}>
          <span className={cn("font-medium text-black dark:text-white")}>
            {activity.user.name}
          </span>
          {' '}{activity.action}{' '}
          <span className={cn("font-medium text-black dark:text-white")}>
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
