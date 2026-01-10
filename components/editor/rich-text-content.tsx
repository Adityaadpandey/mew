'use client'

import { cn } from '@/lib/utils'
import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { Block, CursorPosition, plainText, RichTextSegment, segmentsToText, textToSegments } from './types'

interface RichTextContentProps {
  block: Block
  className?: string
  placeholder?: string
  isFocused: boolean
  isDark: boolean
  onContentChange: (newContent: RichTextSegment[]) => void
  onCursorChange?: (pos: CursorPosition) => void
  onEnter: (cursorPos: CursorPosition) => void
  onBackspaceAtStart: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onFocus: () => void
  onBlur: () => void
  onPaste?: (e: React.ClipboardEvent) => void
}

/**
 * Rich Text Content Editor
 * Renders RichTextSegment[] as styled spans with contentEditable
 * This is the core WYSIWYG component that makes text look formatted while editing
 */
export function RichTextContent({
  block,
  className,
  placeholder = 'Type something...',
  isFocused,
  isDark,
  onContentChange,
  onCursorChange,
  onEnter,
  onBackspaceAtStart,
  onArrowUp,
  onArrowDown,
  onFocus,
  onBlur,
  onPaste,
}: RichTextContentProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isComposing = useRef(false)

  // Get plain text for cursor calculations
  const plainTextContent = useMemo(() => segmentsToText(block.content), [block.content])
  const isEmpty = plainTextContent === ''

  // Focus management
  useEffect(() => {
    if (isFocused && editorRef.current && document.activeElement !== editorRef.current) {
      editorRef.current.focus()
      // Move cursor to end
      const range = document.createRange()
      const sel = window.getSelection()
      range.selectNodeContents(editorRef.current)
      range.collapse(false)
      sel?.removeAllRanges()
      sel?.addRange(range)
    }
  }, [isFocused])

  // Get current cursor position
  const getCursorPosition = useCallback((): CursorPosition | null => {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount || !editorRef.current) return null

    const range = selection.getRangeAt(0)

    // Calculate offset from start of content
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(editorRef.current)
    preCaretRange.setEnd(range.startContainer, range.startOffset)
    const offset = preCaretRange.toString().length

    // Map offset to segment + char position
    let currentOffset = 0
    for (let i = 0; i < block.content.length; i++) {
      const segmentLength = block.content[i].text.length
      if (currentOffset + segmentLength >= offset) {
        return {
          blockId: block.id,
          segmentIndex: i,
          charOffset: offset - currentOffset
        }
      }
      currentOffset += segmentLength
    }

    // Cursor at end
    return {
      blockId: block.id,
      segmentIndex: block.content.length - 1,
      charOffset: block.content[block.content.length - 1].text.length
    }
  }, [block])

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isComposing.current) return

    // Enter - split block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const pos = getCursorPosition()
      if (pos) {
        onEnter(pos)
      }
      return
    }

    // Backspace at start - merge with previous
    if (e.key === 'Backspace') {
      const pos = getCursorPosition()
      if (pos && pos.segmentIndex === 0 && pos.charOffset === 0) {
        const selection = window.getSelection()
        if (selection && selection.isCollapsed) {
          e.preventDefault()
          onBackspaceAtStart()
          return
        }
      }
    }

    // Arrow key navigation between blocks
    if (e.key === 'ArrowUp' && onArrowUp) {
      const selection = window.getSelection()
      if (selection && selection.isCollapsed) {
        const pos = getCursorPosition()
        if (pos && pos.segmentIndex === 0 && pos.charOffset === 0) {
          e.preventDefault()
          onArrowUp()
          return
        }
      }
    }

    if (e.key === 'ArrowDown' && onArrowDown) {
      const selection = window.getSelection()
      if (selection && selection.isCollapsed) {
        const pos = getCursorPosition()
        const lastSeg = block.content.length - 1
        if (pos && pos.segmentIndex === lastSeg && pos.charOffset === block.content[lastSeg].text.length) {
          e.preventDefault()
          onArrowDown()
          return
        }
      }
    }
  }, [getCursorPosition, onEnter, onBackspaceAtStart, onArrowUp, onArrowDown, block.content])

  // Handle content changes
  const handleInput = useCallback(() => {
    if (!editorRef.current || isComposing.current) return

    const text = editorRef.current.innerText || ''

    // For now, convert to plain text segment
    // A more sophisticated implementation would preserve marks during editing
    const newContent: RichTextSegment[] = text ? [plainText(text)] : [plainText('')]
    onContentChange(newContent)
  }, [onContentChange])

  // Render segments as styled spans
  const renderSegments = () => {
    if (isEmpty) {
      return null // Placeholder shown via CSS
    }

    // Defensive normalization
    const segments: RichTextSegment[] = Array.isArray(block.content) ? block.content : textToSegments(block.content as any)

    return segments.map((segment, i) => {
      const markClasses = getMarkClasses(segment.marks, isDark)

      if (segment.link) {
        return (
          <a
            key={i}
            href={segment.link}
            className={cn('text-blue-500 underline cursor-pointer', markClasses)}
            target="_blank"
            rel="noopener noreferrer"
          >
            {segment.text}
          </a>
        )
      }

      return (
        <span key={i} className={markClasses}>
          {segment.text}
        </span>
      )
    })
  }

  return (
    <div
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning
      className={cn(
        'outline-none min-h-[1.5em] w-full',
        isEmpty && 'before:content-[attr(data-placeholder)] before:text-neutral-400 before:pointer-events-none before:absolute',
        className
      )}
      data-placeholder={placeholder}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      onCompositionStart={() => { isComposing.current = true }}
      onCompositionEnd={() => {
        isComposing.current = false
        handleInput()
      }}
      onPaste={(e) => {
        if (onPaste) {
           onPaste(e)
        }
      }}
      dangerouslySetInnerHTML={{ __html: renderToHTML(block.content) }}
    />
  )
}

