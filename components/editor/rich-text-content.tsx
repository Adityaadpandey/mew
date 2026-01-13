'use client'

import { cn } from '@/lib/utils'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Block, CursorPosition, MarkType, plainText, RichTextSegment, segmentsToText, textToSegments } from './types'

interface RichTextContentProps {
  block: Block
  className?: string
  placeholder?: string
  isFocused: boolean
  isDark: boolean
  onContentChange: (newContent: RichTextSegment[]) => void
  onEnter: (cursorPos: CursorPosition) => void
  onBackspaceAtStart: () => void
  onArrowUp?: () => void
  onArrowDown?: () => void
  onFocus: () => void
  onBlur: () => void
  onPaste?: (e: React.ClipboardEvent) => void
  onSlashCommand?: (position: { top: number; left: number }) => void
  onSelectionChange?: (hasSelection: boolean, rect?: DOMRect) => void
}

/**
 * Rich Text Content Editor - Notion-like WYSIWYG editing
 */
export function RichTextContent({
  block,
  className,
  placeholder = 'Type something...',
  isFocused,
  isDark,
  onContentChange,
  onEnter,
  onBackspaceAtStart,
  onArrowUp,
  onArrowDown,
  onFocus,
  onBlur,
  onPaste,
  onSlashCommand,
  onSelectionChange,
}: RichTextContentProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const isComposing = useRef(false)
  const lastContent = useRef<string>('')
  const [showPlaceholder, setShowPlaceholder] = useState(true)

  const plainTextContent = segmentsToText(block.content)
  const isEmpty = plainTextContent === ''

  // Update placeholder visibility
  useEffect(() => {
    setShowPlaceholder(isEmpty)
  }, [isEmpty])

  // Focus management - only focus when explicitly requested
  useEffect(() => {
    if (isFocused && editorRef.current) {
      const activeEl = document.activeElement
      if (activeEl !== editorRef.current) {
        editorRef.current.focus()
        // Move cursor to end
        const range = document.createRange()
        const selection = window.getSelection()
        if (editorRef.current.childNodes.length > 0) {
          range.selectNodeContents(editorRef.current)
          range.collapse(false)
        } else {
          range.setStart(editorRef.current, 0)
          range.collapse(true)
        }
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }
  }, [isFocused])

  // Sync content when block changes externally
  useEffect(() => {
    if (editorRef.current) {
      const currentHTML = editorRef.current.innerHTML
      const newHTML = renderToHTML(block.content)
      if (currentHTML !== newHTML && !isComposing.current) {
        // Only update if content actually changed and we're not composing
        const hadFocus = document.activeElement === editorRef.current
        
        if (!hadFocus) {
          editorRef.current.innerHTML = newHTML
        }
      }
    }
  }, [block.content])

  // Get current cursor position
  const getCursorPosition = useCallback((): CursorPosition | null => {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount || !editorRef.current) return null

    const range = selection.getRangeAt(0)
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(editorRef.current)
    preCaretRange.setEnd(range.startContainer, range.startOffset)
    const offset = preCaretRange.toString().length

    // Map offset to segment + char position
    let currentOffset = 0
    const content = Array.isArray(block.content) ? block.content : textToSegments(block.content as unknown as string)
    
    for (let i = 0; i < content.length; i++) {
      const segmentLength = content[i].text.length
      if (currentOffset + segmentLength >= offset) {
        return {
          blockId: block.id,
          segmentIndex: i,
          charOffset: offset - currentOffset
        }
      }
      currentOffset += segmentLength
    }

    return {
      blockId: block.id,
      segmentIndex: Math.max(0, content.length - 1),
      charOffset: content.length > 0 ? content[content.length - 1].text.length : 0
    }
  }, [block])

  // Get selection offsets for formatting
  const getSelectionOffsets = useCallback((): { start: number; end: number } | null => {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount || !editorRef.current) return null

    const range = selection.getRangeAt(0)
    
    const startRange = range.cloneRange()
    startRange.selectNodeContents(editorRef.current)
    startRange.setEnd(range.startContainer, range.startOffset)
    const start = startRange.toString().length

    const endRange = range.cloneRange()
    endRange.selectNodeContents(editorRef.current)
    endRange.setEnd(range.endContainer, range.endOffset)
    const end = endRange.toString().length

    return { start, end }
  }, [])

  // Apply formatting mark to selection
  const applyMark = useCallback((mark: MarkType) => {
    const offsets = getSelectionOffsets()
    if (!offsets || offsets.start === offsets.end) return

    const { start, end } = offsets
    const content = Array.isArray(block.content) ? block.content : textToSegments(block.content as unknown as string)
    
    // Check if mark is already applied to entire selection
    let markApplied = true
    let currentOffset = 0
    
    for (const segment of content) {
      const segEnd = currentOffset + segment.text.length
      if (segEnd > start && currentOffset < end) {
        if (!segment.marks.includes(mark)) {
          markApplied = false
          break
        }
      }
      currentOffset = segEnd
    }

    // Build new segments
    const newContent: RichTextSegment[] = []
    currentOffset = 0

    for (const segment of content) {
      const segStart = currentOffset
      const segEnd = currentOffset + segment.text.length

      if (segEnd <= start || segStart >= end) {
        // Outside selection
        newContent.push({ ...segment })
      } else {
        // Part before selection
        if (segStart < start) {
          newContent.push({
            ...segment,
            text: segment.text.slice(0, start - segStart)
          })
        }

        // Selected part
        const selStart = Math.max(0, start - segStart)
        const selEnd = Math.min(segment.text.length, end - segStart)
        const selectedPart = segment.text.slice(selStart, selEnd)

        if (selectedPart) {
          const newMarks = markApplied
            ? segment.marks.filter(m => m !== mark)
            : [...new Set([...segment.marks, mark])]

          newContent.push({
            ...segment,
            text: selectedPart,
            marks: newMarks
          })
        }

        // Part after selection
        if (segEnd > end) {
          newContent.push({
            ...segment,
            text: segment.text.slice(end - segStart)
          })
        }
      }
      currentOffset = segEnd
    }

    // Merge adjacent segments with same marks
    const merged = mergeAdjacentSegments(newContent)
    onContentChange(merged.length > 0 ? merged : [plainText('')])
  }, [block.content, getSelectionOffsets, onContentChange])

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (isComposing.current) return

    // Formatting shortcuts
    if (e.metaKey || e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault()
          applyMark('bold')
          return
        case 'i':
          e.preventDefault()
          applyMark('italic')
          return
        case 'u':
          e.preventDefault()
          applyMark('underline')
          return
        case 'e':
          e.preventDefault()
          applyMark('code')
          return
      }
    }

    // Enter - split block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const pos = getCursorPosition()
      if (pos) {
        onEnter(pos)
      }
      return
    }

    // Shift+Enter - line break within block
    if (e.key === 'Enter' && e.shiftKey) {
      // Allow default behavior for line break
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

    // Arrow key navigation
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
        const content = Array.isArray(block.content) ? block.content : textToSegments(block.content as unknown as string)
        const lastSeg = content.length - 1
        if (pos && pos.segmentIndex === lastSeg && pos.charOffset === content[lastSeg].text.length) {
          e.preventDefault()
          onArrowDown()
          return
        }
      }
    }
  }, [getCursorPosition, onEnter, onBackspaceAtStart, onArrowUp, onArrowDown, applyMark, block.content])

  // Handle content changes
  const handleInput = useCallback(() => {
    if (!editorRef.current || isComposing.current) return

    const text = editorRef.current.innerText || ''
    
    // Prevent duplicate updates
    if (text === lastContent.current) return
    lastContent.current = text

    // Check for slash command
    if (text.endsWith('/') && onSlashCommand) {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        onSlashCommand({ top: rect.bottom + 4, left: rect.left })
      }
    }

    setShowPlaceholder(text === '')
    
    // Convert to segments (preserving any existing marks would require more complex logic)
    const newContent: RichTextSegment[] = text ? [plainText(text)] : [plainText('')]
    onContentChange(newContent)
  }, [onContentChange, onSlashCommand])

  // Handle selection changes for formatting toolbar
  const handleSelect = useCallback(() => {
    if (!onSelectionChange) return
    
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) {
      onSelectionChange(false)
      return
    }

    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    onSelectionChange(true, rect)
  }, [onSelectionChange])

  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (onPaste) {
      onPaste(e)
    }
  }, [onPaste])

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className={cn(
          'outline-none min-h-[1.5em] w-full whitespace-pre-wrap break-all',
          className
        )}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={onFocus}
        onBlur={onBlur}
        onSelect={handleSelect}
        onCompositionStart={() => { isComposing.current = true }}
        onCompositionEnd={() => {
          isComposing.current = false
          handleInput()
        }}
        onPaste={handlePaste}
        dangerouslySetInnerHTML={{ __html: renderToHTML(block.content) }}
      />
      {showPlaceholder && (
        <div 
          className={cn(
            'absolute top-0 left-0 pointer-events-none select-none',
            isDark ? 'text-neutral-600' : 'text-neutral-400'
          )}
        >
          {placeholder}
        </div>
      )}
    </div>
  )
}

