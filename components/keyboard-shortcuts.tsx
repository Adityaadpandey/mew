'use client'

import { useEffect, useState } from 'react'
import { Keyboard } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Shortcut {
  keys: string[]
  description: string
}

interface ShortcutGroup {
  name: string
  shortcuts: Shortcut[]
}

const shortcutGroups: ShortcutGroup[] = [
  {
    name: 'General',
    shortcuts: [
      { keys: ['⌘', 'K'], description: 'Open search' },
      { keys: ['⌘', 'N'], description: 'New document' },
      { keys: ['⌘', 'S'], description: 'Save' },
      { keys: ['⌘', '/'], description: 'Show shortcuts' },
    ],
  },
  {
    name: 'Editing',
    shortcuts: [
      { keys: ['⌘', 'Z'], description: 'Undo' },
      { keys: ['⌘', '⇧', 'Z'], description: 'Redo' },
      { keys: ['⌘', 'C'], description: 'Copy' },
      { keys: ['⌘', 'V'], description: 'Paste' },
      { keys: ['⌘', 'X'], description: 'Cut' },
      { keys: ['⌘', 'D'], description: 'Duplicate' },
      { keys: ['⌘', 'A'], description: 'Select all' },
      { keys: ['Delete'], description: 'Delete selected' },
    ],
  },
  {
    name: 'Canvas Tools',
    shortcuts: [
      { keys: ['V'], description: 'Selection tool' },
      { keys: ['H'], description: 'Hand tool (pan)' },
      { keys: ['R'], description: 'Rectangle' },
      { keys: ['O'], description: 'Circle' },
      { keys: ['L'], description: 'Line' },
      { keys: ['T'], description: 'Text' },
      { keys: ['⌘', 'G'], description: 'Group' },
      { keys: ['⌘', '⇧', 'G'], description: 'Ungroup' },
      { keys: ['⌘', ']'], description: 'Bring forward' },
      { keys: ['⌘', '['], description: 'Send backward' },
    ],
  },
  {
    name: 'View',
    shortcuts: [
      { keys: ['⌘', '0'], description: 'Zoom to fit' },
      { keys: ['⌘', '+'], description: 'Zoom in' },
      { keys: ['⌘', '-'], description: 'Zoom out' },
      { keys: ['⌘', '1'], description: 'Zoom to 100%' },
      { keys: ['⌘', '\\'], description: 'Toggle sidebar' },
      { keys: ['⌘', '.'], description: 'Toggle grid' },
    ],
  },
  {
    name: 'Comments',
    shortcuts: [
      { keys: ['⌘', '⌥', 'M'], description: 'Add comment' },
      { keys: ['⌘', 'Enter'], description: 'Post comment' },
      { keys: ['Esc'], description: 'Close modal / Deselect' },
    ],
  },
]

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid grid-cols-2 gap-6">
            {shortcutGroups.map((group) => (
              <div key={group.name}>
                <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                  {group.name}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{shortcut.description}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <kbd
                            key={keyIndex}
                            className="min-w-[24px] rounded border bg-muted px-1.5 py-0.5 text-center text-xs font-medium"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t pt-4 text-center text-xs text-muted-foreground">
          Press <kbd className="rounded border bg-muted px-1.5 py-0.5">⌘</kbd>{' '}
          <kbd className="rounded border bg-muted px-1.5 py-0.5">/</kbd> to toggle this dialog
        </div>
      </DialogContent>
    </Dialog>
  )
}
