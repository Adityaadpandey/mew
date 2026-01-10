'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useCanvasStore, useDocumentStore, useSidebarStore, type CanvasObject, type Connection } from '@/lib/store'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import {
  Bot, Check, Edit2, Loader2, MessageSquare, Plus, Save, Send, Sparkles, Trash2, User, X, History
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
            fromPort?: 'n' | 'e' | 's' | 'w'
            toPort?: 'n' | 'e' | 's' | 'w'
            type: 'line' | 'arrow'
            label?: string
            stroke?: string
            strokeWidth?: number
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
              Notes
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
        {/* AI Chat Tab */}
        {rightSidebarTab === 'ai' && (
          <div className="flex flex-col h-full min-h-0">
            {/* Chat selector */}
            {aiChats.length > 0 && (
              <div className={cn("p-2 border-b flex items-center gap-2", isDark && "border-neutral-800")}>
                <select
                  value={currentChat?.id || ''}
                  onChange={(e) => {
                    const chat = aiChats.find(c => c.id === e.target.value)
                    setCurrentChat(chat || null)
                  }}
                  className={cn("flex-1 text-xs h-8 rounded-md border px-2", isDark ? "bg-neutral-900 border-neutral-700 text-neutral-200" : "bg-white border-slate-200")}
                >
                  {aiChats.map(chat => (
                    <option key={chat.id} value={chat.id}>{chat.title}</option>
                  ))}
                </select>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNewChat}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-3">
              {(!currentChat || currentChat.messages.length === 0) ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 mb-3">
                    <Bot className="h-6 w-6 text-blue-500" />
                  </div>
                  <h3 className={cn("font-semibold text-sm", isDark ? "text-neutral-200" : "text-slate-900")}>AI Assistant</h3>
                  <p className={cn("text-xs mt-1", isDark ? "text-neutral-500" : "text-slate-500")}>
                    Ask me to help with your diagram
                  </p>
                </div>
              ) : (
                currentChat.messages.map((msg) => (
                  <div key={msg.id} className={cn("flex gap-2.5", msg.role === 'user' && 'flex-row-reverse')}>
                    <div className={cn(
                      'flex items-center justify-center w-7 h-7 rounded-full shrink-0',
                      msg.role === 'assistant' ? 'bg-blue-500' : isDark ? 'bg-neutral-800' : 'bg-slate-200'
                    )}>
                      {msg.role === 'assistant' ? (
                        <Bot className="h-3.5 w-3.5 text-white" />
                      ) : (
                        <User className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className={cn(
                      'rounded-2xl px-3.5 py-2.5 text-sm max-w-[80%]',
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : isDark ? 'bg-neutral-900 text-neutral-100 rounded-bl-md' : 'bg-slate-100 text-slate-900 rounded-bl-md'
                    )}>
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {isGenerating && (
                <div className="flex gap-2.5">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 shrink-0">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className={cn("rounded-2xl rounded-bl-md px-4 py-3", isDark ? "bg-neutral-900" : "bg-slate-100")}>
                    <div className="flex gap-1">
                      <span className={cn("w-2 h-2 rounded-full animate-bounce", isDark ? "bg-neutral-500" : "bg-slate-400")} style={{ animationDelay: '0ms' }} />
                      <span className={cn("w-2 h-2 rounded-full animate-bounce", isDark ? "bg-neutral-500" : "bg-slate-400")} style={{ animationDelay: '150ms' }} />
                      <span className={cn("w-2 h-2 rounded-full animate-bounce", isDark ? "bg-neutral-500" : "bg-slate-400")} style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={cn("shrink-0 border-t p-3", isDark ? "bg-neutral-950 border-neutral-800" : "bg-background")}>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask AI..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  className={cn("h-10 text-sm rounded-full px-4", isDark ? "bg-neutral-900 border-neutral-700" : "")}
                  disabled={isGenerating}
                />
                <Button
                  size="icon"
                  className="h-10 w-10 rounded-full shrink-0 bg-blue-600 hover:bg-blue-700"
                  onClick={handleSendMessage}
                  disabled={!aiPrompt.trim() || isGenerating}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
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
    </div>
  )
}