/**
 * Merge adjacent segments with identical marks
 */
function mergeAdjacentSegments(segments: RichTextSegment[]): RichTextSegment[] {
  if (segments.length === 0) return [plainText('')]

  const merged: RichTextSegment[] = [{ ...segments[0] }]

  for (let i = 1; i < segments.length; i++) {
    const prev = merged[merged.length - 1]
    const curr = segments[i]

    if (JSON.stringify(prev.marks.sort()) === JSON.stringify(curr.marks.sort()) &&
        prev.link === curr.link) {
      prev.text += curr.text
    } else {
      merged.push({ ...curr })
    }
  }

  return merged
}

/**
 * Render segments to HTML string
 */
function renderToHTML(content: RichTextSegment[] | string): string {
  const segments: RichTextSegment[] = Array.isArray(content) ? content : textToSegments(content)

  if (segments.length === 0 || (segments.length === 1 && segments[0].text === '')) {
    return ''
  }

  return segments.map(segment => {
    let html = escapeHTML(segment.text)
    
    // Handle line breaks
    html = html.replace(/\n/g, '<br>')

    if (segment.marks?.includes('bold')) html = `<strong>${html}</strong>`
    if (segment.marks?.includes('italic')) html = `<em>${html}</em>`
    if (segment.marks?.includes('code')) html = `<code class="font-mono bg-neutral-100 dark:bg-neutral-800 text-pink-600 dark:text-pink-400 rounded px-1.5 py-0.5 text-[0.9em]">${html}</code>`
    if (segment.marks?.includes('underline')) html = `<u>${html}</u>`
    if (segment.marks?.includes('strike')) html = `<del class="text-neutral-500">${html}</del>`

    if (segment.link) {
      html = `<a href="${escapeHTML(segment.link)}" class="text-blue-600 dark:text-blue-400 underline decoration-blue-600/30 hover:decoration-blue-600 transition-colors" target="_blank" rel="noopener noreferrer">${html}</a>`
    }

    return html
  }).join('')
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export default RichTextContent
