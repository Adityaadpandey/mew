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
import { AlertCircle, AlertTriangle, Check, CheckCircle, Copy, GripVertical, Info, Trash2 } from 'lucide-react'
import { useCallback } from 'react'
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
  getBlockNumber
}: EditorBlockProps) {
  const dragControls = useDragControls()

  // Get plain text for display purposes
  const plainText = segmentsToText(block.content)
  const isEmpty = plainText === ''

  // Handle content changes from RichTextContent
  const handleContentChange = useCallback((newContent: RichTextSegment[]) => {
    // Check for markdown shortcuts (e.g., "# " for heading)
    const text = segmentsToText(newContent)

    if (block.type === 'paragraph' && text.length < 5) {
      // Heading shortcuts
      if (text === '# ') {
        updateBlock(block.id, { type: 'heading1', content: [{ text: '', marks: [] }] })
        return
      }
      if (text === '## ') {
        updateBlock(block.id, { type: 'heading2', content: [{ text: '', marks: [] }] })
        return
      }
      if (text === '### ') {
        updateBlock(block.id, { type: 'heading3', content: [{ text: '', marks: [] }] })
        return
      }
      // List shortcuts
      if (text === '- ' || text === '* ') {
        updateBlock(block.id, { type: 'bulletList', content: [{ text: '', marks: [] }] })
        return
      }
      if (text === '1. ') {
        updateBlock(block.id, { type: 'numberedList', content: [{ text: '', marks: [] }] })
        return
      }
      if (text === '[] ') {
        updateBlock(block.id, { type: 'checkList', content: [{ text: '', marks: [] }], checked: false })
        return
      }
      // Quote
      if (text === '> ') {
        updateBlock(block.id, { type: 'quote', content: [{ text: '', marks: [] }] })
        return
      }
      // Code block
      if (text === '```') {
        updateBlock(block.id, { type: 'code', content: [{ text: '', marks: [] }], language: 'typescript' })
        return
      }
      // Divider
      if (text === '---') {
        updateBlock(block.id, { type: 'divider', content: [{ text: '', marks: [] }] })
        return
      }
    }

    updateBlock(block.id, { content: newContent })
  }, [block.id, block.type, updateBlock])

  // Handle Enter - split block
  const handleEnter = useCallback((cursorPos: CursorPosition) => {
    onEnterSplit(block.id, cursorPos)
  }, [block.id, onEnterSplit])

  // Handle Backspace at start - merge with previous
  const handleBackspaceAtStart = useCallback(() => {
    onBackspaceMerge(block.id)
  }, [block.id, onBackspaceMerge])

  // Notion-like typography based on block type
  const getBlockStyles = () => {
    const base = cn(
      'transition-all',
      isDark ? 'text-neutral-100' : 'text-[#37352f]'
    )

    switch (block.type) {
      case 'heading1':
        return cn(base, 'text-4xl font-bold leading-tight mt-8 mb-2')
      case 'heading2':
        return cn(base, 'text-2xl font-semibold leading-snug mt-6 mb-2')
      case 'heading3':
        return cn(base, 'text-xl font-medium leading-snug mt-4 mb-1')
      case 'quote':
        return cn(base, 'text-lg italic border-l-4 border-neutral-300 dark:border-neutral-600 pl-4 py-1')
      case 'code':
        return cn(base, 'font-mono text-sm bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg')
      case 'callout':
        return cn(base, 'text-base')
      default:
        return cn(base, 'text-base leading-relaxed')
    }
  }

  const getPlaceholder = () => {
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
      default: return "Type '/' for commands..."
    }
  }

  // Render block based on type
  const renderBlockContent = () => {
    // Divider is special - no editable content
    if (block.type === 'divider') {
      return (
        <div className="py-4">
          <hr className={cn(
            'border-t',
            isDark ? 'border-neutral-700' : 'border-neutral-200'
          )} />
        </div>
      )
    }

    // Callout has special wrapper
    if (block.type === 'callout') {
      const calloutStyles = {
        info: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', icon: Info },
        warning: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', icon: AlertTriangle },
        success: { bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800', icon: CheckCircle },
        error: { bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', icon: AlertCircle },
      }
      const style = calloutStyles[block.calloutType || 'info']
      const Icon = style.icon

      return (
        <div className={cn('flex gap-3 p-4 rounded-lg border', style.bg, style.border)}>
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
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
            onBlur={() => setFocusedBlockId(null)}
          />
        </div>
      )
    }

    // Lists have special prefixes
    if (block.type === 'bulletList') {
      return (
        <div className="flex items-start gap-2">
          <span className="w-6 h-6 flex items-center justify-center text-neutral-400">•</span>
          <div className="flex-1">
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
              onBlur={() => setFocusedBlockId(null)}
            />
          </div>
        </div>
      )
    }

    if (block.type === 'numberedList') {
      const num = getBlockNumber(block, index)
      return (
        <div className="flex items-start gap-2">
          <span className="w-6 h-6 flex items-center justify-center text-neutral-400 font-medium">{num}.</span>
          <div className="flex-1">
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
              onBlur={() => setFocusedBlockId(null)}
            />
          </div>
        </div>
      )
    }

    if (block.type === 'checkList') {
      return (
        <div className="flex items-start gap-2">
          <button
            onClick={() => updateBlock(block.id, { checked: !block.checked })}
            className={cn(
              'w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center transition-colors',
              block.checked
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'border-neutral-300 dark:border-neutral-600 hover:border-blue-400'
            )}
          >
            {block.checked && <Check className="w-3 h-3" />}
          </button>
          <div className={cn('flex-1', block.checked && 'opacity-50 line-through')}>
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
              onBlur={() => setFocusedBlockId(null)}
            />
          </div>
        </div>
      )
    }

    // Default: heading, paragraph, quote, code
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
        onBlur={() => setFocusedBlockId(null)}
        onPaste={(e) => onPaste(block.id, e)}
      />
    )
  }

  return (
    <Reorder.Item
      value={block}
      id={block.id}
      dragListener={false}
      dragControls={dragControls}
      className={cn(
        'group relative flex items-start gap-2 py-1 px-2 -mx-2 rounded-md transition-colors',
        isSelected && 'bg-blue-50 dark:bg-blue-950/30',
        isFocused && 'bg-neutral-50 dark:bg-neutral-900/50'
      )}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey) {
          toggleSelection(block.id, true)
        }
      }}
    >
      {/* Drag handle + Menu */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity pt-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800">
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
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Block content */}
      <div className="flex-1 min-w-0">
        {renderBlockContent()}
      </div>
    </Reorder.Item>
  )
}
