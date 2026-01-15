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
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  Calendar,
  MoreHorizontal,
  Tag,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { getPriorityColor } from '@/lib/design-system'

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

interface TaskCardProps {
  task: Task
  index: number
  onStatusChange: (taskId: string, status: Task['status']) => void
  onDelete: (taskId: string) => void
  isDark: boolean
}

export function TaskCard({ task, index, onStatusChange, onDelete, isDark }: TaskCardProps) {
  const priorityColor = getPriorityColor(task.priority)

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "group relative rounded-xl border p-4 transition-all cursor-pointer",
        isDark
          ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:shadow-lg"
          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg"
      )}
    >
      {/* Priority Indicator */}
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full rounded-l-xl",
        task.priority === 'URGENT' && "bg-red-500",
        task.priority === 'HIGH' && "bg-orange-500",
        task.priority === 'MEDIUM' && "bg-blue-500",
        task.priority === 'LOW' && "bg-slate-400"
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
              isDark ? "text-neutral-500" : "text-slate-500"
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
          <DropdownMenuContent align="end" className={isDark ? "bg-neutral-900 border-neutral-800" : ""}>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'TODO')}>
                  <Clock className="h-4 w-4 mr-2" /> To Do
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'IN_PROGRESS')}>
                  <AlertCircle className="h-4 w-4 mr-2" /> In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'DONE')}>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Done
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'BLOCKED')}>
                  <XCircle className="h-4 w-4 mr-2" /> Blocked
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => onDelete(task.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3 ml-2">
          {task.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className={cn(
                "text-xs px-2 py-0.5",
                isDark ? "bg-neutral-800 text-neutral-300" : "bg-slate-100 text-slate-600"
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
                isDark ? "bg-neutral-800 text-neutral-400" : "bg-slate-100 text-slate-500"
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
              "text-xs px-2 py-0.5",
              priorityColor.bg,
              priorityColor.text,
              priorityColor.border,
              "border"
            )}
          >
            {task.priority}
          </Badge>

          {/* Due Date */}
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue
                ? "text-red-500"
                : isDark ? "text-neutral-500" : "text-slate-500"
            )}>
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
            </div>
          )}
        </div>

        {/* Assignee */}
        {task.assignee && (
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignee.image || undefined} />
            <AvatarFallback className="text-xs">
              {task.assignee.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </motion.div>
  )
}
