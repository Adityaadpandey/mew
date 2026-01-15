'use client'

import { useRouter } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { FileText, MoreHorizontal, Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Document {
  id: string
  title: string
  type: string
  updatedAt: string
  creator: {
    name: string
    avatar: string | null
  }
  content?: any
}

export function ProjectDocs({ projectId, workspaceId }: { projectId: string; workspaceId: string }) {
  const router = useRouter()
  // ...
  async function handleCreateDocument() {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Document',
          type: 'DOCUMENT',
          workspaceId,
          projectId,
          content: {},
        }),
      })

      if (res.ok) {
        const newDoc = await res.json()
        window.open(`/documents/${newDoc.id}`, '_self')
      }
    } catch (error) {
      console.error('Failed to create document:', error)
    }
  }
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch(`/api/documents?projectId=${projectId}&type=DOCUMENT`)
        if (res.ok) {
          const data = await res.json()
          setDocuments(data)
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDocuments()
  }, [projectId])

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
      return <div className="p-8 text-center text-muted-foreground">Loading documents...</div>
  }

  return (
    <div className="h-full flex flex-col p-8 space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-9 bg-background/50 border-white/10 focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          className="gap-2 shadow-lg shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleCreateDocument}
        >
          <Plus className="h-4 w-4" /> New Document
        </Button>
      </div>

      {/* Grid */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredDocs.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group relative overflow-hidden border border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer">
                <div className="aspect-[4/3] bg-white dark:bg-neutral-900 p-4 flex flex-col justify-between relative border-b border-white/5 group-hover:bg-neutral-50 dark:group-hover:bg-neutral-800 transition-colors">
                     <div className="absolute inset-0 p-4 opacity-50 overflow-hidden pointer-events-none">
                        {doc.content?.blocks && Array.isArray(doc.content.blocks) ? (
                          <div className="text-[10px] text-muted-foreground space-y-1">
                            {doc.content.blocks.slice(0, 6).map((block: any, idx: number) => (
                              <p key={idx} className="truncate">{block.content || ' '}</p>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 opacity-20">
                             <div className="h-2 w-3/4 bg-current rounded" />
                             <div className="h-2 w-full bg-current rounded" />
                             <div className="h-2 w-5/6 bg-current rounded" />
                          </div>
                        )}
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent" />

                     <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="shadow-xl"
                        onClick={() => window.open(`/documents/${doc.id}`, '_self')}
                      >
                        Open Doc
                      </Button>
                   </div>
                   <div className="flex justify-between items-start z-10 relative">
                     <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20 bg-background/80 backdrop-blur-sm">
                       <FileText className="h-4 w-4" />
                     </div>
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background">
                           <MoreHorizontal className="h-4 w-4" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         <DropdownMenuItem>Rename</DropdownMenuItem>
                         <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                       </DropdownMenuContent>
                     </DropdownMenu>
                   </div>
                </div>

                <div className="p-3 border-t border-white/5 bg-background/40 backdrop-blur-sm">
                  <h3 className="font-medium text-sm truncate mb-2">{doc.title}</h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                       <Avatar className="h-4 w-4">
                         <AvatarImage src={doc.creator.avatar || undefined} />
                         <AvatarFallback className="text-[9px]">{doc.creator.name[0]}</AvatarFallback>
                       </Avatar>
                       <span className="truncate max-w-[80px]">{doc.creator.name}</span>
                    </div>
                    <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/5">
          <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No documents yet</h3>
          <p className="text-sm text-muted-foreground/60 mt-1 mb-6 text-center max-w-sm">
            Create documents to specs, notes, and documentation for your project.
          </p>
          <Button
            className="gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={handleCreateDocument}
          >
             <Plus className="h-4 w-4" /> Create Document
          </Button>
        </div>
      )}
    </div>
  )
}
