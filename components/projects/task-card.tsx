'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import {
  Calendar,
  MoreHorizontal,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  ListChecks,
  Flame,
  Zap,
  Bell,
  BellPlus,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

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
  subtasks?: Subtask[]
  position: number
  createdAt: string
  updatedAt: string
}

interface TaskCardProps {
  task: Task
  index: number
  onStatusChange: (taskId: string, status: Task['status']) => void
  onDelete: (taskId: string) => void
  isDark: boolean
  isDragging?: boolean
}

const PRIORITY_CONFIG = {
  LOW: { icon: Clock, color: 'bg-zinc-400' },
  MEDIUM: { icon: AlertCircle, color: 'bg-amber-500' },
  HIGH: { icon: Zap, color: 'bg-orange-500' },
  URGENT: { icon: Flame, color: 'bg-red-500' },
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

export function TaskCard({ task, index, onStatusChange, onDelete, isDark, isDragging }: TaskCardProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0
  const totalSubtasks = task.subtasks?.length || 0
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0

  return (
    <div
      className={cn(
        "group relative rounded-xl border p-4 transition-all",
        isDark
          ? "bg-zinc-900 border-zinc-800 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5"
          : "bg-white border-slate-200 hover:border-orange-500/50 hover:shadow-lg",
        isDragging && "opacity-50 scale-[0.98] ring-2 ring-orange-500"
      )}
    >
      {/* Priority Indicator */}
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full rounded-l-xl",
        PRIORITY_CONFIG[task.priority].color
      )} />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3 ml-2">
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-semibold text-sm line-clamp-2 mb-1",
            isDark ? "text-white" : "text-slate-900"
          )}>
            {task.title}
          </h4>
          {task.description && (
            <p className={cn(
              "text-xs line-clamp-2",
              isDark ? "text-zinc-500" : "text-slate-500"
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
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={isDark ? "bg-zinc-900 border-zinc-800" : ""}>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className={isDark ? "bg-zinc-900 border-zinc-800" : ""}>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'TODO') }}>
                  <Clock className="h-4 w-4 mr-2 text-zinc-400" /> To Do
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'IN_PROGRESS') }}>
                <AlertCircle className="h-4 w-4 mr-2 text-orange-500" /> In Progress
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
              className="text-rose-500 focus:text-rose-500"
              onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Subtasks Progress */}
      {totalSubtasks > 0 && (
        <div className="ml-2 mb-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <ListChecks className={cn("h-3.5 w-3.5", isDark ? "text-zinc-500" : "text-slate-400")} />
            <span className={cn("text-xs", isDark ? "text-zinc-400" : "text-slate-500")}>
              {completedSubtasks}/{totalSubtasks} subtasks
            </span>
          </div>
          <Progress
            value={subtaskProgress}
            className={cn("h-1.5", isDark ? "bg-zinc-800" : "bg-slate-100")}
          />
        </div>
      )}

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3 ml-2">
          {task.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className={cn(
                "text-xs px-2 py-0.5",
                isDark
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  : "bg-orange-100 text-orange-700 border border-orange-200"
              )}
            >
              {tag}
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <Badge
              variant="secondary"
              className={cn(
                "text-xs px-2 py-0.5",
                isDark ? "bg-zinc-800 text-zinc-400" : "bg-slate-100 text-slate-500"
              )}
            >
              +{task.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 ml-2">
        <div className="flex items-center gap-2">
          {/* Priority Badge */}
          <Badge
            variant="secondary"
            className={cn(
              "text-xs px-2 py-0.5 gap-1",
              task.priority === 'LOW' && (isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-600"),
              task.priority === 'MEDIUM' && (isDark ? "bg-amber-500/10 text-amber-400" : "bg-amber-100 text-amber-700"),
              task.priority === 'HIGH' && (isDark ? "bg-orange-500/10 text-orange-400" : "bg-orange-100 text-orange-700"),
              task.priority === 'URGENT' && (isDark ? "bg-red-500/10 text-red-400" : "bg-red-100 text-red-700"),
            )}
          >
            {task.priority}
          </Badge>

          {/* Due Date */}
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue
                ? "text-rose-500"
                : isDark ? "text-zinc-500" : "text-slate-500"
            )}>
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
            </div>
          )}
        </div>

        {/* Assignee */}
        {task.assignee && (
          <Avatar className="h-6 w-6 ring-2 ring-offset-1 ring-orange-500/20">
            <AvatarImage src={task.assignee.image || undefined} />
            <AvatarFallback className={cn(
              "text-xs",
              isDark ? "bg-zinc-800 text-zinc-400" : "bg-orange-100 text-orange-700"
            )}>
              {task.assignee.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  )
}
