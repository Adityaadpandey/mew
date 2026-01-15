'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  FileText,
  GitBranch,
  Grid3X3,
  List,
  MoreHorizontal,
  Plus,
  Search
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useApp } from '@/lib/app-context'

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
          if (filterType) {
            filtered = data.filter((d: Document) => d.type === filterType)
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
        // Use proper routes based on document type
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

  return (
    <ScrollArea className="h-full">
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className={cn(
              "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
              isDark ? "text-neutral-500" : "text-slate-400"
            )} />
            <Input
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={cn(
                "pl-10",
                isDark
                  ? "bg-neutral-900/50 border-neutral-800"
                  : "bg-white/70 border-slate-200"
              )}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className={cn(
              "flex rounded-lg border p-1",
              isDark ? "border-neutral-800 bg-neutral-900/50" : "border-slate-200 bg-white/70"
            )}>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  viewMode === 'grid' && (isDark ? "bg-neutral-800" : "bg-slate-100")
                )}
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  viewMode === 'list' && (isDark ? "bg-neutral-800" : "bg-slate-100")
                )}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={handleCreateDocument}
              className="gap-2 bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001]"
            >
              <Plus className="h-4 w-4" />
              New {filterType === 'DIAGRAM' ? 'Diagram' : 'Document'}
            </Button>
          </div>
        </div>

        {/* Documents Grid/List */}
        {filteredDocs.length === 0 ? (
          <div className={cn(
            "flex flex-col items-center justify-center rounded-2xl py-20 px-8",
            isDark ? "bg-neutral-900/50" : "bg-white/50"
          )}>
            <div className={cn(
              "flex h-20 w-20 items-center justify-center rounded-2xl mb-6",
              isDark ? "bg-neutral-800" : "bg-slate-100"
            )}>
              {filterType === 'DIAGRAM' ? (
                <GitBranch className={cn("h-10 w-10", isDark ? "text-neutral-600" : "text-slate-400")} />
              ) : (
                <FileText className={cn("h-10 w-10", isDark ? "text-neutral-600" : "text-slate-400")} />
              )}
            </div>
            <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
              No {filterType === 'DIAGRAM' ? 'diagrams' : 'documents'} yet
            </h3>
            <p className={cn("text-center max-w-md mb-6", isDark ? "text-neutral-400" : "text-slate-500")}>
              Create your first {filterType === 'DIAGRAM' ? 'diagram' : 'document'} to get started
            </p>
            <Button
              onClick={handleCreateDocument}
              className="gap-2 bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001]"
            >
              <Plus className="h-4 w-4" />
              Create {filterType === 'DIAGRAM' ? 'Diagram' : 'Document'}
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                onClick={() => {
                  if (doc.type === 'DIAGRAM' || doc.type === 'CANVAS') {
                    router.push(`/designs/${doc.id}`)
                  } else {
                    router.push(`/documents/${doc.id}`)
                  }
                }}
                className={cn(
                  "group cursor-pointer rounded-xl border p-6 transition-all hover:shadow-lg",
                  isDark
                    ? "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
                    : "bg-white/70 border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl",
                    doc.type === 'DIAGRAM'
                      ? "bg-[#E85002]/10 text-[#E85002]"
                      : "bg-[#F16001]/10 text-[#F16001]"
                  )}>
                    {doc.type === 'DIAGRAM' ? (
                      <GitBranch className="h-6 w-6" />
                    ) : (
                      <FileText className="h-6 w-6" />
                    )}
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Open</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className={cn(
                  "font-semibold text-lg mb-2 truncate",
                  isDark ? "text-white" : "text-slate-900"
                )}>
                  {doc.title}
                </h3>

                <p className={cn("text-sm", isDark ? "text-neutral-500" : "text-slate-500")}>
                  Updated {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                </p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocs.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => {
                  if (doc.type === 'DIAGRAM' || doc.type === 'CANVAS') {
                    router.push(`/designs/${doc.id}`)
                  } else {
                    router.push(`/documents/${doc.id}`)
                  }
                }}
                className={cn(
                  "group flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md",
                  isDark
                    ? "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
                    : "bg-white/70 border-slate-200 hover:border-slate-300"
                )}
              >
                <div className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-xl",
                  doc.type === 'DIAGRAM'
                    ? "bg-[#E85002]/10 text-[#E85002]"
                    : "bg-[#F16001]/10 text-[#F16001]"
                )}>
                  {doc.type === 'DIAGRAM' ? (
                    <GitBranch className="h-6 w-6" />
                  ) : (
                    <FileText className="h-6 w-6" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "font-semibold truncate",
                    isDark ? "text-white" : "text-slate-900"
                  )}>
                    {doc.title}
                  </h3>
                  <p className={cn("text-sm", isDark ? "text-neutral-500" : "text-slate-500")}>
                    Updated {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Open</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
