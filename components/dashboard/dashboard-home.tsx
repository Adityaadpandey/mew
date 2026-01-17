'use client'

import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { ProductivityInsights } from '@/components/dashboard/productivity-insights'
import { TeamActivityFeed } from '@/components/dashboard/team-activity-feed'
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
import { motion } from 'framer-motion'
import {
    Activity as ActivityIcon,
    ArrowRight,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileText,
    FolderOpen,
    GitBranch,
    LayoutTemplate,
    ListTodo,
    Plus,
    TrendingUp,
    Zap
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// ============================================================================
// Types
// ============================================================================
interface Task {
  id: string
  title: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  projectId: string
  project?: { name: string }
  assignee?: { name: string; image: string | null }
  updatedAt: string
}

interface Document {
  id: string
  title: string
  type: 'DOCUMENT' | 'DIAGRAM' | 'CANVAS'
  updatedAt: string
  project?: { name: string }
}

interface Activity {
  id: string
  action: string
  targetType: string
  targetId: string
  createdAt: string
  user: {
    id: string
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

// ============================================================================
// Animation Variants
// ============================================================================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

// ============================================================================
// Sub-Components
// ============================================================================

function StatCard({
  label,
  value,
  icon,
  trend,
  color = 'orange',
  onClick
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  trend?: string
  color?: 'orange' | 'blue' | 'green' | 'purple'
  onClick?: () => void
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const colorClasses = {
    orange: {
      bg: isDark ? 'bg-orange-500/10' : 'bg-orange-50',
      ring: 'ring-orange-500/20',
      icon: 'text-orange-500'
    },
    blue: {
      bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
      ring: 'ring-blue-500/20',
      icon: 'text-blue-500'
    },
    green: {
      bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50',
      ring: 'ring-emerald-500/20',
      icon: 'text-emerald-500'
    },
    purple: {
      bg: isDark ? 'bg-red-500/10' : 'bg-red-50',
      ring: 'ring-red-500/20',
      icon: 'text-red-500'
    }
  }

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
      <Card
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-300 group",
          isDark
            ? "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
            : "bg-white/70 border-slate-200 hover:border-slate-300 hover:shadow-lg"
        )}
        onClick={onClick}
      >
        {/* Gradient accent */}
        <div className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
          color === 'orange' && "from-[#C10801] via-[#E85002] to-[#F16001]",
          color === 'blue' && "from-blue-600 to-cyan-500",
          color === 'green' && "from-emerald-600 to-teal-400",
          color === 'purple' && "from-red-600 to-rose-500"
        )} />

        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className={cn("text-sm font-medium", isDark ? "text-neutral-400" : "text-slate-500")}>
                {label}
              </p>
              <div className="flex items-baseline gap-2">
                <p className={cn("text-3xl font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
                  {value}
                </p>
                {trend && (
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full">
                    <TrendingUp className="h-3 w-3" />
                    {trend}
                  </span>
                )}
              </div>
            </div>
            <div className={cn(
              "p-3 rounded-xl ring-1",
              colorClasses[color].bg,
              colorClasses[color].ring
            )}>
              <div className={colorClasses[color].icon}>{icon}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function QuickCreateCard({ onClick }: { onClick: () => void }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
      <Card
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-300 h-full group",
          "border-2 border-dashed",
          isDark
            ? "bg-zinc-900/30 border-zinc-700 hover:border-orange-500 hover:bg-zinc-900/50"
            : "bg-slate-50/50 border-slate-300 hover:border-orange-500 hover:bg-white"
        )}
        onClick={onClick}
      >
        <CardContent className="p-5 h-full flex flex-col items-center justify-center text-center min-h-[140px]">
          <div className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center mb-3 transition-all",
            "bg-gradient-to-br from-[#C10801] to-[#F16001]",
            "group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-500/20"
          )}>
            <Plus className="h-6 w-6 text-white" />
          </div>
          <span className={cn(
            "text-sm font-semibold",
            isDark ? "text-white" : "text-slate-900"
          )}>
            New Project
          </span>
          <span className={cn(
            "text-xs mt-1",
            isDark ? "text-neutral-500" : "text-slate-500"
          )}>
            Start from scratch
          </span>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ProjectCard({ project }: { project: Project }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const router = useRouter()

  const colors = [
    { gradient: 'from-[#C10801] to-[#F16001]', bg: 'bg-orange-500/10' },
    { gradient: 'from-orange-500 to-amber-500', bg: 'bg-amber-500/10' },
    { gradient: 'from-red-600 to-rose-500', bg: 'bg-red-500/10' },
    { gradient: 'from-amber-500 to-yellow-500', bg: 'bg-yellow-500/10' },
    { gradient: 'from-emerald-600 to-teal-500', bg: 'bg-emerald-500/10' },
  ]
  const colorIndex = parseInt(project.id.slice(-2), 36) % colors.length
  const color = colors[colorIndex]

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
      <Card
        className={cn(
          "relative overflow-hidden cursor-pointer transition-all duration-300 group",
          isDark
            ? "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg"
        )}
        onClick={() => router.push(`/projects/${project.id}`)}
      >
        {/* Top gradient bar */}
        <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", color.gradient)} />

        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br shrink-0",
              color.gradient
            )}>
              <FolderOpen className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-semibold text-base truncate",
                isDark ? "text-white" : "text-slate-900"
              )}>
                {project.name}
              </h3>
              <p className={cn(
                "text-sm mt-0.5 line-clamp-1",
                isDark ? "text-neutral-400" : "text-slate-500"
              )}>
                {project.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1.5">
                  <FileText className={cn("h-3.5 w-3.5", isDark ? "text-neutral-500" : "text-slate-400")} />
                  <span className={cn("text-xs", isDark ? "text-neutral-400" : "text-slate-500")}>
                    {project._count?.documents || 0} docs
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ListTodo className={cn("h-3.5 w-3.5", isDark ? "text-neutral-500" : "text-slate-400")} />
                  <span className={cn("text-xs", isDark ? "text-neutral-400" : "text-slate-500")}>
                    {project._count?.tasks || 0} tasks
                  </span>
                </div>
              </div>
            </div>
            <ArrowRight className={cn(
              "h-5 w-5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0",
              isDark ? "text-neutral-400" : "text-slate-400"
            )} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function TaskListCard({ tasks }: { tasks: Task[] }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const router = useRouter()

  const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
  const sortedTasks = [...tasks]
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 5)

  const priorityColors = {
    URGENT: { dot: 'bg-red-500', text: 'text-red-500' },
    HIGH: { dot: 'bg-orange-500', text: 'text-orange-500' },
    MEDIUM: { dot: 'bg-yellow-500', text: 'text-yellow-500' },
    LOW: { dot: 'bg-slate-400', text: 'text-slate-400' }
  }

  return (
    <motion.div variants={itemVariants}>
      <Card className={cn(
        "h-full transition-all duration-300",
        isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-white border-slate-200"
      )}>
        <CardHeader className={cn(
          "flex flex-row items-center justify-between py-4 px-5 border-b",
          isDark ? "border-neutral-800" : "border-slate-100"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              isDark ? "bg-amber-500/10" : "bg-amber-50"
            )}>
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Focus Zone</CardTitle>
              <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
                Your priority tasks
              </p>
            </div>
          </div>
          <Badge variant="outline" className={cn(
            "text-[10px] font-medium uppercase tracking-wider px-2 h-5",
            isDark ? "border-neutral-700 text-neutral-400" : "border-slate-200 text-slate-500"
          )}>
            {tasks.length} pending
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {sortedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className={cn(
                "h-12 w-12 rounded-full flex items-center justify-center mb-3",
                isDark ? "bg-green-500/10" : "bg-green-50"
              )}>
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <p className={cn("font-medium text-sm", isDark ? "text-white" : "text-slate-900")}>
                All caught up!
              </p>
              <p className={cn("text-xs mt-1", isDark ? "text-neutral-500" : "text-slate-500")}>
                No pending tasks
              </p>
            </div>
          ) : (
            <div className={cn("divide-y", isDark ? "divide-neutral-800" : "divide-slate-100")}>
              {sortedTasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "group flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors",
                    isDark ? "hover:bg-neutral-800/50" : "hover:bg-slate-50"
                  )}
                  onClick={() => router.push(`/projects/${task.projectId}`)}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full shrink-0",
                    priorityColors[task.priority].dot
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium truncate",
                      isDark ? "text-white" : "text-slate-900"
                    )}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        "text-xs truncate",
                        isDark ? "text-neutral-500" : "text-slate-500"
                      )}>
                        {task.project?.name}
                      </span>
                      {task.priority === 'URGENT' && (
                        <Badge variant="destructive" className="h-4 px-1.5 text-[9px]">
                          URGENT
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0",
                    isDark ? "text-neutral-500" : "text-slate-400"
                  )} />
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function RecentFilesCard({ documents }: { documents: Document[] }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const router = useRouter()

  return (
    <motion.div variants={itemVariants}>
      <Card className={cn(
        "h-full transition-all duration-300",
        isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-white border-slate-200"
      )}>
        <CardHeader className={cn(
          "flex flex-row items-center justify-between py-4 px-5 border-b",
          isDark ? "border-neutral-800" : "border-slate-100"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              isDark ? "bg-orange-500/10" : "bg-orange-50"
            )}>
              <Clock className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Recent Files</CardTitle>
              <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
                Continue where you left off
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className={cn("divide-y", isDark ? "divide-neutral-800" : "divide-slate-100")}>
            {documents.slice(0, 5).map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "group flex items-center gap-3 px-5 py-3.5 cursor-pointer transition-colors",
                  isDark ? "hover:bg-neutral-800/50" : "hover:bg-slate-50"
                )}
                onClick={() => router.push(`/?documentId=${doc.id}`)}
              >
                <div className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg border shrink-0",
                  doc.type === 'DIAGRAM'
                    ? "bg-orange-500/10 border-orange-500/20 text-orange-500"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                )}>
                  {doc.type === 'DIAGRAM' ? (
                    <GitBranch className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    isDark ? "text-white" : "text-slate-900"
                  )}>
                    {doc.title}
                  </p>
                  <p className={cn(
                    "text-xs truncate mt-0.5",
                    isDark ? "text-neutral-500" : "text-slate-500"
                  )}>
                    {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0",
                  isDark ? "text-neutral-500" : "text-slate-400"
                )} />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ActivityCard({ activities }: { activities: Activity[] }) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <motion.div variants={itemVariants}>
      <Card className={cn(
        "h-full transition-all duration-300",
        isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-white border-slate-200"
      )}>
        <CardHeader className={cn(
          "flex flex-row items-center justify-between py-4 px-5 border-b",
          isDark ? "border-neutral-800" : "border-slate-100"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              isDark ? "bg-amber-500/10" : "bg-amber-50"
            )}>
              <ActivityIcon className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Activity</CardTitle>
              <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
                Recent team updates
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ActivityIcon className={cn("h-8 w-8 mb-2", isDark ? "text-neutral-600" : "text-slate-300")} />
              <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
                No recent activity
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity, i) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3"
                >
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={activity.user.avatar || activity.user.image || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {activity.user.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs leading-5">
                      <span className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>
                        {activity.user.name}
                      </span>{' '}
                      <span className={isDark ? "text-neutral-400" : "text-slate-500"}>
                        {activity.action}
                      </span>{' '}
                      <span className={cn("font-medium", isDark ? "text-white" : "text-slate-900")}>
                        {activity.targetType}
                      </span>
                    </p>
                    <p className={cn("text-[10px] mt-0.5", isDark ? "text-neutral-500" : "text-slate-400")}>
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ============================================================================
// Main Dashboard Component
// ============================================================================
export function DashboardHome() {
  const { user, projects } = useApp()
  const [myTasks, setMyTasks] = useState<Task[]>([])
  const [recentDocs, setRecentDocs] = useState<Document[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [createProjectOpen, setCreateProjectOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    async function fetchDashboardData() {
      if (!user?.id) return
      try {
        const [tasksRes, docsRes, activityRes] = await Promise.all([
          fetch(`/api/tasks?assigneeId=${user.id}&limit=20&status=TODO,IN_PROGRESS,BLOCKED`),
          fetch(`/api/documents?limit=8`),
          fetch(`/api/activity?limit=10`)
        ])

        if (tasksRes.ok) {
          const data = await tasksRes.json()
          setMyTasks(data.data || [])
        }
        if (docsRes.ok) setRecentDocs(await docsRes.json())
        if (activityRes.ok) setActivities(await activityRes.json())

      } catch (error) {
        console.error("Dashboard data fetch failed", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [user?.id])

  if (loading) {
    return <DashboardSkeleton />
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const completedTasks = myTasks.filter(t => t.status === 'DONE').length
  const totalDocs = recentDocs.length

  return (
    <ScrollArea className="h-full">
      <div className={cn(
        "relative min-h-full",
        isDark ? "bg-black" : "bg-slate-50"
      )}>
        {/* Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={cn(
            "absolute -top-40 -right-40 w-96 h-96 rounded-full blur-3xl opacity-20",
            isDark ? "bg-orange-600" : "bg-orange-500"
          )} />
          <div className={cn(
            "absolute top-1/2 -left-40 w-80 h-80 rounded-full blur-3xl opacity-10",
            isDark ? "bg-amber-500" : "bg-amber-400"
          )} />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 max-w-[1400px] mx-auto p-6 md:p-8 space-y-8"
        >
          {/* Header Section */}
          <motion.div variants={itemVariants} className="flex items-start justify-between">
            <div className="space-y-1">
              <h1 className={cn(
                "text-3xl font-bold tracking-tight",
                isDark ? "text-white" : "text-slate-900"
              )}>
                {getGreeting()}, {user?.name?.split(' ')[0]}
              </h1>
              <p className={cn(
                "text-base",
                isDark ? "text-neutral-400" : "text-slate-500"
              )}>
                Here's what's happening with your projects today.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm",
                isDark ? "bg-neutral-900 text-neutral-400" : "bg-white text-slate-500 shadow-sm border border-slate-200"
              )}>
                <Clock className="h-4 w-4" />
                {new Date().toLocaleDateString(undefined, {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Active Projects"
              value={projects.length}
              icon={<LayoutTemplate className="h-5 w-5" />}
              trend={projects.length > 0 ? '+1 this week' : undefined}
              color="orange"
            />
            <StatCard
              label="Pending Tasks"
              value={myTasks.length}
              icon={<ListTodo className="h-5 w-5" />}
              color="blue"
            />
            <StatCard
              label="Documents"
              value={totalDocs}
              icon={<FileText className="h-5 w-5" />}
              color="green"
            />
            <QuickCreateCard onClick={() => setCreateProjectOpen(true)} />
          </div>

          {/* Projects Section */}
          {projects.length > 0 && (
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className={cn(
                    "text-lg font-semibold",
                    isDark ? "text-white" : "text-slate-900"
                  )}>
                    Your Projects
                  </h2>
                  <p className={cn(
                    "text-sm",
                    isDark ? "text-neutral-500" : "text-slate-500"
                  )}>
                    Quick access to your workspaces
                  </p>
                </div>
                <Link href="/projects">
                  <Button variant="ghost" size="sm" className="gap-1.5">
                    View all
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.slice(0, 3).map((project) => (
                  <ProjectCard key={project.id} project={project as Project} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <TaskListCard tasks={myTasks} />
            </div>
            <div className="lg:col-span-1">
              <RecentFilesCard documents={recentDocs} />
            </div>
            <div className="lg:col-span-1">
              <ActivityCard activities={activities} />
            </div>
          </div>

          {/* Productivity & Team Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProductivityInsights />
            <TeamActivityFeed />
          </div>
        </motion.div>

        <CreateProjectDialog open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
      </div>
    </ScrollArea>
  )
}
