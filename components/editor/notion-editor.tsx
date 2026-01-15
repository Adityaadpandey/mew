'use client'

import { Button } from '@/components/ui/button'
import { useDocumentStore } from '@/lib/store'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { Reorder, useDragControls, AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  AlertTriangle,
  Bold,
  Check,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Code,
  Copy,
  GripVertical,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Image as ImageIcon,
  Info,
  Italic,
  Link,
  List,
  ListOrdered,
  Minus,
  Palette,
  Plus,
  Quote,
  Smile,
  Strikethrough,
  Trash2,
  Type,
  Underline,
  X,
  Table,
  FileText,
  ExternalLink
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { parseMarkdownToPasteBlocks } from '@/lib/markdown-parser'

// ============================================================================
// TYPES
// ============================================================================

interface Block {
  id: string
  type: BlockType
  content: string
  checked?: boolean
  calloutType?: 'info' | 'warning' | 'success' | 'error'
  collapsed?: boolean
  children?: Block[]
  indent?: number
  imageUrl?: string
  language?: string
  color?: string
  bgColor?: string
}

type BlockType = 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberedList' | 'checkList' | 'quote' | 'code' | 'divider' | 'callout' | 'toggle' | 'image'

interface SlashCommand {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  type: BlockType
  desc: string
  category: 'basic' | 'lists' | 'media' | 'advanced'
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SLASH_COMMANDS: SlashCommand[] = [
  // Basic blocks
  { id: 'text', label: 'Text', icon: Type, type: 'paragraph', desc: 'Just start writing with plain text.', category: 'basic' },
  { id: 'h1', label: 'Heading 1', icon: Heading1, type: 'heading1', desc: 'Big section heading.', category: 'basic' },
  { id: 'h2', label: 'Heading 2', icon: Heading2, type: 'heading2', desc: 'Medium section heading.', category: 'basic' },
  { id: 'h3', label: 'Heading 3', icon: Heading3, type: 'heading3', desc: 'Small section heading.', category: 'basic' },
  // Lists
  { id: 'bullet', label: 'Bulleted list', icon: List, type: 'bulletList', desc: 'Create a simple bulleted list.', category: 'lists' },
  { id: 'numbered', label: 'Numbered list', icon: ListOrdered, type: 'numberedList', desc: 'Create a list with numbering.', category: 'lists' },
  { id: 'todo', label: 'To-do list', icon: CheckSquare, type: 'checkList', desc: 'Track tasks with a to-do list.', category: 'lists' },
  { id: 'toggle', label: 'Toggle list', icon: ChevronDown, type: 'toggle', desc: 'Toggles can hide and show content inside.', category: 'lists' },
  // Media
  { id: 'image', label: 'Image', icon: ImageIcon, type: 'image', desc: 'Upload or embed an image.', category: 'media' },
  { id: 'code', label: 'Code', icon: Code, type: 'code', desc: 'Capture a code snippet.', category: 'media' },
  // Advanced
  { id: 'quote', label: 'Quote', icon: Quote, type: 'quote', desc: 'Capture a quote.', category: 'advanced' },
  { id: 'divider', label: 'Divider', icon: Minus, type: 'divider', desc: 'Visually divide blocks.', category: 'advanced' },
  { id: 'callout', label: 'Callout', icon: Info, type: 'callout', desc: 'Make writing stand out.', category: 'advanced' },
]

const COVERS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
]

const EMOJI_LIST = ['📄', '📝', '📌', '💡', '🎯', '🚀', '✨', '🔥', '💫', '⭐', '🌟', '💎', '🎨', '🎭', '🎪', '🎬', '📚', '📖', '📓', '📕', '📗', '📘', '📙', '💼', '📊', '📈', '🗂️', '📁', '📂', '🔖', '🏷️', '✅', '❌', '⚠️', '❓', '❗', '💬', '💭', '🗨️', '👍', '👎', '❤️', '🧡', '💛', '💚', '💙', '💜']

const TEXT_COLORS = [
  { name: 'Default', value: undefined, class: '' },
  { name: 'Gray', value: 'text-neutral-500', class: 'text-neutral-500' },
  { name: 'Brown', value: 'text-amber-700', class: 'text-amber-700' },
  { name: 'Orange', value: 'text-orange-500', class: 'text-orange-500' },
  { name: 'Yellow', value: 'text-yellow-500', class: 'text-yellow-500' },
  { name: 'Green', value: 'text-green-500', class: 'text-green-500' },
  { name: 'Blue', value: 'text-blue-500', class: 'text-blue-500' },
  { name: 'Purple', value: 'text-purple-500', class: 'text-purple-500' },
  { name: 'Pink', value: 'text-pink-500', class: 'text-pink-500' },
  { name: 'Red', value: 'text-red-500', class: 'text-red-500' },
]

const BG_COLORS = [
  { name: 'Default', value: undefined, class: '' },
  { name: 'Gray', value: 'bg-neutral-100 dark:bg-neutral-800', class: 'bg-neutral-200' },
  { name: 'Brown', value: 'bg-amber-100 dark:bg-amber-900/30', class: 'bg-amber-200' },
  { name: 'Orange', value: 'bg-orange-100 dark:bg-orange-900/30', class: 'bg-orange-200' },
  { name: 'Yellow', value: 'bg-yellow-100 dark:bg-yellow-900/30', class: 'bg-yellow-200' },
  { name: 'Green', value: 'bg-green-100 dark:bg-green-900/30', class: 'bg-green-200' },
  { name: 'Blue', value: 'bg-blue-100 dark:bg-blue-900/30', class: 'bg-blue-200' },
  { name: 'Purple', value: 'bg-purple-100 dark:bg-purple-900/30', class: 'bg-purple-200' },
  { name: 'Pink', value: 'bg-pink-100 dark:bg-pink-900/30', class: 'bg-pink-200' },
  { name: 'Red', value: 'bg-red-100 dark:bg-red-900/30', class: 'bg-red-200' },
]

// ============================================================================
// HELPERS
// ============================================================================

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

function getListNumber(blocks: Block[], currentIndex: number): number {
  let count = 1
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (blocks[i].type === 'numberedList') {
      count++
    } else {
      break
    }
  }
  return count
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

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
  const [slashBlockId, setSlashBlockId] = useState<string | null>(null)

  // Format toolbar
  const [showFormatBar, setShowFormatBar] = useState(false)
  const [formatPosition, setFormatPosition] = useState({ top: 0, left: 0 })
  const [selectedText, setSelectedText] = useState<{ blockId: string; start: number; end: number } | null>(null)

  // Link dialog
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  // Emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  // Color picker
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [colorPickerType, setColorPickerType] = useState<'text' | 'bg'>('text')

  // Cover picker
  const [showCoverPicker, setShowCoverPicker] = useState(false)

  const editorRef = useRef<HTMLDivElement>(null)
  const slashInputRef = useRef<HTMLInputElement>(null)
  const blockRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map())

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
        children: b.children || [],
        indent: b.indent || 0,
        imageUrl: b.imageUrl,
        language: b.language,
        color: b.color,
        bgColor: b.bgColor
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
          children: b.children,
          indent: b.indent,
          imageUrl: b.imageUrl,
          language: b.language,
          color: b.color,
          bgColor: b.bgColor
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

      newBlocks[index] = {
        ...newBlocks[index],
        type: parsedBlocks[0].type,
        content: parsedBlocks[0].content,
        checked: parsedBlocks[0].checked,
        calloutType: parsedBlocks[0].calloutType
      }

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
  const addBlock = useCallback((afterId: string, type: BlockType = 'paragraph') => {
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
    return newBlock.id
  }, [])

  // Delete block
  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => {
      if (prev.length <= 1) return prev
      const index = prev.findIndex(b => b.id === id)
      const newBlocks = prev.filter(b => b.id !== id)

      if (index > 0) {
        setTimeout(() => setFocusedBlockId(newBlocks[index - 1].id), 10)
      }

      return newBlocks
    })
  }, [])

  // Duplicate block
  const duplicateBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === id)
      if (index === -1) return prev

      const block = prev[index]
      const newBlock = { ...block, id: generateId() }
      const newBlocks = [...prev]
      newBlocks.splice(index + 1, 0, newBlock)
      return newBlocks
    })
  }, [])

  // Move block up/down
  const moveBlock = useCallback((id: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === id)
      if (index === -1) return prev
      if (direction === 'up' && index === 0) return prev
      if (direction === 'down' && index === prev.length - 1) return prev

      const newBlocks = [...prev]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      ;[newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]]
      return newBlocks
    })
  }, [])

  // Handle indent (Tab)
  const indentBlock = useCallback((id: string) => {
    setBlocks(prev => prev.map(b =>
      b.id === id ? { ...b, indent: Math.min((b.indent || 0) + 1, 4) } : b
    ))
  }, [])

  // Handle outdent (Shift+Tab)
  const outdentBlock = useCallback((id: string) => {
    setBlocks(prev => prev.map(b =>
      b.id === id ? { ...b, indent: Math.max((b.indent || 0) - 1, 0) } : b
    ))
  }, [])

  // Handle slash command selection
  const handleSlashCommand = useCallback((blockId: string, command: SlashCommand) => {
    updateBlock(blockId, {
      type: command.type,
      content: '',
      ...(command.type === 'checkList' && { checked: false }),
      ...(command.type === 'callout' && { calloutType: 'info' }),
      ...(command.type === 'toggle' && { collapsed: false, children: [] })
    })
    setShowSlashMenu(false)
    setSlashFilter('')
    setTimeout(() => setFocusedBlockId(blockId), 10)
  }, [updateBlock])

  // Filtered and grouped slash commands
  const filteredCommands = useMemo(() => {
    const filtered = SLASH_COMMANDS.filter(cmd =>
      !slashFilter || cmd.label.toLowerCase().includes(slashFilter.toLowerCase())
    )

    const grouped: Record<string, SlashCommand[]> = {
      basic: [],
      lists: [],
      media: [],
      advanced: []
    }

    filtered.forEach(cmd => {
      grouped[cmd.category].push(cmd)
    })

    return grouped
  }, [slashFilter])

  const flatFilteredCommands = useMemo(() => {
    return Object.values(filteredCommands).flat()
  }, [filteredCommands])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSlashMenu(false)
        setShowFormatBar(false)
        setShowLinkDialog(false)
        setShowEmojiPicker(false)
        setShowColorPicker(false)
        setShowCoverPicker(false)
      }

      if (showSlashMenu) {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedCommand(prev => Math.min(prev + 1, flatFilteredCommands.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedCommand(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter') {
          e.preventDefault()
          if (flatFilteredCommands[selectedCommand] && slashBlockId) {
            handleSlashCommand(slashBlockId, flatFilteredCommands[selectedCommand])
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showSlashMenu, flatFilteredCommands, selectedCommand, slashBlockId, handleSlashCommand])

  // Click outside to close menus
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.notion-menu')) {
        setShowSlashMenu(false)
        setShowFormatBar(false)
        setShowLinkDialog(false)
        setShowEmojiPicker(false)
        setShowColorPicker(false)
        setShowCoverPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Handle reorder
  const handleReorder = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks)
  }, [])

  const addCover = () => setCoverImage(COVERS[Math.floor(Math.random() * COVERS.length)])
  const addIcon = () => setShowEmojiPicker(true)

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
            <div className="relative">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCoverPicker(!showCoverPicker)}
                className="bg-white/90 hover:bg-white text-black backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Change cover
              </Button>

              {/* Cover picker */}
              {showCoverPicker && (
                <div className="notion-menu absolute bottom-full right-0 mb-2 p-3 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border dark:border-neutral-700 w-64">
                  <div className="text-xs font-medium text-neutral-500 mb-2">Gradients</div>
                  <div className="grid grid-cols-4 gap-2">
                    {COVERS.map((cover, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setCoverImage(cover)
                          setShowCoverPicker(false)
                        }}
                        className="h-12 rounded-md cursor-pointer hover:ring-2 ring-blue-500 transition-all"
                        style={{ background: cover }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
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
        {/* Icon with emoji picker */}
        {icon && (
          <div className="relative group/icon -mt-8 mb-6 w-fit">
            <button
              onClick={() => setShowEmojiPicker(true)}
              className="page-icon text-7xl leading-none cursor-pointer select-none transition-all duration-200 hover:scale-105"
            >
              {icon}
            </button>
            <button
              onClick={() => setIcon(null)}
              className="absolute -top-2 -right-2 opacity-0 group-hover/icon:opacity-100 p-2 bg-white dark:bg-neutral-800 rounded-full shadow-lg border dark:border-neutral-700 hover:shadow-xl transition-all duration-200 hover:scale-110"
            >
              <X className="h-3 w-3 text-neutral-400 hover:text-red-500 transition-colors" />
            </button>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="notion-menu fixed z-50 p-3 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border dark:border-neutral-700 w-80" style={{ top: '150px', left: '50%', transform: 'translateX(-50%)' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Choose an icon</span>
              <button onClick={() => setShowEmojiPicker(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded">
                <X className="h-4 w-4 text-neutral-400" />
              </button>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_LIST.map((emoji, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIcon(emoji)
                    setShowEmojiPicker(false)
                  }}
                  className="h-9 w-9 flex items-center justify-center text-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {!icon && !coverImage && <div className="h-16" />}

        {/* Blocks with drag and drop */}
        <Reorder.Group axis="y" values={blocks} onReorder={handleReorder} className="space-y-0.5">
          {blocks.map((block, index) => (
            <NotionBlock
              key={block.id}
              block={block}
              index={index}
              blocks={blocks}
              isDark={isDark}
              isFocused={focusedBlockId === block.id}
              blockRefs={blockRefs}
              onFocus={setFocusedBlockId}
              onUpdate={updateBlock}
              onAddBlock={addBlock}
              onDeleteBlock={deleteBlock}
              onDuplicateBlock={duplicateBlock}
              onMoveBlock={moveBlock}
              onIndent={indentBlock}
              onOutdent={outdentBlock}
              onSlashMenu={(pos, blockId) => {
                setSlashPosition(pos)
                setSlashFilter('')
                setSelectedCommand(0)
                setShowSlashMenu(true)
                setSlashBlockId(blockId)
              }}
              onFormatBar={(pos, blockId, start, end) => {
                setFormatPosition(pos)
                setSelectedText({ blockId, start, end })
                setShowFormatBar(true)
              }}
              onMarkdownPaste={handleMarkdownPaste}
            />
          ))}
        </Reorder.Group>

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
      <AnimatePresence>
        {showSlashMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-0 z-50"
            onClick={() => setShowSlashMenu(false)}
          >
            <div
              className={cn(
                "notion-menu absolute z-50 w-80 rounded-lg border shadow-xl overflow-hidden",
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
                {Object.entries(filteredCommands).map(([category, commands]) => (
                  commands.length > 0 && (
                    <div key={category}>
                      <div className="px-3 py-2 text-xs font-medium text-neutral-500 uppercase tracking-wide">
                        {category === 'basic' ? 'Basic blocks' : category === 'lists' ? 'Lists' : category === 'media' ? 'Media' : 'Advanced'}
                      </div>
                      {commands.map((cmd) => {
                        const globalIndex = flatFilteredCommands.indexOf(cmd)
                        return (
                          <button
                            key={cmd.id}
                            onClick={() => slashBlockId && handleSlashCommand(slashBlockId, cmd)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-colors",
                              globalIndex === selectedCommand
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
                        )
                      })}
                    </div>
                  )
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Format Toolbar */}
      <AnimatePresence>
        {showFormatBar && selectedText && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={cn(
              "notion-menu format-toolbar fixed z-50 flex items-center gap-0.5 px-1.5 py-1 rounded-lg border shadow-lg",
              isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-200"
            )}
            style={{ top: formatPosition.top - 45, left: formatPosition.left }}
          >
            <FormatButton
              icon={Bold}
              tooltip="Bold"
              shortcut="⌘B"
              onClick={() => {
                // Apply bold formatting
                const block = blocks.find(b => b.id === selectedText.blockId)
                if (block) {
                  const before = block.content.slice(0, selectedText.start)
                  const selected = block.content.slice(selectedText.start, selectedText.end)
                  const after = block.content.slice(selectedText.end)
                  updateBlock(selectedText.blockId, { content: `${before}**${selected}**${after}` })
                }
                setShowFormatBar(false)
              }}
            />
            <FormatButton
              icon={Italic}
              tooltip="Italic"
              shortcut="⌘I"
              onClick={() => {
                const block = blocks.find(b => b.id === selectedText.blockId)
                if (block) {
                  const before = block.content.slice(0, selectedText.start)
                  const selected = block.content.slice(selectedText.start, selectedText.end)
                  const after = block.content.slice(selectedText.end)
                  updateBlock(selectedText.blockId, { content: `${before}_${selected}_${after}` })
                }
                setShowFormatBar(false)
              }}
            />
            <FormatButton
              icon={Underline}
              tooltip="Underline"
              shortcut="⌘U"
              onClick={() => {
                const block = blocks.find(b => b.id === selectedText.blockId)
                if (block) {
                  const before = block.content.slice(0, selectedText.start)
                  const selected = block.content.slice(selectedText.start, selectedText.end)
                  const after = block.content.slice(selectedText.end)
                  updateBlock(selectedText.blockId, { content: `${before}<u>${selected}</u>${after}` })
                }
                setShowFormatBar(false)
              }}
            />
            <FormatButton
              icon={Strikethrough}
              tooltip="Strikethrough"
              shortcut="⌘⇧S"
              onClick={() => {
                const block = blocks.find(b => b.id === selectedText.blockId)
                if (block) {
                  const before = block.content.slice(0, selectedText.start)
                  const selected = block.content.slice(selectedText.start, selectedText.end)
                  const after = block.content.slice(selectedText.end)
                  updateBlock(selectedText.blockId, { content: `${before}~~${selected}~~${after}` })
                }
                setShowFormatBar(false)
              }}
            />
            <FormatButton
              icon={Code}
              tooltip="Code"
              shortcut="⌘E"
              onClick={() => {
                const block = blocks.find(b => b.id === selectedText.blockId)
                if (block) {
                  const before = block.content.slice(0, selectedText.start)
                  const selected = block.content.slice(selectedText.start, selectedText.end)
                  const after = block.content.slice(selectedText.end)
                  updateBlock(selectedText.blockId, { content: `${before}\`${selected}\`${after}` })
                }
                setShowFormatBar(false)
              }}
            />
            <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1" />
            <FormatButton
              icon={Link}
              tooltip="Link"
              shortcut="⌘K"
              onClick={() => {
                setShowLinkDialog(true)
                setShowFormatBar(false)
              }}
            />
            <div className="w-px h-5 bg-neutral-300 dark:bg-neutral-600 mx-1" />
            <FormatButton
              icon={Palette}
              tooltip="Color"
              onClick={() => {
                setColorPickerType('text')
                setShowColorPicker(true)
              }}
            />
            <FormatButton
              icon={Highlighter}
              tooltip="Highlight"
              onClick={() => {
                setColorPickerType('bg')
                setShowColorPicker(true)
              }}
            />

            {/* Color Picker Dropdown */}
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-2 p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border dark:border-neutral-700 w-48">
                <div className="text-xs font-medium text-neutral-500 mb-2">
                  {colorPickerType === 'text' ? 'Text color' : 'Background'}
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {(colorPickerType === 'text' ? TEXT_COLORS : BG_COLORS).map((color) => (
                    <button
                      key={color.name}
                      onClick={() => {
                        const block = blocks.find(b => b.id === selectedText.blockId)
                        if (block) {
                          if (colorPickerType === 'text') {
                            updateBlock(selectedText.blockId, { color: color.value })
                          } else {
                            updateBlock(selectedText.blockId, { bgColor: color.value })
                          }
                        }
                        setShowColorPicker(false)
                        setShowFormatBar(false)
                      }}
                      className={cn(
                        "h-6 w-6 rounded-full border-2 transition-all hover:scale-110",
                        color.value ? color.class : "bg-neutral-100 dark:bg-neutral-700"
                      )}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Link Dialog */}
      {showLinkDialog && selectedText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="notion-menu bg-white dark:bg-neutral-800 rounded-lg shadow-xl p-4 w-96">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium">Add Link</span>
              <button onClick={() => setShowLinkDialog(false)} className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
            <input
              type="url"
              placeholder="Paste link or search..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border dark:border-neutral-600 bg-transparent outline-none focus:ring-2 ring-blue-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" size="sm" onClick={() => setShowLinkDialog(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  const block = blocks.find(b => b.id === selectedText.blockId)
                  if (block && linkUrl) {
                    const before = block.content.slice(0, selectedText.start)
                    const selected = block.content.slice(selectedText.start, selectedText.end)
                    const after = block.content.slice(selectedText.end)
                    updateBlock(selectedText.blockId, { content: `${before}[${selected}](${linkUrl})${after}` })
                  }
                  setShowLinkDialog(false)
                  setLinkUrl('')
                }}
              >
                Add Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// FORMAT BUTTON COMPONENT
// ============================================================================

interface FormatButtonProps {
  icon: React.ComponentType<{ className?: string }>
  tooltip: string
  shortcut?: string
  onClick?: () => void
}

function FormatButton({ icon: Icon, tooltip, shortcut, onClick }: FormatButtonProps) {
  return (
    <button
      onClick={onClick}
      className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors group relative"
      title={`${tooltip}${shortcut ? ` (${shortcut})` : ''}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}

// ============================================================================
// NOTION BLOCK COMPONENT
// ============================================================================

interface NotionBlockProps {
  block: Block
  index: number
  blocks: Block[]
  isDark: boolean
  isFocused: boolean
  blockRefs: React.MutableRefObject<Map<string, HTMLTextAreaElement>>
  onFocus: (id: string | null) => void
  onUpdate: (id: string, updates: Partial<Block>) => void
  onAddBlock: (afterId: string, type?: BlockType) => string
  onDeleteBlock: (id: string) => void
  onDuplicateBlock: (id: string) => void
  onMoveBlock: (id: string, direction: 'up' | 'down') => void
  onIndent: (id: string) => void
  onOutdent: (id: string) => void
  onSlashMenu: (position: { top: number; left: number }, blockId: string) => void
  onFormatBar: (position: { top: number; left: number }, blockId: string, start: number, end: number) => void
  onMarkdownPaste: (blockId: string, text: string) => boolean
}

function NotionBlock({
  block,
  index,
  blocks,
  isDark,
  isFocused,
  blockRefs,
  onFocus,
  onUpdate,
  onAddBlock,
  onDeleteBlock,
  onDuplicateBlock,
  onMoveBlock,
  onIndent,
  onOutdent,
  onSlashMenu,
  onFormatBar,
  onMarkdownPaste
}: NotionBlockProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showBlockMenu, setShowBlockMenu] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dragControls = useDragControls()

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

  // Store ref
  useEffect(() => {
    if (textareaRef.current) {
      blockRefs.current.set(block.id, textareaRef.current)
    }
    return () => {
      blockRefs.current.delete(block.id)
    }
  }, [block.id, blockRefs])

  // Adjust height when content changes
  useEffect(() => {
    adjustHeight()
  }, [block.content, adjustHeight])

  // Handle paste
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
      const shortcuts: Record<string, BlockType> = {
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
    // Tab for indent
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      onIndent(block.id)
      return
    }

    // Shift+Tab for outdent
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      onOutdent(block.id)
      return
    }

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
        onSlashMenu({ top: rect.bottom + 4, left: rect.left }, block.id)
      }
    }
  }, [block.id, block.content, onAddBlock, onDeleteBlock, onSlashMenu, onIndent, onOutdent])

  // Handle text selection
  const handleSelect = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    if (start !== end) {
      const rect = textarea.getBoundingClientRect()
      onFormatBar({
        top: rect.top,
        left: rect.left + (rect.width / 2)
      }, block.id, start, end)
    }
  }, [block.id, onFormatBar])

  // Get block styles
  const getBlockStyles = () => {
    const base = "w-full bg-transparent border-none outline-none resize-none font-inherit leading-relaxed"

    const colorClass = block.color || ''
    const bgClass = block.bgColor || ''

    let typeStyles = ''
    switch (block.type) {
      case 'heading1':
        typeStyles = "text-[2.25rem] font-bold leading-[1.2] tracking-tight"
        break
      case 'heading2':
        typeStyles = "text-[1.875rem] font-semibold leading-[1.3]"
        break
      case 'heading3':
        typeStyles = "text-[1.5rem] font-medium leading-[1.3]"
        break
      case 'quote':
        typeStyles = "text-[1.1rem] italic leading-[1.6]"
        break
      case 'code':
        typeStyles = "font-mono text-[0.875rem] leading-[1.6]"
        break
      default:
        typeStyles = "text-[1rem] leading-[1.6]"
    }

    return cn(base, typeStyles, colorClass, bgClass, isDark ? "text-white" : "text-neutral-900")
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
      case 'image':
        return 'Add an image...'
      default:
        return "Type '/' for commands"
    }
  }

  // Render block content
  const renderBlock = () => {
    const indentStyle = { paddingLeft: `${(block.indent || 0) * 24}px` }

    // Divider
    if (block.type === 'divider') {
      return (
        <div className="py-4 w-full" style={indentStyle}>
          <hr className={cn(
            "border-0 h-px w-full",
            isDark ? "bg-neutral-700" : "bg-neutral-200"
          )} />
        </div>
      )
    }

    // Image
    if (block.type === 'image') {
      return (
        <div className="py-2" style={indentStyle}>
          {block.imageUrl ? (
            <div className="relative group/img">
              <img
                src={block.imageUrl}
                alt=""
                className="max-w-full rounded-lg"
              />
              <button
                onClick={() => onUpdate(block.id, { imageUrl: undefined })}
                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <div
              className={cn(
                "flex items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed cursor-pointer transition-colors",
                isDark ? "border-neutral-700 hover:border-neutral-600 bg-neutral-800/50" : "border-neutral-300 hover:border-neutral-400 bg-neutral-50"
              )}
              onClick={() => {
                const url = window.prompt('Enter image URL:')
                if (url) {
                  onUpdate(block.id, { imageUrl: url })
                }
              }}
            >
              <ImageIcon className="h-5 w-5 text-neutral-400" />
              <span className="text-sm text-neutral-500">Click to add an image</span>
            </div>
          )}
        </div>
      )
    }

    // Callout
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
        <div className={cn('flex gap-3 p-4 rounded-r-md', style.bg, style.border)} style={indentStyle}>
          <button
            onClick={() => {
              const types: Array<'info' | 'warning' | 'success' | 'error'> = ['info', 'warning', 'success', 'error']
              const currentIndex = types.indexOf(block.calloutType || 'info')
              const nextType = types[(currentIndex + 1) % types.length]
              onUpdate(block.id, { calloutType: nextType })
            }}
            className="shrink-0 hover:scale-110 transition-transform"
          >
            <Icon className={cn('w-5 h-5 mt-1', style.iconColor)} />
          </button>
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

    // Toggle
    if (block.type === 'toggle') {
      return (
        <div className="flex items-start gap-2" style={indentStyle}>
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

    // Bullet list
    if (block.type === 'bulletList') {
      return (
        <div className="flex items-start gap-3" style={indentStyle}>
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
      const num = getListNumber(blocks, index)
      return (
        <div className="flex items-start gap-3" style={indentStyle}>
          <span className={cn(
            "w-6 h-6 flex items-center justify-center shrink-0 tabular-nums mt-1 text-sm font-medium",
            isDark ? "text-neutral-500" : "text-neutral-400"
          )}>
            {num}.
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

    // Check list
    if (block.type === 'checkList') {
      return (
        <div className="flex items-start gap-3" style={indentStyle}>
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

    // Quote
    if (block.type === 'quote') {
      return (
        <div className={cn(
          "border-l-[3px] pl-4 py-1",
          isDark ? "border-neutral-600" : "border-neutral-300"
        )} style={indentStyle}>
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

    // Code block
    if (block.type === 'code') {
      return (
        <div className={cn(
          "rounded-lg p-4 font-mono text-sm overflow-x-auto border",
          isDark ? "bg-neutral-900 border-neutral-800" : "bg-neutral-50 border-neutral-200"
        )} style={indentStyle}>
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                // Allow Enter in code blocks
                return
              }
              handleKeyDown(e)
            }}
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
      <div style={indentStyle}>
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

  return (
    <Reorder.Item
      value={block}
      id={block.id}
      dragListener={false}
      dragControls={dragControls}
      className={cn(
        "notion-block group relative flex items-start py-1 px-1 -mx-1 rounded-sm transition-all duration-150",
        isFocused && "notion-block-focused",
        isHovered && "bg-neutral-50/50 dark:bg-neutral-800/30"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowBlockMenu(false)
      }}
    >
      {/* Left controls */}
      <div
        className={cn(
          "absolute -left-10 top-1 flex items-center gap-0.5 transition-opacity duration-150",
          (isHovered || isFocused) ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          onClick={() => onAddBlock(block.id)}
          className={cn(
            "p-1 rounded-sm transition-all duration-150 hover:scale-110",
            isDark ? "hover:bg-neutral-700 text-neutral-500 hover:text-neutral-300" : "hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600"
          )}
          title="Add block"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="relative">
          <button
            onPointerDown={(e) => {
              e.preventDefault()
              dragControls.start(e)
            }}
            onClick={() => setShowBlockMenu(!showBlockMenu)}
            className={cn(
              "p-1 rounded-sm transition-all duration-150 cursor-grab active:cursor-grabbing",
              isDark ? "hover:bg-neutral-700 text-neutral-500 hover:text-neutral-300" : "hover:bg-neutral-200 text-neutral-400 hover:text-neutral-600"
            )}
            title="Drag to move"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Block Menu */}
          {showBlockMenu && (
            <div className={cn(
              "notion-menu absolute left-0 top-full mt-1 z-50 w-48 rounded-lg border shadow-xl py-1",
              isDark ? "bg-neutral-800 border-neutral-700" : "bg-white border-neutral-200"
            )}>
              <button
                onClick={() => {
                  onDuplicateBlock(block.id)
                  setShowBlockMenu(false)
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-sm",
                  isDark ? "hover:bg-neutral-700" : "hover:bg-neutral-100"
                )}
              >
                <Copy className="w-4 h-4" /> Duplicate
              </button>
              <button
                onClick={() => {
                  onMoveBlock(block.id, 'up')
                  setShowBlockMenu(false)
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-sm",
                  isDark ? "hover:bg-neutral-700" : "hover:bg-neutral-100"
                )}
              >
                Move up
              </button>
              <button
                onClick={() => {
                  onMoveBlock(block.id, 'down')
                  setShowBlockMenu(false)
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-sm",
                  isDark ? "hover:bg-neutral-700" : "hover:bg-neutral-100"
                )}
              >
                Move down
              </button>
              <div className="h-px bg-neutral-200 dark:bg-neutral-700 my-1" />
              <button
                onClick={() => {
                  onDeleteBlock(block.id)
                  setShowBlockMenu(false)
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-500",
                  isDark ? "hover:bg-neutral-700" : "hover:bg-neutral-100"
                )}
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Block content */}
      <div className="flex-1 min-w-0">
        {renderBlock()}
      </div>
    </Reorder.Item>
  )
}
