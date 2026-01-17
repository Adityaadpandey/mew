'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Flame,
  Zap,
  ListTodo,
  GripVertical,
} from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { TaskCard } from './task-card'
import { CreateTaskDialog } from './create-task-dialog'
import { TaskDetailDialog } from './task-detail-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface Subtask {
  id: string
  title: string
  completed: boolean
  position: number
}

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
  subtasks: Subtask[]
  position: number
  createdAt: string
  updatedAt: string
}

interface ProjectTasksProps {
  projectId: string
}

const COLUMNS = [
  { id: 'TODO', label: 'To Do', icon: Clock, color: 'text-zinc-400', bg: 'bg-zinc-500/10', accent: 'border-zinc-400' },
  { id: 'IN_PROGRESS', label: 'In Progress', icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', accent: 'border-blue-500' },
  { id: 'DONE', label: 'Done', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', accent: 'border-emerald-500' },
  { id: 'BLOCKED', label: 'Blocked', icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', accent: 'border-red-500' },
] as const

const PRIORITY_OPTIONS = [
  { id: null, label: 'All Priorities', icon: Filter },
  { id: 'LOW', label: 'Low', icon: Clock, color: 'text-zinc-500' },
  { id: 'MEDIUM', label: 'Medium', icon: AlertCircle, color: 'text-amber-500' },
  { id: 'HIGH', label: 'High', icon: Zap, color: 'text-orange-500' },
  { id: 'URGENT', label: 'Urgent', icon: Flame, color: 'text-red-500' },
]

function DraggableTaskCard({
  task,
  index,
  onStatusChange,
  onDelete,
  onClick,
  isDark,
  onDragStart,
  onDragEnd,
  isDragging,
}: {
  task: Task
  index: number
  onStatusChange: (taskId: string, status: Task['status']) => void
  onDelete: (taskId: string) => void
  onClick: () => void
  isDark: boolean
  onDragStart: (taskId: string) => void
  onDragEnd: () => void
  isDragging: boolean
}) {
  let wasDragged = false

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    wasDragged = true
    e.dataTransfer.setData('text/plain', task.id)
    e.dataTransfer.setData('application/task-id', task.id)
    e.dataTransfer.effectAllowed = 'move'
    onDragStart(task.id)
  }

  const handleClick = (e: React.MouseEvent) => {
    if (wasDragged) {
      wasDragged = false
      return
    }
    const target = e.target as HTMLElement
    if (target.closest('[data-radix-dropdown-menu-content]') ||
        target.closest('button') ||
        target.closest('[role="menuitem"]')) {
      return
    }
    onClick()
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={handleClick}
      className={cn(
        "relative group cursor-pointer",
        isDragging && "opacity-50 scale-[0.98]"
      )}
    >
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab",
        isDark ? "text-zinc-600" : "text-gray-400"
      )}>
        <GripVertical className="h-3.5 w-3.5" />
      </div>
      <div className="pl-2">
        <TaskCard
          task={task}
          index={index}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
          isDark={isDark}
          isDragging={isDragging}
        />
      </div>
    </div>
  )
}

