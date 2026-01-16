'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useCanvasStore, useDocumentStore, useSidebarStore, type CanvasObject, type Connection } from '@/lib/store'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot, Check, ChevronDown, Edit2, Loader2, MessageSquare, Plus, Save, Send, Sparkles, Trash2, User, X, History, Wand2, RefreshCw
} from 'lucide-react'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useRef, useState } from 'react'

interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

interface AIChat {
  id: string
  title: string
  messages: AIMessage[]
  createdAt: string
}

interface Note {
  id: string
  content: string
  color: string
  user: { name: string; image?: string }
  createdAt: string
}

interface Snapshot {
  id: string
  description: string
  createdAt: string
}

const NOTE_COLORS = ['#FEF3C7', '#DCFCE7', '#DBEAFE', '#FCE7F3', '#F3E8FF', '#FED7AA']

export function RightSidebarNew() {
  const { rightSidebarOpen, rightSidebarTab, toggleRightSidebar, setRightSidebarTab } = useSidebarStore()
  const { currentDocument } = useDocumentStore()
  const { objects, connections, addObject, addConnection, clearCanvas } = useCanvasStore()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  // AI Chat state
  const [currentChat, setCurrentChat] = useState<AIChat | null>(null)
  const [aiChats, setAiChats] = useState<AIChat[]>([])
  const [aiPrompt, setAiPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Notes state
  const [notes, setNotes] = useState<Note[]>([])
  const [newNoteContent, setNewNoteContent] = useState('')
  const [newNoteColor, setNewNoteColor] = useState('#FEF3C7')
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingNoteContent, setEditingNoteContent] = useState('')

  // Snapshots state
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [snapshotName, setSnapshotName] = useState('')
  const [showSnapshotForm, setShowSnapshotForm] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Build canvas context for AI
  const getCanvasContext = useCallback(() => {
    if (!objects || objects.length === 0) return undefined
    
    return {
      objects: objects.map((obj: CanvasObject) => ({
        id: obj.id,
        type: obj.type,
        text: obj.text || '',
        x: obj.x,
        y: obj.y,
        category: inferCategory(obj.text || '', obj.fill || ''),
      })),
      connections: connections.map((conn: Connection) => ({
        id: conn.id,
        from: conn.from,
        to: conn.to,
        label: conn.label || '',
      })),
    }
  }, [objects, connections])

  // Infer category from text and color
  function inferCategory(text: string, fill: string): string {
    const lowerText = text.toLowerCase()
    
    // Check by color first
    if (fill === '#DBEAFE') return 'client'
    if (fill === '#FEF3C7') return 'gateway'
    if (fill === '#D1FAE5') return 'service'
    if (fill === '#EDE9FE') return 'database'
    if (fill === '#FEE2E2') return 'cache'
    if (fill === '#FCE7F3') return 'queue'
    if (fill === '#E0E7FF') return 'storage'
    if (fill === '#FFEDD5') return 'auth'
    
    // Check by text
    if (lowerText.includes('client') || lowerText.includes('user') || lowerText.includes('web') || lowerText.includes('mobile')) return 'client'
    if (lowerText.includes('gateway') || lowerText.includes('load') || lowerText.includes('cdn')) return 'gateway'
    if (lowerText.includes('auth')) return 'auth'
    if (lowerText.includes('db') || lowerText.includes('database') || lowerText.includes('postgres') || lowerText.includes('mongo')) return 'database'
    if (lowerText.includes('cache') || lowerText.includes('redis')) return 'cache'
    if (lowerText.includes('queue') || lowerText.includes('kafka') || lowerText.includes('rabbit')) return 'queue'
    if (lowerText.includes('s3') || lowerText.includes('storage') || lowerText.includes('bucket')) return 'storage'
    if (lowerText.includes('service') || lowerText.includes('api')) return 'service'
    
    return 'service'
  }

  // Get conversation history for AI
  const getConversationHistory = useCallback(() => {
    if (!currentChat?.messages) return []
    
    return currentChat.messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }))
  }, [currentChat?.messages])

  // Fetch data when document changes
  useEffect(() => {
    if (!currentDocument?.id) return

    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [chatsRes, notesRes, snapshotsRes] = await Promise.all([
          fetch(`/api/ai-chats?documentId=${currentDocument.id}`),
          fetch(`/api/notes?documentId=${currentDocument.id}`),
          fetch(`/api/snapshots?documentId=${currentDocument.id}`),
        ])

        if (chatsRes.ok) {
          const chats = await chatsRes.json()
          setAiChats(chats)
          // Load the most recent chat if exists
          if (chats.length > 0) {
            setCurrentChat(chats[0])
          }
        }
        if (notesRes.ok) setNotes(await notesRes.json())
        if (snapshotsRes.ok) setSnapshots(await snapshotsRes.json())
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [currentDocument?.id])

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [currentChat?.messages, isGenerating])

  if (!rightSidebarOpen) return null

  // AI Chat handlers
  const handleNewChat = async () => {
    if (!currentDocument?.id) return

    try {
      const res = await fetch('/api/ai-chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: currentDocument.id,
          title: 'New Chat',
        }),
      })

      if (res.ok) {
        const newChat = await res.json()
        setAiChats(prev => [newChat, ...prev])
        setCurrentChat(newChat)
      }
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!aiPrompt.trim() || !currentDocument?.id) return

    // Create chat if none exists
    let chatId = currentChat?.id
    if (!chatId) {
      try {
        const res = await fetch('/api/ai-chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId: currentDocument.id,
            title: aiPrompt.slice(0, 30) + (aiPrompt.length > 30 ? '...' : ''),
          }),
        })
        if (res.ok) {
          const newChat = await res.json()
          setAiChats(prev => [newChat, ...prev])
          setCurrentChat(newChat)
          chatId = newChat.id
        }
      } catch (error) {
        console.error('Failed to create chat:', error)
        return
      }
    }

    const userMessage: AIMessage = {
      id: nanoid(),
      role: 'user',
      content: aiPrompt,
      createdAt: new Date().toISOString(),
    }

    // Update local state immediately
    setCurrentChat(prev => prev ? { ...prev, messages: [...prev.messages, userMessage] } : null)
    const currentPrompt = aiPrompt
    setAiPrompt('')
    setIsGenerating(true)

    try {
      // Save user message to DB
      await fetch(`/api/ai-chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'user', content: currentPrompt }),
      })

      // Get canvas context and conversation history
      const canvasContext = getCanvasContext()
      const conversationHistory = getConversationHistory()

      // Call AI endpoint with full context
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentPrompt,
          documentId: currentDocument.id,
          canvasContext,
          conversationHistory,
        }),
      })

      const data = await res.json()
      const assistantContent = data.message || 'I can help you with your diagram. What would you like to create or modify?'

      // If AI generated diagram data, add it to the canvas
      if (data.success && data.data) {
        const { objects: newObjects, connections: newConnections } = data.data
        
        // Handle modifications vs new diagrams
        if (data.isModification) {
          // For modifications, we replace the canvas with the updated state
          clearCanvas()
        } else if (newObjects && newObjects.length > 0) {
          // For new diagrams, clear and add
          clearCanvas()
        }
        
        // Add all objects
        if (newObjects && newObjects.length > 0) {
          newObjects.forEach((obj: {
            id: string
            type: string
            x: number
            y: number
            width: number
            height: number
            fill: string
            stroke: string
            strokeWidth: number
            rotation: number
            opacity: number
            borderRadius?: number
            zIndex: number
            text?: string
            fontSize?: number
            fontFamily?: string
            isGroup?: boolean
            groupLabel?: string
            groupColor?: string
          }) => {
            addObject(obj as Parameters<typeof addObject>[0])
          })
        }
        
        // Add all connections
        if (newConnections && newConnections.length > 0) {
          newConnections.forEach((conn: {
            id: string
            from: string
            to: string
            fromPort?: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'
            toPort?: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'
            type: 'line' | 'arrow'
            label?: string
            stroke?: string
            strokeWidth?: number
            animated?: boolean
            dashArray?: string
          }) => {
            addConnection(conn)
          })
        }
      }

      const assistantMessage: AIMessage = {
        id: nanoid(),
        role: 'assistant',
        content: assistantContent,
        createdAt: new Date().toISOString(),
      }

      // Save assistant message to DB
      await fetch(`/api/ai-chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'assistant', content: assistantContent }),
      })

      setCurrentChat(prev => prev ? { ...prev, messages: [...prev.messages, assistantMessage] } : null)
    } catch (error) {
      console.error('AI Error:', error)
      // Add error message to chat
      const errorMessage: AIMessage = {
        id: nanoid(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date().toISOString(),
      }
      setCurrentChat(prev => prev ? { ...prev, messages: [...prev.messages, errorMessage] } : null)
    } finally {
      setIsGenerating(false)
    }
  }

  // Notes handlers
  const handleAddNote = async () => {
    if (!currentDocument?.id || !newNoteContent.trim()) return

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: currentDocument.id,
          content: newNoteContent,
          color: newNoteColor,
        }),
      })

      if (res.ok) {
        const newNote = await res.json()
        setNotes(prev => [newNote, ...prev])
        setNewNoteContent('')
        setNewNoteColor('#FEF3C7')
        setShowNoteForm(false)
      }
    } catch (error) {
      console.error('Failed to create note:', error)
    }
  }

  const handleUpdateNote = async (noteId: string) => {
    if (!editingNoteContent.trim()) return

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editingNoteContent }),
      })

      if (res.ok) {
        const updatedNote = await res.json()
        setNotes(prev => prev.map(n => n.id === noteId ? updatedNote : n))
        setEditingNoteId(null)
        setEditingNoteContent('')
      }
    } catch (error) {
      console.error('Failed to update note:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await fetch(`/api/notes/${noteId}`, { method: 'DELETE' })
      setNotes(prev => prev.filter(n => n.id !== noteId))
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  // Snapshot handlers
  const handleCreateSnapshot = async () => {
    if (!currentDocument?.id) return

    try {
      const res = await fetch('/api/snapshots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: currentDocument.id,
          content: currentDocument.content,
          description: snapshotName.trim() || `Snapshot - ${new Date().toLocaleString()}`,
        }),
      })

      if (res.ok) {
        const newSnapshot = await res.json()
        setSnapshots(prev => [newSnapshot, ...prev])
        setSnapshotName('')
        setShowSnapshotForm(false)
      }
    } catch (error) {
      console.error('Failed to create snapshot:', error)
    }
  }

  // Quick prompts for AI
  const quickPrompts = [
    { label: 'Create flowchart', prompt: 'Create a simple flowchart for a user login process' },
    { label: 'System design', prompt: 'Design a basic microservices architecture diagram' },
    { label: 'Add component', prompt: 'Add a new database component to the diagram' },
    { label: 'Explain diagram', prompt: 'Explain the current diagram architecture' },
  ]

  return (
    <motion.div
      initial={{ x: 320, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 320, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={cn(
        "w-[340px] border-l flex flex-col h-full shadow-2xl",
        isDark ? "bg-neutral-950 border-neutral-800" : "bg-white border-slate-200"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-3 border-b shrink-0",
        isDark ? "border-neutral-800 bg-neutral-900/50" : "border-slate-100 bg-slate-50/50"
      )}>
        <Tabs value={rightSidebarTab} onValueChange={(v) => setRightSidebarTab(v as 'comments' | 'history' | 'ai')}>
          <TabsList className={cn("h-9 p-1", isDark ? "bg-neutral-800" : "bg-slate-100")}>
            <TabsTrigger value="ai" className="text-xs px-3 gap-1.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#E85002] data-[state=active]:to-[#F16001] data-[state=active]:text-white">
              <Sparkles className="h-3.5 w-3.5" />
              AI
            </TabsTrigger>
            <TabsTrigger value="comments" className="text-xs px-3 gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs px-3 gap-1.5">
              <History className="h-3.5 w-3.5" />
              History
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8 rounded-full", isDark ? "hover:bg-neutral-800" : "hover:bg-slate-100")}
          onClick={toggleRightSidebar}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {/* AI Chat Tab */}
        {rightSidebarTab === 'ai' && (
          <div className="flex flex-col h-full min-h-0">
            {/* Chat selector - Redesigned */}
            <div className={cn(
              "px-4 py-3 border-b flex items-center gap-2",
              isDark ? "border-neutral-800 bg-neutral-900/30" : "border-slate-100 bg-slate-50/30"
            )}>
              {aiChats.length > 0 ? (
                <>
                  <div className={cn(
                    "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors",
                    isDark ? "bg-neutral-800 hover:bg-neutral-700" : "bg-slate-100 hover:bg-slate-200"
                  )}>
                    <Wand2 className={cn("h-4 w-4", isDark ? "text-[#F16001]" : "text-[#E85002]")} />
                    <select
                      value={currentChat?.id || ''}
                      onChange={(e) => {
                        const chat = aiChats.find(c => c.id === e.target.value)
                        setCurrentChat(chat || null)
                      }}
                      className={cn(
                        "flex-1 text-sm font-medium bg-transparent border-none outline-none cursor-pointer",
                        isDark ? "text-neutral-200" : "text-slate-700"
                      )}
                    >
                      {aiChats.map(chat => (
                        <option key={chat.id} value={chat.id}>{chat.title}</option>
                      ))}
                    </select>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-9 w-9 rounded-lg", isDark ? "hover:bg-neutral-800" : "hover:bg-slate-100")}
                    onClick={handleNewChat}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className={cn(
                  "flex-1 flex items-center gap-2 px-3 py-2 rounded-lg",
                  isDark ? "bg-neutral-800/50" : "bg-slate-100/50"
                )}>
                  <Sparkles className={cn("h-4 w-4", isDark ? "text-[#F16001]" : "text-[#E85002]")} />
                  <span className={cn("text-sm font-medium", isDark ? "text-neutral-300" : "text-slate-600")}>
                    New Conversation
                  </span>
                </div>
              )}
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="p-4 space-y-4">
                <AnimatePresence mode="popLayout">
                  {(!currentChat || currentChat.messages.length === 0) ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-8"
                    >
                      {/* AI Welcome */}
                      <div className={cn(
                        "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-gradient-to-br",
                        "from-[#E85002] to-[#F16001] shadow-lg shadow-orange-500/20"
                      )}>
                        <Bot className="h-8 w-8 text-white" />
                      </div>
                      <h3 className={cn("font-semibold text-base", isDark ? "text-white" : "text-slate-900")}>
                        AI Diagram Assistant
                      </h3>
                      <p className={cn("text-sm mt-2 max-w-[240px] mx-auto leading-relaxed", isDark ? "text-neutral-400" : "text-slate-500")}>
                        I can help you create, modify, and understand your diagrams. Try asking me anything.
                      </p>

                      {/* Quick Prompts */}
                      <div className="mt-6 space-y-2">
                        <p className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-neutral-500" : "text-slate-400")}>
                          Quick Actions
                        </p>
                        <div className="flex flex-wrap justify-center gap-2 mt-3">
                          {quickPrompts.map((item, i) => (
                            <motion.button
                              key={i}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: i * 0.1 }}
                              onClick={() => setAiPrompt(item.prompt)}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                                isDark
                                  ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700"
                                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200"
                              )}
                            >
                              {item.label}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    currentChat.messages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn("flex gap-3", msg.role === 'user' && 'flex-row-reverse')}
                      >
                        {/* Avatar */}
                        <div className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-full shrink-0 shadow-sm',
                          msg.role === 'assistant'
                            ? 'bg-gradient-to-br from-[#E85002] to-[#F16001]'
                            : isDark ? 'bg-neutral-700 ring-1 ring-neutral-600' : 'bg-slate-200 ring-1 ring-slate-300'
                        )}>
                          {msg.role === 'assistant' ? (
                            <Bot className="h-4 w-4 text-white" />
                          ) : (
                            <User className={cn("h-4 w-4", isDark ? "text-neutral-300" : "text-slate-600")} />
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className={cn(
                          'rounded-2xl px-4 py-3 text-sm max-w-[85%] shadow-sm',
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-[#E85002] to-[#F16001] text-white rounded-br-sm'
                            : isDark
                              ? 'bg-neutral-800 text-neutral-100 rounded-bl-sm border border-neutral-700'
                              : 'bg-slate-100 text-slate-900 rounded-bl-sm border border-slate-200'
                        )}>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          <p className={cn(
                            "text-[10px] mt-2 opacity-60",
                            msg.role === 'user' ? 'text-right' : ''
                          )}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>

                {/* Generating Animation */}
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[#E85002] to-[#F16001] shrink-0 shadow-sm">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className={cn(
                      "rounded-2xl rounded-bl-sm px-4 py-3 border shadow-sm",
                      isDark ? "bg-neutral-800 border-neutral-700" : "bg-slate-100 border-slate-200"
                    )}>
                      <div className="flex items-center gap-2">
                        <RefreshCw className={cn("h-3.5 w-3.5 animate-spin", isDark ? "text-[#F16001]" : "text-[#E85002]")} />
                        <span className={cn("text-xs font-medium", isDark ? "text-neutral-400" : "text-slate-500")}>
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area - Redesigned */}
            <div className={cn(
              "shrink-0 border-t p-4",
              isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-slate-50/50 border-slate-100"
            )}>
              <div className={cn(
                "flex items-center gap-2 p-1.5 rounded-xl border transition-all",
                isDark
                  ? "bg-neutral-800 border-neutral-700 focus-within:border-[#E85002] focus-within:ring-1 focus-within:ring-[#E85002]/20"
                  : "bg-white border-slate-200 focus-within:border-[#E85002] focus-within:ring-1 focus-within:ring-[#E85002]/20"
              )}>
                <Input
                  placeholder="Ask me anything..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  className={cn(
                    "flex-1 h-10 text-sm border-0 bg-transparent shadow-none focus-visible:ring-0 px-3",
                    isDark ? "placeholder:text-neutral-500" : "placeholder:text-slate-400"
                  )}
                  disabled={isGenerating}
                />
                <Button
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-lg shrink-0 transition-all",
                    aiPrompt.trim()
                      ? "bg-gradient-to-r from-[#E85002] to-[#F16001] hover:from-[#D14502] hover:to-[#E05501] text-white shadow-md"
                      : isDark ? "bg-neutral-700 text-neutral-400" : "bg-slate-100 text-slate-400"
                  )}
                  onClick={handleSendMessage}
                  disabled={!aiPrompt.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className={cn("text-[10px] text-center mt-2", isDark ? "text-neutral-500" : "text-slate-400")}>
                AI can help create and modify diagrams
              </p>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {rightSidebarTab === 'comments' && (
          <div className="flex flex-col h-full">
            <div className={cn("p-3 border-b shrink-0", isDark && "border-neutral-800")}>
              {showNoteForm ? (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Write your note..."
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    className={cn("min-h-[80px] text-sm resize-none", isDark ? "bg-neutral-900 border-neutral-700" : "")}
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs", isDark ? "text-neutral-400" : "text-slate-500")}>Color:</span>
                    <div className="flex gap-1">
                      {NOTE_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => setNewNoteColor(color)}
                          className={cn("w-5 h-5 rounded-full border-2 transition-transform", newNoteColor === color ? "scale-110 border-blue-500" : "border-transparent")}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddNote} disabled={!newNoteContent.trim()} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs">
                      <Save className="h-3.5 w-3.5" />
                      Save Note
                    </Button>
                    <Button variant="ghost" onClick={() => { setShowNoteForm(false); setNewNoteContent('') }} className="h-8 text-xs">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setShowNoteForm(true)} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4" />
                  Add Note
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : notes.length === 0 ? (
                <p className={cn("text-center text-sm py-8", isDark ? "text-neutral-500" : "text-slate-500")}>
                  No notes yet. Click &quot;Add Note&quot; to create one.
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className={cn("p-3 rounded-lg border", isDark ? "border-neutral-800" : "border-slate-200")}
                    style={{ backgroundColor: note.color + '20' }}
                  >
                    {editingNoteId === note.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editingNoteContent}
                          onChange={(e) => setEditingNoteContent(e.target.value)}
                          className={cn("min-h-[60px] text-sm resize-none", isDark ? "bg-neutral-900 border-neutral-700" : "")}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleUpdateNote(note.id)} className="h-7 text-xs gap-1 bg-blue-600 hover:bg-blue-700">
                            <Check className="h-3 w-3" />
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setEditingNoteId(null); setEditingNoteContent('') }} className="h-7 text-xs">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm whitespace-pre-wrap", isDark ? "text-neutral-200" : "text-slate-900")}>{note.content}</p>
                          <p className={cn("text-xs mt-2", isDark ? "text-neutral-500" : "text-slate-500")}>
                            {new Date(note.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => { setEditingNoteId(note.id); setEditingNoteContent(note.content) }}
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* History/Snapshots Tab */}
        {rightSidebarTab === 'history' && (
          <div className="flex flex-col h-full">
            <div className={cn("p-3 border-b shrink-0", isDark && "border-neutral-800")}>
              {showSnapshotForm ? (
                <div className="space-y-3">
                  <Input
                    placeholder="Snapshot name (optional)"
                    value={snapshotName}
                    onChange={(e) => setSnapshotName(e.target.value)}
                    className={cn("h-9 text-sm", isDark ? "bg-neutral-900 border-neutral-700" : "")}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreateSnapshot} className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs">
                      <Save className="h-3.5 w-3.5" />
                      Save Snapshot
                    </Button>
                    <Button variant="ghost" onClick={() => { setShowSnapshotForm(false); setSnapshotName('') }} className="h-8 text-xs">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setShowSnapshotForm(true)} className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4" />
                  Create Snapshot
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : snapshots.length === 0 ? (
                <p className={cn("text-center text-sm py-8", isDark ? "text-neutral-500" : "text-slate-500")}>
                  No snapshots yet. Create one to save your current work.
                </p>
              ) : (
                snapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className={cn("p-3 rounded-lg border hover:bg-opacity-50 cursor-pointer transition-colors", isDark ? "border-neutral-800 hover:bg-neutral-800" : "border-slate-200 hover:bg-slate-50")}
                  >
                    <p className={cn("text-sm font-medium", isDark ? "text-neutral-200" : "text-slate-900")}>
                      {snapshot.description}
                    </p>
                    <p className={cn("text-xs mt-1", isDark ? "text-neutral-500" : "text-slate-500")}>
                      {new Date(snapshot.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
