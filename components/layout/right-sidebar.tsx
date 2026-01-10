'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCanvasStore, useDocumentStore, useSidebarStore, type CanvasObject } from '@/lib/store'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import {
    Bot,
    Check,
    ChevronDown,
    Code,
    FileText,
    History,
    Layout,
    Lightbulb,
    Loader2,
    MessageSquare,
    RotateCcw,
    Send,
    Sparkles,
    Trash2,
    User,
    Wand2,
    X,
    Zap,
} from 'lucide-react'
import { nanoid } from 'nanoid'
import { useEffect, useRef, useState } from 'react'

interface Comment {
  id: string
  user: { name: string; avatar?: string }
  content: string
  createdAt: string
  resolved: boolean
  replies?: Comment[]
}

const mockComments: Comment[] = [
  {
    id: '1',
    user: { name: 'Alice Chen' },
    content: 'Should we add error handling here?',
    createdAt: '2 hours ago',
    resolved: false,
    replies: [{ id: '1-1', user: { name: 'Bob Smith' }, content: 'Good point!', createdAt: '1 hour ago', resolved: false }],
  },
]

interface VersionItem {
  id: string
  user: { name: string }
  description: string
  createdAt: string
}

const mockVersions: VersionItem[] = [
  { id: 'v1', user: { name: 'You' }, description: 'Added authentication flow', createdAt: '10 minutes ago' },
  { id: 'v2', user: { name: 'Alice Chen' }, description: 'Updated database schema', createdAt: '2 hours ago' },
]

interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function CommentThread({ comment }: { comment: Comment }) {
  const [showReplies, setShowReplies] = useState(true)
  return (
    <div className={cn('rounded-lg border p-3', comment.resolved && 'opacity-60')}>
      <div className="flex items-start gap-2">
        <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{comment.user.name.charAt(0)}</AvatarFallback></Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{comment.user.name}</span>
            <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
          </div>
          <p className="mt-1 text-sm">{comment.content}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6">{comment.resolved ? <RotateCcw className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}</Button>
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 border-l-2 pl-3">
          <button onClick={() => setShowReplies(!showReplies)} className="flex items-center gap-1 text-xs text-muted-foreground">
            <ChevronDown className={cn('h-3 w-3 transition-transform', !showReplies && '-rotate-90')} />
            {comment.replies.length} replies
          </button>
          {showReplies && comment.replies.map((reply) => (
            <div key={reply.id} className="mt-2 flex items-start gap-2">
              <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{reply.user.name.charAt(0)}</AvatarFallback></Avatar>
              <div><span className="text-xs font-medium">{reply.user.name}</span><p className="text-sm">{reply.content}</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const quickActions = [
  { icon: Wand2, label: 'Generate', prompt: 'Create a system architecture diagram' },
  { icon: Layout, label: 'Layout', prompt: 'Reorganize and auto-layout the diagram' },
  { icon: Lightbulb, label: 'Improve', prompt: 'Suggest improvements for this diagram' },
  { icon: Code, label: 'Export', prompt: 'Export to Mermaid code' },
  { icon: FileText, label: 'Explain', prompt: 'Explain this diagram' },
]

export function RightSidebar() {
  const { rightSidebarOpen, rightSidebarTab, toggleRightSidebar, setRightSidebarTab } = useSidebarStore()
  const { addObject, addConnection, clearCanvas, objects } = useCanvasStore()
  const { currentDocument, setIsSaving } = useDocumentStore()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [commentFilter, setCommentFilter] = useState<'all' | 'open' | 'resolved'>('all')
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [messages, setMessages] = useState<AIMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isGenerating])

  if (!rightSidebarOpen) return null

  const filteredComments = mockComments.filter((c) => {
    if (commentFilter === 'open') return !c.resolved
    if (commentFilter === 'resolved') return c.resolved
    return true
  })

  const saveDiagram = async (newObjects: CanvasObject[], newConnections: { id: string; from: string; to: string; type: string; label?: string }[]) => {
    if (!currentDocument?.id) return
    setIsSaving(true)
    try {
      await fetch(`/api/documents/${currentDocument.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: { objects: newObjects, connections: newConnections } }),
      })
    } catch (error) {
      console.error('Failed to save diagram:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendMessage = async (prompt: string) => {
    if (!prompt.trim() || isGenerating) return

    const userMessage: AIMessage = { id: nanoid(), role: 'user', content: prompt, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setAiPrompt('')
    setIsGenerating(true)

    try {
      const canvasContext = {
        objectCount: objects.length,
        existingTypes: [...new Set(objects.map(o => o.text).filter(Boolean))]
      }

      // Build conversation history from messages
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }))

      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          conversationHistory,
          canvasContext,
        }),
      })

      const data = await res.json()

      // Check if AI is asking a clarifying question
      if (data.needsClarification) {
        const assistantMessage: AIMessage = {
          id: nanoid(),
          role: 'assistant',
          content: data.clarifyingQuestion || data.message,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        setIsGenerating(false)
        return
      }

      // Process the diagram if generated
      if (data.success && data.data?.objects) {
        clearCanvas()
        const idMap: Record<string, string> = {}
        const newObjects: CanvasObject[] = []
        const newConnections: { id: string; from: string; to: string; type: string; label?: string; stroke?: string; strokeWidth?: number; fromPort?: string; toPort?: string }[] = []

        data.data.objects.forEach((obj: CanvasObject & { id: string }, index: number) => {
          const newId = nanoid()
          idMap[obj.id] = newId
          const newObj = { ...obj, id: newId, zIndex: index } as CanvasObject
          newObjects.push(newObj)
          addObject(newObj)
        })

        data.data.connections?.forEach((conn: { id: string; from: string; to: string; type: string; label?: string; fromPort?: string; toPort?: string }) => {
          const newConn = {
            id: nanoid(),
            from: idMap[conn.from] || conn.from,
            to: idMap[conn.to] || conn.to,
            type: (conn.type as 'arrow' | 'line') || 'arrow',
            label: conn.label,
            fromPort: conn.fromPort as 'n' | 'e' | 's' | 'w' | undefined,
            toPort: conn.toPort as 'n' | 'e' | 's' | 'w' | undefined,
            stroke: '#94A3B8',
            strokeWidth: 1.5,
          }
          newConnections.push(newConn)
          addConnection(newConn)
        })

        await saveDiagram(newObjects, newConnections)
      }

      const assistantMessage: AIMessage = {
        id: nanoid(),
        role: 'assistant',
        content: data.message || `✨ Created diagram with ${data.data?.objects?.length || 0} components!`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('AI Error:', error)
      const errorMessage: AIMessage = {
        id: nanoid(),
        role: 'assistant',
        content: '❌ Sorry, something went wrong. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsGenerating(false)
    }
  }

  const clearChat = () => {
    setMessages([])
  }

  return (
    <div className={cn("w-80 border-l flex flex-col h-full", isDark ? "bg-neutral-950 border-neutral-800" : "bg-background")}>
      {/* Header */}
      <div className={cn("flex items-center justify-between p-3 border-b shrink-0", isDark && "border-neutral-800")}>
        <Tabs value={rightSidebarTab} onValueChange={(v) => setRightSidebarTab(v as 'comments' | 'history' | 'ai')}>
          <TabsList className="h-8">
            <TabsTrigger value="ai" className="text-xs px-2.5 gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              AI
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-xs px-2.5 gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Comments
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs px-2.5 gap-1.5">
              <History className="h-3.5 w-3.5" />
              History
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleRightSidebar}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {rightSidebarTab === 'comments' && (
          <div className="flex flex-col h-full">
            <div className="p-3 border-b shrink-0">
              <div className="flex gap-1">
                {(['all', 'open', 'resolved'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={commentFilter === filter ? 'secondary' : 'ghost'}
                    size="sm"
                    className="text-xs h-7 capitalize"
                    onClick={() => setCommentFilter(filter)}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-3">
                {filteredComments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">No comments yet</div>
                ) : (
                  filteredComments.map((comment) => <CommentThread key={comment.id} comment={comment} />)
                )}
              </div>
            </div>
            <div className="p-3 border-t shrink-0">
              <Input placeholder="Add a comment..." className="h-8 text-sm" />
            </div>
          </div>
        )}

        {rightSidebarTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-3">
            <div className="space-y-2">
              {mockVersions.map((version) => (
                <div key={version.id} className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{version.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{version.user.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{version.createdAt}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{version.description}</p>
                  <div className="mt-2 flex gap-2">
                    <Button variant="outline" size="sm" className="h-6 text-xs">
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rightSidebarTab === 'ai' && (
          <div className="flex flex-col h-full min-h-0">
            {/* Chat Messages Area */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto min-h-0"
            >
              {messages.length === 0 ? (
                /* Welcome Screen */
                <div className="p-4 space-y-4">
                  <div className="text-center py-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-linear-to-br from-violet-500 to-purple-600 mb-3">
                      <Bot className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm">AI Diagram Assistant</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Generate diagrams, get suggestions, and more
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Zap className="h-3 w-3" />
                      Quick Actions
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => handleSendMessage(action.prompt)}
                          disabled={isGenerating}
                          className="flex items-center gap-2 p-2.5 rounded-lg border bg-card hover:bg-muted/50 transition-colors text-left disabled:opacity-50"
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-muted">
                            <action.icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-xs font-medium">{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Example prompts */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Try describing your system:
                    </p>
                    <div className="space-y-1.5 text-xs text-muted-foreground">
                      <p className="italic">&quot;A web app with React frontend, Node.js API, and PostgreSQL database&quot;</p>
                      <p className="italic">&quot;E-commerce platform with payment processing and inventory management&quot;</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Chat Messages */
                <div className="p-3 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-2.5',
                        msg.role === 'user' && 'flex-row-reverse'
                      )}
                    >
                      <div className={cn(
                        'flex items-center justify-center w-7 h-7 rounded-full shrink-0',
                        msg.role === 'assistant'
                          ? 'bg-linear-to-br from-violet-500 to-purple-600'
                          : 'bg-slate-200'
                      )}>
                        {msg.role === 'assistant' ? (
                          <Bot className="h-3.5 w-3.5 text-white" />
                        ) : (
                          <User className="h-3.5 w-3.5 text-slate-600" />
                        )}
                      </div>
                      <div
                        className={cn(
                          'rounded-2xl px-3.5 py-2.5 text-sm max-w-[80%]',
                          msg.role === 'user'
                            ? 'bg-[#2B5CE6] text-white rounded-br-md'
                            : isDark
                              ? 'bg-neutral-900 text-neutral-100 rounded-bl-md'
                              : 'bg-slate-100 text-slate-900 rounded-bl-md'
                        )}
                      >
                        <div className="text-sm leading-relaxed">
                          {(msg.content || '').split('\n').map((line, i) => {
                            // Bold text parsing
                            const parseBold = (text: string) => {
                              const parts = text.split(/(\*\*.*?\*\*)/g)
                              return parts.map((part, j) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={j}>{part.slice(2, -2)}</strong>
                                }
                                return part
                              })
                            }

                            // List items
                            if (line.match(/^\d+\./) || line.trim().startsWith('-')) {
                              return (
                                <div key={i} className="ml-4 pl-1" style={{ textIndent: '-1.2em' }}>
                                  {parseBold(line)}
                                </div>
                              )
                            }

                            // Headers (simple)
                            if (line.startsWith('###')) {
                              return <h4 key={i} className="font-bold mt-2 mb-1">{parseBold(line.replace(/^###\s+/, ''))}</h4>
                            }
                            if (line.startsWith('##')) {
                                return <h3 key={i} className="font-bold text-base mt-3 mb-2">{parseBold(line.replace(/^##\s+/, ''))}</h3>
                            }

                            // Regular paragraph
                            return line.trim() ? <div key={i} className="min-h-[1.2em]">{parseBold(line)}</div> : <div key={i} className="h-2" />
                          })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isGenerating && (
                    <div className="flex gap-2.5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-linear-to-br from-violet-500 to-purple-600 shrink-0">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className={cn("rounded-2xl rounded-bl-md px-4 py-3", isDark ? "bg-neutral-900" : "bg-slate-100")}>
                        <div className="flex gap-1">
                          <span className={cn("w-2 h-2 rounded-full animate-bounce", isDark ? "bg-neutral-500" : "bg-neutral-400")} style={{ animationDelay: '0ms' }} />
                          <span className={cn("w-2 h-2 rounded-full animate-bounce", isDark ? "bg-neutral-500" : "bg-neutral-400")} style={{ animationDelay: '150ms' }} />
                          <span className={cn("w-2 h-2 rounded-full animate-bounce", isDark ? "bg-neutral-500" : "bg-neutral-400")} style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className={cn("shrink-0 border-t p-3 space-y-2", isDark ? "bg-neutral-950 border-neutral-800" : "bg-background")}>
              {messages.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {quickActions.slice(0, 3).map((action) => (
                      <button
                        key={action.label}
                        onClick={() => handleSendMessage(action.prompt)}
                        disabled={isGenerating}
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        <action.icon className="h-3 w-3" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={clearChat}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Describe what you want to create..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(aiPrompt)}
                  className={cn(
                    "h-10 text-sm rounded-full px-4 focus-visible:ring-[#2B5CE6]",
                    isDark ? "bg-neutral-900 border-neutral-700" : "bg-slate-50 border-slate-200"
                  )}
                  disabled={isGenerating}
                />
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-full shrink-0 bg-[#2B5CE6] hover:bg-blue-700"
                  onClick={() => handleSendMessage(aiPrompt)}
                  disabled={!aiPrompt.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
