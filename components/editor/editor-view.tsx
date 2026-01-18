'use client'

import { DashboardHome } from '@/components/dashboard/dashboard_home'
import { RightSidebarNew } from '@/components/layout/right-sidebar-new'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useDocumentStore, useSidebarStore } from '@/lib/store'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { Check, Home, LayoutDashboard, Pencil, Play, Share2, Sparkles, X } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { DiagramEditor } from './diagram-editor'
import { DiagramToolbar } from './diagram-toolbar'
import { DocumentEditorV2 } from './document-editor-v2'
import { MiniMap } from './mini-map'
import { PropertiesPanel } from './properties-panel'
import { ShapeLibrary } from './shape-library'
import { ZoomControls } from './zoom-controls'

type EditorMode = 'document' | 'diagram'

export function EditorView({
  documentId: propDocumentId,
  diagramId: propDiagramId,
  forcedMode
}: {
  documentId?: string
  diagramId?: string
  forcedMode?: EditorMode
}) {
  const searchParams = useSearchParams()
  const documentId = propDocumentId || searchParams.get('documentId')
  const diagramId = propDiagramId || searchParams.get('diagramId')
  const itemId = documentId || diagramId
  
  // Determine mode based on props - use useMemo to avoid re-renders
  const initialMode = useMemo(() => {
    if (forcedMode) return forcedMode
    if (documentId) return 'document'
    if (diagramId) return 'diagram'
    return 'diagram'
  }, [forcedMode, documentId, diagramId])
  
  const [mode, setMode] = useState<EditorMode>(initialMode)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)
  const { currentDocument, setCurrentDocument } = useDocumentStore()
  const { rightSidebarOpen, setRightSidebarTab } = useSidebarStore()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  // Sync mode with initial mode when it changes
  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  useEffect(() => {
    // Only set loading state if we're switching to a different document/diagram
    if (itemId && itemId !== currentDocument?.id) {
      // Determine type based on which ID is provided
      const type = diagramId ? 'DIAGRAM' : 'DOCUMENT'

      // Set partial doc to trigger loading in the editor components
      setCurrentDocument({
        id: itemId,
        title: 'Loading...',
        type,
        content: {},
      })
    } else if (!itemId && currentDocument) {
      setCurrentDocument(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId, diagramId])

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

  const handleStartEditTitle = () => {
    setEditedTitle(currentDocument?.title || '')
    setIsEditingTitle(true)
  }

  const handleSaveTitle = async () => {
    if (!currentDocument || !editedTitle.trim()) {
      setIsEditingTitle(false)
      return
    }

    try {
      const isDiagram = mode === 'diagram' || currentDocument.type === 'DIAGRAM' || currentDocument.type === 'CANVAS'
      const endpoint = isDiagram ? `/api/diagrams/${currentDocument.id}` : `/api/documents/${currentDocument.id}`

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editedTitle.trim() }),
      })

      if (res.ok) {
        setCurrentDocument({ ...currentDocument, title: editedTitle.trim() })
        toast.success('Title updated')
      } else {
        toast.error('Failed to update title')
      }
    } catch (error) {
      console.error('Failed to update title:', error)
      toast.error('Failed to update title')
    }
    setIsEditingTitle(false)
  }

  const handleCancelEdit = () => {
    setIsEditingTitle(false)
    setEditedTitle('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  if (!currentDocument) {
    return <DashboardHome />
  }

  const isDiagram = mode === 'diagram'

  return (
    <TooltipProvider>
      <div className={cn("flex h-screen flex-col overflow-hidden", isDark ? "bg-black" : "bg-white")}>
        {/* Top Navigation Bar */}
        <div className={cn(
          "flex items-center justify-between border-b px-4 py-2.5 z-20 relative",
          isDark ? "bg-neutral-950 border-neutral-800" : "bg-white border-slate-200"
        )}>
          {/* Left Section - Navigation */}
          <div className="flex items-center gap-3">
            {/* Back to Dashboard */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/dashboard">
                  <Button variant="ghost" size="icon" className={cn("h-8 w-8", isDark && "hover:bg-neutral-800")}>
                    <LayoutDashboard className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>Dashboard</TooltipContent>
            </Tooltip>

            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm">
              <Link href="/dashboard" className={cn("text-muted-foreground hover:text-foreground transition-colors", isDark ? "hover:text-white" : "")}>
                <Home className="h-3.5 w-3.5" />
              </Link>
              <span className="text-muted-foreground/50">/</span>
              {isEditingTitle ? (
                <div className="flex items-center gap-1">
                  <Input
                    ref={titleInputRef}
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSaveTitle}
                    className={cn(
                      "h-7 text-sm font-medium px-2 py-0 w-[200px]",
                      isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-slate-300"
                    )}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleSaveTitle}
                  >
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              ) : (
                <button
                  onClick={handleStartEditTitle}
                  className={cn(
                    "flex items-center gap-1.5 font-medium truncate max-w-[200px] hover:opacity-80 transition-opacity group",
                    isDark ? "text-white" : "text-slate-900"
                  )}
                >
                  <span>{currentDocument.title || 'Untitled'}</span>
                  <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Mode Switcher - Hidden, documents and diagrams are now separate */}
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            {/* AI Assistant Button - Only for diagrams */}
            {isDiagram && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={rightSidebarOpen ? "secondary" : "ghost"}
                    size="sm"
                    className={cn("h-8 gap-1.5", isDark && "hover:bg-neutral-800")}
                    onClick={() => {
                      setRightSidebarTab('ai')
                    }}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">AI</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>AI Assistant</TooltipContent>
              </Tooltip>
            )}

            <Button variant="ghost" size="sm" className={cn("h-8 w-8 px-0", isDark && "hover:bg-neutral-800")}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button size="sm" className="h-8 bg-linear-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001] text-white gap-2 px-3">
              <Play className="h-3.5 w-3.5 fill-current" />
              Present
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Editor Content */}
          <div className={cn("relative flex-1", mode === 'document' ? "overflow-y-auto" : "overflow-hidden", isDark ? "bg-neutral-900" : "bg-slate-50")}>
            {mode === 'document' ? (
              <DocumentEditorV2 />
            ) : (
              <>
                <div className="absolute inset-0 z-0">
                  <DiagramEditor />
                </div>

                <div className="pointer-events-none absolute inset-0 z-10">
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
                    <div className="pointer-events-auto">
                      <ShapeLibrary />
                    </div>
                    <div className="pointer-events-auto">
                      <DiagramToolbar />
                    </div>
                    <div className="pointer-events-auto">
                      <ZoomControls />
                    </div>
                  </div>

                  <div className="absolute right-3 top-20 pointer-events-auto">
                    <PropertiesPanel />
                  </div>

                  <div className="absolute right-3 bottom-3 pointer-events-auto">
                    <MiniMap width={240} height={160} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right Sidebar - Only for diagrams */}
          {isDiagram && <RightSidebarNew />}
        </div>
      </div>
    </TooltipProvider>
  )
}
