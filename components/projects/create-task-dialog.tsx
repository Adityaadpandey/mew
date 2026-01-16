'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { buttonGradients } from '@/lib/design-system'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import {
  CalendarIcon,
  Check,
  Loader2,
  Plus,
  ListTodo,
  Tag,
  User,
  X,
  AlertCircle,
  Clock,
  Zap,
  Flame
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface Member {
  id: string
  user: {
    id: string
    name: string | null
    image: string | null
    email: string | null
  }
}

interface CreateTaskDialogProps {
  projectId: string
  onTaskCreated: () => void
  defaultStatus?: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'
}

const PRIORITY_CONFIG = {
  LOW: { label: 'Low', icon: Clock, color: 'text-zinc-500', bg: 'bg-zinc-500/10' },
  MEDIUM: { label: 'Medium', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  HIGH: { label: 'High', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  URGENT: { label: 'Urgent', icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10' },
}

export function CreateTaskDialog({ projectId, onTaskCreated, defaultStatus = 'TODO' }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM')
  const [status, setStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED'>(defaultStatus)
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [assigneeId, setAssigneeId] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [members, setMembers] = useState<Member[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isLoadingMembers, setIsLoadingMembers] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    if (open) {
      fetchMembers()
    }
  }, [open, projectId])

  const fetchMembers = async () => {
    setIsLoadingMembers(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/members`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members || [])
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
    } finally {
      setIsLoadingMembers(false)
    }
  }

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleCreate = async () => {
    if (!title.trim()) return

    setIsCreating(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          status,
          projectId,
          assigneeId,
          dueDate: dueDate?.toISOString() || null,
          tags,
        }),
      })

      if (res.ok) {
        toast.success('Task created successfully!')
        resetForm()
        setOpen(false)
        onTaskCreated()
      } else {
        toast.error('Failed to create task')
      }
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task')
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setPriority('MEDIUM')
    setStatus(defaultStatus)
    setDueDate(undefined)
    setAssigneeId(null)
    setTags([])
    setTagInput('')
  }

  const selectedAssignee = members.find(m => m.user.id === assigneeId)
  const PriorityIcon = PRIORITY_CONFIG[priority].icon

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={cn("gap-2", buttonGradients.primary)}>
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className={cn(
        "sm:max-w-[600px]",
        isDark ? "bg-zinc-950 border-zinc-800" : ""
      )}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#C10801] to-[#F16001]">
              <ListTodo className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className={isDark ? "text-white" : ""}>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your project with details
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className={isDark ? "text-zinc-300" : ""}>
              Task Title <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Design homepage mockup"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
              autoFocus
              className={cn(
                "h-11",
                isDark ? "bg-zinc-900 border-zinc-800 focus:border-orange-500" : ""
              )}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className={isDark ? "text-zinc-300" : ""}>
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Add more details about this task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={cn(
                "resize-none",
                isDark ? "bg-zinc-900 border-zinc-800 focus:border-orange-500" : ""
              )}
            />
          </div>

          {/* Priority and Status Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={isDark ? "text-zinc-300" : ""}>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
                <SelectTrigger className={cn(
                  "h-11",
                  isDark ? "bg-zinc-900 border-zinc-800" : ""
                )}>
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

            <div className="space-y-2">
              <Label className={isDark ? "text-zinc-300" : ""}>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                <SelectTrigger className={cn(
                  "h-11",
                  isDark ? "bg-zinc-900 border-zinc-800" : ""
                )}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDark ? "bg-zinc-900 border-zinc-800" : ""}>
                  <SelectItem value="TODO">To Do</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="DONE">Done</SelectItem>
                  <SelectItem value="BLOCKED">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date and Assignee Row */}
          <div className="grid grid-cols-2 gap-4">
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
                    {dueDate ? format(dueDate, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className={cn("w-auto p-0", isDark ? "bg-zinc-900 border-zinc-800" : "")}>
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className={isDark ? "text-zinc-300" : ""}>Assignee</Label>
              <Select
                value={assigneeId || 'unassigned'}
                onValueChange={(v) => setAssigneeId(v === 'unassigned' ? null : v)}
              >
                <SelectTrigger className={cn(
                  "h-11",
                  isDark ? "bg-zinc-900 border-zinc-800" : ""
                )}>
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
                  className={cn(
                    "pl-10 h-11",
                    isDark ? "bg-zinc-900 border-zinc-800" : ""
                  )}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn("h-11 w-11", isDark ? "border-zinc-800 hover:bg-zinc-800" : "")}
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
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
                      type="button"
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
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => {
              resetForm()
              setOpen(false)
            }}
            disabled={isCreating}
            className={isDark ? "hover:bg-zinc-800" : ""}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim() || isCreating}
            className={buttonGradients.primary}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
