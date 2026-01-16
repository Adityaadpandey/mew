'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { buttonGradients } from '@/lib/design-system'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  CalendarIcon,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  ListTodo,
  Loader2,
  Plus,
  Save,
  Tag,
  Trash2,
  User,
  X,
  Zap,
  GripVertical,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Subtask {
  id: string
  title: string
  completed: boolean
  position: number
}

interface Member {
  id: string
  user: {
    id: string
    name: string | null
    image: string | null
    email: string | null
  }
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
  createdAt: string
  updatedAt: string
  project?: {
    id: string
    name: string
    members?: Member[]
  }
}

interface TaskDetailDialogProps {
  task: Task | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskUpdated: () => void
  projectId: string
}

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', icon: Clock, color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
  MEDIUM: { label: 'Medium', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  HIGH: { label: 'High', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  URGENT: { label: 'Urgent', icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10' },
}

const STATUS_CONFIG = {
  TODO: { label: 'To Do', color: 'text-zinc-400', bg: 'bg-zinc-500/10' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  DONE: { label: 'Done', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  BLOCKED: { label: 'Blocked', color: 'text-rose-500', bg: 'bg-rose-500/10' },
}

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onTaskUpdated,
  projectId,
}: TaskDetailDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('MEDIUM')
  const [status, setStatus] = useState<Task['status']>('TODO')
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [newSubtask, setNewSubtask] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    if (task && open) {
      setTitle(task.title)
      setDescription(task.description || '')
      setPriority(task.priority)
      setStatus(task.status)
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
      setAssigneeId(task.assigneeId)
      setTags(task.tags || [])
      setSubtasks(task.subtasks || [])
      setHasChanges(false)
      fetchMembers()
    }
  }, [task, open])

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
    }
  }

  const handleFieldChange = () => {
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!task) return

    setIsSaving(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description: description || null,
          priority,
          status,
          assigneeId,
          dueDate: dueDate?.toISOString() || null,
          tags,
        }),
      })

      if (res.ok) {
        toast.success('Task updated successfully!')
        setHasChanges(false)
        onTaskUpdated()
      } else {
        toast.error('Failed to update task')
      }
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to update task')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddSubtask = async () => {
    if (!newSubtask.trim() || !task) return

    try {
      const res = await fetch('/api/subtasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newSubtask.trim(),
          taskId: task.id,
        }),
      })

      if (res.ok) {
        const subtask = await res.json()
        setSubtasks([...subtasks, subtask])
        setNewSubtask('')
        onTaskUpdated()
      }
    } catch (error) {
      console.error('Failed to add subtask:', error)
      toast.error('Failed to add subtask')
    }
  }

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    try {
      const res = await fetch('/api/subtasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: subtaskId,
          completed,
        }),
      })

      if (res.ok) {
        setSubtasks(subtasks.map(s =>
          s.id === subtaskId ? { ...s, completed } : s
        ))
        onTaskUpdated()
      }
    } catch (error) {
      console.error('Failed to update subtask:', error)
    }
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      const res = await fetch(`/api/subtasks?id=${subtaskId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setSubtasks(subtasks.filter(s => s.id !== subtaskId))
        onTaskUpdated()
      }
    } catch (error) {
      console.error('Failed to delete subtask:', error)
    }
  }

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setTagInput('')
      handleFieldChange()
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
    handleFieldChange()
  }

  const completedSubtasks = subtasks.filter(s => s.completed).length
  const subtaskProgress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0
  const selectedAssignee = members.find(m => m.user.id === assigneeId)
  const PriorityIcon = PRIORITY_CONFIG[priority].icon

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col",
        isDark ? "bg-zinc-950 border-zinc-800" : ""
      )}>
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br",
                status === 'DONE' ? "from-emerald-500 to-teal-500" : "from-[#C10801] to-[#F16001]"
              )}>
                {status === 'DONE' ? (
                  <CheckCircle2 className="h-5 w-5 text-white" />
                ) : (
                  <ListTodo className="h-5 w-5 text-white" />
                )}
              </div>
              <div>
                <DialogTitle className={cn("text-lg", isDark ? "text-white" : "")}>
                  Task Details
                </DialogTitle>
                <p className={cn("text-xs mt-0.5", isDark ? "text-zinc-500" : "text-slate-500")}>
                  Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            {hasChanges && (
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className={buttonGradients.primary}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Title */}
          <div className="space-y-2">
            <Label className={isDark ? "text-zinc-300" : ""}>Title</Label>
            <Input
              value={title}
              onChange={(e) => { setTitle(e.target.value); handleFieldChange() }}
              className={cn(
                "text-lg font-medium h-12",
                isDark ? "bg-zinc-900 border-zinc-800" : ""
              )}
            />
          </div>

          {/* Status and Priority Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={isDark ? "text-zinc-300" : ""}>Status</Label>
              <Select
                value={status}
                onValueChange={(v) => { setStatus(v as Task['status']); handleFieldChange() }}
              >
                <SelectTrigger className={cn("h-11", isDark ? "bg-zinc-900 border-zinc-800" : "")}>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", STATUS_CONFIG[status].bg.replace('/10', ''))} />
                      {STATUS_CONFIG[status].label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className={isDark ? "bg-zinc-900 border-zinc-800" : ""}>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", config.bg.replace('/10', ''))} />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={isDark ? "text-zinc-300" : ""}>Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => { setPriority(v as Task['priority']); handleFieldChange() }}
              >
                <SelectTrigger className={cn("h-11", isDark ? "bg-zinc-900 border-zinc-800" : "")}>
                  <SelectValue>
                    <div className="flex items-center gap-2">
                      <PriorityIcon className={cn("h-4 w-4", PRIORITY_CONFIG[priority].color)} />
                      {PRIORITY_CONFIG[priority].label}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className={isDark ? "bg-zinc-900 border-zinc-800" : ""}>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => {
                    const Icon = config.icon
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className={cn("h-4 w-4", config.color)} />
                          {config.label}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee and Due Date Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={isDark ? "text-zinc-300" : ""}>Assignee</Label>
              <Select
                value={assigneeId || 'unassigned'}
                onValueChange={(v) => { setAssigneeId(v === 'unassigned' ? null : v); handleFieldChange() }}
              >
                <SelectTrigger className={cn("h-11", isDark ? "bg-zinc-900 border-zinc-800" : "")}>
                  <SelectValue placeholder="Unassigned">
                    {selectedAssignee ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={selectedAssignee.user.image || undefined} />
                          <AvatarFallback className="text-xs">
                            {selectedAssignee.user.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{selectedAssignee.user.name || selectedAssignee.user.email}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        Unassigned
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className={isDark ? "bg-zinc-900 border-zinc-800" : ""}>
                  <SelectItem value="unassigned">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Unassigned
                    </div>
                  </SelectItem>
                  {members
                    .filter(m => m.user?.id && m.user.id.trim().length > 0)
                    .map((member) => (
                    <SelectItem key={member.user.id} value={member.user.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={member.user.image || undefined} />
                          <AvatarFallback className="text-xs">
                            {member.user.name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.user.name || member.user.email}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className={isDark ? "text-zinc-300" : ""}>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-11 justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground",
                      isDark ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800" : ""
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, 'PPP') : 'No due date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className={cn("w-auto p-0", isDark ? "bg-zinc-900 border-zinc-800" : "")}>
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => { setDueDate(date); handleFieldChange() }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className={isDark ? "text-zinc-300" : ""}>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => { setDescription(e.target.value); handleFieldChange() }}
              placeholder="Add a description..."
              rows={4}
              className={cn(
                "resize-none",
                isDark ? "bg-zinc-900 border-zinc-800" : ""
              )}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className={isDark ? "text-zinc-300" : ""}>Tags</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className={cn(
                  "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                  isDark ? "text-zinc-500" : "text-slate-400"
                )} />
                <Input
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className={cn("pl-10 h-10", isDark ? "bg-zinc-900 border-zinc-800" : "")}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className={cn("h-10 w-10", isDark ? "border-zinc-800 hover:bg-zinc-800" : "")}
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className={cn(
                      "px-2.5 py-1 gap-1.5",
                      isDark
                        ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                        : "bg-orange-100 text-orange-700 border border-orange-200"
                    )}
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <Separator className={isDark ? "bg-zinc-800" : ""} />

          {/* Subtasks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className={cn("text-base", isDark ? "text-zinc-300" : "")}>
                  Subtasks
                </Label>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs",
                    isDark ? "bg-zinc-800 text-zinc-400" : ""
                  )}
                >
                  {completedSubtasks}/{subtasks.length}
                </Badge>
              </div>
              {subtasks.length > 0 && (
                <span className={cn("text-xs", isDark ? "text-zinc-500" : "text-slate-500")}>
                  {Math.round(subtaskProgress)}% complete
                </span>
              )}
            </div>

            {subtasks.length > 0 && (
              <Progress
                value={subtaskProgress}
                className={cn("h-2", isDark ? "bg-zinc-800" : "")}
              />
            )}

            {/* Subtask list */}
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg group",
                    isDark ? "bg-zinc-900/50 hover:bg-zinc-900" : "bg-slate-50 hover:bg-slate-100"
                  )}
                >
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={(checked) => handleToggleSubtask(subtask.id, !!checked)}
                    className={cn(
                      "h-5 w-5",
                      subtask.completed && "bg-emerald-500 border-emerald-500"
                    )}
                  />
                  <span className={cn(
                    "flex-1 text-sm",
                    subtask.completed && "line-through opacity-60",
                    isDark ? "text-zinc-300" : "text-slate-700"
                  )}>
                    {subtask.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    onClick={() => handleDeleteSubtask(subtask.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Add subtask */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a subtask..."
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSubtask()
                  }
                }}
                className={cn("h-10", isDark ? "bg-zinc-900 border-zinc-800" : "")}
              />
              <Button
                variant="outline"
                onClick={handleAddSubtask}
                disabled={!newSubtask.trim()}
                className={cn("h-10 gap-2", isDark ? "border-zinc-800 hover:bg-zinc-800" : "")}
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
