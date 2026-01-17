/**
 * Keyboard Shortcuts System
 * Global keyboard shortcuts for the application
 */

export type ShortcutAction =
  | 'search'
  | 'newProject'
  | 'newTask'
  | 'newDocument'
  | 'goHome'
  | 'goProjects'
  | 'goTasks'
  | 'goSettings'
  | 'toggleSidebar'
  | 'save'
  | 'undo'
  | 'redo'
  | 'escape'
  | 'help'
  | 'notifications'
  | 'quickSwitch'

export interface Shortcut {
  key: string
  ctrl?: boolean
  meta?: boolean // cmd on Mac
  shift?: boolean
  alt?: boolean
  description: string
  action: ShortcutAction
  category: 'navigation' | 'actions' | 'editing' | 'general'
}

// Detect if user is on Mac
export const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

// Get modifier key label
export const getModifierLabel = (useMeta: boolean = true): string => {
  return isMac && useMeta ? '⌘' : 'Ctrl'
}

// Format shortcut for display
export function formatShortcut(shortcut: Shortcut): string {
  const parts: string[] = []

  if (shortcut.ctrl || shortcut.meta) {
    parts.push(isMac ? '⌘' : 'Ctrl')
  }
  if (shortcut.alt) {
    parts.push(isMac ? '⌥' : 'Alt')
  }
  if (shortcut.shift) {
    parts.push(isMac ? '⇧' : 'Shift')
  }

  // Format the key
  let keyLabel = shortcut.key.toUpperCase()
  if (keyLabel === 'ESCAPE') keyLabel = 'Esc'
  if (keyLabel === 'ARROWUP') keyLabel = '↑'
  if (keyLabel === 'ARROWDOWN') keyLabel = '↓'
  if (keyLabel === 'ARROWLEFT') keyLabel = '←'
  if (keyLabel === 'ARROWRIGHT') keyLabel = '→'
  if (keyLabel === 'ENTER') keyLabel = '↵'
  if (keyLabel === 'BACKSPACE') keyLabel = '⌫'
  if (keyLabel === ' ') keyLabel = 'Space'

  parts.push(keyLabel)

  return parts.join(isMac ? '' : '+')
}

// Global shortcuts configuration
export const shortcuts: Shortcut[] = [
  // Navigation
  {
    key: 'k',
    meta: true,
    description: 'Open search / command palette',
    action: 'search',
    category: 'navigation',
  },
  {
    key: 'h',
    meta: true,
    shift: true,
    description: 'Go to home',
    action: 'goHome',
    category: 'navigation',
  },
  {
    key: 'p',
    meta: true,
    shift: true,
    description: 'Go to projects',
    action: 'goProjects',
    category: 'navigation',
  },
  {
    key: 'b',
    meta: true,
    description: 'Toggle sidebar',
    action: 'toggleSidebar',
    category: 'navigation',
  },
  {
    key: 'o',
    meta: true,
    description: 'Quick switch between projects',
    action: 'quickSwitch',
    category: 'navigation',
  },

  // Actions
  {
    key: 'n',
    meta: true,
    description: 'New project',
    action: 'newProject',
    category: 'actions',
  },
  {
    key: 't',
    meta: true,
    shift: true,
    description: 'New task',
    action: 'newTask',
    category: 'actions',
  },
  {
    key: 'd',
    meta: true,
    shift: true,
    description: 'New document',
    action: 'newDocument',
    category: 'actions',
  },
  {
    key: 'n',
    meta: true,
    shift: true,
    description: 'Open notifications',
    action: 'notifications',
    category: 'actions',
  },

  // Editing
  {
    key: 's',
    meta: true,
    description: 'Save',
    action: 'save',
    category: 'editing',
  },
  {
    key: 'z',
    meta: true,
    description: 'Undo',
    action: 'undo',
    category: 'editing',
  },
  {
    key: 'z',
    meta: true,
    shift: true,
    description: 'Redo',
    action: 'redo',
    category: 'editing',
  },

  // General
  {
    key: 'Escape',
    description: 'Close modal / Cancel',
    action: 'escape',
    category: 'general',
  },
  {
    key: '?',
    shift: true,
    description: 'Show keyboard shortcuts',
    action: 'help',
    category: 'general',
  },
]

// Group shortcuts by category
export function getShortcutsByCategory(): Record<string, Shortcut[]> {
  return shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, Shortcut[]>)
}

// Check if event matches shortcut
export function matchesShortcut(event: KeyboardEvent, shortcut: Shortcut): boolean {
  const metaOrCtrl = isMac ? event.metaKey : event.ctrlKey

  if ((shortcut.meta || shortcut.ctrl) && !metaOrCtrl) return false
  if (shortcut.shift && !event.shiftKey) return false
  if (shortcut.alt && !event.altKey) return false

  // Normalize key comparison
  const eventKey = event.key.toLowerCase()
  const shortcutKey = shortcut.key.toLowerCase()

  return eventKey === shortcutKey
}

// Find matching shortcut for event
export function findMatchingShortcut(event: KeyboardEvent): Shortcut | undefined {
  return shortcuts.find(shortcut => matchesShortcut(event, shortcut))
}

// Category labels
export const categoryLabels: Record<string, string> = {
  navigation: 'Navigation',
  actions: 'Actions',
  editing: 'Editing',
  general: 'General',
}
