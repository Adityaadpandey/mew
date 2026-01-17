'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  findMatchingShortcut,
  ShortcutAction,
  type Shortcut,
} from '@/lib/keyboard-shortcuts'

interface UseKeyboardShortcutsOptions {
  onSearch?: () => void
  onNewProject?: () => void
  onNewTask?: () => void
  onNewDocument?: () => void
  onToggleSidebar?: () => void
  onSave?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onEscape?: () => void
  onHelp?: () => void
  onNotifications?: () => void
  onQuickSwitch?: () => void
  disabled?: boolean
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const router = useRouter()
  const { disabled = false } = options

  const handleShortcut = useCallback(
    (action: ShortcutAction, event: KeyboardEvent) => {
      // Prevent default browser behavior
      event.preventDefault()

      switch (action) {
        case 'search':
          options.onSearch?.()
          break
        case 'newProject':
          options.onNewProject?.()
          break
        case 'newTask':
          options.onNewTask?.()
          break
        case 'newDocument':
          options.onNewDocument?.()
          break
        case 'goHome':
          router.push('/dashboard')
          break
        case 'goProjects':
          router.push('/dashboard?view=projects')
          break
        case 'goSettings':
          router.push('/settings/billing')
          break
        case 'toggleSidebar':
          options.onToggleSidebar?.()
          break
        case 'save':
          options.onSave?.()
          break
        case 'undo':
          options.onUndo?.()
          break
        case 'redo':
          options.onRedo?.()
          break
        case 'escape':
          options.onEscape?.()
          break
        case 'help':
          options.onHelp?.()
          break
        case 'notifications':
          options.onNotifications?.()
          break
        case 'quickSwitch':
          options.onQuickSwitch?.()
          break
      }
    },
    [router, options]
  )

  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Only allow escape in inputs
        if (event.key !== 'Escape') {
          return
        }
      }

      const matchedShortcut = findMatchingShortcut(event)
      if (matchedShortcut) {
        handleShortcut(matchedShortcut.action, event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [disabled, handleShortcut])
}

// Hook for single shortcut
export function useShortcut(
  shortcut: Partial<Shortcut> & { key: string },
  callback: () => void,
  deps: React.DependencyList = []
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        if (event.key !== 'Escape') return
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const metaOrCtrl = isMac ? event.metaKey : event.ctrlKey

      if ((shortcut.meta || shortcut.ctrl) && !metaOrCtrl) return
      if (shortcut.shift && !event.shiftKey) return
      if (shortcut.alt && !event.altKey) return

      if (event.key.toLowerCase() === shortcut.key.toLowerCase()) {
        event.preventDefault()
        callback()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcut.key, shortcut.meta, shortcut.ctrl, shortcut.shift, shortcut.alt, ...deps])
}
