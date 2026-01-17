'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useApp } from '@/lib/app-context'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  FileText,
  GitBranch,
  Grid3X3,
  LayoutList,
  MoreHorizontal,
  Plus,
  Search
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Document {
  id: string
  title: string
  type: 'DOCUMENT' | 'DIAGRAM' | 'CANVAS'
  updatedAt: string
  createdAt: string
}

interface ProjectDocumentsProps {
  projectId: string
  filterType?: 'DOCUMENT' | 'DIAGRAM'
}

export function ProjectDocuments({ projectId, filterType }: ProjectDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const router = useRouter()
  const { currentWorkspace } = useApp()

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(`/api/documents?projectId=${projectId}`)
        if (res.ok) {
          const data = await res.json()
          let filtered = data
          if (filterType === 'DOCUMENT') {
            filtered = data.filter((d: Document) => d.type === 'DOCUMENT')
          } else if (filterType === 'DIAGRAM') {
            filtered = data.filter((d: Document) => d.type === 'DIAGRAM' || d.type === 'CANVAS')
          }
          setDocuments(filtered)
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDocuments()
  }, [projectId, filterType])

  const filteredDocs = documents.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreateDocument = async () => {
    if (!currentWorkspace) {
      console.error('No workspace selected')
      return
    }

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: filterType === 'DIAGRAM' ? 'Untitled Diagram' : 'Untitled Document',
          type: filterType || 'DOCUMENT',
          workspaceId: currentWorkspace.id,
          projectId,
        }),
      })

      if (res.ok) {
        const doc = await res.json()
        if (doc.type === 'DIAGRAM' || doc.type === 'CANVAS') {
          router.push(`/designs/${doc.id}`)
        } else {
          router.push(`/documents/${doc.id}`)
        }
      } else {
        const error = await res.json()
        console.error('Failed to create document:', error)
      }
    } catch (error) {
      console.error('Failed to create document:', error)
    }
  }

  const handleOpenDocument = (doc: Document) => {
    if (doc.type === 'DIAGRAM' || doc.type === 'CANVAS') {
      router.push(`/designs/${doc.id}`)
    } else {
      router.push(`/documents/${doc.id}`)
    }
  }

  const docTypeLabel = filterType === 'DIAGRAM' ? 'design' : 'document'
  const DocTypeIcon = filterType === 'DIAGRAM' ? GitBranch : FileText

  return (
    <ScrollArea className="h-full">
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className={cn(
              "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
              isDark ? "text-zinc-500" : "text-gray-400"
            )} />
            <Input
              placeholder={`Search ${docTypeLabel}s...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "pl-10 h-9",
                isDark
                  ? "bg-zinc-900 border-zinc-800"
                  : "bg-white border-gray-200"
              )}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className={cn(
              "flex rounded-lg border p-0.5",
              isDark ? "border-zinc-800 bg-zinc-900" : "border-gray-200 bg-white"
            )}>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  viewMode === 'grid' && (isDark ? "bg-zinc-800" : "bg-gray-100")
                )}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0",
                  viewMode === 'list' && (isDark ? "bg-zinc-800" : "bg-gray-100")
                )}
                onClick={() => setViewMode('list')}
              >
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={handleCreateDocument}
              size="sm"
              className={cn(
                "gap-2 h-9",
                isDark ? "bg-white text-black hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-800"
              )}
            >
              <Plus className="h-4 w-4" />
              New {filterType === 'DIAGRAM' ? 'Design' : 'Document'}
            </Button>
          </div>
        </div>

        {/* Documents */}
        {filteredDocs.length === 0 ? (
          <div className={cn(
            "text-center py-20 rounded-xl border-2 border-dashed",
            isDark ? "border-zinc-800" : "border-gray-200"
          )}>
            <DocTypeIcon className={cn("h-12 w-12 mx-auto mb-4", isDark ? "text-zinc-700" : "text-gray-300")} />
            <h3 className={cn("text-lg font-medium mb-2", isDark ? "text-white" : "text-gray-900")}>
              {search ? `No ${docTypeLabel}s found` : `No ${docTypeLabel}s yet`}
            </h3>
            <p className={cn("text-sm mb-6", isDark ? "text-zinc-500" : "text-gray-500")}>
              {search ? `No results for "${search}"` : `Create your first ${docTypeLabel} to get started`}
            </p>
            {!search && (
              <Button onClick={handleCreateDocument} size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Create {filterType === 'DIAGRAM' ? 'Design' : 'Document'}
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div
                role="button"
                tabIndex={0}
                key={doc.id}
                onClick={() => handleOpenDocument(doc)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleOpenDocument(doc)
                  }
                }}
                className={cn(
                  "w-full text-left p-5 rounded-xl border transition-all group cursor-pointer relative",
                  isDark
                    ? "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    doc.type === 'DIAGRAM' || doc.type === 'CANVAS'
                      ? "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                  )}>
                    {doc.type === 'DIAGRAM' || doc.type === 'CANVAS' ? (
                      <GitBranch className="h-5 w-5" />
                    ) : (
                      <FileText className="h-5 w-5" />
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 relative z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={isDark ? "bg-zinc-900 border-zinc-800" : ""}>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenDocument(doc); }}>Open</DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Duplicate</DropdownMenuItem>
                      <DropdownMenuSeparator className={isDark ? "bg-zinc-800" : ""} />
                      <DropdownMenuItem className="text-red-500" onClick={(e) => e.stopPropagation()}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className={cn(
                  "font-medium mb-1 truncate",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  {doc.title}
                </h3>

                <p className={cn("text-sm", isDark ? "text-zinc-500" : "text-gray-500")}>
                  Updated {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true }).replace('about ', '')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocs.map((doc) => (
              <div
                role="button"
                tabIndex={0}
                key={doc.id}
                onClick={() => handleOpenDocument(doc)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleOpenDocument(doc)
                  }
                }}
                className={cn(
                  "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group cursor-pointer relative",
                  isDark
                    ? "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700"
                    : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                )}
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
                  doc.type === 'DIAGRAM' || doc.type === 'CANVAS'
                    ? "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400"
                    : "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                )}>
                  {doc.type === 'DIAGRAM' || doc.type === 'CANVAS' ? (
                    <GitBranch className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-medium truncate",
                    isDark ? "text-white" : "text-gray-900"
                  )}>
                    {doc.title}
                  </h3>
                  <p className={cn("text-sm", isDark ? "text-zinc-500" : "text-gray-500")}>
                    Updated {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true }).replace('about ', '')}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 shrink-0 relative z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={isDark ? "bg-zinc-900 border-zinc-800" : ""}>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpenDocument(doc); }}>Open</DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>Duplicate</DropdownMenuItem>
                    <DropdownMenuSeparator className={isDark ? "bg-zinc-800" : ""} />
                    <DropdownMenuItem className="text-red-500" onClick={(e) => e.stopPropagation()}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
