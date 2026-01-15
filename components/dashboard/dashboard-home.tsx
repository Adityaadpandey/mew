'use client'

import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useApp } from '@/lib/app-context'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import {
    Activity as ActivityIcon,
    ArrowUpRight,
    CheckCircle2,
    ChevronRight,
    Clock,
    FileText,
    GitBranch,
    LayoutTemplate,
    ListTodo,
    Plus,
    Zap
} from 'lucide-react'
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

// ============================================================================
// Sub-Components (V4 Premium)
// ============================================================================

// Consistent card styling with ProjectOverview
function useCardStyles() {
    const { resolvedTheme } = useTheme()
    const isDark = resolvedTheme === 'dark'
    return {
        card: cn(
            isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-white/70 border-slate-200"
        ),
        hover: cn(
             isDark ? "hover:bg-neutral-800/50" : "hover:bg-slate-50"
        ),
        text: cn(
             isDark ? "text-neutral-400" : "text-slate-500"
        ),
        textStrong: cn(
             isDark ? "text-white" : "text-slate-900"
        )
    }
}

function FocusZone({ tasks }: { tasks: Task[] }) {
    const styles = useCardStyles()
    // Sort by priority (URGENT > HIGH > MEDIUM > LOW)
    const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
    const sortedTasks = [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

    return (
        <Card className={cn("col-span-1 md:col-span-2 lg:col-span-2 row-span-2 h-full transition-all duration-300", styles.card)}>
            <CardHeader className={cn("flex flex-row items-center justify-between py-4 px-6 border-b", styles.card.split(' ')[1])}>
                <div className="space-y-0.5">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4 text-amber-500" />
                        Focus Zone
                    </CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] font-normal uppercase tracking-widest px-2 py-0 h-5 border-border/50 bg-transparent opacity-70">
                   High Priority
                </Badge>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[440px]">
                    {sortedTasks.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center opacity-60">
                            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4 ring-1 ring-green-500/20">
                                <CheckCircle2 className="h-6 w-6 text-green-500" />
                            </div>
                            <p className="font-medium text-sm">All caught up</p>
                            <p className="text-xs mt-1 max-w-[200px]">No high priority tasks pending.</p>
                         </div>
                    ) : (
                        <div className={cn("divide-y", styles.card.split(' ')[1])}>
                            {sortedTasks.map((task, i) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={cn("group flex items-center gap-4 px-6 py-4 transition-colors cursor-pointer", styles.hover)}
                                >
                                    {/* Priority Indicator */}
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full flex-shrink-0 ring-4 ring-transparent transition-all",
                                        task.priority === 'URGENT' ? 'bg-[#C10801] text-[#C10801]' :
                                        task.priority === 'HIGH' ? 'bg-[#F16001] text-[#F16001]' :
                                        task.priority === 'MEDIUM' ? 'bg-[#E85002] text-[#E85002]' : 'bg-slate-500 text-slate-500'
                                    )} />

                                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className={cn("text-sm font-medium truncate transition-colors", styles.textStrong)}>
                                                {task.title}
                                            </span>
                                            {task.priority === 'URGENT' && (
                                                <Badge variant="destructive" className="h-4 px-1 text-[9px] uppercase tracking-wider rounded-sm">Urgent</Badge>
                                            )}
                                        </div>
                                        <div className={cn("flex items-center gap-2 text-xs", styles.text)}>
                                            <span className="truncate max-w-[120px] font-medium">{task.project?.name}</span>
                                            <span className="w-1 h-1 rounded-full bg-border" />
                                            <span>{task.status.replace('_', ' ').toLowerCase()}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

function TeamPulse({ activities }: { activities: Activity[] }) {
    const styles = useCardStyles()
    return (
        <Card className={cn("col-span-1 h-full transition-all duration-300", styles.card)}>
            <CardHeader className={cn("flex flex-row items-center justify-between py-4 px-6 border-b", styles.card.split(' ')[1])}>
                <div className="space-y-0.5">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <ActivityIcon className="h-4 w-4 text-rose-500" />
                        Team Pulse
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[440px]">
                    {activities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center opacity-60">
                             <div className="h-10 w-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-3">
                                <ActivityIcon className="h-5 w-5 text-rose-500/50" />
                            </div>
                            <p className="text-xs">No recent activity</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {activities.map((activity, i) => (
                                <div key={activity.id} className={cn("relative pl-6 pr-4 py-3 transition-colors group", styles.hover)}>
                                     {/* Timeline Line */}
                                     {i !== activities.length - 1 && (
                                         <div className="absolute left-[33px] top-8 bottom-0 w-[1px] bg-border/40 group-hover:bg-border/60" />
                                     )}

                                    <div className="flex gap-3">
                                        <Avatar className="h-6 w-6 border border-border/50 ring-2 ring-background z-10 mt-0.5">
                                            <AvatarImage src={activity.user.avatar || activity.user.image || undefined} />
                                            <AvatarFallback className="text-[10px]">{activity.user.name?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0 space-y-0.5">
                                            <p className="text-xs leading-5">
                                                <span className={cn("font-semibold", styles.textStrong)}>{activity.user.name}</span>{' '}
                                                <span className={styles.text}>{activity.action}</span>{' '}
                                                <span className={cn("font-medium", styles.textStrong)}>{activity.targetType}</span>
                                            </p>
                                            <p className={cn("text-[10px] font-medium opacity-60", styles.text)}>
                                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

function JumpBackIn({ documents }: { documents: Document[] }) {
    const router = useRouter()
    const styles = useCardStyles()
    return (
        <Card className={cn("col-span-1 h-full transition-all duration-300", styles.card)}>
             <CardHeader className={cn("flex flex-row items-center justify-between py-4 px-6 border-b", styles.card.split(' ')[1])}>
                <div className="space-y-0.5">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#E85002]" />
                        Jump Back In
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <ScrollArea className="h-[440px]">
                    <div className={cn("divide-y", styles.card.split(' ')[1])}>
                         {documents.map((doc, i) => (
                             <div
                                key={doc.id}
                                className={cn("group flex items-center justify-between px-6 py-4 transition-colors cursor-pointer", styles.hover)}
                                onClick={() => router.push(`/?documentId=${doc.id}`)}
                             >
                                 <div className="flex items-center gap-3 overflow-hidden">
                                     <div className={cn(
                                         "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border shadow-sm transition-colors",
                                         doc.type === 'DIAGRAM'
                                            ? "bg-[#E85002]/10 border-[#E85002]/20 text-[#E85002]"
                                            : "bg-[#F16001]/10 border-[#F16001]/20 text-[#F16001]"
                                     )}>
                                         {doc.type === 'DIAGRAM' ? <GitBranch className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                     </div>
                                     <div className="min-w-0 flex flex-col gap-0.5">
                                         <p className={cn("text-sm font-medium truncate transition-colors", styles.textStrong)}>{doc.title}</p>
                                         <p className={cn("text-[11px] truncate font-medium", styles.text)}>{doc.project?.name || 'No Project'}</p>
                                     </div>
                                 </div>
                                 <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                             </div>
                         ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

function StatCard({ label, value, icon, trend, subLabel }: any) {
    const styles = useCardStyles()
    return (
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
            <Card className={cn("flex flex-row items-center p-5 gap-4 transition-all", styles.card)}>
                <div className={cn(
                    "p-3 rounded-2xl ring-1 ring-border/50",
                    // Use a subtle neutral bg
                    styles.card.includes("neutral") ? "bg-neutral-800" : "bg-slate-100"
                )}>
                     {icon}
                </div>
                <div>
                     <div className={cn("text-2xl font-bold tracking-tight leading-none mb-1", styles.textStrong)}>{value}</div>
                     <div className="flex items-center gap-2">
                        <span className={cn("text-xs font-medium", styles.text)}>{label}</span>
                        {trend && (
                            <span className="text-[10px] font-bold text-green-600 bg-green-500/10 px-1.5 rounded-sm">
                                {trend}
                            </span>
                        )}
                     </div>
                </div>
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
  const styles = useCardStyles()

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
      return (
          <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
              <Skeleton className="h-6 w-1/3 rounded-xl mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl" />)}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[500px]">
                  <Skeleton className="lg:col-span-2 h-full rounded-2xl" />
                  <Skeleton className="h-full rounded-2xl" />
                  <Skeleton className="h-full rounded-2xl" />
              </div>
          </div>
      )
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <ScrollArea className="h-full">
      <div className="relative max-w-[1600px] mx-auto p-6 md:p-8 space-y-6">

         {/* Minimal Header */}
         <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className={cn("text-2xl font-bold tracking-tight", styles.textStrong)}>
                    Dashboard
                </h1>
                <p className={cn("text-sm", styles.text)}>
                    {getGreeting()}, {user?.name?.split(' ')[0]}
                </p>
            </div>

            <div className={cn("flex items-center gap-2 text-sm font-medium", styles.text)}>
                <span className="flex items-center gap-1.5 bg-secondary/40 px-3 py-1 rounded-full text-xs box-border border-border/10">
                    <Clock className="h-3 w-3" />
                    {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
            </div>
         </div>

         {/* Hero Stats */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
             <StatCard
                label="Active Projects"
                value={projects.length}
                icon={<LayoutTemplate className="h-5 w-5 text-[#E85002]" />}
                trend="+2"
             />
             <StatCard
                label="Pending Tasks"
                value={myTasks.length}
                icon={<ListTodo className="h-5 w-5 text-orange-500" />}
             />
             <StatCard
                label="Recent Files"
                value={recentDocs.length}
                icon={<FileText className="h-5 w-5 text-[#F16001]" />}
             />
             <motion.div
                 whileHover={{ scale: 1.01 }}
                 whileTap={{ scale: 0.99 }}
                 onClick={() => setCreateProjectOpen(true)}
                 className={cn(
                    "flex flex-col items-center justify-center p-4 rounded-xl border border-dashed transition-colors cursor-pointer group h-full min-h-[100px]",
                     styles.card.includes("neutral")
                        ? "border-neutral-700 bg-neutral-900/30 hover:bg-neutral-900/60"
                        : "border-slate-300 bg-slate-50 hover:bg-slate-100"
                 )}
             >
                 <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Plus className="h-5 w-5 text-primary" />
                 </div>
                 <span className="text-sm font-semibold text-primary">Create New Project</span>
             </motion.div>
         </div>

         {/* Main Dashboard Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:h-[600px] auto-rows-min">
             {/* Main Focus Area - 2x2 on large */}
             <FocusZone tasks={myTasks} />

             {/* Activity Stream */}
             <div className="col-span-1 lg:col-span-1 h-full">
                 <TeamPulse activities={activities} />
             </div>

             {/* Recent Files */}
             <div className="col-span-1 lg:col-span-1 h-full">
                 <JumpBackIn documents={recentDocs} />
             </div>
         </div>
      </div>

      <CreateProjectDialog open={createProjectOpen} onOpenChange={setCreateProjectOpen} />
    </ScrollArea>
  )
}
