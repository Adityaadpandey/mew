'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Calendar, MoreHorizontal } from 'lucide-react'

export interface Task {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  assignees: string[]
  tags: string[]
  comments?: number
  attachments?: number
  completed?: boolean
}

interface KanbanCardProps {
  task: Task
  index: number
  onStatusChange?: (id: string, newStatus: string) => void
}

export function KanbanCard({ task, index, onStatusChange }: KanbanCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'medium': return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20'
    }
  }

  const handleStatusChange = (value: string) => {
    if (onStatusChange) {
      onStatusChange(task.id, value)
    }
  }

  return (
    <motion.div
      layout
      layoutId={task.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02, zIndex: 10 }}
      className="group relative bg-white dark:bg-zinc-900 border border-border/40 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-default mb-3"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-2 flex-wrap">
          {task.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 h-5 bg-secondary/50 hover:bg-secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity outline-none">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit Task</DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Move to...</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup value={task.completed ? 'DONE' : 'TODO'} onValueChange={handleStatusChange}>
                  <DropdownMenuRadioItem value="TODO">To Do</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="IN_PROGRESS">In Progress</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="DONE">Done</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h4 className={cn("font-medium text-sm mb-3", task.completed && "line-through text-muted-foreground")}>
        {task.title}
      </h4>

      <div className="flex items-center justify-between mt-auto pt-2">
         <div className="flex -space-x-2">
           {task.assignees.map((assignee, i) => (
             <Avatar key={i} className="h-6 w-6 border-2 border-background">
               <AvatarImage src={`https://i.pravatar.cc/150?u=${assignee}`} />
               <AvatarFallback className="text-[9px]">{assignee.substring(0,2)}</AvatarFallback>
             </Avatar>
           ))}
         </div>

         <div className="flex items-center gap-3 text-muted-foreground">
            {task.dueDate && (
              <div className={cn(
                "flex items-center gap-1 text-xs px-1.5 py-0.5 rounded",
                getPriorityColor(task.priority)
              )}>
                 <Calendar className="h-3 w-3" />
                 {task.dueDate}
              </div>
            )}
         </div>
      </div>
    </motion.div>
  )
}
