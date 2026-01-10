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

// Auto-save hook for canvas changes
export function useAutoSave() {
  const { objects, connections, lastModified } = useCanvasStore()
  const { currentDocument, setIsSaving } = useDocumentStore()
  const lastSavedRef = useRef<number>(0)
  const isSavingRef = useRef(false)

  const saveDocument = useCallback(async () => {
    if (!currentDocument?.id || isSavingRef.current) return
    if (lastModified === 0 || lastModified <= lastSavedRef.current) return

    isSavingRef.current = true
    setIsSaving(true)

    try {
      const response = await fetch(`/api/documents/${currentDocument.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { objects, connections },
        }),
      })

      if (response.ok) {
        lastSavedRef.current = lastModified
      }
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      isSavingRef.current = false
      setIsSaving(false)
    }
  }, [currentDocument?.id, objects, connections, lastModified, setIsSaving])

  const debouncedSave = useDebounce(saveDocument, 1500)

  // Trigger save when canvas changes
  useEffect(() => {
    if (lastModified > 0 && lastModified > lastSavedRef.current) {
      debouncedSave()
    }
  }, [lastModified, debouncedSave])

  // Reset lastSaved when document changes
  useEffect(() => {
    lastSavedRef.current = 0
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
