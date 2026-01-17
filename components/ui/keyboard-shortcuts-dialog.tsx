'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Keyboard } from 'lucide-react'
import {
  shortcuts,
  formatShortcut,
  categoryLabels,
  getShortcutsByCategory,
} from '@/lib/keyboard-shortcuts'
import { modalOverlay, modalContent } from '@/lib/animations'
import { cn } from '@/lib/utils'

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  const shortcutsByCategory = getShortcutsByCategory()

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            variants={modalOverlay}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Dialog */}
          <motion.div
            variants={modalContent}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10">
                    <Keyboard className="h-5 w-5 text-orange-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                    Keyboard Shortcuts
                  </h2>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(shortcutsByCategory).map(([category, categoryShortcuts]) => (
                    <div key={category}>
                      <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
                        {categoryLabels[category] || category}
                      </h3>
                      <div className="space-y-2">
                        {categoryShortcuts.map((shortcut, index) => (
                          <div
                            key={`${shortcut.action}-${index}`}
                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                          >
                            <span className="text-sm text-zinc-700 dark:text-zinc-300">
                              {shortcut.description}
                            </span>
                            <kbd className="inline-flex items-center gap-1 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-mono rounded border border-zinc-200 dark:border-zinc-700 shadow-sm">
                              {formatShortcut(shortcut)}
                            </kbd>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-gray-200 dark:border-zinc-800">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                  Press <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-xs font-mono">?</kbd> anywhere to show this dialog
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Kbd component for displaying keyboard shortcuts inline
interface KbdProps {
  children: React.ReactNode
  className?: string
}

export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5',
        'bg-zinc-100 dark:bg-zinc-800',
        'text-zinc-600 dark:text-zinc-400',
        'text-xs font-mono font-medium',
        'rounded border border-zinc-200 dark:border-zinc-700',
        'shadow-sm',
        className
      )}
    >
      {children}
    </kbd>
  )
}

// Shortcut hint component
interface ShortcutHintProps {
  shortcut: string
  className?: string
}

export function ShortcutHint({ shortcut, className }: ShortcutHintProps) {
  return (
    <span
      className={cn(
        'ml-auto text-xs text-zinc-400 dark:text-zinc-500',
        className
      )}
    >
      <Kbd>{shortcut}</Kbd>
    </span>
  )
}
