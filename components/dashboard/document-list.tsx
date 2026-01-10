
'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
    ArrowRight,
    Clock,
    FileText, GitBranch,
    MoreVertical,
    Star
} from 'lucide-react'

interface DocumentActionsProps {
  document: { id: string; title: string; type: 'DOCUMENT' | 'DIAGRAM' | 'CANVAS'; isFavorite: boolean; updatedAt: string }
  onClick: () => void
  onDuplicate: (e: React.MouseEvent) => void
  onToggleFavorite: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
  isDark: boolean
}

export function DocumentCard({ document, onClick, onDuplicate, onToggleFavorite, onDelete, isDark }: DocumentActionsProps) {
  const timeAgo = formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })
  const isDiagram = document.type === 'DIAGRAM' || document.type === 'CANVAS'

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        isDark
          ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
          : "bg-white border-slate-200 hover:border-blue-200"
      )}
      onClick={onClick}
    >
      {/* Thumbnail Area */}
      <div className={cn(
        "relative aspect-[16/9] overflow-hidden",
        isDiagram
          ? isDark ? "bg-gradient-to-br from-blue-900/20 to-indigo-900/20" : "bg-gradient-to-br from-blue-50 to-indigo-50"
          : isDark ? "bg-neutral-800" : "bg-slate-50"
      )}>
        {/* Abstract Pattern for Diagram */}
        {isDiagram && (
            <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>
        )}

        {/* Central Icon / Preview */}
        <div className="absolute inset-0 flex items-center justify-center transition-transform group-hover:scale-105">
           <div className={cn(
             "h-16 w-16 rounded-2xl flex items-center justify-center shadow-sm",
             isDiagram
               ? "bg-blue-500 text-white shadow-blue-500/20"
               : isDark ? "bg-neutral-700 text-neutral-300" : "bg-white text-slate-400 shadow-slate-200"
           )}>
             {isDiagram ? <GitBranch className="h-8 w-8" /> : <FileText className="h-8 w-8" />}
           </div>
        </div>

        {/* Favorite Badge */}
        {document.isFavorite && (
          <div className="absolute top-2 right-2 p-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          </div>
        )}

        {/* Type Badge */}
        <div className={cn(
            "absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wider backdrop-blur-md border",
            isDark ? "bg-black/40 border-white/10 text-white/80" : "bg-white/60 border-black/5 text-slate-600"
        )}>
            {document.type}
        </div>
      </div>

      {/* Info Area */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
                <h3 className={cn(
                    "truncate font-semibold text-sm leading-tight group-hover:text-blue-500 transition-colors",
                    isDark ? "text-neutral-200" : "text-slate-900"
                )}>
                    {document.title}
                </h3>
                <div className={cn("mt-1.5 flex items-center gap-2 text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
                    <Clock className="h-3 w-3" />
                    <span>{timeAgo}</span>
                </div>
            </div>

            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                variant="ghost"
                size="icon"
                className={cn("h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity -mr-1", isDark && "hover:bg-neutral-800")}
                onClick={(e) => e.stopPropagation()}
                >
                <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={isDark ? "bg-neutral-900 border-neutral-700" : ""}>
                <DropdownMenuItem onClick={onClick}>Open</DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator className={isDark ? "bg-neutral-700" : ""} />
                <DropdownMenuItem onClick={onToggleFavorite}>
                {document.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </DropdownMenuItem>
                <DropdownMenuSeparator className={isDark ? "bg-neutral-700" : ""} />
                <DropdownMenuItem className="text-red-500" onClick={onDelete}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export function DocumentRow({ document, onClick, onDuplicate, onToggleFavorite, onDelete, isDark }: DocumentActionsProps) {
  const timeAgo = formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })
  const isDiagram = document.type === 'DIAGRAM' || document.type === 'CANVAS'

  return (
    <div
      className={cn(
        "group flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-all hover:shadow-md",
        isDark
          ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
          : "bg-white border-slate-200 hover:border-slate-300"
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div className={cn(
        "flex h-12 w-12 items-center justify-center rounded-xl shrink-0",
        isDiagram
          ? "bg-blue-500/10 text-blue-500"
          : isDark ? "bg-neutral-800 text-neutral-400" : "bg-slate-100 text-slate-500"
      )}>
        {isDiagram ? <GitBranch className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className={cn(
            "truncate font-medium group-hover:text-blue-500 transition-colors",
            isDark ? "text-neutral-200" : "text-slate-900"
          )}>
            {document.title}
          </h3>
          {document.isFavorite && <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />}
        </div>
        <div className={cn("mt-1 flex items-center gap-3 text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
          <span className={cn(
            "px-2 py-0.5 rounded-full capitalize",
            isDiagram
              ? isDark ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600"
              : isDark ? "bg-neutral-800 text-neutral-400" : "bg-slate-100 text-slate-600"
          )}>
            {document.type.toLowerCase()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className={cn("opacity-0 group-hover:opacity-100 transition-opacity", isDark && "hover:bg-neutral-800")}
          onClick={(e) => { e.stopPropagation(); onClick() }}
        >
          Open
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity", isDark && "hover:bg-neutral-800")} onClick={(e) => e.stopPropagation()}>
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className={isDark ? "bg-neutral-900 border-neutral-700" : ""}>
                <DropdownMenuItem onClick={onClick}>Open</DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator className={isDark ? "bg-neutral-700" : ""} />
                <DropdownMenuItem onClick={onToggleFavorite}>
                    {document.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </DropdownMenuItem>
                <DropdownMenuSeparator className={isDark ? "bg-neutral-700" : ""} />
                <DropdownMenuItem className="text-red-500" onClick={onDelete}>Delete</DropdownMenuItem>
             </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
