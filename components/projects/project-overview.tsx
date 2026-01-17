'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  GitBranch,
  ListTodo,
  TrendingUp
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface ProjectOverviewProps {
  projectId: string
  project: {
    id: string
    name: string
    description: string | null
    createdAt: string
    updatedAt: string
  }
}

interface Task {
  id: string
  title: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  updatedAt: string
}

interface Document {
  id: string
  title: string
  type: 'DOCUMENT' | 'DIAGRAM' | 'CANVAS'
  updatedAt: string
}

const statusConfig = {
  TODO: { dot: 'bg-zinc-400', bg: 'bg-zinc-100 dark:bg-zinc-800', text: 'text-zinc-600 dark:text-zinc-400' },
  IN_PROGRESS: { dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  DONE: { dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  BLOCKED: { dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-400' },
}

export function ProjectOverview({ projectId, project }: ProjectOverviewProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, docsRes] = await Promise.all([
          fetch(`/api/tasks?projectId=${projectId}&limit=5`),
          fetch(`/api/documents?projectId=${projectId}&limit=5`),
        ])

        if (tasksRes.ok) {
          const data = await tasksRes.json()
          setTasks(data.data || [])
        }

        if (docsRes.ok) {
          const data = await docsRes.json()
          setDocuments(data)
        }
      } catch (error) {
        console.error('Failed to fetch overview data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [projectId])

  const taskStats = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'DONE').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    todo: tasks.filter(t => t.status === 'TODO').length,
  }

  const progress = taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0

  return (
    <ScrollArea className="h-full">
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Tasks"
            value={taskStats.total}
            icon={<ListTodo className="h-4 w-4" />}
            isDark={isDark}
          />
          <StatCard
            label="Completed"
            value={taskStats.done}
            icon={<CheckCircle2 className="h-4 w-4" />}
            isDark={isDark}
            accent="emerald"
          />
          <StatCard
            label="In Progress"
            value={taskStats.inProgress}
            icon={<Activity className="h-4 w-4" />}
            isDark={isDark}
            accent="blue"
          />
          <StatCard
            label="Progress"
            value={`${progress}%`}
            icon={<TrendingUp className="h-4 w-4" />}
            isDark={isDark}
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <div className={cn(
            "rounded-xl border p-5",
            isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-200"
          )}>
            <div className="flex items-center gap-2 mb-4">
              <ListTodo className={cn("h-4 w-4", isDark ? "text-zinc-400" : "text-gray-500")} />
              <h3 className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                Recent Tasks
              </h3>
            </div>

            {tasks.length === 0 ? (
              <p className={cn("text-sm text-center py-8", isDark ? "text-zinc-500" : "text-gray-400")}>
                No tasks yet
              </p>
            ) : (
              <div className="space-y-2">
                {tasks.slice(0, 5).map((task) => {
                  const config = statusConfig[task.status]
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-colors",
                        isDark ? "hover:bg-zinc-800" : "hover:bg-gray-50"
                      )}
                    >
                      <div className={cn("h-2 w-2 rounded-full shrink-0", config.dot)} />
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          isDark ? "text-white" : "text-gray-900"
                        )}>
                          {task.title}
                        </p>
                        <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-gray-500")}>
                          {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium shrink-0",
                        config.bg,
                        config.text
                      )}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent Documents */}
          <div className={cn(
            "rounded-xl border p-5",
            isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-200"
          )}>
            <div className="flex items-center gap-2 mb-4">
              <FileText className={cn("h-4 w-4", isDark ? "text-zinc-400" : "text-gray-500")} />
              <h3 className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                Recent Documents
              </h3>
            </div>

            {documents.length === 0 ? (
              <p className={cn("text-sm text-center py-8", isDark ? "text-zinc-500" : "text-gray-400")}>
                No documents yet
              </p>
            ) : (
              <div className="space-y-2">
                {documents.slice(0, 5).map((doc) => (
                  <div
                    key={doc.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer",
                      isDark ? "hover:bg-zinc-800" : "hover:bg-gray-50"
                    )}
                  >
                    <div className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                      doc.type === 'DIAGRAM' || doc.type === 'CANVAS'
                        ? "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                        : "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                    )}>
                      {doc.type === 'DIAGRAM' || doc.type === 'CANVAS' ? (
                        <GitBranch className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        isDark ? "text-white" : "text-gray-900"
                      )}>
                        {doc.title}
                      </p>
                      <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-gray-500")}>
                        {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Project Timeline */}
        <div className={cn(
          "rounded-xl border p-5",
          isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-200"
        )}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className={cn("h-4 w-4", isDark ? "text-zinc-400" : "text-gray-500")} />
            <h3 className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
              Timeline
            </h3>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                isDark ? "bg-zinc-800" : "bg-gray-100"
              )}>
                <Clock className={cn("h-4 w-4", isDark ? "text-zinc-400" : "text-gray-500")} />
              </div>
              <div>
                <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                  Created
                </p>
                <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-gray-500")}>
                  {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>

            <div className={cn("h-px flex-1", isDark ? "bg-zinc-800" : "bg-gray-200")} />

            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg",
                isDark ? "bg-zinc-800" : "bg-gray-100"
              )}>
                <Activity className={cn("h-4 w-4", isDark ? "text-zinc-400" : "text-gray-500")} />
              </div>
              <div>
                <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
                  Last Updated
                </p>
                <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-gray-500")}>
                  {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

function StatCard({ label, value, icon, isDark, accent }: {
  label: string
  value: number | string
  icon: React.ReactNode
  isDark: boolean
  accent?: 'emerald' | 'blue' | 'orange'
}) {
  const accentClasses = {
    emerald: isDark ? 'text-emerald-400' : 'text-emerald-600',
    blue: isDark ? 'text-blue-400' : 'text-blue-600',
    orange: isDark ? 'text-orange-400' : 'text-orange-600',
  }

  return (
    <div className={cn(
      "p-4 rounded-xl border",
      isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-200"
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-zinc-500" : "text-gray-500")}>
          {label}
        </span>
        <div className={cn(
          "p-1.5 rounded-md",
          isDark ? "bg-zinc-800 text-zinc-400" : "bg-gray-100 text-gray-500"
        )}>
          {icon}
        </div>
      </div>
      <p className={cn(
        "text-2xl font-semibold",
        accent ? accentClasses[accent] : (isDark ? "text-white" : "text-gray-900")
      )}>
        {value}
      </p>
    </div>
  )
}
