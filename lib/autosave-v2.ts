/**
 * Autosave System V2 - Simplified and Reliable
 * 
 * Core principles:
 * 1. Simple debouncing with useEffect
 * 2. No complex state management
 * 3. Clear separation between loading and saving
 * 4. Explicit control over when to save
 */

import { useEffect, useRef } from 'react'

export interface AutosaveConfig {
  /** Debounce delay in milliseconds */
  debounceMs: number
  /** Called when save starts */
  onSaveStart?: () => void
  /** Called when save succeeds */
  onSaveSuccess?: (data: unknown) => void
  /** Called when save fails */
  onSaveError?: (error: Error) => void
}

/**
 * Simple autosave hook that saves content after debounce period
 * 
 * @param content - Content to save (must be serializable)
 * @param saveFunction - Async function that saves the content
 * @param enabled - Whether autosave is enabled (use to disable during loading)
 * @param config - Configuration options
 */
export function useAutosaveV2<T>(
  content: T,
  saveFunction: (content: T) => Promise<unknown>,
  enabled: boolean,
  config: AutosaveConfig
) {
  const { debounceMs, onSaveStart, onSaveSuccess, onSaveError } = config
  
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const isSavingRef = useRef<boolean>(false)
  const contentRef = useRef<T>(content)
  const isFirstRenderRef = useRef<boolean>(true)
  
  // Update content ref
  contentRef.current = content
  
  useEffect(() => {
    // Skip first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    
    // Skip if disabled
    if (!enabled) {
      return
    }
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) return
      
      try {
        isSavingRef.current = true
        if (onSaveStart) onSaveStart()
        
        const result = await saveFunction(contentRef.current)
        
        if (onSaveSuccess) onSaveSuccess(result)
      } catch (error) {
        if (onSaveError) onSaveError(error instanceof Error ? error : new Error('Save failed'))
      } finally {
        isSavingRef.current = false
      }
    }, debounceMs)
    
    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, enabled, debounceMs])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
}
