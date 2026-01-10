'use client'

import { Button } from '@/components/ui/button'
import { mergeBlocks, splitBlockAtCursor } from '@/lib/block-operations'
import { parseMarkdown } from '@/lib/markdown-utils'
import { useDocumentStore } from '@/lib/store'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from 'cmdk'
import { AnimatePresence, Reorder } from 'framer-motion'
import {
    AlertCircle,
    AlertTriangle, CheckCircle,
    CheckSquare,
    Code,
    Heading1, Heading2, Heading3,
    Image as ImageIcon,
    Info,
    List, ListOrdered,
    Minus,
    Quote,
    Smile,
    Type,
    X
} from 'lucide-react'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useRef, useState } from 'react'
import { EditorBlock } from './editor-block'
import { Block, BlockType, CursorPosition, RichTextSegment, segmentsToText, textToSegments } from './types'

interface SlashCommand {
  id: string
  label: string
  description: string
  icon: React.ReactNode
  type: BlockType
  calloutType?: Block['calloutType']
}

const SLASH_COMMANDS: SlashCommand[] = [
  { id: 'text', label: 'Text', description: 'Plain text paragraph', icon: <Type className="h-4 w-4" />, type: 'paragraph' },
  { id: 'h1', label: 'Heading 1', description: 'Large section heading', icon: <Heading1 className="h-4 w-4" />, type: 'heading1' },
  { id: 'h2', label: 'Heading 2', description: 'Medium section heading', icon: <Heading2 className="h-4 w-4" />, type: 'heading2' },
  { id: 'h3', label: 'Heading 3', description: 'Small section heading', icon: <Heading3 className="h-4 w-4" />, type: 'heading3' },
  { id: 'bullet', label: 'Bullet List', description: 'Create a bullet list', icon: <List className="h-4 w-4" />, type: 'bulletList' },
  { id: 'numbered', label: 'Numbered List', description: 'Create a numbered list', icon: <ListOrdered className="h-4 w-4" />, type: 'numberedList' },
  { id: 'todo', label: 'To-do List', description: 'Track tasks with checkboxes', icon: <CheckSquare className="h-4 w-4" />, type: 'checkList' },
  { id: 'code', label: 'Code Block', description: 'Capture code snippet', icon: <Code className="h-4 w-4" />, type: 'code' },
  { id: 'quote', label: 'Quote', description: 'Capture a quote', icon: <Quote className="h-4 w-4" />, type: 'quote' },
  { id: 'divider', label: 'Divider', description: 'Visual divider', icon: <Minus className="h-4 w-4" />, type: 'divider' },
  { id: 'info', label: 'Info Callout', description: 'Highlight information', icon: <Info className="h-4 w-4 text-blue-500" />, type: 'callout', calloutType: 'info' },
  { id: 'warning', label: 'Warning Callout', description: 'Highlight a warning', icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, type: 'callout', calloutType: 'warning' },
  { id: 'success', label: 'Success Callout', description: 'Highlight success', icon: <CheckCircle className="h-4 w-4 text-green-500" />, type: 'callout', calloutType: 'success' },
  { id: 'error', label: 'Error Callout', description: 'Highlight an error', icon: <AlertCircle className="h-4 w-4 text-red-500" />, type: 'callout', calloutType: 'error' },
]

const createBlock = (
  type: BlockType = 'paragraph',
  content: RichTextSegment[] | string = '',
  calloutType?: Block['calloutType'],
  order: number = 0
): Block => ({
  id: nanoid(),
  type,
  content: typeof content === 'string' ? textToSegments(content) : content,
  parentId: null,
  order,
  indent: 0,
  checked: type === 'checkList' ? false : undefined,
  calloutType: type === 'callout' ? calloutType || 'info' : undefined,
})

const COVERS = [
  'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500',
  'bg-gradient-to-r from-green-300 via-blue-500 to-purple-600',
  'bg-gradient-to-r from-indigo-300 to-purple-400',
  'bg-gradient-to-r from-red-200 via-red-300 to-yellow-200',
  'bg-slate-100', // simple
]

