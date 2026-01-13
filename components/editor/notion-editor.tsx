'use client'

import { Button } from '@/components/ui/button'
import { useDocumentStore } from '@/lib/store'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import {
  AlertCircle,
  AlertTriangle,
  Bold,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  Code,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Info,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Plus,
  Quote,
  Smile,
  Type,
  X
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { parseMarkdownToPasteBlocks } from '@/lib/markdown-parser'
import { NotionBlock } from './notion-block'

interface Block {
  id: string
  type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberedList' | 'checkList' | 'quote' | 'code' | 'divider' | 'callout' | 'toggle'
  content: string
  checked?: boolean
  calloutType?: 'info' | 'warning' | 'success' | 'error'
  collapsed?: boolean
  children?: Block[]
}

const SLASH_COMMANDS = [
  { id: 'text', label: 'Text', icon: Type, type: 'paragraph' as const, desc: 'Just start writing with plain text.' },
  { id: 'h1', label: 'Heading 1', icon: Heading1, type: 'heading1' as const, desc: 'Big section heading.' },
  { id: 'h2', label: 'Heading 2', icon: Heading2, type: 'heading2' as const, desc: 'Medium section heading.' },
  { id: 'h3', label: 'Heading 3', icon: Heading3, type: 'heading3' as const, desc: 'Small section heading.' },
  { id: 'bullet', label: 'Bulleted list', icon: List, type: 'bulletList' as const, desc: 'Create a simple bulleted list.' },
  { id: 'numbered', label: 'Numbered list', icon: ListOrdered, type: 'numberedList' as const, desc: 'Create a list with numbering.' },
  { id: 'todo', label: 'To-do list', icon: CheckSquare, type: 'checkList' as const, desc: 'Track tasks with a to-do list.' },
  { id: 'toggle', label: 'Toggle list', icon: ChevronDown, type: 'toggle' as const, desc: 'Toggles can hide and show content inside.' },
  { id: 'quote', label: 'Quote', icon: Quote, type: 'quote' as const, desc: 'Capture a quote.' },
  { id: 'code', label: 'Code', icon: Code, type: 'code' as const, desc: 'Capture a code snippet.' },
  { id: 'divider', label: 'Divider', icon: Minus, type: 'divider' as const, desc: 'Visually divide blocks.' },
  { id: 'callout', label: 'Callout', icon: Info, type: 'callout' as const, desc: 'Make writing stand out.' },
]

const COVERS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
]

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

