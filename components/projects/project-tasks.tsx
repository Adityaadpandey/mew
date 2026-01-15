'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { getStatusColor, getPriorityColor } from '@/lib/design-system'
import { TaskCard } from './task-card'
import { CreateTaskDialog } from './create-task-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface Task {
  id: string
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assigneeId: string | null
  assignee: { id: string; name: string | null; image: string | null } | null
  dueDate: string | null
  tags: string[]
  position: number
  createdAt: string
  updatedAt: string
}

interface ProjectTasksProps {
  projectId: string
}

const COLUMNS = [
  { id: 'TODO', label: 'To Do', icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'IN_PROGRESS', label: 'In Progress', icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'DONE', label: 'Done', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'BLOCKED', label: 'Blocked', icon: XCircle, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
] as const

export function ProjectTasks({ projectId }: ProjectTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    fetchTasks()
  }, [projectId])

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/tasks?projectId=${projectId}`)
      if (res.ok) {
        const data = await res.json()
        setTasks(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
      }
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return

    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (res.ok) {
        setTasks(prev => prev.filter(t => t.id !== taskId))
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
    const matchesPriority = !filterPriority || task.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  const getTasksByStatus = (status: Task['status']) => {
    return filteredTasks
      .filter(t => t.status === status)
      .sort((a, b) => a.position - b.position)
  }

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
    blocked: tasks.filter(t => t.status === 'BLOCKED').length,
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className={cn(
        "border-b px-8 py-4",
        isDark ? "border-neutral-800 bg-black/50" : "border-slate-200 bg-white/50"
      )}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className={cn(
                "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                isDark ? "text-neutral-500" : "text-slate-400"
              )} />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "pl-10",
                  isDark
                    ? "bg-neutral-900/50 border-neutral-800"
                    : "bg-white/70 border-slate-200"
                )}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-2",
                    isDark ? "border-neutral-800 bg-neutral-900/50" : "bg-white/70"
                  )}
                >
                  <Filter className="h-4 w-4" />
                  {filterPriority || 'All Priorities'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setFilterPriority(null)}>
                  All Priorities
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilterPriority('LOW')}>Low</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority('MEDIUM')}>Medium</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority('HIGH')}>High</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterPriority('URGENT')}>Urgent</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CreateTaskDialog projectId={projectId} onTaskCreated={fetchTasks} />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", COLUMNS[0].color.replace('text-', 'bg-'))} />
            <span className={cn("text-sm", isDark ? "text-neutral-400" : "text-slate-600")}>
              To Do: {stats.todo}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", COLUMNS[1].color.replace('text-', 'bg-'))} />
            <span className={cn("text-sm", isDark ? "text-neutral-400" : "text-slate-600")}>
              In Progress: {stats.inProgress}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", COLUMNS[2].color.replace('text-', 'bg-'))} />
            <span className={cn("text-sm", isDark ? "text-neutral-400" : "text-slate-600")}>
              Done: {stats.done}
            </span>
          </div>
          {stats.blocked > 0 && (
            <div className="flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", COLUMNS[3].color.replace('text-', 'bg-'))} />
              <span className={cn("text-sm", isDark ? "text-neutral-400" : "text-slate-600")}>
                Blocked: {stats.blocked}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <ScrollArea className="flex-1">
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COLUMNS.map((column) => {
              const columnTasks = getTasksByStatus(column.id as Task['status'])
              const Icon = column.icon

              return (
                <div key={column.id} className="flex flex-col">
                  {/* Column Header */}
                  <div className={cn(
                    "flex items-center justify-between p-4 rounded-t-xl border-b-2",
                    isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-white/70 border-slate-200"
                  )}>
                    <div className="flex items-center gap-2">
                      <Icon className={cn("h-5 w-5", column.color)} />
                      <h3 className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>
                        {column.label}
                      </h3>
                      <span className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                        column.bg,
                        column.color
                      )}>
                        {columnTasks.length}
                      </span>
                    </div>
                  </div>

                  {/* Column Content */}
                  <div className={cn(
                    "flex-1 p-4 rounded-b-xl min-h-[500px]",
                    isDark ? "bg-neutral-900/30" : "bg-slate-50/50"
                  )}>
                    <div className="space-y-3">
                      <AnimatePresence>
                        {columnTasks.map((task, index) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            index={index}
                            onStatusChange={handleStatusChange}
                            onDelete={handleDeleteTask}
                            isDark={isDark}
                          />
                        ))}
                      </AnimatePresence>

                      {columnTasks.length === 0 && (
                        <div className={cn(
                          "flex flex-col items-center justify-center py-12 px-4 rounded-xl border-2 border-dashed",
                          isDark ? "border-neutral-800" : "border-slate-200"
                        )}>
                          <Icon className={cn("h-8 w-8 mb-2", isDark ? "text-neutral-700" : "text-slate-300")} />
                          <p className={cn("text-sm text-center", isDark ? "text-neutral-600" : "text-slate-400")}>
                            No tasks
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
