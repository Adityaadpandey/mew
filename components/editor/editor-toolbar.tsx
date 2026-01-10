'use client'

import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Link,
  Image,
  Table,
  Minus,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Heading1,
  Heading2,
  Heading3,
  ChevronDown,
  Undo,
  Redo,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface ToolbarButtonProps {
  icon: React.ReactNode
  label: string
  shortcut?: string
  active?: boolean
  onClick?: () => void
}

function ToolbarButton({ icon, label, shortcut, active, onClick }: ToolbarButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('h-8 w-8', active && 'bg-muted')}
          onClick={onClick}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
        {shortcut && <p className="text-xs text-muted-foreground">{shortcut}</p>}
      </TooltipContent>
    </Tooltip>
  )
}

export function EditorToolbar() {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-0.5 border-b bg-white px-2 py-1">
        {/* Undo/Redo */}
        <ToolbarButton icon={<Undo className="h-4 w-4" />} label="Undo" shortcut="⌘Z" />
        <ToolbarButton icon={<Redo className="h-4 w-4" />} label="Redo" shortcut="⌘⇧Z" />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Headings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
              <Heading1 className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Heading1 className="mr-2 h-4 w-4" />
              Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Heading2 className="mr-2 h-4 w-4" />
              Heading 2
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Heading3 className="mr-2 h-4 w-4" />
              Heading 3
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Text Formatting */}
        <ToolbarButton icon={<Bold className="h-4 w-4" />} label="Bold" shortcut="⌘B" />
        <ToolbarButton icon={<Italic className="h-4 w-4" />} label="Italic" shortcut="⌘I" />
        <ToolbarButton icon={<Underline className="h-4 w-4" />} label="Underline" shortcut="⌘U" />
        <ToolbarButton icon={<Strikethrough className="h-4 w-4" />} label="Strikethrough" />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Lists */}
        <ToolbarButton icon={<List className="h-4 w-4" />} label="Bullet list" />
        <ToolbarButton icon={<ListOrdered className="h-4 w-4" />} label="Numbered list" />
        <ToolbarButton icon={<CheckSquare className="h-4 w-4" />} label="Checklist" />

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Blocks */}
        <ToolbarButton icon={<Code className="h-4 w-4" />} label="Code block" />
        <ToolbarButton icon={<Quote className="h-4 w-4" />} label="Quote" />

        {/* Callouts */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
              <Info className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Info className="mr-2 h-4 w-4 text-blue-500" />
              Info callout
            </DropdownMenuItem>
            <DropdownMenuItem>
              <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
              Warning callout
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
              Success callout
            </DropdownMenuItem>
            <DropdownMenuItem>
              <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
              Error callout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Separator orientation="vertical" className="mx-1 h-6" />

        {/* Insert */}
        <ToolbarButton icon={<Link className="h-4 w-4" />} label="Insert link" shortcut="⌘K" />
        <ToolbarButton icon={<Image className="h-4 w-4" />} label="Insert image" />
        <ToolbarButton icon={<Table className="h-4 w-4" />} label="Insert table" />
        <ToolbarButton icon={<Minus className="h-4 w-4" />} label="Horizontal rule" />
      </div>
    </TooltipProvider>
  )
}
