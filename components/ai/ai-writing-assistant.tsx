'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  BookOpen,
  FileText,
  Lightbulb,
  Loader2,
  MessageCircle,
  PenLine,
  Send,
  Sparkles,
  Wand2,
} from 'lucide-react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

interface AIWritingAssistantProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInsertContent?: (content: string) => void
  currentContent?: string
  documentTitle?: string
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface UpgradeState {
  show: boolean
  current?: number
  limit?: number
  message?: string
}

const quickActions = [
  { icon: PenLine, label: 'Improve Writing', prompt: 'Improve the clarity and flow of this text' },
  { icon: Lightbulb, label: 'Expand Ideas', prompt: 'Expand on the main ideas in this document' },
  { icon: BookOpen, label: 'Add Examples', prompt: 'Add relevant examples to illustrate the concepts' },
  { icon: FileText, label: 'Summarize', prompt: 'Create a concise summary of this document' },
]

export function AIWritingAssistant({
  open,
  onOpenChange,
  onInsertContent,
  currentContent,
  documentTitle,
}: AIWritingAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
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
      const response = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: messageContent,
          documentContent: currentContent,
          documentTitle,
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

      setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
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

  const handleInsert = (content: string) => {
    onInsertContent?.(content)
    onOpenChange(false)
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
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className={isDark ? "text-white" : ""}>
                AI Writing Assistant
              </DialogTitle>
              <DialogDescription>
                Get help with writing, editing, and improving your document
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col overflow-hidden">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#C10801] to-[#F16001] flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className={cn("text-lg font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
                How can I help you write?
              </h3>
              <p className={cn("text-sm text-center mb-6 max-w-md", isDark ? "text-zinc-400" : "text-slate-600")}>
                I can help you improve your writing, expand on ideas, add examples, or create summaries.
              </p>
              <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                {quickActions.map((action) => (
                  <Card
                    key={action.label}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:scale-[1.02]",
                      isDark
                        ? "bg-zinc-900 border-zinc-800 hover:border-orange-500/50"
                        : "hover:border-orange-500/50"
                    )}
                    onClick={() => handleSendMessage(action.prompt)}
                  >
                    <action.icon className={cn("h-5 w-5 mb-2", isDark ? "text-orange-400" : "text-orange-600")} />
                    <p className={cn("font-medium text-sm", isDark ? "text-white" : "text-slate-900")}>
                      {action.label}
                    </p>
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
                      "rounded-xl px-4 py-3 max-w-[80%]",
                      msg.role === 'assistant'
                        ? isDark ? "bg-zinc-900 border border-zinc-800" : "bg-slate-50"
                        : "bg-gradient-to-r from-[#C10801] to-[#F16001] text-white"
                    )}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-3"
                            onClick={() => handleInsert(msg.content)}
                          >
                            <FileText className="h-3 w-3 mr-1" /> Insert into document
                          </Button>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
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
                          Writing...
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
              placeholder="Ask me to help with your writing..."
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
          feature="AI Writing Assistant"
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
