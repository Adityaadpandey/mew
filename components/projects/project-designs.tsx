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
import { LayoutTemplate, MoreHorizontal, PenTool, Plus, Search } from 'lucide-react'
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

export function ProjectDesigns({ projectId, workspaceId }: { projectId: string; workspaceId: string }) {
  const router = useRouter()
  // ...
  async function handleCreateDesign() {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Design',
          type: 'DIAGRAM',
          workspaceId,
          projectId,
          content: {},
        }),
      })

      if (res.ok) {
        const newDoc = await res.json()
        window.open(`/designs/${newDoc.id}`, '_self')
      }
    } catch (error) {
      console.error('Failed to create design:', error)
    }
  }
  const [designs, setDesigns] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchDesigns() {
      try {
        // Fetch both DIAGRAM and CANVAS types
        const res = await fetch(`/api/documents?projectId=${projectId}&type=DIAGRAM,CANVAS`)
        if (res.ok) {
          const data = await res.json()
          setDesigns(data)
        }
      } catch (error) {
        console.error('Failed to fetch designs:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDesigns()
  }, [projectId])

  const filteredDesigns = designs.filter(doc =>
    doc.title.toLowerCase().includes(search.toLowerCase())
  )

  if (isLoading) {
      return <div className="p-8 text-center text-muted-foreground">Loading designs...</div>
  }

  return (
    <div className="h-full flex flex-col p-8 space-y-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search designs..."
            className="pl-9 bg-background/50 border-white/10 focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          className="gap-2 bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00601] hover:to-[#E85002] text-white shadow-lg shadow-orange-900/20"
          onClick={handleCreateDesign}
        >
          <Plus className="h-4 w-4" /> New Design
        </Button>
      </div>

      {/* Grid */}
      {filteredDesigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredDesigns.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group relative overflow-hidden border border-white/5 bg-white/5 hover:bg-white/10 hover:border-orange-500/30 transition-all cursor-pointer">
                <div className="aspect-[4/3] bg-neutral-100/50 dark:bg-neutral-900/50 p-4 flex flex-col justify-between relative">
                   {/* Preview Canvas */}
                   <div className="absolute inset-0 opacity-50 p-4 pointer-events-none overflow-hidden">
                     {doc.content?.objects && Array.isArray(doc.content.objects) && doc.content.objects.length > 0 ? (
                        <svg viewBox="0 0 800 600" className="w-full h-full text-foreground/20 fill-current">
                          {doc.content.objects.map((obj: any, idx: number) => {
                             // Simple rendering of shapes
                             if (obj.type === 'rectangle') {
                               return <rect key={idx} x={obj.x} y={obj.y} width={obj.width} height={obj.height} rx={obj.borderRadius || 0} fill="currentColor" stroke="none" />
                             } else if (obj.type === 'circle') {
                               return <circle key={idx} cx={obj.x + obj.width/2} cy={obj.y + obj.height/2} r={Math.min(obj.width, obj.height)/2} fill="currentColor" stroke="none" />
                             } else if (obj.type === 'text') {
                               return <rect key={idx} x={obj.x} y={obj.y} width={obj.width} height={10} fill="currentColor" opacity={0.5} />
                             }
                             return <rect key={idx} x={obj.x} y={obj.y} width={obj.width} height={obj.height} fill="currentColor" opacity={0.2} />
                          })}
                        </svg>
                     ) : (
                       <div className="absolute inset-0 flex items-center justify-center opacity-10">
                          <LayoutTemplate className="w-16 h-16" />
                       </div>
                     )}
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-t from-background/10 to-transparent" />

                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="shadow-xl"
                        onClick={() => window.open(`/designs/${doc.id}`, '_self')}
                      >
                        Open Design
                      </Button>
                   </div>
                   <div className="flex justify-between items-start z-10 relative">
                     <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 ring-1 ring-orange-500/20 bg-background/80 backdrop-blur-sm">
                       <LayoutTemplate className="h-4 w-4" />
                     </div>
                     <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background">
                           <MoreHorizontal className="h-4 w-4" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         <DropdownMenuItem>Rename</DropdownMenuItem>
                         <DropdownMenuItem>Duplicate</DropdownMenuItem>
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
          <div className="h-16 w-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-4">
            <PenTool className="h-8 w-8 text-orange-500" />
          </div>
          <h3 className="text-lg font-medium text-foreground">No designs yet</h3>
          <p className="text-sm text-muted-foreground/60 mt-1 mb-6 text-center max-w-sm">
            Create whiteboards, wireframes, and diagrams to visualize your ideas.
          </p>
          <Button
            className="gap-2 bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00601] hover:to-[#E85002]"
            onClick={handleCreateDesign}
          >
            <Plus className="h-4 w-4" /> Create Design
          </Button>
        </div>
      )}
    </div>
  )
}
