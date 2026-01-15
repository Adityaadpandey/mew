'use client'

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
import { FileText, LayoutTemplate, MoreHorizontal, Plus, Search } from 'lucide-react'
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
}

interface ProjectDocumentsProps {
  projectId: string
  type: 'DOCUMENT' | 'DIAGRAM'
}

export function ProjectDocuments({ projectId, type }: ProjectDocumentsProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const res = await fetch(`/api/documents?projectId=${projectId}&type=${type}`)
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
  }, [projectId, type])

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  )

  const emptyLabel = type === 'DOCUMENT' ? 'No documents found' : 'No designs found'
  const createLabel = type === 'DOCUMENT' ? 'New Document' : 'New Design'
  const icon = type === 'DOCUMENT' ? <FileText className="h-8 w-8 text-muted-foreground mb-4" /> : <LayoutTemplate className="h-8 w-8 text-muted-foreground mb-4" />

  if (isLoading) {
      return <div className="p-8 text-center text-muted-foreground">Loading...</div>
  }

  return (
    <div className="h-full flex flex-col p-8 space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${type === 'DOCUMENT' ? 'docs' : 'designs'}...`}
            className="pl-9 bg-background/50 border-white/10 focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40">
          <Plus className="h-4 w-4" /> {createLabel}
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
              <Card className="group relative overflow-hidden border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
                <div className="aspect-[4/3] bg-gradient-to-br from-white/5 to-transparent p-4 flex flex-col justify-between">
                   <div className="flex justify-between items-start">
                     <div className={`p-2 rounded-lg ${type === 'DOCUMENT' ? 'bg-blue-500/20 text-blue-500' : 'bg-purple-500/20 text-purple-500'}`}>
                       {type === 'DOCUMENT' ? <FileText className="h-4 w-4" /> : <LayoutTemplate className="h-4 w-4" />}
                     </div>
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
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
          {icon}
          <h3 className="text-lg font-medium text-muted-foreground">{emptyLabel}</h3>
          <p className="text-sm text-muted-foreground/60 mt-1 mb-4">Create a new item to get started</p>
          <Button variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> {createLabel}
          </Button>
        </div>
      )}
    </div>
  )
}
