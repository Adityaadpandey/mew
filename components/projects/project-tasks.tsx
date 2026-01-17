
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  GripVertical,
  ListTodo,
  Search,
  XCircle,
  Zap
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { CreateTaskDialog } from './create-task-dialog'
import { TaskCard } from './task-card'
import { TaskDetailDialog } from './task-detail-dialog'

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
  recurrence?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  recurrenceInterval?: number
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
  { id: 'HIGH', icon: Zap, color: 'text-orange-500' },
  { id: 'URGENT', label: 'Urgent', icon: Flame, color: 'text-red-500' },
]

function DraggableTaskCard({
  task,
  index,
  onDelete,
  onClick,
  isDark,
  isActive // visual state for overlay
}: {
  task: Task
  index: number
  onDelete: (taskId: string) => void
  onClick: () => void
  isDark: boolean
  isActive?: boolean
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { task }
  })

  // Prevent click when dragging
  const handleClick = () => {
    if (!isDragging) {
      onClick()
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        // Make sure transform is handled by dnd-kit context
      }}
      className={cn(
        "relative group",
        isActive && "cursor-grabbing",
        !isActive && "cursor-pointer"
      )}
    >
      <div
        {...listeners}
        {...attributes}
        className={cn(
          "absolute left-0 top-0 bottom-0 w-8 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing",
          isDark ? "text-zinc-600" : "text-gray-400"
        )}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>
      <div className="pl-2" onClick={handleClick}>
        <TaskCard
          task={task}
          index={index}
          onStatusChange={() => {}} // Disabled in card view, handled by DnD
          onDelete={onDelete}
          isDark={isDark}
          isDragging={isActive} // Purely visual
        />
      </div>
    </div>
  )
}

function DroppableColumn({
  column,
  tasks,
  isDark,
  onDelete,
  onTaskClick,
}: {
  column: typeof COLUMNS[number]
  tasks: Task[]
  isDark: boolean
  onDelete: (taskId: string) => void
  onTaskClick: (task: Task) => void
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const Icon = column.icon

  return (
    <div className="flex flex-col min-w-[280px] h-full max-h-full">
      {/* Column Header */}
      <div className={cn(
        "flex items-center justify-between px-3 py-2.5 rounded-t-lg border-b shrink-0",
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
        ref={setNodeRef}
        className={cn(
          "flex-1 rounded-b-lg transition-colors h-full overflow-hidden flex flex-col", // flex col for ScrollArea to fill
          isDark ? "bg-zinc-900/30" : "bg-gray-50/50",
          isOver && (isDark
            ? "bg-blue-500/5 ring-1 ring-inset ring-blue-500/30"
            : "bg-blue-50/50 ring-1 ring-inset ring-blue-500/30")
        )}
      >
        <ScrollArea className="flex-1 h-full">
          <div className="p-3 space-y-2 pb-4">
            {tasks.map((task, index) => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                index={index}
                onDelete={onDelete}
                onClick={() => onTaskClick(task)}
                isDark={isDark}
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
        </ScrollArea>
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

  // DnD State
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // Require 10px drag before activation to prevent accidental drags on click
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  )

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
    // Optimistic update
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
        fetchTasks() // Revert on error
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

  // DnD Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    const task = tasks.find(t => t.id === active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    // Reset drag state
    setActiveId(null)
    setActiveTask(null)

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as Task['status']

    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    if (task.status !== newStatus) {
       handleStatusChange(taskId, newStatus)
    }
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
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
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
        <div className="flex-1 overflow-x-auto overflow-y-hidden">
          <div className="p-6 h-full min-w-max">
            {tasks.length === 0 && !isLoading ? (
              <div
                className={cn(
                  "flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-16 w-full h-full",
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
                {COLUMNS.map((column) => (
                  <DroppableColumn
                    key={column.id}
                    column={column}
                    tasks={getTasksByStatus(column.id as Task['status'])}
                    isDark={isDark}
                    onDelete={handleDeleteTask}
                    onTaskClick={handleTaskClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Overlay for Dragged Item */}
        <DragOverlay>
          {activeTask ? (
             <div className="opacity-90 scale-105 rotate-2 cursor-grabbing">
                <TaskCard
                  task={activeTask}
                  index={0}
                  onStatusChange={() => {}}
                  onDelete={() => {}}
                  isDark={isDark}
                  isDragging={true}
                />
             </div>
          ) : null}
        </DragOverlay>

        {/* Task Detail Dialog */}
        <TaskDetailDialog
          task={selectedTask}
          open={taskDetailOpen}
          onOpenChange={setTaskDetailOpen}
          onTaskUpdated={fetchTasks}
          projectId={projectId}
        />
      </div>
    </DndContext>
  )
}