/**
 * Get Tailwind classes for marks
 */
function getMarkClasses(marks: RichTextSegment['marks'], isDark: boolean): string {
  const classes: string[] = []

  if (marks?.includes('bold')) classes.push('font-bold')
  if (marks?.includes('italic')) classes.push('italic')
  if (marks?.includes('code')) classes.push('font-mono bg-neutral-100 dark:bg-neutral-800 text-red-500 rounded px-1 py-0.5 text-sm')
  if (marks?.includes('underline')) classes.push('underline')
  if (marks?.includes('strike')) classes.push('line-through')

  return classes.join(' ')
}

/**
 * Render segments to HTML string (for dangerouslySetInnerHTML)
 */
function renderToHTML(content: RichTextSegment[] | string): string {
  // Defensive normalization
  const segments: RichTextSegment[] = Array.isArray(content) ? content : textToSegments(content)

  if (segments.length === 0 || (segments.length === 1 && segments[0].text === '')) {
    return ''
  }

  return segments.map(segment => {
    let html = escapeHTML(segment.text)

    // Apply marks as HTML tags
    if (segment.marks?.includes('bold')) html = `<strong>${html}</strong>`
    if (segment.marks?.includes('italic')) html = `<em>${html}</em>`
    if (segment.marks?.includes('code')) html = `<code class="font-mono bg-neutral-100 dark:bg-neutral-800 text-red-500 rounded px-1 py-0.5 text-sm">${html}</code>`
    if (segment.marks?.includes('underline')) html = `<u>${html}</u>`
    if (segment.marks?.includes('strike')) html = `<del>${html}</del>`

    if (segment.link) {
      html = `<a href="${escapeHTML(segment.link)}" class="text-blue-500 underline" target="_blank" rel="noopener noreferrer">${html}</a>`
    }

    return html
  }).join('')
}

/**
 * Escape HTML special characters
 */
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default RichTextContent
