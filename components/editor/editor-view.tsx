'use client'

import { DashboardHome } from '@/components/dashboard/dashboard-home'
import { Button } from '@/components/ui/button'
import { useAutoSave, useLoadDocument } from '@/lib/hooks'
import { useDocumentStore } from '@/lib/store'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { FileText, GitBranch, Play, Share2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DiagramCanvas } from './diagram-canvas'
import { DiagramToolbar } from './diagram-toolbar'
import { DocumentEditor } from './document-editor'
import { MiniMap } from './mini-map'
import { PropertiesPanel } from './properties-panel'
import { ShapeLibrary } from './shape-library'
import { ZoomControls } from './zoom-controls'

type EditorMode = 'document' | 'diagram'

export function EditorView({
  documentId: propDocumentId,
  forcedMode
}: {
  documentId?: string
  forcedMode?: EditorMode
}) {
  const [mode, setMode] = useState<EditorMode>(forcedMode || 'diagram')
  const { currentDocument, setCurrentDocument } = useDocumentStore()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useAutoSave()
  useLoadDocument()

  const searchParams = useSearchParams()
  const documentId = propDocumentId || searchParams.get('documentId')

  useEffect(() => {
    if (forcedMode) setMode(forcedMode)
  }, [forcedMode])

  useEffect(() => {
    if (documentId && documentId !== currentDocument?.id) {
      // Set partial doc to trigger useLoadDocument
      setCurrentDocument({
        id: documentId,
        title: 'Loading...',
        type: 'DIAGRAM', // Default, will be overwritten by load
        content: {},
      })
    } else if (!documentId && currentDocument) {
      setCurrentDocument(null)
    }
  }, [documentId, setCurrentDocument])

  if (!currentDocument) {
    return <DashboardHome />
  }

  return (
    <div className={cn("flex h-screen flex-col overflow-hidden", isDark ? "bg-black" : "bg-white")}>
      {/* Top Bar */}
      <div className={cn(
        "flex items-center justify-between border-b px-4 py-2 z-20 relative",
        isDark ? "bg-neutral-950 border-neutral-800" : "bg-white border-slate-200"
      )}>
        <div className="flex items-center gap-4">
          {/* Mode Switcher - Only show if not forced */}
          {!forcedMode && (
            <div className={cn("flex items-center rounded-lg p-0.5", isDark ? "bg-neutral-900" : "bg-slate-100")}>
            <button
              onClick={() => setMode('document')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                mode === 'document'
                  ? isDark ? "bg-neutral-800 text-white shadow" : "bg-white text-slate-900 shadow"
                  : isDark ? "text-neutral-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              Document
            </button>
            <button
              onClick={() => setMode('diagram')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                mode === 'diagram'
                  ? isDark ? "bg-neutral-800 text-white shadow" : "bg-white text-slate-900 shadow"
                  : isDark ? "text-neutral-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
              )}
            >
              <GitBranch className="h-3.5 w-3.5" />
              Diagram
            </button>
          </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className={cn("h-8 w-8 px-0", isDark && "hover:bg-neutral-800")}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700 text-white gap-2 px-3">
            <Play className="h-3.5 w-3.5 fill-current" />
            Present
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className={cn("relative flex-1", mode === 'document' ? "overflow-y-auto" : "overflow-hidden", isDark ? "bg-neutral-900" : "bg-slate-50")}>
        {mode === 'document' ? (
          <DocumentEditor />
        ) : (
          <>
            <div className="absolute inset-0 z-0">
              <DiagramCanvas />
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
    </div>
  )
}
