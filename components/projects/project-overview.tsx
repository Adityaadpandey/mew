'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
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
import { getStatusColor } from '@/lib/design-system'

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
      <div className="max-w-7xl mx-auto px-8 py-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className={cn(
              "border-l-4 border-l-[#E85002]",
              isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-white/70 border-slate-200"
            )}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-neutral-400" : "text-slate-500")}>
                      Total Tasks
                    </p>
                    <p className={cn("text-3xl font-bold mt-2", isDark ? "text-white" : "text-slate-900")}>
                      {taskStats.total}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E85002]/10">
                    <ListTodo className="h-6 w-6 text-[#E85002]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className={cn(
              "border-l-4 border-l-green-500",
              isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-white/70 border-slate-200"
            )}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-neutral-400" : "text-slate-500")}>
                      Completed
                    </p>
                    <p className={cn("text-3xl font-bold mt-2", isDark ? "text-white" : "text-slate-900")}>
                      {taskStats.done}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className={cn(
              "border-l-4 border-l-orange-500",
              isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-white/70 border-slate-200"
            )}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-neutral-400" : "text-slate-500")}>
                      In Progress
                    </p>
                    <p className={cn("text-3xl font-bold mt-2", isDark ? "text-white" : "text-slate-900")}>
                      {taskStats.inProgress}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10">
                    <Activity className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className={cn(
              "border-l-4 border-l-[#E85002]",
              isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-white/70 border-slate-200"
            )}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-neutral-400" : "text-slate-500")}>
                      Progress
                    </p>
                    <p className={cn("text-3xl font-bold mt-2", isDark ? "text-white" : "text-slate-900")}>
                      {progress}%
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E85002]/10">
                    <TrendingUp className="h-6 w-6 text-[#E85002]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Tasks */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className={cn(
              isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-white/70 border-slate-200"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5" />
                  Recent Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length === 0 ? (
                  <p className={cn("text-sm text-center py-8", isDark ? "text-neutral-500" : "text-slate-400")}>
                    No tasks yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tasks.slice(0, 5).map((task) => {
                      const statusColor = getStatusColor(task.status)
                      return (
                        <div
                          key={task.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                            isDark
                              ? "border-neutral-800 hover:bg-neutral-800/50"
                              : "border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          <div className={cn("h-2 w-2 rounded-full", statusColor.dot)} />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              isDark ? "text-white" : "text-slate-900"
                            )}>
                              {task.title}
                            </p>
                            <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
                              {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                            </p>
                          </div>
                          <div className={cn(
                            "px-2 py-1 rounded text-xs font-medium",
                            statusColor.bg,
                            statusColor.text
                          )}>
                            {task.status.replace('_', ' ')}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Documents */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className={cn(
              isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-white/70 border-slate-200"
            )}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Recent Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <p className={cn("text-sm text-center py-8", isDark ? "text-neutral-500" : "text-slate-400")}>
                    No documents yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {documents.slice(0, 5).map((doc) => (
                      <div
                        key={doc.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                          isDark
                            ? "border-neutral-800 hover:bg-neutral-800/50"
                            : "border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg",
                          doc.type === 'DIAGRAM'
                            ? "bg-[#E85002]/10 text-[#E85002]"
                            : "bg-[#F16001]/10 text-[#F16001]"
                        )}>
                          {doc.type === 'DIAGRAM' ? (
                            <GitBranch className="h-5 w-5" />
                          ) : (
                            <FileText className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            isDark ? "text-white" : "text-slate-900"
                          )}>
                            {doc.title}
                          </p>
                          <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
                            {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Project Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className={cn(
            isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-white/70 border-slate-200"
          )}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Project Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    isDark ? "bg-neutral-800" : "bg-slate-100"
                  )}>
                    <Clock className={cn("h-5 w-5", isDark ? "text-neutral-400" : "text-slate-500")} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                      Created
                    </p>
                    <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
                      {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    isDark ? "bg-neutral-800" : "bg-slate-100"
                  )}>
                    <Activity className={cn("h-5 w-5", isDark ? "text-neutral-400" : "text-slate-500")} />
                  </div>
                  <div>
                    <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                      Last Updated
                    </p>
                    <p className={cn("text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
                      {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ScrollArea>
  )
}
