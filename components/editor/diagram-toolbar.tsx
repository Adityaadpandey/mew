'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useCanvasStore } from '@/lib/store'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import {
  ArrowRight, Circle, Diamond, Grid3X3, Hand, Magnet, MousePointer,
  Redo, Spline, Square, StickyNote, Type, Undo
} from 'lucide-react'

interface ToolButtonProps {
  icon: React.ReactNode
  label: string
  shortcut?: string
  active?: boolean
  onClick?: () => void
}

function ToolButton({ icon, label, shortcut, active, onClick }: ToolButtonProps) {
  const { resolvedTheme } = useTheme()
  const darkMode = resolvedTheme === 'dark'
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-9 w-9 transition-all',
            active 
              ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md' 
              : darkMode 
                ? 'hover:bg-neutral-800 text-neutral-300' 
                : 'hover:bg-slate-100 text-slate-600'
          )}
          onClick={onClick}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-2 bg-neutral-900 text-white border-0">
        <span>{label}</span>
        {shortcut && <kbd className="px-1.5 py-0.5 text-[10px] bg-neutral-700 rounded font-mono">{shortcut}</kbd>}
      </TooltipContent>
    </Tooltip>
  )
}

export function DiagramToolbar() {
  const { tool, setTool, gridEnabled, toggleGrid, snapToGrid, toggleSnapToGrid } = useCanvasStore()
  const { resolvedTheme } = useTheme()
  const darkMode = resolvedTheme === 'dark'
  const undo = () => useCanvasStore.temporal.getState().undo()
  const redo = () => useCanvasStore.temporal.getState().redo()

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn(
        "flex h-11 items-center gap-0.5 rounded-xl border px-1.5 shadow-lg",
        darkMode 
          ? "bg-neutral-950 border-neutral-800" 
          : "bg-white border-slate-200"
      )}>
        {/* Selection Tools */}
        <ToolButton icon={<MousePointer className="h-4 w-4" />} label="Select" shortcut="V" active={tool === 'select'} onClick={() => setTool('select')} />
        <ToolButton icon={<Hand className="h-4 w-4" />} label="Pan" shortcut="H" active={tool === 'hand'} onClick={() => setTool('hand')} />

        <Separator orientation="vertical" className={cn("mx-1 h-5", darkMode ? "bg-neutral-800" : "bg-slate-200")} />

        {/* Shape Tools */}
        <ToolButton icon={<Square className="h-4 w-4" />} label="Rectangle" shortcut="R" active={tool === 'rectangle'} onClick={() => setTool('rectangle')} />
        <ToolButton icon={<Circle className="h-4 w-4" />} label="Circle" shortcut="O" active={tool === 'circle'} onClick={() => setTool('circle')} />
        <ToolButton icon={<Diamond className="h-4 w-4" />} label="Diamond" shortcut="D" active={tool === 'diamond'} onClick={() => setTool('diamond')} />

        <Separator orientation="vertical" className={cn("mx-1 h-5", darkMode ? "bg-neutral-800" : "bg-slate-200")} />

        {/* Connection & Text */}
        <ToolButton icon={<Spline className="h-4 w-4" />} label="Connector" shortcut="C" active={tool === 'connector'} onClick={() => setTool('connector')} />
        <ToolButton icon={<ArrowRight className="h-4 w-4" />} label="Arrow" shortcut="A" active={tool === 'arrow'} onClick={() => setTool('arrow')} />
        <ToolButton icon={<Type className="h-4 w-4" />} label="Text" shortcut="T" active={tool === 'text'} onClick={() => setTool('text')} />
        <ToolButton icon={<StickyNote className="h-4 w-4" />} label="Sticky Note" shortcut="N" active={tool === 'sticky'} onClick={() => setTool('sticky')} />

        <Separator orientation="vertical" className={cn("mx-1 h-5", darkMode ? "bg-neutral-800" : "bg-slate-200")} />

        {/* Canvas Controls */}
        <ToolButton icon={<Grid3X3 className="h-4 w-4" />} label="Toggle Grid" shortcut="G" active={gridEnabled} onClick={toggleGrid} />
        <ToolButton icon={<Magnet className="h-4 w-4" />} label="Snap to Grid" shortcut="S" active={snapToGrid} onClick={toggleSnapToGrid} />

        <Separator orientation="vertical" className={cn("mx-1 h-5", darkMode ? "bg-neutral-800" : "bg-slate-200")} />

        {/* History */}
        <ToolButton icon={<Undo className="h-4 w-4" />} label="Undo" shortcut="⌘Z" onClick={undo} />
        <ToolButton icon={<Redo className="h-4 w-4" />} label="Redo" shortcut="⌘⇧Z" onClick={redo} />
      </div>
    </TooltipProvider>
  )
}
