'use client'

import { useEffect, useState, useCallback } from 'react'
import { useDocumentStore, useCanvasStore, CanvasObject, Connection } from '@/lib/store'
import { useAutosaveV2 } from '@/lib/autosave-v2'
import { DiagramCanvas } from './diagram-canvas'
import { Loader2, Check, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function DiagramEditor() {
  const { currentDocument, setCurrentDocument } = useDocumentStore()
  const { objects, connections, loadCanvas } = useCanvasStore()
  
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [saveError, setSaveError] = useState<string | null>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  // Load diagram on mount
  useEffect(() => {
    const loadDiagram = async () => {
      if (!currentDocument?.id) {
        setIsLoading(false)
        return
      }
      
      // If already loaded (not "Loading..."), skip
      if (currentDocument.title !== 'Loading...') {
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      
      try {
        const response = await fetch(`/api/diagrams/${currentDocument.id}`)
        
        if (!response.ok) {
          throw new Error('Failed to load diagram')
        }
        
        const diagram = await response.json()
        
        // Load into canvas store
        const content = diagram.content as { objects?: CanvasObject[]; connections?: Connection[] }
        loadCanvas(content.objects || [], content.connections || [])
        
        // Update document store with metadata
        setCurrentDocument({
          id: diagram.id,
          title: diagram.title,
          type: diagram.type,
          content: {}, // Empty for diagrams
          updatedAt: diagram.updatedAt ? new Date(diagram.updatedAt) : undefined,
        })
        
        console.log('✅ Diagram loaded:', {
          id: diagram.id,
          objects: content.objects?.length || 0,
          connections: content.connections?.length || 0,
        })
      } catch (error) {
        console.error('❌ Failed to load diagram:', error)
      } finally {
        // Wait a bit before enabling autosave
        setTimeout(() => {
          setIsLoading(false)
        }, 500)
      }
    }
    
    loadDiagram()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDocument?.id])
  
  // Save function
  const saveDiagram = useCallback(async () => {
    if (!currentDocument?.id) {
      throw new Error('No diagram to save')
    }
    
    console.log('💾 Saving diagram:', {
      id: currentDocument.id,
      objects: objects.length,
      connections: connections.length,
    })
    
    const response = await fetch(`/api/diagrams/${currentDocument.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: {
          objects,
          connections,
        },
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to save')
    }
    
    const result = await response.json()
    
    // Update updatedAt
    if (result.updatedAt) {
      setCurrentDocument({
        ...currentDocument,
        updatedAt: new Date(result.updatedAt),
      })
    }
    
    console.log('✅ Diagram saved')
    return result
  }, [currentDocument, objects, connections, setCurrentDocument])
  
  // Autosave hook
  useAutosaveV2(
    { objects, connections }, // Content to watch
    saveDiagram, // Save function
    !isLoading && !!currentDocument?.id, // Only enable after loading
    {
      debounceMs: 2000, // 2 second debounce
      onSaveStart: () => {
        setSaveStatus('saving')
        setSaveError(null)
      },
      onSaveSuccess: () => {
        setSaveStatus('saved')
        setLastSaved(new Date())
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000)
      },
      onSaveError: (error) => {
        setSaveStatus('error')
        setSaveError(error.message)
      },
    }
  )
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-neutral-400" />
          <p className="text-sm text-neutral-500">Loading diagram...</p>
        </div>
      </div>
    )
  }
  
  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-neutral-500">No diagram selected</p>
      </div>
    )
  }
  
  return (
    <div className="relative h-full">
      {/* Save status indicator */}
      <div className="absolute top-4 right-4 z-10">
        <SaveStatusBadge
          status={saveStatus}
          lastSaved={lastSaved}
          error={saveError}
          onRetry={saveDiagram}
        />
      </div>
      
      {/* Canvas */}
      <DiagramCanvas />
    </div>
  )
}

interface SaveStatusBadgeProps {
  status: SaveStatus
  lastSaved: Date | null
  error: string | null
  onRetry: () => void
}

function SaveStatusBadge({ status, lastSaved, error, onRetry }: SaveStatusBadgeProps) {
  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...'
      case 'saved':
        return 'Saved'
      case 'error':
        return error || 'Save failed'
      case 'idle':
        return lastSaved ? formatTime(lastSaved) : 'No changes'
    }
  }
  
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
        'backdrop-blur-sm border shadow-sm',
        status === 'saving' && 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
        status === 'saved' && 'bg-green-50/90 dark:bg-green-950/50 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
        status === 'error' && 'bg-red-50/90 dark:bg-red-950/50 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
        status === 'idle' && 'bg-white/90 dark:bg-neutral-800/90 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
      )}
    >
      {status === 'saving' && <Loader2 className="h-3 w-3 animate-spin" />}
      {status === 'saved' && <Check className="h-3 w-3" />}
      {status === 'error' && <AlertCircle className="h-3 w-3" />}
      {status === 'idle' && <Clock className="h-3 w-3" />}
      
      <span>{getStatusText()}</span>
      
      {status === 'error' && (
        <button
          onClick={onRetry}
          className="ml-1 underline hover:no-underline"
        >
          Retry
        </button>
      )}
    </div>
  )
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  
  if (seconds < 10) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  if (minutes < 60) return `${minutes}m ago`
  
  return date.toLocaleTimeString()
}
