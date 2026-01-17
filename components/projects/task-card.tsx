'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  Bell,
  BellPlus,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  MoreHorizontal,
  XCircle,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'

interface Subtask {
  id: string
  title: string
  completed: boolean
  position: number
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  projectId: string
  assigneeId: string | null
  assignee: { id: string; name: string | null; image: string | null; email: string } | null
  dueDate: string | null
  tags: string[]
  subtasks?: Subtask[]
  recurrence?: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  recurrenceInterval?: number
  position: number
  createdAt: string
  updatedAt: string
}

interface TaskCardProps {
  task: Task
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onDelete: (taskId: string) => void
  isDark: boolean
  isDragging?: boolean
  className?: string
}

const PRIORITY_CONFIG = {
  LOW: {
    icon: Clock,
    color: 'bg-zinc-100 text-zinc-600',
    darkColor: 'bg-zinc-500/10 text-zinc-400',
    border: 'border-zinc-200',
    darkBorder: 'border-zinc-800'
  },
  MEDIUM: {
    icon: AlertCircle,
    color: 'bg-blue-50 text-blue-600',
    darkColor: 'bg-blue-500/10 text-blue-400',
    border: 'border-blue-100',
    darkBorder: 'border-blue-500/20'
  },
  HIGH: {
    icon: Zap,
    color: 'bg-orange-50 text-orange-600',
    darkColor: 'bg-orange-500/10 text-orange-400',
    border: 'border-orange-100',
    darkBorder: 'border-orange-500/20'
  },
  URGENT: {
    icon: Flame,
    color: 'bg-rose-50 text-rose-600',
    darkColor: 'bg-rose-500/10 text-rose-400',
    border: 'border-rose-100',
    darkBorder: 'border-rose-500/20'
  },
}

