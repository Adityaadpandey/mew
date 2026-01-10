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
import { Check, CheckSquare, Copy, GripVertical, Trash2 } from 'lucide-react'
import { KeyboardEvent, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Block } from './types'

interface EditorBlockProps {
  block: Block
  index: number
  isDark: boolean
  isFocused: boolean
  isSelected: boolean
  toggleSelection: (id: string, multi: boolean) => void
  updateBlock: (id: string, updates: Partial<Block>) => void
  addBlockAfter: (id: string, type?: Block['type']) => void
  addBlocksAfter: (id: string, blocks: Partial<Block>[]) => void
  deleteBlock: (id: string) => void
  duplicateBlock: (block: Block) => void
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>, block: Block) => void
  setFocusedBlockId: (id: string | null) => void
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
  addBlocksAfter,
  deleteBlock,
  duplicateBlock,
  onKeyDown,
  setFocusedBlockId,
  getBlockNumber
}: EditorBlockProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const dragControls = useDragControls()

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [block.content])

  // Focus management
  useEffect(() => {
    if (isFocused && textareaRef.current) {
        if (document.activeElement !== textareaRef.current) {
             textareaRef.current.focus()
             // Move cursor to end
             const len = textareaRef.current.value.length
             textareaRef.current.setSelectionRange(len, len)
        }
    }
  }, [isFocused])

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault()
      const text = e.clipboardData.getData('text/plain')
      if (!text) return

      // If we are INSIDE a code block, just insert the text raw, don't split tokens
      if (block.type === 'code') {
          const start = textareaRef.current?.selectionStart || 0
          const end = textareaRef.current?.selectionEnd || 0
          const newVal = block.content.substring(0, start) + text + block.content.substring(end)
          updateBlock(block.id, { content: newVal })
          setTimeout(() => {
              if (textareaRef.current) {
                  textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + text.length
              }
          }, 0)
          return
      }

      const lines = text.split('\n')

      // If single line, just insert text (or parse if needed, but let's just insert for now)
      if (lines.length === 1) {
          const val = block.content + text
          updateBlock(block.id, { content: val })
          return
      }

      // Multi-line: Stateful Parser
      const newBlocks: Partial<Block>[] = []
      let currentCodeBlock: Partial<Block> | null = null

      for (let i = 0; i < lines.length; i++) {
          const line = lines[i]

          if (currentCodeBlock) {
               if (line.trim().startsWith('```')) {
                   newBlocks.push(currentCodeBlock)
                   currentCodeBlock = null
               } else {
                   currentCodeBlock.content += (currentCodeBlock.content ? '\n' : '') + line
               }
               continue
          }

          if (line.trim().startsWith('```')) {
               currentCodeBlock = { type: 'code', content: '' }
               continue
          }

          let type: Block['type'] = 'paragraph'
          let content = line
          let calloutType: Block['calloutType'] = undefined

          if (line.startsWith('# ')) { type = 'heading1'; content = line.slice(2) }
          else if (line.startsWith('## ')) { type = 'heading2'; content = line.slice(3) }
          else if (line.startsWith('### ')) { type = 'heading3'; content = line.slice(4) }
          else if (line.startsWith('- ') || line.startsWith('* ')) { type = 'bulletList'; content = line.slice(2) }
          else if (line.match(/^\d+\. /)) { type = 'numberedList'; content = line.replace(/^\d+\. /, '') }
          else if (line.startsWith('[] ') || line.startsWith('- [ ] ')) { type = 'checkList'; content = line.replace(/^(\[\]|- \[ \]) /, '') }
          else if (line.startsWith('> ')) { type = 'quote'; content = line.slice(2) }
          else if (line === '---') { type = 'divider'; content = '' }

          newBlocks.push({ type, content, calloutType })
      }

      if (currentCodeBlock) newBlocks.push(currentCodeBlock)

      // Update current block with first line content
      const firstBlock = newBlocks[0]
      updateBlock(block.id, {
          content: firstBlock.content,
          type: firstBlock.type,
          calloutType: firstBlock.calloutType
      })

      // Insert remaining blocks
      if (newBlocks.length > 1) {
          addBlocksAfter(block.id, newBlocks.slice(1))
      }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value

      // Markdown Parsers
      if (block.type === 'paragraph' && val.endsWith(' ') && val.length < 5) {
          if (val === '# ') { updateBlock(block.id, { type: 'heading1', content: '' }); return }
          if (val === '## ') { updateBlock(block.id, { type: 'heading2', content: '' }); return }
          if (val === '### ') { updateBlock(block.id, { type: 'heading3', content: '' }); return }
          if (val === '> ') { updateBlock(block.id, { type: 'quote', content: '' }); return }
          if (val === '- ' || val === '* ') { updateBlock(block.id, { type: 'bulletList', content: '' }); return }
          if (val === '1. ') { updateBlock(block.id, { type: 'numberedList', content: '' }); return }
          if (val === '[] ') { updateBlock(block.id, { type: 'checkList', content: '' }); return }
          if (val === '``` ') { updateBlock(block.id, { type: 'code', content: '' }); return }
      }

      updateBlock(block.id, { content: val })
  }

  const baseClasses = cn(
    'w-full outline-none resize-none bg-transparent leading-loose transition-all overflow-hidden',
    isDark ? 'text-neutral-100 placeholder:text-neutral-500' : 'text-slate-900 placeholder:text-slate-400',
    block.align === 'center' ? 'text-center' : block.align === 'right' ? 'text-right' : 'text-left'
  )

  const renderContent = () => {
    const commonProps = {
      ref: textareaRef,
      value: block.content,
      onChange: handleInput,
      onPaste: handlePaste,
      onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => onKeyDown(e, block),
      onFocus: () => setFocusedBlockId(block.id),
      onBlur: () => setFocusedBlockId(null),
      rows: 1,
      placeholder: block.type === 'paragraph' ? "Type '/' for commands..." : '',
      className: cn(baseClasses, "z-10 relative") // Ensure textarea is above when focused
    }

    // Common Markdown Renderer
    const MarkdownPreview = ({ className }: { className: string }) => (
        <div
            className={cn(className, "absolute inset-0 z-0 pointer-events-none whitespace-pre-wrap break-words prose dark:prose-invert max-w-none")}
            style={{
                // Careful match of line-height and font-size
            }}
        >
             <ReactMarkdown
                components={{
                    // Override all block elements to be inline-block or plain spans to avoid creating extra margins
                    p: ({node, ...props}: any) => <span {...props} />,
                    h1: ({node, ...props}: any) => <span {...props} />,
                    h2: ({node, ...props}: any) => <span {...props} />,
                    h3: ({node, ...props}: any) => <span {...props} />,
                    // Bold and Italic are main ones we care about
                    strong: ({node, ...props}: any) => <span className="font-bold text-current" {...props} />,
                    em: ({node, ...props}: any) => <span className="italic text-current" {...props} />,
                }}
             >
                {block.content || (block.type === 'paragraph' ? "Type '/' for commands..." : '')}
             </ReactMarkdown>
        </div>
    )

    // Actually, absolute positioning overlay is tricky for auto-size textareas.
    // Better approach: Show one OR the other.

    const showPreview = !isFocused && block.content

    if (showPreview) {
         // Preview Mode View
         // REMOVED: overflow-hidden. Added min-h to prevent collapse.
         const previewClasses = cn(baseClasses, "resize-none whitespace-pre-wrap break-words block min-h-[1.75rem] overflow-visible")



         const CommonPreview = ({ additionalClasses }: { additionalClasses?: string }) => (
             <div className={cn(previewClasses, additionalClasses)} onClick={() => { setFocusedBlockId(block.id); setTimeout(() => textareaRef.current?.focus(), 0) }}>
                 <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                         p: ({node, ...props}: any) => <span {...props} />,
                         a: ({node, ...props}: any) => <span className="text-blue-500 underline" {...props} />,
                         table: ({node, ...props}: any) => <div className="my-4 w-full overflow-y-auto"><table className="w-full border-collapse text-sm" {...props} /></div>,
                         thead: ({node, ...props}: any) => <thead className={cn("bg-neutral-100", isDark ? "bg-neutral-800" : "")} {...props} />,
                         tbody: ({node, ...props}: any) => <tbody {...props} />,
                         tr: ({node, ...props}: any) => <tr className={cn("border-b transition-colors", isDark ? "border-neutral-800 hover:bg-neutral-800/50" : "border-slate-200 hover:bg-slate-50")} {...props} />,
                         th: ({node, ...props}: any) => <th className={cn("border-y px-4 py-2 text-left font-medium", isDark ? "border-neutral-700 text-neutral-200" : "border-slate-200 text-slate-700")} {...props} />,
                         td: ({node, ...props}: any) => <td className="px-4 py-2 min-w-[100px]" {...props} />,
                    }}
                 >
                    {block.content}
                 </ReactMarkdown>
             </div>
         )

         switch (block.type) {
             case 'heading1': return <CommonPreview additionalClasses="text-4xl font-bold mt-6 mb-2" />
             case 'heading2': return <CommonPreview additionalClasses="text-2xl font-semibold mt-4 mb-2" />
             case 'heading3': return <CommonPreview additionalClasses="text-xl font-medium mt-2 mb-1" />
             case 'quote':
                return (
                 <div className={cn("border-l-4 pl-4 my-2", isDark ? "border-neutral-600" : "border-slate-300")}>
                    <CommonPreview additionalClasses={cn("italic text-lg", isDark ? "text-neutral-300" : "text-slate-600")} />
                 </div>
                )
             case 'callout':
                const calloutStyles = {
                    info: isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800',
                    warning: isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800',
                    success: isDark ? 'bg-green-500/10 border-green-500/20 text-green-200' : 'bg-green-50 border-green-200 text-green-800',
                    error: isDark ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-red-50 border-red-200 text-red-800',
                }
                const calloutIcons = { info: '💡', warning: '⚠️', success: '✅', error: '❌' }
                return (
                    <div className={cn('flex items-start gap-3 rounded-lg border p-4 my-2', calloutStyles[block.calloutType || 'info'])}>
                         <span className="text-xl select-none">{calloutIcons[block.calloutType || 'info']}</span>
                         <CommonPreview additionalClasses="bg-transparent" />
                    </div>
                )
            case 'bulletList':
               return (
                  <div className="flex items-start gap-3 pl-2">
                    <span className={cn("mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full", isDark ? "bg-neutral-400" : "bg-slate-600")} />
                    <CommonPreview />
                  </div>
                )
             case 'numberedList':
               return (
                  <div className="flex items-start gap-3 pl-2">
                    <span className={cn("mt-0.5 shrink-0 w-5 text-right font-medium select-none", isDark ? "text-neutral-500" : "text-slate-500")}>
                      {getBlockNumber(block, index)}.
                    </span>
                    <CommonPreview />
                  </div>
                )
             case 'checkList':
               return (
                  <div className="flex items-start gap-3 pl-2">
                    <div
                        className={cn(
                            "mt-1 h-4 w-4 rounded border flex items-center justify-center cursor-pointer transition-colors",
                            block.checked
                                ? "bg-blue-500 border-blue-500"
                                : isDark ? "border-neutral-600 hover:bg-neutral-800" : "border-slate-300 hover:bg-slate-100"
                        )}
                        onClick={(e) => { e.stopPropagation(); updateBlock(block.id, { checked: !block.checked }) }}
                    >
                        {block.checked && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <CommonPreview additionalClasses={cn(block.checked && 'line-through opacity-50 text-slate-400')} />
                  </div>
               )
             // For code, we already have a nice view, but let's stick to textarea for now or custom view
             case 'code':
                 // Keep code editing for now, maybe highlight later
                 break;
             default:
                 // Fallthrough to standard preview for paragraph
                 return <CommonPreview />
         }
    }

    // EDIT MODE
    switch (block.type) {
      case 'heading1':
        return <textarea {...commonProps} className={cn(baseClasses, 'text-4xl font-bold mt-6 mb-2')} placeholder="Heading 1" />
      case 'heading2':
        return <textarea {...commonProps} className={cn(baseClasses, 'text-2xl font-semibold mt-4 mb-2')} placeholder="Heading 2" />
      case 'heading3':
        return <textarea {...commonProps} className={cn(baseClasses, 'text-xl font-medium mt-2 mb-1')} placeholder="Heading 3" />
      case 'bulletList':
        return (
          <div className="flex items-start gap-3 pl-2">
            <span className={cn("mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full", isDark ? "bg-neutral-400" : "bg-slate-600")} />
            <textarea {...commonProps} className={baseClasses} placeholder="List item" />
          </div>
        )
      case 'numberedList':
        return (
          <div className="flex items-start gap-3 pl-2">
            <span className={cn("mt-0.5 shrink-0 w-5 text-right font-medium select-none", isDark ? "text-neutral-500" : "text-slate-500")}>
              {getBlockNumber(block, index)}.
            </span>
            <textarea {...commonProps} className={baseClasses} placeholder="List item" />
          </div>
        )
      case 'checkList':
        return (
          <div className="flex items-start gap-3 pl-2">
            <div
                className={cn(
                    "mt-1 h-4 w-4 rounded border flex items-center justify-center cursor-pointer transition-colors",
                    block.checked
                        ? "bg-blue-500 border-blue-500"
                        : isDark ? "border-neutral-600 hover:bg-neutral-800" : "border-slate-300 hover:bg-slate-100"
                )}
                onClick={() => updateBlock(block.id, { checked: !block.checked })}
            >
                {block.checked && <Check className="h-3 w-3 text-white" />}
            </div>
            <textarea
              {...commonProps}
              className={cn(baseClasses, block.checked && 'line-through opacity-50 text-slate-400')}
              placeholder="To-do item"
            />
          </div>
        )
      case 'code':
        return (
          <div className={cn("rounded-lg p-4 font-mono text-sm my-2 relative group", isDark ? "bg-neutral-900 border border-neutral-800" : "bg-slate-50 border border-slate-200")}>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] uppercase text-muted-foreground select-none">Code</span>
            </div>
            <textarea
              {...commonProps}
              className={cn(baseClasses, "leading-normal", isDark ? "text-blue-300" : "text-slate-800")}
              placeholder="// Write code here..."
              spellCheck={false}
            />
          </div>
        )
      case 'quote':
        return (
          <div className={cn("border-l-4 pl-4 my-2", isDark ? "border-neutral-600" : "border-slate-300")}>
            <textarea
              {...commonProps}
              className={cn(baseClasses, 'italic text-lg', isDark ? "text-neutral-300" : "text-slate-600")}
              placeholder="Empty quote..."
            />
          </div>
        )
      case 'callout':
         const calloutStyles = {
          info: isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-800',
          warning: isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-800',
          success: isDark ? 'bg-green-500/10 border-green-500/20 text-green-200' : 'bg-green-50 border-green-200 text-green-800',
          error: isDark ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-red-50 border-red-200 text-red-800',
        }
        const calloutIcons = { info: '💡', warning: '⚠️', success: '✅', error: '❌' }
        return (
          <div className={cn('flex items-start gap-3 rounded-lg border p-4 my-2', calloutStyles[block.calloutType || 'info'])}>
            <span className="text-xl select-none">{calloutIcons[block.calloutType || 'info']}</span>
            <textarea {...commonProps} className={cn(baseClasses, 'bg-transparent')} placeholder="Callout text..." />
          </div>
        )
      case 'divider':
          return (
              <div className="py-4 cursor-default select-none" onClick={(e) => { e.preventDefault(); textareaRef.current?.focus() } }>
                  <hr className={cn("border-t", isDark ? "border-neutral-800" : "border-slate-200")} />
                   <textarea {...commonProps} className="opacity-0 h-0 w-0 absolute" />
              </div>
          )
      default:
        return <textarea {...commonProps} />
    }
  }

  return (
    <Reorder.Item
      value={block}
      id={block.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      dragListener={false}
      dragControls={dragControls}
      className={cn(
        "group/block relative flex items-start -ml-12 pl-12 py-1 transition-colors rounded-sm min-h-[2rem]",
        isSelected && (isDark ? "bg-blue-500/20" : "bg-blue-100")
      )}
      onClick={(e) => {
          if (e.shiftKey) {
              e.preventDefault()
              toggleSelection(block.id, true)
          }
      }}
    >
      {/* Drag Handle & Menu Trigger Wrapper */}
      {/* Centered relative to the FIRST line of text (approx top-2 is 8px, good for leading-loose) */}
      <div
        className={cn(
            "absolute left-2 top-2 z-10 opacity-0 group-hover/block:opacity-100 transition-opacity flex items-center justify-center",
            isFocused && "opacity-100" // Keep visible if focused? standard notion hides it until hover usually, but let's follow user 'when i get my cursor there'
        )}
        contentEditable={false}
      >
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <div
                    className="flex items-center justify-center h-6 w-5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 cursor-grab active:cursor-grabbing text-neutral-400"
                    onPointerDown={(e) => dragControls.start(e)}
                  >
                      <GripVertical className="h-4 w-4" />
                  </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className={cn("w-48", isDark ? "bg-neutral-900 border-neutral-800" : "")}>
                 <DropdownMenuItem onClick={() => {
                        const newType = block.type === 'checkList' ? 'paragraph' : 'checkList'
                         updateBlock(block.id, { type: newType, checked: false })
                  }}>
                      <CheckSquare className="mr-2 h-4 w-4" />
                      {block.type === 'checkList' ? 'Remove Checkbox' : 'Turn into To-do'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => duplicateBlock(block)}>
                      <Copy className="mr-2 h-4 w-4" /> Duplicate
                  </DropdownMenuItem>
                   <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => deleteBlock(block.id)} className="text-red-600 focus:text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
      </div>

      <div className="flex-1 min-w-0 relative">
        {renderContent()}
      </div>

    </Reorder.Item>
  )
}
