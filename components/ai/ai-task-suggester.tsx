'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UpgradePrompt } from '@/components/subscription/upgrade-prompt'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import {
  CheckCircle2,
  ListTodo,
  Loader2,
  Plus,
  Send,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface AITaskSuggesterProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  projectName: string
  existingTasks?: { title: string; status: string }[]
  onTaskCreated?: () => void
}

interface SuggestedTask {
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  suggestions?: SuggestedTask[]
}

interface UpgradeState {
  show: boolean
  current?: number
  limit?: number
  message?: string
}

const quickPrompts = [
  { icon: Target, label: 'Break down goal', prompt: 'Help me break down a project goal into actionable tasks' },
  { icon: Zap, label: 'Sprint planning', prompt: 'Suggest tasks for a 2-week sprint' },
  { icon: ListTodo, label: 'Missing tasks', prompt: 'What tasks might be missing from this project?' },
]

export function AITaskSuggester({
  open,
  onOpenChange,
  projectId,
  projectName,
  existingTasks = [],
  onTaskCreated,
}: AITaskSuggesterProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [creatingTask, setCreatingTask] = useState<string | null>(null)
  const [upgradeState, setUpgradeState] = useState<UpgradeState>({ show: false })
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const handleSendMessage = async (userPrompt?: string) => {
    const messageContent = userPrompt || input.trim()
    if (!messageContent || isGenerating) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: messageContent }])
    setIsGenerating(true)

    try {
      const response = await fetch('/api/ai/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: messageContent,
          projectName,
          existingTasks: existingTasks.map(t => t.title),
          conversationHistory: messages,
        }),
      })

      const data = await response.json()

      // Handle upgrade needed
      if (response.status === 403 && data.needsUpgrade) {
        setUpgradeState({
          show: true,
          current: data.usage?.current,
          limit: data.usage?.limit,
          message: data.message,
        })
        return
      }

      if (!response.ok) throw new Error('Failed to generate')

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.content,
          suggestions: data.suggestions,
        },
      ])
    } catch (error) {
      console.error('AI error:', error)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreateTask = async (task: SuggestedTask) => {
    setCreatingTask(task.title)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: 'TODO',
          projectId,
        }),
      })

      if (response.ok) {
        toast.success(`Task "${task.title}" created!`)
        onTaskCreated?.()
      } else {
        toast.error('Failed to create task')
      }
    } catch (error) {
      toast.error('Failed to create task')
    } finally {
      setCreatingTask(null)
    }
  }

  const priorityColors = {
    LOW: 'bg-zinc-500/10 text-zinc-500',
    MEDIUM: 'bg-amber-500/10 text-amber-500',
    HIGH: 'bg-orange-500/10 text-orange-500',
    URGENT: 'bg-red-500/10 text-red-500',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "sm:max-w-[700px] h-[600px] flex flex-col p-0",
        isDark ? "bg-zinc-950 border-zinc-800" : ""
      )}>
        <DialogHeader className="p-6 pb-4 border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#C10801] to-[#F16001] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className={isDark ? "text-white" : ""}>
                AI Task Suggester
              </DialogTitle>
              <DialogDescription>
                Get intelligent task suggestions for {projectName}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#C10801] to-[#F16001] flex items-center justify-center mb-4">
                <ListTodo className="h-8 w-8 text-white" />
              </div>
              <h3 className={cn("text-lg font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
                Plan smarter with AI
              </h3>
              <p className={cn("text-sm text-center mb-6 max-w-md", isDark ? "text-zinc-400" : "text-slate-600")}>
                Describe your goals and I'll suggest tasks to help you achieve them.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {quickPrompts.map((prompt) => (
                  <Card
                    key={prompt.label}
                    className={cn(
                      "px-4 py-3 cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-2",
                      isDark
                        ? "bg-zinc-900 border-zinc-800 hover:border-orange-500/50"
                        : "hover:border-orange-500/50"
                    )}
                    onClick={() => handleSendMessage(prompt.prompt)}
                  >
                    <prompt.icon className={cn("h-4 w-4", isDark ? "text-orange-400" : "text-orange-600")} />
                    <span className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                      {prompt.label}
                    </span>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={cn("flex gap-3", msg.role === 'user' && "flex-row-reverse")}>
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className={cn(
                        msg.role === 'assistant'
                          ? "bg-gradient-to-br from-[#C10801] to-[#F16001] text-white"
                          : isDark ? "bg-zinc-700" : "bg-slate-200"
                      )}>
                        {msg.role === 'assistant' ? <Sparkles className="h-4 w-4" /> : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "rounded-xl px-4 py-3 max-w-[85%]",
                      msg.role === 'assistant'
                        ? isDark ? "bg-zinc-900 border border-zinc-800" : "bg-slate-50"
                        : "bg-gradient-to-r from-[#C10801] to-[#F16001] text-white"
                    )}>
                      <p className={cn("text-sm mb-3", msg.role === 'user' && "mb-0")}>
                        {msg.content}
                      </p>
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {msg.suggestions.map((task, idx) => (
                            <Card
                              key={idx}
                              className={cn(
                                "p-3",
                                isDark ? "bg-zinc-800/50 border-zinc-700" : "bg-white"
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className={cn("font-medium text-sm", isDark ? "text-white" : "text-slate-900")}>
                                      {task.title}
                                    </h4>
                                    <Badge className={cn("text-xs", priorityColors[task.priority])}>
                                      {task.priority}
                                    </Badge>
                                  </div>
                                  <p className={cn("text-xs", isDark ? "text-zinc-400" : "text-slate-600")}>
                                    {task.description}
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="shrink-0"
                                  onClick={() => handleCreateTask(task)}
                                  disabled={creatingTask === task.title}
                                >
                                  {creatingTask === task.title ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <Plus className="h-3 w-3 mr-1" /> Add
                                    </>
                                  )}
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-[#C10801] to-[#F16001] text-white">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "rounded-xl px-4 py-3",
                      isDark ? "bg-zinc-900 border border-zinc-800" : "bg-slate-50"
                    )}>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className={cn("text-sm", isDark ? "text-zinc-400" : "text-slate-500")}>
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className={cn("p-4 border-t", isDark ? "border-zinc-800" : "border-slate-200")}>
          <div className="flex gap-2">
            <Input
              placeholder="Describe your goals or ask for task suggestions..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              disabled={isGenerating}
              className={cn(
                "flex-1",
                isDark ? "bg-zinc-900 border-zinc-800" : ""
              )}
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isGenerating}
              className="bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00601] hover:to-[#E85002]"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Upgrade Prompt Modal */}
      {upgradeState.show && (
        <UpgradePrompt
          feature="AI Task Suggester"
          description={upgradeState.message || "You've used all your AI credits this month. Upgrade to Pro for more."}
          currentUsage={upgradeState.current}
          limit={upgradeState.limit}
          variant="modal"
          onClose={() => setUpgradeState({ show: false })}
        />
      )}
    </Dialog>
  )
}