async function setReminder(taskId: string, minutes: number) {
  const remindAt = new Date(Date.now() + minutes * 60 * 1000)

  try {
    const res = await fetch(`/api/tasks/${taskId}/reminders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remindAt: remindAt.toISOString() }),
    })

    if (res.ok) {
      toast.success(`Reminder set for ${formatReminderTime(minutes)}`)
    } else {
      toast.error('Failed to set reminder')
    }
  } catch {
    toast.error('Failed to set reminder')
  }
}

function formatReminderTime(minutes: number): string {
  if (minutes < 60) return `${minutes} minutes`
  if (minutes === 60) return '1 hour'
  if (minutes < 1440) return `${minutes / 60} hours`
  if (minutes === 1440) return '1 day'
  return `${minutes / 1440} days`
}

export function TaskCard({ task, onStatusChange, onDelete, isDark, isDragging, className }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  const priorityConfig = PRIORITY_CONFIG[task.priority]

  return (
    <div
      className={cn(
        "group relative rounded-xl border p-4 transition-all duration-300",
        // Light mode
        "bg-gradient-to-br from-white to-slate-50 border-slate-200/60 shadow-sm",
        "hover:shadow-md hover:border-orange-200/50",
        // Dark mode
        isDark && [
          "bg-gradient-to-br from-zinc-900 to-zinc-900/50",
          "border-white/5",
          "hover:border-orange-500/30 hover:shadow-[0_4px_20px_-12px_rgba(249,115,22,0.3)] hover:bg-zinc-800/80"
        ],
        // Dragging state
        isDragging && "opacity-50 scale-[0.98] ring-2 ring-orange-500 rotate-2 cursor-grabbing shadow-xl",
        className
      )}
    >
      {/* Priority Indicator Stripe */}
      <div className={cn(
        "absolute top-3 bottom-3 left-0 w-[3px] rounded-r-full transition-colors",
        isDark ? priorityConfig.darkColor.split(' ')[0] : priorityConfig.color.split(' ')[0].replace('bg-', 'bg-')
      )} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3 pl-2">
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-medium text-sm line-clamp-2 mb-1.5 leading-snug tracking-tight",
            task.status === 'DONE' && "line-through opacity-60 decoration-slate-400",
            isDark ? "text-zinc-100" : "text-slate-700"
          )}>
            {task.title}
          </h4>
          {task.description && (
            <p className={cn(
              "text-[11px] line-clamp-2 leading-relaxed font-medium",
              isDark ? "text-zinc-500" : "text-slate-400"
            )}>
              {task.description}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 -mr-2 opacity-0 group-hover:opacity-100 transition-all duration-200",
                isDark ? "hover:bg-white/5 text-zinc-400 hover:text-white" : "hover:bg-slate-100 text-slate-400"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={isDark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : ""}>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className={isDark ? "bg-zinc-900 border-zinc-800" : ""}>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'TODO') }}>
                  <Clock className="h-4 w-4 mr-2 text-zinc-400" /> To Do
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'IN_PROGRESS') }}>
                <AlertCircle className="h-4 w-4 mr-2 text-blue-500" /> In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'DONE') }}>
                  <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" /> Done
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'BLOCKED') }}>
                  <XCircle className="h-4 w-4 mr-2 text-rose-500" /> Blocked
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <BellPlus className="h-4 w-4 mr-2" /> Set Reminder
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className={isDark ? "bg-zinc-900 border-zinc-800" : ""}>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setReminder(task.id, 15) }}>
                  <Bell className="h-4 w-4 mr-2 text-orange-500" /> In 15 minutes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setReminder(task.id, 30) }}>
                  <Bell className="h-4 w-4 mr-2 text-orange-500" /> In 30 minutes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setReminder(task.id, 60) }}>
                  <Bell className="h-4 w-4 mr-2 text-orange-500" /> In 1 hour
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setReminder(task.id, 180) }}>
                  <Bell className="h-4 w-4 mr-2 text-orange-500" /> In 3 hours
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setReminder(task.id, 1440) }}>
                  <Bell className="h-4 w-4 mr-2 text-orange-500" /> Tomorrow
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator className={isDark ? "bg-zinc-800" : ""} />
            <DropdownMenuItem
              className="text-rose-500 focus:text-rose-500 focus:bg-rose-500/10"
              onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="ml-2 mb-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-semibold">
            <span className={cn(isDark ? "text-zinc-500" : "text-slate-400")}>Subtasks</span>
            <span className={cn(isDark ? "text-zinc-400" : "text-slate-500")}>
              {completedSubtasks}/{totalSubtasks}
            </span>
          </div>
          <Progress
            value={subtaskProgress}
            className={cn("h-1", isDark ? "bg-zinc-800" : "bg-slate-100")}
            indicatorClassName={cn(
              subtaskProgress === 100 ? "bg-emerald-500" : "bg-orange-500"
            )}
          />
        </div>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3.5 ml-2">
          {task.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className={cn(
                "text-[10px] px-2 py-0 h-5 font-normal border shadow-none",
                isDark
                  ? "bg-zinc-800/50 text-zinc-400 border-zinc-700/50"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              )}
            >
              {tag}
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <Badge
              variant="secondary"
              className={cn(
                "text-[10px] px-1.5 py-0 h-5 font-normal border shadow-none",
                isDark ? "bg-zinc-800/30 text-zinc-500 border-zinc-800" : "bg-slate-50 text-slate-400 border-slate-100"
              )}
            >
              +{task.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 ml-2 pt-2 border-t border-dashed border-gray-100 dark:border-white/5">
        <div className="flex items-center gap-2">
          {/* Priority Badge */}
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md border",
            isDark
              ? cn(priorityConfig.darkColor, priorityConfig.darkBorder)
              : cn(priorityConfig.color, priorityConfig.border)
          )}>
            <priorityConfig.icon className="h-3 w-3" />
            {task.priority}
          </div>

          {/* Due Date */}
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-1 text-[10px] font-medium transition-colors",
              isOverdue
                ? "text-rose-500"
                : isDark ? "text-zinc-500 group-hover:text-zinc-400" : "text-slate-400 group-hover:text-slate-500"
            )}>
              <Calendar className="h-3 w-3" />
              <span>
                {isOverdue ? "Overdue" : formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
              </span>
            </div>
          )}
        </div>

        {/* Assignee */}
        {task.assignee && (
          <Avatar className="h-5 w-5 ring-2 ring-white dark:ring-zinc-900 grayscale group-hover:grayscale-0 transition-all">
            <AvatarImage src={task.assignee.image || undefined} />
            <AvatarFallback className={cn(
              "text-[9px] font-bold",
              isDark ? "bg-zinc-800 text-zinc-400" : "bg-slate-100 text-slate-500"
            )}>
              {task.assignee.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}
