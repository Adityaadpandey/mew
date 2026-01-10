'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useCanvasStore, useDocumentStore } from './store'

// Debounce hook
export function useDebounce<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args)
      }, delay)
    },
    [callback, delay]
  ) as T

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return debouncedCallback
}

// Debounce value hook (for debouncing values instead of callbacks)
export function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Auto-save hook for unified persistence
export function useAutoSave() {
  const { objects, connections, lastModified: canvasLastModified } = useCanvasStore()
  const { currentDocument, updateContent, setIsSaving, isDirty } = useDocumentStore()
  const lastSavedRef = useRef<number>(0)
  const isSavingRef = useRef(false)

  // 1. Sync Canvas changes to Document Store
  useEffect(() => {
    if (canvasLastModified > lastSavedRef.current) {
      // Update document store with new canvas data immediately so it's ready for save
      updateContent({ objects, connections })
    }
  }, [canvasLastModified, objects, connections, updateContent])


  // 2. Main Save Function - reads from Document Store (Source of Truth)
  const saveDocument = useCallback(async () => {
    // Get fresh state
    const doc = useDocumentStore.getState().currentDocument
    if (!doc?.id || isSavingRef.current) return

    isSavingRef.current = true
    setIsSaving(true)

    try {
      // Send the FULL content object to ensure nothing is lost during partial updates
      // Prisma/Backend usually expects the full JSON to replace the field
      const response = await fetch(`/api/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: doc.content
        }),
      })

      if (response.ok) {
        lastSavedRef.current = Date.now()
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }, [setIsSaving])

  const debouncedSave = useDebounce(saveDocument, 2000)

  // 3. Trigger Save on any structural change (Canvas OR Document Dirty)
  // We watch 'isDirty' (set by DocumentEditor) and 'canvasLastModified'
  useEffect(() => {
    // If canvas changed OR doc is marked dirty (by editor)
    if (canvasLastModified > lastSavedRef.current || isDirty) {
      debouncedSave()
    }
  }, [canvasLastModified, isDirty, debouncedSave])

  // Reset on doc switch
  useEffect(() => {
    lastSavedRef.current = Date.now()
  }, [currentDocument?.id])

  return { saveNow: saveDocument }
}

// Load document content hook
export function useLoadDocument() {
  const { currentDocument, setCurrentDocument } = useDocumentStore()
  const { loadCanvas, clearCanvas } = useCanvasStore()
  const loadedDocRef = useRef<string | null>(null)

  useEffect(() => {
    const loadDocumentContent = async () => {
      if (!currentDocument?.id || loadedDocRef.current === currentDocument.id) return

      try {
        const response = await fetch(`/api/documents/${currentDocument.id}`)
        if (response.ok) {
          const doc = await response.json()
          loadedDocRef.current = currentDocument.id

          // Update document store with full content
          setCurrentDocument({
            id: doc.id,
            title: doc.title,
            type: doc.type,
            content: doc.content || {},
          })

          // Load canvas content if it's a diagram
          if (doc.type === 'DIAGRAM' && doc.content) {
            const content = doc.content as { objects?: unknown[]; connections?: unknown[] }
            loadCanvas(
              (content.objects || []) as Parameters<typeof loadCanvas>[0],
              (content.connections || []) as Parameters<typeof loadCanvas>[1]
            )
          } else {
            clearCanvas()
          }
        }
      } catch (error) {
        console.error('Failed to load document:', error)
      }
    }

    loadDocumentContent()
  }, [currentDocument?.id, setCurrentDocument, loadCanvas, clearCanvas])
}
