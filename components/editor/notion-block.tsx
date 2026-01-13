'use client'

import { cn } from '@/lib/utils'
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle,
  ChevronRight,
  GripVertical,
  Info,
  Plus
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Block {
  id: string
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberedList' | 'checkList' | 'quote' | 'code' | 'divider' | 'callout' | 'toggle'
  content: string
  checked?: boolean
  calloutType?: 'info' | 'warning' | 'success' | 'error'
  collapsed?: boolean
  children?: Block[]
}

interface NotionBlockProps {
  block: Block
  index: number
  isDark: boolean
  isFocused: boolean
  onFocus: (id: string | null) => void
  onUpdate: (id: string, updates: Partial<Block>) => void
  onAddBlock: (afterId: string, type?: Block['type']) => void
  onDeleteBlock: (id: string) => void
  onSlashMenu: (position: { top: number; left: number }) => void
  onFormatBar: (position: { top: number; left: number }) => void
  onMarkdownPaste: (blockId: string, text: string) => boolean
}

export function NotionBlock({
  block,
  index,
  isDark,
  isFocused,
  onFocus,
  onUpdate,
  onAddBlock,
  onDeleteBlock,
  onSlashMenu,
  onFormatBar,
  onMarkdownPaste
}: NotionBlockProps) {
  const [isHovered, setIsHovered] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const blockRef = useRef<HTMLDivElement>(null)

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.max(24, textarea.scrollHeight) + 'px'
    }
  }, [])

  // Focus management
  useEffect(() => {
    if (isFocused && textareaRef.current) {
      textareaRef.current.focus()
      const len = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(len, len)
    }
  }, [isFocused])

  // Adjust height when content changes
  useEffect(() => {
    adjustHeight()
  }, [block.content, adjustHeight])

  // Handle paste events
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text/plain')
    if (text && onMarkdownPaste(block.id, text)) {
      e.preventDefault()
    }
  }, [block.id, onMarkdownPaste])

  // Handle content change
  const handleContentChange = useCallback((value: string) => {
    onUpdate(block.id, { content: value })
    
    // Check for markdown shortcuts
    if (block.type === 'paragraph' && value.length < 10) {
      const shortcuts: Record<string, Block['type']> = {
        '# ': 'heading1',
        '## ': 'heading2',
        '### ': 'heading3',
        '- ': 'bulletList',
        '* ': 'bulletList',
        '1. ': 'numberedList',
        '[] ': 'checkList',
        '> ': 'quote',
        '```': 'code',
        '---': 'divider'
      }
      
      for (const [shortcut, type] of Object.entries(shortcuts)) {
        if (value === shortcut || (shortcut === '---' && value === '---')) {
          onUpdate(block.id, { type, content: '' })
          return
        }
      }
    }
  }, [block.id, block.type, onUpdate])

  // Handle key events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onAddBlock(block.id)
    } else if (e.key === 'Backspace' && block.content === '' && e.currentTarget === textareaRef.current) {
      e.preventDefault()
      onDeleteBlock(block.id)
    } else if (e.key === '/' && block.content === '') {
      e.preventDefault()
      const rect = textareaRef.current?.getBoundingClientRect()
      if (rect) {
        onSlashMenu({ top: rect.bottom + 4, left: rect.left })
      }
    }
  }, [block.id, block.content, onAddBlock, onDeleteBlock, onSlashMenu])

  // Handle text selection for format bar
  const handleSelect = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    
    if (start !== end) {
      const rect = textarea.getBoundingClientRect()
      onFormatBar({ 
        top: rect.top - 40, 
        left: rect.left + (rect.width / 2) 
      })
    }
  }, [onFormatBar])

  // Get block styles with Notion-like typography
  const getBlockStyles = () => {
    const base = "w-full bg-transparent border-none outline-none resize-none font-inherit leading-relaxed"
    
    switch (block.type) {
      case 'heading1':
        return cn(base, "text-[2.25rem] font-bold leading-[1.2] tracking-tight text-neutral-900 dark:text-white")
      case 'heading2':
        return cn(base, "text-[1.875rem] font-semibold leading-[1.3] text-neutral-900 dark:text-white")
      case 'heading3':
        return cn(base, "text-[1.5rem] font-medium leading-[1.3] text-neutral-900 dark:text-white")
      case 'quote':
        return cn(base, "text-[1.1rem] italic leading-[1.6] text-neutral-700 dark:text-neutral-300")
      case 'code':
        return cn(base, "font-mono text-[0.875rem] leading-[1.6] text-neutral-800 dark:text-neutral-200")
      default:
        return cn(base, "text-[1rem] leading-[1.6] text-neutral-700 dark:text-neutral-300")
    }
  }

  const getPlaceholder = () => {
    if (index === 0 && block.type === 'heading1') return 'Untitled'
    switch (block.type) {
      case 'heading1': return 'Heading 1'
      case 'heading2': return 'Heading 2'
      case 'heading3': return 'Heading 3'
      case 'quote': return 'Empty quote'
      case 'code': return 'Type your code...'
      case 'bulletList':
      case 'numberedList':
      case 'checkList':
        return 'List'
      case 'toggle':
        return 'Toggle'
      default:
        return "Type '/' for commands"
    }
  }

  // Render block content with enhanced Notion-like styling
  const renderBlock = () => {
    // Divider
    if (block.type === 'divider') {
      return (
        <div className="py-4 w-full">
          <hr className={cn(
            "border-0 h-px w-full",
            isDark ? "bg-neutral-700" : "bg-neutral-200"
          )} />
        </div>
      )
    }

    // Callout with enhanced styling
    if (block.type === 'callout') {
      const styles = {
        info: { 
          bg: 'bg-blue-50/80 dark:bg-blue-950/30', 
          border: 'border-l-[3px] border-blue-400', 
          icon: Info, 
          iconColor: 'text-blue-500 dark:text-blue-400' 
        },
        warning: { 
          bg: 'bg-amber-50/80 dark:bg-amber-950/30', 
          border: 'border-l-[3px] border-amber-400', 
          icon: AlertTriangle, 
          iconColor: 'text-amber-500 dark:text-amber-400' 
        },
        success: { 
          bg: 'bg-emerald-50/80 dark:bg-emerald-950/30', 
          border: 'border-l-[3px] border-emerald-400', 
          icon: CheckCircle, 
          iconColor: 'text-emerald-500 dark:text-emerald-400' 
        },
        error: { 
          bg: 'bg-red-50/80 dark:bg-red-950/30', 
          border: 'border-l-[3px] border-red-400', 
          icon: AlertCircle, 
          iconColor: 'text-red-500 dark:text-red-400' 
        },
      }
      const style = styles[block.calloutType || 'info']
      const Icon = style.icon

      return (
        <div className={cn('flex gap-3 p-4 rounded-r-md', style.bg, style.border)}>
          <Icon className={cn('w-5 h-5 mt-1 shrink-0', style.iconColor)} />
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => onFocus(block.id)}
            onSelect={handleSelect}
            onPaste={handlePaste}
            placeholder="Write a callout..."
            className={cn(getBlockStyles(), "placeholder:text-neutral-400 dark:placeholder:text-neutral-500")}
            rows={1}
          />
        </div>
      )
    }

    // Toggle with enhanced styling
    if (block.type === 'toggle') {
      return (
        <div className="flex items-start gap-2">
          <button
            onClick={() => onUpdate(block.id, { collapsed: !block.collapsed })}
            className={cn(
              "p-1 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-150 mt-1",
              block.collapsed ? 'rotate-0' : 'rotate-90'
            )}
          >
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </button>
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => onFocus(block.id)}
            onSelect={handleSelect}
            onPaste={handlePaste}
            placeholder={getPlaceholder()}
            className={cn(getBlockStyles(), "placeholder:text-neutral-400 dark:placeholder:text-neutral-500")}
            rows={1}
          />
        </div>
      )
    }

    // Bullet list with enhanced styling
    if (block.type === 'bulletList') {
      return (
        <div className="flex items-start gap-3">
          <span className={cn(
            "w-6 h-6 flex items-center justify-center shrink-0 mt-1 text-lg",
            isDark ? "text-neutral-500" : "text-neutral-400"
          )}>
            •
          </span>
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => onFocus(block.id)}
            onSelect={handleSelect}
            onPaste={handlePaste}
            placeholder={getPlaceholder()}
            className={cn(getBlockStyles(), "placeholder:text-neutral-400 dark:placeholder:text-neutral-500")}
            rows={1}
          />
        </div>
      )
    }

    // Numbered list
    if (block.type === 'numberedList') {
      return (
        <div className="flex items-start gap-3">
          <span className={cn(
            "w-6 h-6 flex items-center justify-center shrink-0 tabular-nums mt-1 text-sm font-medium",
            isDark ? "text-neutral-500" : "text-neutral-400"
          )}>
            {index + 1}.
          </span>
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => onFocus(block.id)}
            onSelect={handleSelect}
            onPaste={handlePaste}
            placeholder={getPlaceholder()}
            className={cn(getBlockStyles(), "placeholder:text-neutral-400 dark:placeholder:text-neutral-500")}
            rows={1}
          />
        </div>
      )
    }

    // Check list with enhanced styling
    if (block.type === 'checkList') {
      return (
        <div className="flex items-start gap-3">
          <button
            onClick={() => onUpdate(block.id, { checked: !block.checked })}
            className={cn(
              "w-[18px] h-[18px] mt-[6px] rounded-sm border-2 flex items-center justify-center transition-all duration-150 shrink-0",
              block.checked
                ? "bg-blue-500 border-blue-500 hover:bg-blue-600"
                : isDark
                  ? "border-neutral-600 hover:border-neutral-500 hover:bg-neutral-800"
                  : "border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50"
            )}
          >
            {block.checked && <Check className="w-3 h-3 text-white" strokeWidth={2.5} />}
          </button>
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => onFocus(block.id)}
            onSelect={handleSelect}
            onPaste={handlePaste}
            placeholder={getPlaceholder()}
            className={cn(
              getBlockStyles(), 
              block.checked && "line-through opacity-60",
              "placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            )}
            rows={1}
          />
        </div>
      )
    }

    // Quote with enhanced styling
    if (block.type === 'quote') {
      return (
        <div className={cn(
          "border-l-[3px] pl-4 py-1",
          isDark ? "border-neutral-600" : "border-neutral-300"
        )}>
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => onFocus(block.id)}
            onSelect={handleSelect}
            onPaste={handlePaste}
            placeholder={getPlaceholder()}
            className={cn(getBlockStyles(), "placeholder:text-neutral-400 dark:placeholder:text-neutral-500")}
            rows={1}
          />
        </div>
      )
    }

    // Code block with enhanced styling
    if (block.type === 'code') {
      return (
        <div className={cn(
          "rounded-lg p-4 font-mono text-sm overflow-x-auto border",
          isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-50 border-neutral-200"
        )}>
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => onFocus(block.id)}
            onPaste={handlePaste}
            placeholder={getPlaceholder()}
            className={cn(getBlockStyles(), "placeholder:text-neutral-400 dark:placeholder:text-neutral-500")}
            rows={1}
          />
        </div>
      )
    }

    // Default: paragraph, headings
    return (
      <textarea
        ref={textareaRef}
        value={block.content}
        onChange={(e) => handleContentChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => onFocus(block.id)}
        onSelect={handleSelect}
        onPaste={handlePaste}
        placeholder={getPlaceholder()}
        className={cn(getBlockStyles(), "placeholder:text-neutral-400 dark:placeholder:text-neutral-500")}
        rows={1}
      />
    )
  }

  return (
    <div
      ref={blockRef}
      className={cn(
        "notion-block group relative flex items-start py-1 px-1 -mx-1 rounded-sm transition-all duration-150",
        isFocused && "notion-block-focused",
        isHovered && "bg-neutral-50/50 dark:bg-neutral-800/30"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left controls with enhanced styling */}
      <div 
        className={cn(
          "absolute -left-10 top-1 flex items-center gap-1 transition-opacity duration-150",
          (isHovered || isFocused) ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          onClick={() => onAddBlock(block.id)}
          className={cn(
            "p-1.5 rounded-sm transition-all duration-150 hover:scale-110",
            isDark ? "hover:bg-neutral-700 text-neutral-500 hover:text-neutral-300" : "hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600"
          )}
          title="Add block"
        >
          <Plus className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onDeleteBlock(block.id)}
          className={cn(
            "p-1.5 rounded-sm transition-all duration-150 hover:scale-110 cursor-grab active:cursor-grabbing",
            isDark ? "hover:bg-neutral-700 text-neutral-500 hover:text-neutral-300" : "hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600"
          )}
          title="Drag to move"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Block content */}
      <div className="flex-1 min-w-0">
        {renderBlock()}
      </div>
    </div>
  )
}