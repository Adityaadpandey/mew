'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Reorder, useDragControls } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  Check,
  CheckCircle,
  ChevronRight,
  Copy,
  GripVertical,
  Info,
  Plus,
  Trash2
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { RichTextContent } from './rich-text-content'
import { Block, BlockType, CursorPosition, RichTextSegment, segmentsToText } from './types'

interface EditorBlockProps {
  block: Block
  index: number
  isDark: boolean
  isFocused: boolean
  isSelected: boolean
  toggleSelection: (id: string, multi: boolean) => void
  updateBlock: (id: string, updates: Partial<Block>) => void
  addBlockAfter: (id: string, type?: BlockType) => void
  deleteBlock: (id: string) => void
  duplicateBlock: (block: Block) => void
  onEnterSplit: (blockId: string, cursorPos: CursorPosition) => void
  onBackspaceMerge: (blockId: string) => void
  setFocusedBlockId: (id: string | null) => void
  focusPreviousBlock: () => void
  focusNextBlock: () => void
  onPaste: (blockId: string, e: React.ClipboardEvent) => void
  getBlockNumber: (block: Block, index: number) => number
  onSlashCommand?: (blockId: string, position: { top: number; left: number }) => void
  onSelectionChange?: (hasSelection: boolean, rect?: DOMRect) => void
}