export function DocumentEditor() {
  const { currentDocument, updateContent, setIsSaving } = useDocumentStore()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const [blocks, setBlocks] = useState<Block[]>([])
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [icon, setIcon] = useState<string | null>(null)

  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null)
  const [showSlashMenu, setShowSlashMenu] = useState(false)
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 })
  const [slashFilter, setSlashFilter] = useState('')
  const [history, setHistory] = useState<{ blocks: Block[], cover: string | null, icon: string | null }[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Selection State
  const [selectedBlockIds, setSelectedBlockIds] = useState<Set<string>>(new Set())

  const editorRef = useRef<HTMLDivElement>(null)
  const lastDocumentIdRef = useRef<string | null>(null)
  const isSavingRef = useRef(false)

  // Initialize from store
  useEffect(() => {
    if (currentDocument?.id && currentDocument.id !== lastDocumentIdRef.current) {
      lastDocumentIdRef.current = currentDocument.id
      const content = currentDocument.content || {}

      const rawBlocks = (content.blocks as any[]) || [
        createBlock('heading1', currentDocument.title || 'Untitled Document'),
        createBlock('paragraph', ''),
      ]

      // Normalize legacy blocks (convert string content to RichTextSegment[])
      const newBlocks: Block[] = rawBlocks.map((block, i) => ({
        ...block,
        // Ensure content is always RichTextSegment[]
        content: textToSegments(block.content),
        // Ensure tree structure fields exist
        parentId: block.parentId ?? null,
        order: block.order ?? i,
        indent: block.indent ?? 0,
      }))

      setBlocks(newBlocks)
      setCoverImage((content.coverImage as string) || null)
      setIcon((content.icon as string) || null)

      // Clear history on new doc load
      setHistory([])
      setHistoryIndex(-1)
      setSelectedBlockIds(new Set())
    }
  }, [currentDocument?.id, currentDocument?.content, currentDocument?.title])

  // Clear selection on click outside (this might need refinement to not clear on block click)
  useEffect(() => {
      const handleClick = (e: MouseEvent) => {
          if (editorRef.current && !editorRef.current.contains(e.target as Node)) {
              setSelectedBlockIds(new Set())
          }
      }
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Save loop (Updates Store Only - useAutoSave handles DB)
  useEffect(() => {
    if (!currentDocument?.id) return

    const timeout = setTimeout(async () => {
       // Just update the store. The unified useAutoSave hook in parent will handle the DB call.
       const content = { blocks, coverImage, icon }
       updateContent(content)
    }, 500) // Reduced debounce since we just update store

    return () => clearTimeout(timeout)
  }, [blocks, coverImage, icon, currentDocument?.id, updateContent])



  const saveToHistory = useCallback(() => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), { blocks, cover: coverImage, icon }])
    setHistoryIndex(prev => prev + 1)
  }, [blocks, coverImage, icon, historyIndex])

  // Global Copy Handler for Multi-Selection
  useEffect(() => {
      const handleCopy = (e: ClipboardEvent) => {
          if (selectedBlockIds.size === 0) return

          // Filter blocks to only selected ones, preserving order
          const selectedBlocks = blocks.filter(b => selectedBlockIds.has(b.id))
          if (selectedBlocks.length === 0) return

          // Generate Markdown
          const text = selectedBlocks.map(b => {
              const t = segmentsToText(b.content)
              switch (b.type) {
                  case 'heading1': return `# ${t}`
                  case 'heading2': return `## ${t}`
                  case 'heading3': return `### ${t}`
                  case 'bulletList': return `- ${t}`
                  case 'numberedList': return `1. ${t}` // Simplified
                  case 'checkList': return `- [${b.checked ? 'x' : ' '}] ${t}`
                  case 'quote': return `> ${t}`
                  case 'code': return `\`\`\`\n${t}\n\`\`\``
                  default: return t
              }
          }).join('\n\n')

          e.preventDefault()
          e.clipboardData?.setData('text/plain', text)
      }

      document.addEventListener('copy', handleCopy)
      return () => document.removeEventListener('copy', handleCopy)
  }, [selectedBlockIds, blocks])





  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1]
      setHistoryIndex(prev => prev - 1)
      setBlocks(prevState.blocks)
      setCoverImage(prevState.cover)
      setIcon(prevState.icon)
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setHistoryIndex(prev => prev + 1)
      setBlocks(nextState.blocks)
      setCoverImage(nextState.cover)
      setIcon(nextState.icon)
    }
  }, [history, historyIndex])

  // Global Keyboard Shortcuts (Undo/Redo, Delete Selection)
  // MOVED HERE TO FIX HOISTING ERROR
  useEffect(() => {
      const handleGlobalKeyDown = (e: KeyboardEvent) => {
          // Undo / Redo
          if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
              e.preventDefault()
              if (e.shiftKey) {
                  redo()
              } else {
                  undo()
              }
              return
          }

          // Delete Selection
          if (selectedBlockIds.size > 0 && (e.key === 'Backspace' || e.key === 'Delete')) {
              e.preventDefault()
              saveToHistory()

              setBlocks(prev => {
                  const newBlocks = prev.filter(b => !selectedBlockIds.has(b.id))
                  if (newBlocks.length === 0) {
                      return [createBlock()]
                  }
                  return newBlocks
              })
              setSelectedBlockIds(new Set())
          }
      }

      window.addEventListener('keydown', handleGlobalKeyDown as any)
      return () => window.removeEventListener('keydown', handleGlobalKeyDown as any)
  }, [selectedBlockIds, saveToHistory, undo, redo])

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(block => block.id === id ? { ...block, ...updates } : block))
  }, [])

  const addBlockAfter = useCallback((afterId: string, type: Block['type'] = 'paragraph', calloutType?: Block['calloutType']) => {
    saveToHistory()
    const newBlock = createBlock(type, '', calloutType)
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === afterId)
      const newBlocks = [...prev]
      newBlocks.splice(index + 1, 0, newBlock)
      return newBlocks
    })
    // Delay focus to let render happen
    setTimeout(() => setFocusedBlockId(newBlock.id), 10)
    return newBlock.id
  }, [saveToHistory])

  const addBlocksAfter = useCallback((afterId: string, newBlocksData: Partial<Block>[]) => {
      saveToHistory()
      const newBlocks = newBlocksData.map(data => createBlock(
          data.type || 'paragraph',
          data.content || '',
          data.calloutType
      ))

      setBlocks(prev => {
          const index = prev.findIndex(b => b.id === afterId)
          if (index === -1) return prev
          const updatedBlocks = [...prev]
          updatedBlocks.splice(index + 1, 0, ...newBlocks)
          return updatedBlocks
      })
  }, [saveToHistory])

  const deleteBlock = useCallback((id: string) => {
    saveToHistory()
    setBlocks(prev => {
      if (prev.length <= 1) return prev
      const index = prev.findIndex(b => b.id === id)
      const newBlocks = prev.filter(b => b.id !== id)
      // Focus prev
      setTimeout(() => {
          const prevBlock = newBlocks[Math.max(0, index - 1)]
          if (prevBlock) setFocusedBlockId(prevBlock.id)
      }, 10)
      return newBlocks
    })
  }, [saveToHistory])

  const duplicateBlock = useCallback((block: Block) => {
      saveToHistory()
      const newBlock = { ...block, id: nanoid() }
      setBlocks(prev => {
          const index = prev.findIndex(b => b.id === block.id)
          const newBlocks = [...prev]
          newBlocks.splice(index + 1, 0, newBlock)
          return newBlocks
      })
  }, [saveToHistory])

  // Selection Handlers
  const selectAllBlocks = useCallback(() => {
      // We must use function update or ensure blocks is fresh.
      // Since we need block IDs, we rely on the `blocks` dependency which is updated on every render.
      const allIds = new Set(blocks.map(b => b.id))
      setSelectedBlockIds(allIds)

      // Blur any active element to show block selection state clearly
      if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur()
      }

      // Force a re-render or ensure UI updates? State update does that.
  }, [blocks])

  const toggleBlockSelection = useCallback((id: string, multi: boolean) => {
      setSelectedBlockIds(prev => {
          const next = new Set(multi ? prev : [])
          if (next.has(id)) next.delete(id)
          else next.add(id)
          return next
      })
  }, [])

  const onPaste = useCallback((blockId: string, e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text/plain')

    // Only intercept if we have newlines (basic check for "structure")
    // OR if it looks like markdown (headings, lists)
    const hasStructure = text.includes('\n') ||
                         text.startsWith('#') ||
                         text.startsWith('- ') ||
                         text.startsWith('* ') ||
                         text.startsWith('> ') ||
                         text.startsWith('[] ')

    if (!hasStructure) return // Let default behavior handle single line plain text

    e.preventDefault()
    saveToHistory()

    // Parse the pasted text
    const parsedLines = parseMarkdown(text)
    if (parsedLines.length === 0) return

    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === blockId)
      if (index === -1) return prev

      const newBlocks = [...prev]
      const createdBlocks: Block[] = []

      // Convert parsed lines to full blocks
      parsedLines.forEach((line, i) => {
        createdBlocks.push({
          id: nanoid(),
          type: line.type,
          content: line.content, // RichTextSegment[]
          parentId: null,
          order: prev[index].order + i + 1, // Will be reordered anyway
          indent: 0,
          checked: line.checked,
          language: line.language,
          calloutType: line.calloutType
        })
      })

      // Insert after current block
      // OPTION: If current block is empty, replace it with first pasted block?
      // For now, let's just insert after to be safe and simple
      newBlocks.splice(index + 1, 0, ...createdBlocks)

      // Re-index orders
      return newBlocks.map((b, i) => ({ ...b, order: i }))
    })
  }, [saveToHistory])

  // NEW: Handle Enter - splits block at cursor (tree mutation)
  const onEnterSplit = useCallback((blockId: string, cursorPos: CursorPosition) => {
    saveToHistory()

    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === blockId)
      if (index === -1) return prev

      const block = prev[index]
      const newBlockId = nanoid()

      // Use the split operation from block-operations
      const [updatedBlock, newBlock] = splitBlockAtCursor(block, cursorPos, newBlockId)

      // Update orders for all subsequent blocks
      const newBlocks = [...prev]
      newBlocks[index] = updatedBlock
      newBlocks.splice(index + 1, 0, newBlock)

      // Reorder
      return newBlocks.map((b, i) => ({ ...b, order: i }))
    })

    // Focus new block (use timeout to let render complete)
    setTimeout(() => {
      // Find the newly created block (it's right after the current one)
      setBlocks(currentBlocks => {
        const index = currentBlocks.findIndex(b => b.id === blockId)
        if (index >= 0 && index + 1 < currentBlocks.length) {
          setFocusedBlockId(currentBlocks[index + 1].id)
        }
        return currentBlocks
      })
    }, 10)
  }, [saveToHistory])

  // NEW: Handle Backspace at start - merges with previous block (tree mutation)
  const onBackspaceMerge = useCallback((blockId: string) => {
    saveToHistory()

    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === blockId)
      if (index <= 0) return prev // Can't merge first block

      const currentBlock = prev[index]
      const prevBlock = prev[index - 1]

      // Special case: if previous block is divider, just delete it
      if (prevBlock.type === 'divider') {
        const newBlocks = prev.filter((_, i) => i !== index - 1)
        setTimeout(() => setFocusedBlockId(blockId), 10)
        return newBlocks.map((b, i) => ({ ...b, order: i }))
      }

      // Merge blocks using the operation from block-operations
      const mergedBlock = mergeBlocks(prevBlock, currentBlock)

      const newBlocks = prev.filter((_, i) => i !== index)
      newBlocks[index - 1] = mergedBlock

      // Focus the merged block
      setTimeout(() => setFocusedBlockId(prevBlock.id), 10)

      return newBlocks.map((b, i) => ({ ...b, order: i }))
    })
  }, [saveToHistory])

  // Focus navigation helpers
  const focusPreviousBlock = useCallback(() => {
    setBlocks(currentBlocks => {
      const currentIndex = currentBlocks.findIndex(b => b.id === focusedBlockId)
      if (currentIndex > 0) {
        setFocusedBlockId(currentBlocks[currentIndex - 1].id)
      }
      return currentBlocks
    })
  }, [focusedBlockId])

  const focusNextBlock = useCallback(() => {
    setBlocks(currentBlocks => {
      const currentIndex = currentBlocks.findIndex(b => b.id === focusedBlockId)
      if (currentIndex < currentBlocks.length - 1) {
        setFocusedBlockId(currentBlocks[currentIndex + 1].id)
      }
      return currentBlocks
    })
  }, [focusedBlockId])

  const getBlockNumber = (block: Block, index: number) => {
      let count = 1
      for (let i = 0; i < index; i++) {
          if (blocks[i].type === 'numberedList') count++
          else if (blocks[i].type !== 'numberedList' && i > 0 && blocks[i-1].type === 'numberedList') count = 1
      }
      return count
  }

  const addCover = () => {
      saveToHistory()
      setCoverImage(COVERS[Math.floor(Math.random() * COVERS.length)])
  }

  const addIcon = () => {
      saveToHistory()
      setIcon('📄')
  }

  return (
    <div className={cn("flex flex-col min-h-full pb-32 relative font-sans", isDark ? "bg-[#191919]" : "bg-white")}>

        {/* Cover Image */}
        <div  className={cn(
            "group relative w-full transition-all duration-300 ease-in-out",
            coverImage ? "h-[30vh] min-h-[200px]" : "h-[12vh] min-h-[120px]",
            coverImage ? coverImage : (isDark ? "bg-[#191919] hover:bg-[#202020]" : "bg-white hover:bg-slate-50")
        )}>
            {coverImage && (
                 <div className="absolute bottom-4 right-12 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <Button variant="secondary" size="sm" className="shadow-sm bg-white/50 backdrop-blur-md hover:bg-white/80 dark:bg-black/50 dark:hover:bg-black/80 dark:text-white border-0" onClick={() => setCoverImage(null)}>
                        Change Cover
                    </Button>
                </div>
            )}
            {!coverImage && (
                <div className="absolute bottom-2 left-[calc(50%-384px+48px)] xl:left-[calc(50%-448px+48px)] flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground">
                        <Button variant="ghost" size="sm" onClick={addIcon} className="text-xs h-7 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"><Smile className="mr-1.5 h-3.5 w-3.5" /> Add Icon</Button>
                        <Button variant="ghost" size="sm" onClick={addCover} className="text-xs h-7 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"><ImageIcon className="mr-1.5 h-3.5 w-3.5" /> Add Cover</Button>
                </div>
            )}
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto w-full px-12 md:px-24 flex-1 flex flex-col relative">
            {/* Icon */}
            {icon && (
                <div className="relative group/icon -mt-[42px] mb-6 ml-1 z-20 w-fit">
                    <div className="text-[78px] leading-none shadow-none rounded-sm cursor-pointer transition-transform hover:scale-105 select-none" onClick={() => setIcon(null)}>
                        {icon}
                    </div>
                     <div className="absolute top-0 -right-4 opacity-0 group-hover/icon:opacity-100 cursor-pointer p-1 bg-white dark:bg-neutral-800 rounded-full shadow-sm border dark:border-neutral-700" onClick={(e) => { e.stopPropagation(); setIcon(null) }}>
                        <X className="h-3 w-3 text-neutral-400 hover:text-red-500" />
                    </div>
                </div>
            )}

            {/* Title (First Block should be H1 logically, but we often keep title separate in metadata.
                However, looking at user's data, title IS block[0]. So we rely on standard rendering for now,
                BUT we can add a visual spacer if no icon exists to push content down slightly?
                Actually, standard Notion just starts.
            */}
             {!icon && <div className="h-8" />}

            {/* Blocks */}
            <Reorder.Group axis="y" values={blocks} onReorder={setBlocks} className="space-y-1">
                <AnimatePresence initial={false}>
                    {blocks.map((block, index) => (
                        <EditorBlock
                            key={block.id}
                            block={block}
                            index={index}
                            isDark={isDark}
                            isFocused={focusedBlockId === block.id}
                            isSelected={selectedBlockIds.has(block.id)}
                            updateBlock={updateBlock}
                            addBlockAfter={addBlockAfter}
                            deleteBlock={deleteBlock}
                            duplicateBlock={duplicateBlock}
                            onEnterSplit={onEnterSplit}
                            onBackspaceMerge={onBackspaceMerge}
                            focusPreviousBlock={focusPreviousBlock}
                            focusNextBlock={focusNextBlock}
                            setFocusedBlockId={setFocusedBlockId}
                            toggleSelection={toggleBlockSelection} // New Prop
                            getBlockNumber={getBlockNumber}
                            onPaste={onPaste}
                        />
                    ))}
                </AnimatePresence>
            </Reorder.Group>

             {/* Bottom Placeholder */}
             <div
                className={cn("h-32 mt-4 cursor-text", isDark ? "text-neutral-700" : "text-slate-200")}
                onClick={() => addBlockAfter(blocks[blocks.length - 1].id)}
            >
                <div className="px-1 text-sm">Click to add content...</div>
            </div>
        </div>

        {/* Floating Components */}
        <CommandPopover
            open={showSlashMenu}
            onOpenChange={setShowSlashMenu}
            position={slashMenuPosition}
            onSelect={(type, calloutType) => {
                if (focusedBlockId) {
                    updateBlock(focusedBlockId, { type, calloutType })
                    setFocusedBlockId(null) // Reset focus to re-trigger
                    setTimeout(() => setFocusedBlockId(focusedBlockId), 10)
                }
                setShowSlashMenu(false)
            }}
            isDark={isDark}
        />
    </div>
  )
}