export function NotionEditor() {
  const { currentDocument, updateContent } = useDocumentStore()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const [blocks, setBlocks] = useState<Block[]>([])
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [icon, setIcon] = useState<string | null>(null)
  
  // Slash menu
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashPosition, setSlashPosition] = useState({ top: 0, left: 0 })
  const [slashFilter, setSlashFilter] = useState('')
  const [selectedCommand, setSelectedCommand] = useState(0)
  
  // Format toolbar
  const [showFormatBar, setShowFormatBar] = useState(false)
  const [formatPosition, setFormatPosition] = useState({ top: 0, left: 0 })
  
  const editorRef = useRef<HTMLDivElement>(null)
  const slashInputRef = useRef<HTMLInputElement>(null)
  // Initialize from document
  useEffect(() => {
    if (!currentDocument) return
    
    const content = currentDocument.content || {}
    const rawBlocks = content.blocks as any[] || []
    
    if (rawBlocks.length === 0) {
      setBlocks([
        { id: generateId(), type: 'heading1', content: currentDocument.title || 'Untitled' },
        { id: generateId(), type: 'paragraph', content: '' }
      ])
    } else {
      setBlocks(rawBlocks.map(b => ({
        id: b.id || generateId(),
        type: b.type || 'paragraph',
        content: b.content || '',
        checked: b.checked,
        calloutType: b.calloutType,
        collapsed: b.collapsed,
        children: b.children || []
      })))
    }
    
    setCoverImage(content.coverImage || null)
    setIcon(content.icon || null)
  }, [currentDocument?.id])

  // Save to store (debounced)
  useEffect(() => {
    if (!currentDocument?.id || blocks.length === 0) return
    
    const timeout = setTimeout(() => {
      updateContent({
        blocks: blocks.map(b => ({
          id: b.id,
          type: b.type,
          content: b.content,
          checked: b.checked,
          calloutType: b.calloutType,
          collapsed: b.collapsed,
          children: b.children
        })),
        coverImage,
        icon
      })
    }, 500)
    
    return () => clearTimeout(timeout)
  }, [blocks, coverImage, icon, currentDocument?.id, updateContent])

  // Handle block content change
  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }, [])

  // Handle markdown paste
  const handleMarkdownPaste = useCallback((blockId: string, text: string) => {
    // Check if it looks like markdown
    const hasMarkdown = text.includes('\n') || 
                       text.match(/^#{1,3} /) || 
                       text.match(/^[-*] /) || 
                       text.match(/^\d+\. /) || 
                       text.includes('```') ||
                       text.startsWith('> ')

    if (!hasMarkdown) return false

    const parsedBlocks = parseMarkdownToPasteBlocks(text)
    if (parsedBlocks.length === 0) return false

    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === blockId)
      if (index === -1) return prev

      const newBlocks = [...prev]
      
      // Replace current block with first parsed block
      newBlocks[index] = {
        ...newBlocks[index],
        type: parsedBlocks[0].type,
        content: parsedBlocks[0].content,
        checked: parsedBlocks[0].checked,
        calloutType: parsedBlocks[0].calloutType
      }

      // Add remaining blocks after current
      if (parsedBlocks.length > 1) {
        const additionalBlocks = parsedBlocks.slice(1).map(block => ({
          id: generateId(),
          type: block.type,
          content: block.content,
          checked: block.checked,
          calloutType: block.calloutType,
          ...(block.type === 'toggle' && { collapsed: false, children: [] })
        }))
        
        newBlocks.splice(index + 1, 0, ...additionalBlocks)
      }

      return newBlocks
    })

    return true
  }, [])

  // Add new block after current
  const addBlock = useCallback((afterId: string, type: Block['type'] = 'paragraph') => {
    const newBlock: Block = {
      id: generateId(),
      type,
      content: '',
      ...(type === 'checkList' && { checked: false }),
      ...(type === 'callout' && { calloutType: 'info' }),
      ...(type === 'toggle' && { collapsed: false, children: [] })
    }
    
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === afterId)
      const newBlocks = [...prev]
      newBlocks.splice(index + 1, 0, newBlock)
      return newBlocks
    })
    
    setTimeout(() => setFocusedBlockId(newBlock.id), 10)
  }, [])

  // Delete block
  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => {
      if (prev.length <= 1) return prev
      const index = prev.findIndex(b => b.id === id)
      const newBlocks = prev.filter(b => b.id !== id)
      
      // Focus previous block
      if (index > 0) {
        setTimeout(() => setFocusedBlockId(newBlocks[index - 1].id), 10)
      }
      
      return newBlocks
    })
  }, [])

  // Handle slash command
  const handleSlashCommand = useCallback((blockId: string, command: typeof SLASH_COMMANDS[0]) => {
    updateBlock(blockId, { 
      type: command.type,
      content: '',
      ...(command.type === 'checkList' && { checked: false }),
      ...(command.type === 'callout' && { calloutType: 'info' }),
      ...(command.type === 'toggle' && { collapsed: false, children: [] })
    })
    setShowSlashMenu(false)
    setTimeout(() => setFocusedBlockId(blockId), 10)
  }, [updateBlock])

  // Filtered slash commands
  const filteredCommands = SLASH_COMMANDS.filter(cmd => 
    !slashFilter || cmd.label.toLowerCase().includes(slashFilter.toLowerCase())
  )

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSlashMenu(false)
        setShowFormatBar(false)
      }
      
      if (showSlashMenu) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedCommand(prev => Math.min(prev + 1, filteredCommands.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedCommand(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter') {
          e.preventDefault()
          if (filteredCommands[selectedCommand] && focusedBlockId) {
            handleSlashCommand(focusedBlockId, filteredCommands[selectedCommand])
          }
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSlashMenu, filteredCommands, selectedCommand, focusedBlockId, handleSlashCommand])

  // Click outside to close menus
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!editorRef.current?.contains(e.target as Node)) {
        setShowSlashMenu(false)
        setShowFormatBar(false)
      }
    }
    
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const addCover = () => setCoverImage(COVERS[Math.floor(Math.random() * COVERS.length)])
  const addIcon = () => setIcon('📄')
  return (
    <div 
      ref={editorRef}
      className={cn(
        "notion-editor flex flex-col min-h-full pb-32 relative",
        isDark ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"
      )}
    >
      {/* Cover with enhanced styling */}
      <div className={cn(
        "group relative w-full transition-all duration-500 ease-out",
        coverImage ? "h-[30vh] min-h-[200px]" : "h-[80px]"
      )}>
        {coverImage && (
          <div 
            className="cover-image absolute inset-0"
            style={{ background: coverImage }}
          />
        )}
        
        {coverImage && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={addCover}
              className="bg-white/90 hover:bg-white text-black backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Change cover
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCoverImage(null)}
              className="bg-white/90 hover:bg-white text-black backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Remove
            </Button>
          </div>
        )}
        
        {!coverImage && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={addIcon} 
              className="text-xs h-8 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
            >
              <Smile className="mr-2 h-4 w-4" /> Add icon
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={addCover} 
              className="text-xs h-8 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200"
            >
              <ImageIcon className="mr-2 h-4 w-4" /> Add cover
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto w-full px-16 flex-1">
        {/* Icon with enhanced styling */}
        {icon && (
          <div className="relative group/icon -mt-8 mb-6 w-fit">
            <div className="page-icon text-7xl leading-none cursor-pointer select-none transition-all duration-200">
              {icon}
            </div>
            <button
              onClick={() => setIcon(null)}
              className="absolute -top-2 -right-2 opacity-0 group-hover/icon:opacity-100 p-2 bg-white dark:bg-neutral-800 rounded-full shadow-lg border dark:border-neutral-700 hover:shadow-xl transition-all duration-200 hover:scale-110"
            >
              <X className="h-3 w-3 text-neutral-400 hover:text-red-500 transition-colors" />
            </button>
          </div>
        )}

        {!icon && !coverImage && <div className="h-16" />}

        {/* Blocks with enhanced spacing */}
        <div className="space-y-1">
          {blocks.map((block, index) => (
            <NotionBlock
              key={block.id}
              block={block}
              index={index}
              isDark={isDark}
              isFocused={focusedBlockId === block.id}
              onFocus={setFocusedBlockId}
              onUpdate={updateBlock}
              onAddBlock={addBlock}
              onDeleteBlock={deleteBlock}
              onSlashMenu={(pos) => {
                setSlashPosition(pos)
                setSlashFilter('')
                setSelectedCommand(0)
                setShowSlashMenu(true)
                setFocusedBlockId(block.id)
              }}
              onFormatBar={(pos) => {
                setFormatPosition(pos)
                setShowFormatBar(true)
              }}
              onMarkdownPaste={handleMarkdownPaste}
            />
          ))}
        </div>

        {/* Enhanced add block area */}
        <div
          className="h-20 cursor-text flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-all duration-200 group"
          onClick={() => blocks.length > 0 && addBlock(blocks[blocks.length - 1].id)}
        >
          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
            <Plus className="w-4 h-4" />
            <span className="text-sm">Click to add a block, or type '/' for commands</span>
          </div>
        </div>
      </div>
      {/* Slash Menu */}
      {showSlashMenu && (
        <div
          className="fixed inset-0 z-50"
          onClick={() => setShowSlashMenu(false)}
        >
          <div
            className={cn(
              "slash-menu absolute z-50 w-80 rounded-lg border shadow-xl overflow-hidden",
              isDark ? "bg-neutral-900 border-neutral-700" : "bg-white border-neutral-200"
            )}
            style={{ top: slashPosition.top, left: slashPosition.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
              <input
                ref={slashInputRef}
                type="text"
                placeholder="Type to filter..."
                value={slashFilter}
                onChange={(e) => {
                  setSlashFilter(e.target.value)
                  setSelectedCommand(0)
                }}
                className={cn(
                  "w-full px-0 py-1 text-sm bg-transparent border-none outline-none",
                  isDark ? "text-white placeholder:text-neutral-500" : "text-neutral-900 placeholder:text-neutral-400"
                )}
                autoFocus
              />
            </div>
            <div className="max-h-80 overflow-y-auto p-1 custom-scrollbar">
              {filteredCommands.map((cmd, i) => (
                <button
                  key={cmd.id}
                  onClick={() => focusedBlockId && handleSlashCommand(focusedBlockId, cmd)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors",
                    i === selectedCommand
                      ? isDark ? "bg-neutral-800" : "bg-neutral-100"
                      : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center h-10 w-10 rounded border shrink-0",
                    isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-200"
                  )}>
                    <cmd.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{cmd.label}</div>
                    <div className="text-xs text-neutral-500 truncate">{cmd.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Format Toolbar */}
      {showFormatBar && (
        <div
          className={cn(
            "format-toolbar fixed z-50 flex items-center gap-1 px-2 py-1 rounded-lg border shadow-lg -translate-x-1/2",
            isDark ? "bg-neutral-900 border-neutral-700" : "bg-white border-neutral-200"
          )}
          style={{ top: formatPosition.top, left: formatPosition.left }}
        >
          <FormatButton icon={Bold} />
          <FormatButton icon={Italic} />
          <FormatButton icon={Code} />
          <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-600 mx-1" />
          <FormatButton icon={Link} />
        </div>
      )}
    </div>
  )
}

function FormatButton({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <button className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
      <Icon className="w-4 h-4" />
    </button>
  )
}