function DroppableColumn({
  column,
  tasks,
  isDark,
  onDrop,
  isOver,
  onDragOver,
  onDragLeave,
  onStatusChange,
  onDelete,
  onTaskClick,
  draggingTaskId,
  onDragStart,
  onDragEnd,
}: {
  column: typeof COLUMNS[number]
  tasks: Task[]
  isDark: boolean
  onDrop: (taskId: string, status: Task['status']) => void
  isOver: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onStatusChange: (taskId: string, status: Task['status']) => void
  onDelete: (taskId: string) => void
  onTaskClick: (task: Task) => void
  draggingTaskId: string | null
  onDragStart: (taskId: string) => void
  onDragEnd: () => void
}) {
  const Icon = column.icon

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('application/task-id') || e.dataTransfer.getData('text/plain')
    if (taskId) {
      onDrop(taskId, column.id as Task['status'])
    }
    onDragLeave()
  }

  return (
    <div className="flex flex-col min-w-[280px]">
      {/* Column Header */}
      <div className={cn(
        "flex items-center justify-between px-3 py-2.5 rounded-t-lg border-b",
        column.accent,
        isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200"
      )}>
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", column.color)} />
          <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-gray-900")}>
            {column.label}
          </span>
          <Badge
            variant="secondary"
            className={cn(
              "h-5 min-w-[20px] px-1.5 text-xs",
              isDark ? "bg-zinc-800" : "bg-gray-100"
            )}
          >
            {tasks.length}
          </Badge>
        </div>
      </div>

      {/* Column Content */}
      <div
        onDragOver={(e) => { e.preventDefault(); onDragOver(e) }}
        onDragLeave={onDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex-1 p-3 rounded-b-lg min-h-[350px] max-h-[calc(100vh-300px)] overflow-y-auto transition-colors",
          isDark ? "bg-zinc-900/30" : "bg-gray-50/50",
          isOver && (isDark
            ? "bg-blue-500/5 ring-1 ring-inset ring-blue-500/30"
            : "bg-blue-50/50 ring-1 ring-inset ring-blue-500/30")
        )}
      >
        <div className="space-y-2">
          {tasks.map((task, index) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              index={index}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
              onClick={() => onTaskClick(task)}
              isDark={isDark}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={draggingTaskId === task.id}
            />
          ))}

          {tasks.length === 0 && (
            <div className={cn(
              "flex flex-col items-center justify-center py-10 px-3 rounded-lg border border-dashed",
              isDark ? "border-zinc-800" : "border-gray-200",
              isOver && "border-blue-500/50"
            )}>
              <Icon className={cn("h-6 w-6 mb-2", isDark ? "text-zinc-700" : "text-gray-300", isOver && "text-blue-500")} />
              <p className={cn("text-xs text-center", isDark ? "text-zinc-600" : "text-gray-400", isOver && "text-blue-500")}>
                {isOver ? "Drop here" : "No tasks"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ProjectTasks({ projectId }: ProjectTasksProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [taskDetailOpen, setTaskDetailOpen] = useState(false)
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
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
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    ))

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        fetchTasks()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
      fetchTasks()
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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setTaskDetailOpen(true)
  }

  const handleDrop = (taskId: string, newStatus: Task['status']) => {
    setDraggingTaskId(null)
    setDragOverColumn(null)
    handleStatusChange(taskId, newStatus)
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
    const matchesPriority = !filterPriority || task.priority === filterPriority
    return matchesSearch && matchesPriority
  })

  const getTasksByStatus = useCallback((status: Task['status']) => {
    return filteredTasks
      .filter(t => t.status === status)
      .sort((a, b) => a.position - b.position)
  }, [filteredTasks])

  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
    blocked: tasks.filter(t => t.status === 'BLOCKED').length,
  }

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
  const selectedPriority = PRIORITY_OPTIONS.find(p => p.id === filterPriority)

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className={cn(
        "border-b px-6 py-4 shrink-0",
        isDark ? "border-zinc-800 bg-zinc-950" : "border-gray-200 bg-white"
      )}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className={cn(
                "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                isDark ? "text-zinc-500" : "text-gray-400"
              )} />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "pl-10 h-9",
                  isDark
                    ? "bg-zinc-900 border-zinc-800"
                    : "bg-white border-gray-200"
                )}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-2 h-9",
                    isDark ? "border-zinc-800 bg-zinc-900 hover:bg-zinc-800" : "bg-white hover:bg-gray-50"
                  )}
                >
                  {selectedPriority?.icon && (
                    <selectedPriority.icon className={cn("h-4 w-4", selectedPriority.color)} />
                  )}
                  {filterPriority || 'All Priorities'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className={isDark ? "bg-zinc-900 border-zinc-800" : ""}>
                {PRIORITY_OPTIONS.map((option, index) => {
                  const Icon = option.icon
                  return (
                    <div key={option.id || 'all'}>
                      {index === 1 && <DropdownMenuSeparator className={isDark ? "bg-zinc-800" : ""} />}
                      <DropdownMenuItem onClick={() => setFilterPriority(option.id)}>
                        <Icon className={cn("h-4 w-4 mr-2", option.color)} />
                        {option.label}
                      </DropdownMenuItem>
                    </div>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CreateTaskDialog projectId={projectId} onTaskCreated={fetchTasks} />
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-5">
            {COLUMNS.map((column) => {
              const count = column.id === 'TODO' ? stats.todo :
                           column.id === 'IN_PROGRESS' ? stats.inProgress :
                           column.id === 'DONE' ? stats.done : stats.blocked
              if (count === 0 && column.id === 'BLOCKED') return null
              return (
                <div key={column.id} className="flex items-center gap-1.5">
                  <div className={cn("h-2 w-2 rounded-full", column.color.replace('text-', 'bg-'))} />
                  <span className={cn("text-xs", isDark ? "text-zinc-400" : "text-gray-600")}>
                    {column.label}:
                  </span>
                  <span className={cn("text-xs font-medium", isDark ? "text-white" : "text-gray-900")}>
                    {count}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <span className={cn("text-xs", isDark ? "text-zinc-500" : "text-gray-500")}>
              {completionRate}% complete
            </span>
            <Progress value={completionRate} className={cn("w-24 h-1.5", isDark ? "bg-zinc-800" : "bg-gray-200")} />
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 min-w-max">
          {tasks.length === 0 && !isLoading ? (
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16",
                isDark ? "border-zinc-800" : "border-gray-200"
              )}
            >
              <div className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl mb-4",
                isDark ? "bg-zinc-800" : "bg-gray-100"
              )}>
                <ListTodo className={cn("h-6 w-6", isDark ? "text-zinc-400" : "text-gray-500")} />
              </div>
              <h3 className={cn("text-lg font-medium mb-2", isDark ? "text-white" : "text-gray-900")}>
                No tasks yet
              </h3>
              <p className={cn("text-sm text-center max-w-md mb-5", isDark ? "text-zinc-500" : "text-gray-500")}>
                Create your first task to start organizing your work
              </p>
              <CreateTaskDialog projectId={projectId} onTaskCreated={fetchTasks} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {COLUMNS.map((column) => (
                <DroppableColumn
                  key={column.id}
                  column={column}
                  tasks={getTasksByStatus(column.id as Task['status'])}
                  isDark={isDark}
                  onDrop={handleDrop}
                  isOver={dragOverColumn === column.id}
                  onDragOver={() => setDragOverColumn(column.id)}
                  onDragLeave={() => setDragOverColumn(null)}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDeleteTask}
                  onTaskClick={handleTaskClick}
                  draggingTaskId={draggingTaskId}
                  onDragStart={setDraggingTaskId}
                  onDragEnd={() => {
                    setDraggingTaskId(null)
                    setDragOverColumn(null)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={selectedTask}
        open={taskDetailOpen}
        onOpenChange={setTaskDetailOpen}
        onTaskUpdated={fetchTasks}
        projectId={projectId}
      />
    </div>
  )
}
