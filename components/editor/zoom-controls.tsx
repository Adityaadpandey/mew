'use client'

import { Button } from '@/components/ui/button'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useCanvasStore } from '@/lib/store'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { Maximize, ZoomIn, ZoomOut } from 'lucide-react'

export function ZoomControls() {
  const { zoom, setZoom, setPan } = useCanvasStore()
  const { resolvedTheme } = useTheme()
  const darkMode = resolvedTheme === 'dark'

  const handleZoomIn = () => {
    setZoom(Math.min(4, zoom + 0.25))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(0.25, zoom - 0.25))
  }

  const handleFitToScreen = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  return (
    <TooltipProvider>
      <div className={cn(
        "flex h-11 items-center gap-0.5 rounded-xl border px-1.5 shadow-lg",
        darkMode 
          ? "bg-neutral-950 border-neutral-800" 
          : "bg-white border-slate-200"
      )}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", darkMode && "text-neutral-300 hover:bg-neutral-800")}
              onClick={handleZoomOut}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-neutral-900 text-white border-0">Zoom out (⌘-)</TooltipContent>
        </Tooltip>

        <button
          className={cn(
            "min-w-[52px] px-2 py-1 text-xs font-medium rounded transition-colors",
            darkMode 
              ? "text-neutral-300 hover:bg-neutral-800" 
              : "text-slate-600 hover:bg-slate-100"
          )}
          onClick={() => setZoom(1)}
        >
          {Math.round(zoom * 100)}%
        </button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", darkMode && "text-neutral-300 hover:bg-neutral-800")}
              onClick={handleZoomIn}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-neutral-900 text-white border-0">Zoom in (⌘+)</TooltipContent>
        </Tooltip>

        <div className={cn("mx-0.5 h-4 w-px", darkMode ? "bg-neutral-800" : "bg-slate-200")} />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", darkMode && "text-neutral-300 hover:bg-neutral-800")}
              onClick={handleFitToScreen}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-neutral-900 text-white border-0">Fit to screen (⌘0)</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
