'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef } from 'react'

interface InlineMarkdownProps {
  content: string
  className?: string
  placeholder?: string
  isDark: boolean
  onChange: (value: string) => void
  onKeyDown?: (e: React.KeyboardEvent) => void
  onFocus?: () => void
  onSelect?: () => void
  onPaste?: (e: React.ClipboardEvent) => void
  rows?: number
}

export function InlineMarkdown({
  content,
  className,
  placeholder,
  isDark,
  onChange,
  onKeyDown,
  onFocus,
  onSelect,
  onPaste,
  rows = 1
}: InlineMarkdownProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Auto-resize
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.max(24, textarea.scrollHeight) + 'px'
    }
  }, [content])

  // Render markdown preview
  const renderPreview = (text: string) => {
    return text
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code class="inline-code bg-neutral-100 dark:bg-neutral-800 text-pink-600 dark:text-pink-400 rounded px-1.5 py-0.5 text-sm font-mono">$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 underline hover:no-underline" target="_blank" rel="noopener">$1</a>')
      // Strikethrough
      .replace(/~~(.*?)~~/g, '<del class="text-neutral-500">$1</del>')
  }

  const hasMarkdown = /(\*\*|__|`|\[.*\]\(.*\)|~~)/.test(content)

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onSelect={onSelect}
        onPaste={onPaste}
        placeholder={placeholder}
        className={cn(
          "w-full bg-transparent border-none outline-none resize-none font-inherit",
          hasMarkdown && "opacity-0",
          className
        )}
        rows={rows}
      />
      
      {hasMarkdown && (
        <div
          ref={previewRef}
          className={cn(
            "absolute inset-0 pointer-events-none whitespace-pre-wrap break-words",
            className
          )}
          dangerouslySetInnerHTML={{ __html: renderPreview(content) }}
        />
      )}
    </div>
  )
}