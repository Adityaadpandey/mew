'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useCanvasStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
    AlertCircle,
    Check,
    FileText,
    GitBranch,
    Loader2,
    MessageCircle,
    Send,
    Sparkles,
    Wand2,
    X,
    Zap
} from 'lucide-react'
import { useState } from 'react'

interface AIDiagramGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerate?: (data: { objects: unknown[];  connections: unknown[] }) => void
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const quickStarters = [
  { icon: GitBranch, label: 'Microservices', prompt: 'Create a microservices e-commerce system' },
  { icon: FileText, label: 'CI/CD Pipeline', prompt: 'Design a CI/CD pipeline with GitHub and AWS' },
  { icon: Zap, label: 'Event-Driven', prompt: 'Event-driven architecture with Kafka' },
]

export function AIDiagramGenerator({ open, onOpenChange, onGenerate }: AIDiagramGeneratorProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedData, setGeneratedData] = useState<{ objects: unknown[]; connections: unknown[] } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { objects } = useCanvasStore()

  const handleSendMessage = async () => {
    if (!input.trim() || isGenerating) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsGenerating(true)
    setError(null)

    try {
      // Build canvas context
      const canvasContext = {
        objectCount: objects.length,
        existingTypes: [...new Set(objects.map(o => o.type))]
      }

      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
          canvasContext
        }),
      })

      const data = await response.json()

      if (data.success) {
        if (data.needsClarification && data.clarifyingQuestion) {
          // AI is asking a clarifying question
          setMessages(prev => [...prev, { role: 'assistant', content: data.clarifyingQuestion }])
        } else if (data.data) {
          // AI generated a diagram
          setGeneratedData(data.data)
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `✨ I've created a diagram with ${data.data.objects?.length || 0} components. Review it below and click "Add to Canvas" when ready!`
          }])
        }
      } else {
        setError(data.error || 'Failed to generate diagram')
      }
    } catch {
      setError('Failed to connect to AI service')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAccept = () => {
    if (generatedData) {
      onGenerate?.(generatedData)
      onOpenChange(false)
      // Reset state
      setMessages([])
      setInput('')
      setGeneratedData(null)
    }
  }

  const handleQuickStart = (prompt: string) => {
    setInput(prompt)
  }

  const handleReset = () => {
    setMessages([])
    setInput('')
    setGeneratedData(null)
    setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#2B5CE6]" />
            AI Diagram Assistant
          </DialogTitle>
          <DialogDescription>
            I'll ask clarifying questions to create the perfect diagram for you
          </DialogDescription>
        </DialogHeader>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col min-h-0 mt-4">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                  <MessageCircle className="h-8 w-8 text-[#2B5CE6]" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Let's create something amazing</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                  Describe what you want to build and I'll ask questions to understand your needs better
                </p>

                {/* Quick Starters */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickStarters.map((starter, i) => {
                    const Icon = starter.icon
                    return (
                      <button
                        key={i}
                        onClick={() => handleQuickStart(starter.prompt)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:border-[#2B5CE6] hover:bg-blue-50 transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{starter.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      'flex gap-3',
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[80%] rounded-lg px-4 py-2',
                        msg.role === 'user'
                          ? 'bg-[#2B5CE6] text-white'
                          : 'bg-muted'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium">You</span>
                      </div>
                    )}
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    </div>
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <p className="text-sm text-muted-foreground">Thinking...</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Preview Section */}
          {generatedData && (
            <div className="border rounded-lg p-4 mb-4 bg-gradient-to-br from-blue-50 to-purple-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Diagram Ready</span>
                </div>
                <div className="flex gap-1 text-xs text-muted-foreground">
                  <span>{generatedData.objects?.length || 0} components</span>
                  <span>•</span>
                  <span>{generatedData.connections?.length || 0} connections</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {(generatedData.objects as Array<{ text?: string; id: string }>)?.slice(0, 6).map((obj, i) => (
                  <div key={i} className="px-3 py-1 rounded-md bg-white border text-xs font-medium">
                    {obj.text || `Component ${i + 1}`}
                  </div>
                ))}
                {(generatedData.objects?.length || 0) > 6 && (
                  <div className="px-3 py-1 rounded-md bg-white border text-xs text-muted-foreground">
                    +{(generatedData.objects?.length || 0) - 6} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex items-center gap-2 text-red-700 mb-4">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Describe your diagram or answer the question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              disabled={isGenerating}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!input.trim() || isGenerating}
              className="bg-[#2B5CE6] hover:bg-[#1E42B8]"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <Button variant="ghost" size="sm" onClick={handleReset} disabled={isGenerating}>
            <X className="mr-1 h-3 w-3" />
            Reset
          </Button>

          {generatedData && (
            <Button
              onClick={handleAccept}
              className="bg-[#2B5CE6] hover:bg-[#1E42B8]"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              Add to Canvas
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
