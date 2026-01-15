
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Filter,
  GripVertical,
  MoreHorizontal,
  Pause,
  Plus,
  Search,
  Tag,
  Trash2,
  User,
  X
} from 'lucide-react'
import { useCallback, useEffect, useState, DragEvent } from 'react'

// ============================================================================
// Types
// ============================================================================
interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  assigneeId: string | null
  assignee: { id: string; name: string | null; email: string; image: string | null } | null
  position: number
  dueDate: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

interface Column {
  id: TaskStatus
  title: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}

// ============================================================================
// Constants
// ============================================================================
const COLUMNS: Column[] = [
  {
    id: 'TODO',
    title: 'To Do',
    icon: <Circle className="h-4 w-4" />,
    color: 'text-slate-500',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30'
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    icon: <Clock className="h-4 w-4" />,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  {
    id: 'DONE',
    title: 'Done',
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30'
  },
  {
    id: 'BLOCKED',
    title: 'Blocked',
    icon: <Pause className="h-4 w-4" />,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30'
  }
]

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; icon: React.ReactNode; color: string; bgColor: string }> = {
  LOW: { label: 'Low', icon: <ArrowDown className="h-3 w-3" />, color: 'text-slate-500', bgColor: 'bg-slate-500/10' },
  MEDIUM: { label: 'Medium', icon: <ArrowRight className="h-3 w-3" />, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  HIGH: { label: 'High', icon: <ArrowUp className="h-3 w-3" />, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  URGENT: { label: 'Urgent', icon: <AlertCircle className="h-3 w-3" />, color: 'text-red-500', bgColor: 'bg-red-500/10' }
}

// ============================================================================
// Task Card Component
// ============================================================================
function TaskCard({
  task,
  isDark,
  onUpdate,
  onDelete,
  onDragStart
}: {
  task: Task
  isDark: boolean
  onUpdate: (taskId: string, data: Partial<Task>) => void
  onDelete: (taskId: string) => void
  onDragStart: (e: DragEvent<HTMLDivElement>, task: Task) => void
}) {
  const priority = PRIORITY_CONFIG[task.priority]
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      draggable
      onDragStart={(e) => onDragStart(e as unknown as DragEvent<HTMLDivElement>, task)}
      className={cn(
        "group relative rounded-lg border p-3 cursor-grab active:cursor-grabbing transition-all",
        "hover:shadow-md hover:-translate-y-0.5",
        isDark
          ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
          : "bg-white border-slate-200 hover:border-slate-300"
      )}
    >
      {/* Drag Handle */}
      <div className={cn(
        "absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
        isDark ? "text-neutral-600" : "text-slate-300"
      )}>
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Task Content */}
      <div className="pl-4">
        {/* Header with Title and Menu */}
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            "font-medium text-sm leading-snug",
            task.status === 'DONE' && "line-through opacity-60",
            isDark ? "text-white" : "text-slate-900"
          )}>
            {task.title}
          </h4>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0",
                  isDark ? "hover:bg-neutral-800" : "hover:bg-slate-100"
                )}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={isDark ? "bg-neutral-900 border-neutral-800" : ""}>
              <DropdownMenuItem
                onClick={() => onUpdate(task.id, { status: 'TODO' })}
                disabled={task.status === 'TODO'}
              >
                <Circle className="h-4 w-4 mr-2" /> Move to To Do
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdate(task.id, { status: 'IN_PROGRESS' })}
                disabled={task.status === 'IN_PROGRESS'}
              >
                <Clock className="h-4 w-4 mr-2" /> Move to In Progress
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdate(task.id, { status: 'DONE' })}
                disabled={task.status === 'DONE'}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" /> Mark as Done
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdate(task.id, { status: 'BLOCKED' })}
                disabled={task.status === 'BLOCKED'}
              >
                <Pause className="h-4 w-4 mr-2" /> Mark as Blocked
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(task.id)}
                className="text-red-500 focus:text-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description Preview */}
        {task.description && (
          <p className={cn(
            "text-xs mt-1.5 line-clamp-2",
            isDark ? "text-neutral-500" : "text-slate-500"
          )}>
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {task.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className={cn(
                  "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium",
                  isDark ? "bg-neutral-800 text-neutral-400" : "bg-slate-100 text-slate-600"
                )}
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className={cn(
                "text-[10px]",
                isDark ? "text-neutral-500" : "text-slate-400"
              )}>
                +{task.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer: Priority, Due Date, Assignee */}
        <div className="flex items-center justify-between gap-2 mt-3">
          <div className="flex items-center gap-2">
            {/* Priority Badge */}
            <span className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
              priority.bgColor,
              priority.color
            )}>
              {priority.icon}
              {priority.label}
            </span>

            {/* Due Date */}
            {task.dueDate && (
              <span className={cn(
                "inline-flex items-center gap-1 text-[10px]",
                isOverdue ? "text-red-500" : isDark ? "text-neutral-500" : "text-slate-500"
              )}>
                <CalendarDays className="h-3 w-3" />
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}
          </div>

          {/* Assignee Avatar */}
          {task.assignee && (
            <div
              className={cn(
                "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-medium",
                isDark ? "bg-neutral-800 text-neutral-300" : "bg-slate-100 text-slate-600"
              )}
              title={task.assignee.name || task.assignee.email}
            >
              {task.assignee.image ? (
                <img
                  src={task.assignee.image}
                  alt={task.assignee.name || ''}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                (task.assignee.name || task.assignee.email)[0].toUpperCase()
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================================
// Kanban Column Component
// ============================================================================
function KanbanColumn({
  column,
  tasks,
  isDark,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onDragStart,
  onDrop
}: {
  column: Column
  tasks: Task[]
  isDark: boolean
  onAddTask: (status: TaskStatus) => void
  onUpdateTask: (taskId: string, data: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
  onDragStart: (e: DragEvent<HTMLDivElement>, task: Task) => void
  onDrop: (e: DragEvent<HTMLDivElement>, status: TaskStatus) => void
}) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    onDrop(e, column.id)
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full min-w-[300px] w-[300px] rounded-xl transition-all",
        isDragOver && "ring-2 ring-offset-2",
        isDragOver && (isDark ? "ring-blue-500 ring-offset-black" : "ring-blue-500 ring-offset-slate-50"),
        isDark ? "bg-neutral-950" : "bg-slate-100/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className={cn(
        "flex items-center justify-between p-3 border-b",
        isDark ? "border-neutral-800" : "border-slate-200"
      )}>
        <div className="flex items-center gap-2">
          <span className={cn("p-1 rounded", column.bgColor, column.color)}>
            {column.icon}
          </span>
          <h3 className={cn("font-semibold text-sm", isDark ? "text-white" : "text-slate-900")}>
            {column.title}
          </h3>
          <span className={cn(
            "ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium",
            isDark ? "bg-neutral-800 text-neutral-400" : "bg-slate-200 text-slate-600"
          )}>
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7",
            isDark ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-slate-200 text-slate-500"
          )}
          onClick={() => onAddTask(column.id)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tasks List */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                isDark={isDark}
                onUpdate={onUpdateTask}
                onDelete={onDeleteTask}
                onDragStart={onDragStart}
              />
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className={cn(
              "flex flex-col items-center justify-center py-8 text-center",
              isDark ? "text-neutral-600" : "text-slate-400"
            )}>
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center mb-2",
                column.bgColor
              )}>
                {column.icon}
              </div>
              <p className="text-xs">No tasks</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// ============================================================================
// Create Task Dialog
// ============================================================================
function CreateTaskDialog({
  projectId,
  isDark,
  open,
  onOpenChange,
  onCreate,
  defaultStatus = 'TODO'
}: {
  projectId: string
  isDark: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (task: Partial<Task>) => void
  defaultStatus?: TaskStatus
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [status, setStatus] = useState<TaskStatus>(defaultStatus)
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onCreate({
      title: title.trim(),
      description: description.trim() || null,
      priority,
      status,
      dueDate: dueDate?.toISOString() || null,
      tags,
      projectId
    })

    // Reset form
    setTitle('')
    setDescription('')
    setPriority('MEDIUM')
    setStatus('TODO')
    setDueDate(undefined)
    setTags([])
    onOpenChange(false)
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-[500px]",
        isDark ? "bg-neutral-900 border-neutral-800" : ""
      )}>
        <DialogHeader>
          <DialogTitle className={isDark ? "text-white" : ""}>Create New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div>
            <Input
              placeholder="Task title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className={cn(
                "text-base font-medium",
                isDark ? "bg-neutral-800 border-neutral-700" : ""
              )}
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <Textarea
              placeholder="Add a description..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={cn(
                "min-h-[80px] resize-none",
                isDark ? "bg-neutral-800 border-neutral-700" : ""
              )}
            />
          </div>

          {/* Status and Priority Row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={cn("text-xs font-medium mb-1.5 block", isDark ? "text-neutral-400" : "text-slate-500")}>
                Status
              </label>
              <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                <SelectTrigger className={isDark ? "bg-neutral-800 border-neutral-700" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? "bg-neutral-900 border-neutral-800" : ""}>
                  {COLUMNS.map(col => (
                    <SelectItem key={col.id} value={col.id}>
                      <div className="flex items-center gap-2">
                        <span className={col.color}>{col.icon}</span>
                        {col.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className={cn("text-xs font-medium mb-1.5 block", isDark ? "text-neutral-400" : "text-slate-500")}>
                Priority
              </label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className={isDark ? "bg-neutral-800 border-neutral-700" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? "bg-neutral-900 border-neutral-800" : ""}>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <span className={config.color}>{config.icon}</span>
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className={cn("text-xs font-medium mb-1.5 block", isDark ? "text-neutral-400" : "text-slate-500")}>
              Due Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dueDate && "text-muted-foreground",
                    isDark ? "bg-neutral-800 border-neutral-700 hover:bg-neutral-700" : ""
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className={cn("w-auto p-0", isDark ? "bg-neutral-900 border-neutral-800" : "")} align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tags */}
          <div>
            <label className={cn("text-xs font-medium mb-1.5 block", isDark ? "text-neutral-400" : "text-slate-500")}>
              Tags
            </label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={cn(
                    "cursor-pointer",
                    isDark ? "bg-neutral-800 hover:bg-neutral-700" : ""
                  )}
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
                className={isDark ? "bg-neutral-800 border-neutral-700" : ""}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                className={isDark ? "border-neutral-700 hover:bg-neutral-800" : ""}
              >
                <Tag className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className={isDark ? "border-neutral-700 hover:bg-neutral-800" : ""}
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Create Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Main Task Manager Component
// ============================================================================
export function TaskManager({ projectId }: { projectId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('TODO')
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  // Load tasks
  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`)
      if (res.ok) {
        const data = await res.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Create task
  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })

      if (res.ok) {
        loadTasks()
      }
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  // Update task
  const handleUpdateTask = async (taskId: string, data: Partial<Task>) => {
    try {
      // Optimistic update
      setTasks(prev =>
        prev.map(t => (t.id === taskId ? { ...t, ...data } : t))
      )

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        // Revert on failure
        loadTasks()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
      loadTasks()
    }
  }

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      // Optimistic update
      setTasks(prev => prev.filter(t => t.id !== taskId))

      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        loadTasks()
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
      loadTasks()
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', task.id)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== newStatus) {
      handleUpdateTask(draggedTask.id, { status: newStatus })
    }
    setDraggedTask(null)
  }

  // Open create dialog with specific status
  const handleAddTask = (status: TaskStatus) => {
    setDefaultStatus(status)
    setCreateDialogOpen(true)
  }

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description?.toLowerCase().includes(search.toLowerCase()) ||
      task.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  // Group tasks by status
  const tasksByStatus = COLUMNS.reduce((acc, col) => {
    acc[col.id] = filteredTasks
      .filter(t => t.status === col.id)
      .sort((a, b) => a.position - b.position)
    return acc
  }, {} as Record<TaskStatus, Task[]>)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className={cn(
          "animate-spin h-8 w-8 border-2 border-t-transparent rounded-full",
          isDark ? "border-neutral-600" : "border-slate-300"
        )} />
      </div>
    )
  }

  return (
    <div className={cn("flex h-full flex-col", isDark ? "bg-black" : "bg-slate-50")}>
      {/* Toolbar */}
      <div className={cn(
        "flex items-center justify-between gap-4 border-b px-6 py-3",
        isDark ? "bg-neutral-950 border-neutral-800" : "bg-white border-slate-200"
      )}>
        <div className="flex items-center gap-3">
          <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-900")}>
            Tasks
          </h2>
          <span className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            isDark ? "bg-neutral-800 text-neutral-400" : "bg-slate-100 text-slate-600"
          )}>
            {tasks.length} total
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className={cn(
              "absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4",
              isDark ? "text-neutral-500" : "text-slate-400"
            )} />
            <Input
              placeholder="Search tasks..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={cn(
                "h-8 w-48 pl-8 text-sm",
                isDark ? "bg-neutral-900 border-neutral-800" : ""
              )}
            />
          </div>

          {/* Priority Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-8",
                  priorityFilter !== 'ALL' && "border-blue-500 text-blue-500",
                  isDark ? "border-neutral-800 hover:bg-neutral-900" : ""
                )}
              >
                <Filter className="h-4 w-4 mr-1.5" />
                {priorityFilter === 'ALL' ? 'Priority' : PRIORITY_CONFIG[priorityFilter].label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={isDark ? "bg-neutral-900 border-neutral-800" : ""}>
              <DropdownMenuItem onClick={() => setPriorityFilter('ALL')}>
                All Priorities
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setPriorityFilter(key as TaskPriority)}
                >
                  <span className={cn("mr-2", config.color)}>{config.icon}</span>
                  {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Create Button */}
          <Button
            size="sm"
            className="h-8 bg-blue-600 hover:bg-blue-700"
            onClick={() => handleAddTask('TODO')}
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full">
          {COLUMNS.map(column => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id]}
              isDark={isDark}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        projectId={projectId}
        isDark={isDark}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={handleCreateTask}
        defaultStatus={defaultStatus}
      />
    </div>
  )
}