export function EditorBlock({
  block,
  index,
  isDark,
  isFocused,
  isSelected,
  toggleSelection,
  updateBlock,
  addBlockAfter,
  deleteBlock,
  duplicateBlock,
  onEnterSplit,
  onBackspaceMerge,
  setFocusedBlockId,
  focusPreviousBlock,
  focusNextBlock,
  onPaste,
  getBlockNumber,
  onSlashCommand,
  onSelectionChange,
}: EditorBlockProps) {
  const dragControls = useDragControls()
  const [isHovered, setIsHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Handle content changes
  const handleContentChange = useCallback((newContent: RichTextSegment[]) => {
    const text = segmentsToText(newContent)

    // Markdown shortcuts for paragraph blocks
    if (block.type === 'paragraph' && text.length < 6) {
      const shortcuts: Record<string, { type: BlockType; calloutType?: Block['calloutType'] }> = {
        '# ': { type: 'heading1' },
        '## ': { type: 'heading2' },
        '### ': { type: 'heading3' },
        '- ': { type: 'bulletList' },
        '* ': { type: 'bulletList' },
        '1. ': { type: 'numberedList' },
        '[] ': { type: 'checkList' },
        '[ ] ': { type: 'checkList' },
        '> ': { type: 'quote' },
        '---': { type: 'divider' },
      }

      for (const [prefix, config] of Object.entries(shortcuts)) {
        if (text === prefix || (prefix === '---' && text === '---')) {
          updateBlock(block.id, {
            type: config.type,
            content: [{ text: '', marks: [] }],
            calloutType: config.calloutType,
            checked: config.type === 'checkList' ? false : undefined,
          })
          return
        }
      }

      // Code block shortcut
      if (text === '```') {
        updateBlock(block.id, {
          type: 'code',
          content: [{ text: '', marks: [] }],
          language: 'typescript'
        })
        return
      }
    }

    updateBlock(block.id, { content: newContent })
  }, [block.id, block.type, updateBlock])

  const handleEnter = useCallback((cursorPos: CursorPosition) => {
    onEnterSplit(block.id, cursorPos)
  }, [block.id, onEnterSplit])

  const handleBackspaceAtStart = useCallback(() => {
    onBackspaceMerge(block.id)
  }, [block.id, onBackspaceMerge])

  const handleSlashCommand = useCallback((position: { top: number; left: number }) => {
    onSlashCommand?.(block.id, position)
  }, [block.id, onSlashCommand])

  // Block styles based on type
  const getBlockStyles = () => {
    const base = cn(
      'transition-colors duration-75',
      isDark ? 'text-neutral-100' : 'text-neutral-800'
    )

    switch (block.type) {
      case 'heading1':
        return cn(base, 'text-[2rem] font-bold leading-tight tracking-tight')
      case 'heading2':
        return cn(base, 'text-[1.5rem] font-semibold leading-snug')
      case 'heading3':
        return cn(base, 'text-[1.25rem] font-medium leading-snug')
      case 'quote':
        return cn(base, 'text-lg italic')
      case 'code':
        return cn(base, 'font-mono text-sm')
      default:
        return cn(base, 'text-base leading-relaxed')
    }
  }

  const getPlaceholder = () => {
    if (index === 0 && block.type === 'heading1') return 'Untitled'
    switch (block.type) {
      case 'heading1': return 'Heading 1'
      case 'heading2': return 'Heading 2'
      case 'heading3': return 'Heading 3'
      case 'quote': return 'Quote'
      case 'code': return 'Code'
      case 'bulletList':
      case 'numberedList':
      case 'checkList':
        return 'List item'
      case 'toggle':
        return 'Toggle'
      default:
        return "Type '/' for commands..."
    }
  }

  // Render block content based on type
  const renderBlockContent = () => {
    // Divider
    if (block.type === 'divider') {
      return (
        <div className="py-3">
          <hr className={cn(
            'border-t',
            isDark ? 'border-neutral-700' : 'border-neutral-200'
          )} />
        </div>
      )
    }

    // Callout
    if (block.type === 'callout') {
      const styles = {
        info: { bg: 'bg-blue-50 dark:bg-blue-950/40', border: 'border-l-4 border-blue-400', icon: Info, iconColor: 'text-blue-500' },
        warning: { bg: 'bg-amber-50 dark:bg-amber-950/40', border: 'border-l-4 border-amber-400', icon: AlertTriangle, iconColor: 'text-amber-500' },
        success: { bg: 'bg-emerald-50 dark:bg-emerald-950/40', border: 'border-l-4 border-emerald-400', icon: CheckCircle, iconColor: 'text-emerald-500' },
        error: { bg: 'bg-red-50 dark:bg-red-950/40', border: 'border-l-4 border-red-400', icon: AlertCircle, iconColor: 'text-red-500' },
      }
      const style = styles[block.calloutType || 'info']
      const Icon = style.icon

      return (
        <div className={cn('flex gap-3 p-4 rounded-r-lg', style.bg, style.border)}>
          <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', style.iconColor)} />
          <div className="flex-1 min-w-0">
            <RichTextContent
              block={block}
              className={getBlockStyles()}
              placeholder="Callout text..."
              isFocused={isFocused}
              isDark={isDark}
              onContentChange={handleContentChange}
              onEnter={handleEnter}
              onBackspaceAtStart={handleBackspaceAtStart}
              onArrowUp={focusPreviousBlock}
              onArrowDown={focusNextBlock}
              onFocus={() => setFocusedBlockId(block.id)}
              onBlur={() => {}}
              onSlashCommand={handleSlashCommand}
              onSelectionChange={onSelectionChange}
            />
          </div>
        </div>
      )
    }

    // Toggle
    if (block.type === 'toggle') {
      return (
        <div className="flex items-start gap-1">
          <button
            onClick={() => updateBlock(block.id, { collapsed: !block.collapsed })}
            className={cn(
              'p-0.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-transform',
              block.collapsed ? '' : 'rotate-90'
            )}
          >
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
          <div className="flex-1 min-w-0">
            <RichTextContent
              block={block}
              className={getBlockStyles()}
              placeholder={getPlaceholder()}
              isFocused={isFocused}
              isDark={isDark}
              onContentChange={handleContentChange}
              onEnter={handleEnter}
              onBackspaceAtStart={handleBackspaceAtStart}
              onArrowUp={focusPreviousBlock}
              onArrowDown={focusNextBlock}
              onFocus={() => setFocusedBlockId(block.id)}
              onBlur={() => {}}
              onSlashCommand={handleSlashCommand}
              onSelectionChange={onSelectionChange}
            />
          </div>
        </div>
      )
    }

    // Bullet list
    if (block.type === 'bulletList') {
      return (
        <div className="flex items-start gap-2">
          <span className={cn(
            'w-6 h-6 flex items-center justify-center shrink-0',
            isDark ? 'text-neutral-500' : 'text-neutral-400'
          )}>
            •
          </span>
          <div className="flex-1 min-w-0">
            <RichTextContent
              block={block}
              className={getBlockStyles()}
              placeholder={getPlaceholder()}
              isFocused={isFocused}
              isDark={isDark}
              onContentChange={handleContentChange}
              onEnter={handleEnter}
              onBackspaceAtStart={handleBackspaceAtStart}
              onArrowUp={focusPreviousBlock}
              onArrowDown={focusNextBlock}
              onFocus={() => setFocusedBlockId(block.id)}
              onBlur={() => {}}
              onSlashCommand={handleSlashCommand}
              onSelectionChange={onSelectionChange}
            />
          </div>
        </div>
      )
    }

    // Numbered list
    if (block.type === 'numberedList') {
      const num = getBlockNumber(block, index)
      return (
        <div className="flex items-start gap-2">
          <span className={cn(
            'w-6 h-6 flex items-center justify-center shrink-0 tabular-nums',
            isDark ? 'text-neutral-500' : 'text-neutral-400'
          )}>
            {num}.
          </span>
          <div className="flex-1 min-w-0">
            <RichTextContent
              block={block}
              className={getBlockStyles()}
              placeholder={getPlaceholder()}
              isFocused={isFocused}
              isDark={isDark}
              onContentChange={handleContentChange}
              onEnter={handleEnter}
              onBackspaceAtStart={handleBackspaceAtStart}
              onArrowUp={focusPreviousBlock}
              onArrowDown={focusNextBlock}
              onFocus={() => setFocusedBlockId(block.id)}
              onBlur={() => {}}
              onSlashCommand={handleSlashCommand}
              onSelectionChange={onSelectionChange}
            />
          </div>
        </div>
      )
    }

    // Check list
    if (block.type === 'checkList') {
      return (
        <div className="flex items-start gap-2">
          <button
            onClick={() => updateBlock(block.id, { checked: !block.checked })}
            className={cn(
              'w-[18px] h-[18px] mt-[3px] rounded border-2 flex items-center justify-center transition-all shrink-0',
              block.checked
                ? 'bg-blue-500 border-blue-500'
                : isDark
                  ? 'border-neutral-600 hover:border-neutral-500'
                  : 'border-neutral-300 hover:border-neutral-400'
            )}
          >
            {block.checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </button>
          <div className={cn('flex-1 min-w-0', block.checked && 'opacity-50')}>
            <RichTextContent
              block={block}
              className={cn(getBlockStyles(), block.checked && 'line-through')}
              placeholder={getPlaceholder()}
              isFocused={isFocused}
              isDark={isDark}
              onContentChange={handleContentChange}
              onEnter={handleEnter}
              onBackspaceAtStart={handleBackspaceAtStart}
              onArrowUp={focusPreviousBlock}
              onArrowDown={focusNextBlock}
              onFocus={() => setFocusedBlockId(block.id)}
              onBlur={() => {}}
              onSlashCommand={handleSlashCommand}
              onSelectionChange={onSelectionChange}
            />
          </div>
        </div>
      )
    }

    // Quote
    if (block.type === 'quote') {
      return (
        <div className={cn(
          'border-l-[3px] pl-4',
          isDark ? 'border-neutral-600' : 'border-neutral-300'
        )}>
          <RichTextContent
            block={block}
            className={getBlockStyles()}
            placeholder={getPlaceholder()}
            isFocused={isFocused}
            isDark={isDark}
            onContentChange={handleContentChange}
            onEnter={handleEnter}
            onBackspaceAtStart={handleBackspaceAtStart}
            onArrowUp={focusPreviousBlock}
            onArrowDown={focusNextBlock}
            onFocus={() => setFocusedBlockId(block.id)}
            onBlur={() => {}}
            onSlashCommand={handleSlashCommand}
            onSelectionChange={onSelectionChange}
          />
        </div>
      )
    }

    // Code block
    if (block.type === 'code') {
      return (
        <div className={cn(
          'rounded-lg p-4 font-mono text-sm overflow-x-auto',
          isDark ? 'bg-neutral-900' : 'bg-neutral-100'
        )}>
          <RichTextContent
            block={block}
            className={getBlockStyles()}
            placeholder={getPlaceholder()}
            isFocused={isFocused}
            isDark={isDark}
            onContentChange={handleContentChange}
            onEnter={handleEnter}
            onBackspaceAtStart={handleBackspaceAtStart}
            onArrowUp={focusPreviousBlock}
            onArrowDown={focusNextBlock}
            onFocus={() => setFocusedBlockId(block.id)}
            onBlur={() => {}}
            onSlashCommand={handleSlashCommand}
            onSelectionChange={onSelectionChange}
          />
        </div>
      )
    }

    // Default: paragraph, headings
    return (
      <RichTextContent
        block={block}
        className={getBlockStyles()}
        placeholder={getPlaceholder()}
        isFocused={isFocused}
        isDark={isDark}
        onContentChange={handleContentChange}
        onEnter={handleEnter}
        onBackspaceAtStart={handleBackspaceAtStart}
        onArrowUp={focusPreviousBlock}
        onArrowDown={focusNextBlock}
        onFocus={() => setFocusedBlockId(block.id)}
        onBlur={() => {}}
        onPaste={(e) => onPaste(block.id, e)}
        onSlashCommand={handleSlashCommand}
        onSelectionChange={onSelectionChange}
      />
    )
  }

  return (
    <Reorder.Item
      value={block}
      id={block.id}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      className={cn(
        'group relative flex items-start py-[3px] rounded-sm transition-colors',
        isSelected && 'bg-blue-100 dark:bg-blue-900/30',
        isDragging && 'opacity-50 z-50'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey) {
          e.preventDefault()
          toggleSelection(block.id, true)
        }
      }}
    >
      {/* Left controls - drag handle + add button */}
      <div 
        className={cn(
          'absolute -left-8 top-0 flex items-center gap-0.5 transition-opacity',
          isHovered || isFocused ? 'opacity-100' : 'opacity-0'
        )}
      >
        <button
          onClick={() => addBlockAfter(block.id)}
          className={cn(
            'p-1 rounded transition-colors',
            isDark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'
          )}
        >
          <Plus className="w-4 h-4 text-neutral-400" />
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              onPointerDown={(e) => {
                e.preventDefault()
                dragControls.start(e)
              }}
              className={cn(
                'p-1 rounded cursor-grab active:cursor-grabbing transition-colors',
                isDark ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'
              )}
            >
              <GripVertical className="w-4 h-4 text-neutral-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => duplicateBlock(block)}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => deleteBlock(block.id)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Block content */}
      <div className="flex-1 min-w-0 pl-1">
        {renderBlockContent()}
      </div>
    </Reorder.Item>
  )
}