function CommandPopover({
    open,
    onOpenChange,
    position,
    onSelect,
    isDark
}: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
    position: { top: number, left: number },
    onSelect: (type: BlockType, calloutType?: Block['calloutType']) => void,
    isDark: boolean
}) {
    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-50 bg-black/5 dark:bg-black/20"
            onClick={() => onOpenChange(false)}
        >
             <div
                className="absolute z-50"
                style={{ top: position.top, left: position.left }} // Remove maxHeight from style, handle in class
                onClick={(e) => e.stopPropagation()}
            >
                <Command className={cn(
                    "w-72 rounded-lg border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1",
                    isDark ? "bg-[#1F1F1F] border-neutral-800" : "bg-white border-slate-100"
                )}>
                    <CommandInput
                        placeholder="Type a command..."
                        className={cn("border-none focus:ring-0 text-sm h-9", isDark ? "bg-[#1F1F1F] text-white placeholder:text-neutral-500" : "")}
                        autoFocus
                    />
                    <CommandList className="max-h-[320px] overflow-auto px-1 py-1 custom-scrollbar">
                        <CommandEmpty className="py-3 text-xs text-center text-muted-foreground">No matches found.</CommandEmpty>
                        <CommandGroup heading="Basic Blocks" className={cn("text-xs font-medium text-muted-foreground", isDark ? "text-neutral-500" : "")}>
                             {SLASH_COMMANDS.map(cmd => (
                                 <CommandItem
                                    key={cmd.id}
                                    value={cmd.label}
                                    onSelect={() => onSelect(cmd.type, cmd.calloutType)}
                                    className={cn(
                                        "flex items-center gap-3 px-2 py-2 rounded-[4px] cursor-pointer text-sm transition-colors my-0.5",
                                        isDark ? "aria-selected:bg-[#2C2C2C] text-neutral-200" : "aria-selected:bg-[#EFEFEF] text-slate-700"
                                    )}
                                 >
                                    <div className={cn(
                                        "flex items-center justify-center h-10 w-10 rounded-[4px] border border-opacity-50 shrink-0",
                                        isDark ? "bg-[#2C2C2C] border-neutral-700" : "bg-white border-slate-200 shadow-sm"
                                    )}>
                                        {cmd.icon}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="font-medium text-[13px]">{cmd.label}</span>
                                        <span className="text-[11px] text-muted-foreground line-clamp-1 opacity-70">{cmd.description}</span>
                                    </div>
                                 </CommandItem>
                             ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </div>
        </div>
    )
}
