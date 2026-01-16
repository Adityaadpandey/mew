
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApp } from '@/lib/app-context'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Clock,
  FileText,
  Folder,
  GitBranch,
  LayoutGrid,
  List,
  ListTodo,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Star,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DocumentCard } from '../dashboard/document-list'
import { TaskManager } from './task-manager'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

interface ProjectViewProps {
  project: {
    id: string
    name: string
    description: string | null
    updatedAt: Date
  }
}

export function ProjectView({ project }: ProjectViewProps) {
  const [activeTab, setActiveTab] = useState('documents')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const { documents, refreshDocuments, currentWorkspace } = useApp()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const router = useRouter()

  // Filter docs for this project
  const projectDocs = documents.filter(d => d.projectId === project.id)
  const filteredDocs = projectDocs.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase())
  )

  // Stats
  const diagramCount = projectDocs.filter(d => d.type === 'DIAGRAM' || d.type === 'CANVAS').length
  const documentCount = projectDocs.filter(d => d.type === 'DOCUMENT').length

  const handleCreateDocument = async (type: 'DOCUMENT' | 'DIAGRAM') => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: type === 'DIAGRAM' ? 'Untitled Diagram' : 'Untitled Document',
          type,
          workspaceId: currentWorkspace?.id,
          projectId: project.id
        }),
      })
      if (res.ok) {
        const newDoc = await res.json()
        await refreshDocuments()
        // Use proper routes based on document type
        if (type === 'DIAGRAM') {
          router.push(`/designs/${newDoc.id}`)
        } else {
          router.push(`/documents/${newDoc.id}`)
        }
      }
    } catch (error) {
      console.error('Failed to create doc', error)
    }
  }

  const handleOpenDocument = (docId: string, docType: string) => {
    if (docType === 'DIAGRAM' || docType === 'CANVAS') {
      router.push(`/designs/${docId}`)
    } else {
      router.push(`/documents/${docId}`)
    }
  }

  const getDocIcon = (type: string) => {
    if (type === 'DIAGRAM' || type === 'CANVAS') {
      return <GitBranch className="h-4 w-4 text-[#E85002]" />
    }
    return <FileText className="h-4 w-4 text-[#F16001]" />
  }

  return (
    <div className={cn("flex h-screen flex-col", isDark ? "bg-black" : "bg-slate-50")}>
      {/* Header */}
      <div className={cn(
        "border-b px-8 py-6",
        isDark
          ? "bg-gradient-to-br from-neutral-950 via-neutral-950 to-[#E85002]/5 border-neutral-800"
          : "bg-gradient-to-br from-white via-[#E85002]/5 to-[#F16001]/5 border-slate-200"
      )}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {/* Back button */}
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-10 w-10 shrink-0", isDark ? "hover:bg-neutral-800" : "")}
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Project icon and info */}
            <div className="flex items-start gap-4">
              <div className={cn(
                "flex h-14 w-14 items-center justify-center rounded-xl shrink-0",
                isDark ? "bg-[#E85002]/10" : "bg-[#E85002]/20"
              )}>
                <Folder className="h-7 w-7 text-[#E85002] fill-[#E85002]/20" />
              </div>

              <div>
                <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                  {project.name}
                </h1>
                {project.description && (
                  <p className={cn("mt-1 text-sm max-w-xl", isDark ? "text-neutral-400" : "text-slate-500")}>
                    {project.description}
                  </p>
                )}
                <div className={cn("flex items-center gap-4 mt-3 text-xs", isDark ? "text-neutral-500" : "text-slate-500")}>
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    {documentCount} Documents
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GitBranch className="h-3.5 w-3.5" />
                    {diagramCount} Diagrams
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001]">
                  <Plus className="h-4 w-4 mr-2" />
                  New
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={isDark ? "bg-neutral-900 border-neutral-800" : ""}>
                <DropdownMenuItem onClick={() => handleCreateDocument('DIAGRAM')}>
                  <GitBranch className="h-4 w-4 mr-2 text-[#E85002]" />
                  New Diagram
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleCreateDocument('DOCUMENT')}>
                  <FileText className="h-4 w-4 mr-2 text-[#F16001]" />
                  New Document
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="icon" className={isDark ? "border-neutral-800 hover:bg-neutral-900" : ""}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className={cn(
            "flex items-center justify-between px-8 border-b",
            isDark ? "border-neutral-800" : "border-slate-200"
          )}>
            <TabsList className={cn("bg-transparent h-12", isDark ? "" : "")}>
              <TabsTrigger
                value="documents"
                className={cn(
                  "data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none h-12 px-4",
                  "data-[state=active]:border-b-2 data-[state=active]:border-[#E85002]",
                  isDark ? "data-[state=active]:text-white" : ""
                )}
              >
                <FileText className="h-4 w-4 mr-2" />
                Documents
                <Badge variant="secondary" className={cn("ml-2", isDark ? "bg-neutral-800" : "")}>
                  {projectDocs.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger
                value="tasks"
                className={cn(
                  "data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none h-12 px-4",
                  "data-[state=active]:border-b-2 data-[state=active]:border-[#E85002]",
                  isDark ? "data-[state=active]:text-white" : ""
                )}
              >
                <ListTodo className="h-4 w-4 mr-2" />
                Tasks
              </TabsTrigger>
            </TabsList>

            {activeTab === 'documents' && (
              <div className="flex items-center gap-2 py-2">
                <div className="relative">
                  <Search className={cn(
                    "absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4",
                    isDark ? "text-neutral-500" : "text-slate-400"
                  )} />
                  <Input
                    placeholder="Search documents..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className={cn(
                      "h-8 w-48 pl-8 text-sm",
                      isDark ? "bg-neutral-900 border-neutral-800" : ""
                    )}
                  />
                </div>

                <div className={cn("flex rounded-lg border", isDark ? "border-neutral-800" : "border-slate-200")}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 rounded-r-none", viewMode === 'grid' && (isDark ? "bg-neutral-800" : "bg-slate-100"))}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("h-8 w-8 rounded-l-none", viewMode === 'list' && (isDark ? "bg-neutral-800" : "bg-slate-100"))}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <TabsContent value="documents" className="flex-1 overflow-auto m-0">
            <ScrollArea className="h-full">
              <div className="p-8">
                {filteredDocs.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16 px-8",
                      isDark ? "border-neutral-700 bg-neutral-900/50" : "border-slate-200 bg-white"
                    )}
                  >
                    <div className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-2xl mb-4",
                      isDark ? "bg-neutral-800" : "bg-slate-100"
                    )}>
                      <FileText className={cn("h-8 w-8", isDark ? "text-neutral-600" : "text-slate-400")} />
                    </div>
                    <h3 className={cn("text-lg font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
                      {search ? 'No documents found' : 'No documents yet'}
                    </h3>
                    <p className={cn("text-center max-w-sm mb-6 text-sm", isDark ? "text-neutral-500" : "text-slate-500")}>
                      {search ? 'Try a different search term.' : 'Create your first document or diagram to get started.'}
                    </p>
                    {!search && (
                      <div className="flex gap-3">
                        <Button onClick={() => handleCreateDocument('DIAGRAM')} className="bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001]">
                          <GitBranch className="h-4 w-4 mr-2" />
                          New Diagram
                        </Button>
                        <Button variant="outline" onClick={() => handleCreateDocument('DOCUMENT')} className={isDark ? "border-neutral-700" : ""}>
                          <FileText className="h-4 w-4 mr-2" />
                          New Document
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredDocs.map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          className={cn(
                            "group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1",
                            isDark
                              ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          )}
                          onClick={() => handleOpenDocument(doc.id, doc.type)}
                        >
                          {/* Thumbnail */}
                          <div className={cn(
                            "h-32 flex items-center justify-center border-b",
                            isDark ? "bg-neutral-950 border-neutral-800" : "bg-slate-50 border-slate-100"
                          )}>
                            <div className={cn(
                              "p-4 rounded-xl transition-transform group-hover:scale-110",
                              doc.type === 'DIAGRAM' || doc.type === 'CANVAS'
                                ? isDark ? "bg-[#E85002]/10" : "bg-[#E85002]/20"
                                : isDark ? "bg-[#F16001]/10" : "bg-[#F16001]/20"
                            )}>
                              {doc.type === 'DIAGRAM' || doc.type === 'CANVAS' ? (
                                <GitBranch className="h-8 w-8 text-[#E85002]" />
                              ) : (
                                <FileText className="h-8 w-8 text-[#F16001]" />
                              )}
                            </div>
                          </div>

                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h3 className={cn(
                                  "font-semibold truncate",
                                  isDark ? "text-white" : "text-slate-900"
                                )}>
                                  {doc.title}
                                </h3>
                                <div className={cn(
                                  "flex items-center gap-2 mt-2 text-xs",
                                  isDark ? "text-neutral-500" : "text-slate-500"
                                )}>
                                  <Badge variant="outline" className={cn(
                                    "text-[10px]",
                                    doc.type === 'DIAGRAM' || doc.type === 'CANVAS'
                                      ? "border-[#E85002]/20 text-[#E85002]"
                                      : "border-[#F16001]/20 text-[#F16001]"
                                  )}>
                                    {doc.type}
                                  </Badge>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                                  </span>
                                </div>
                              </div>

                              {doc.isFavorite && (
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  // List view
                  <div className="space-y-2">
                    {filteredDocs.map((doc, index) => (
                      <motion.div
                        key={doc.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => handleOpenDocument(doc.id, doc.type)}
                        className={cn(
                          "group flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all",
                          "hover:shadow-md",
                          isDark
                            ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        )}
                      >
                        <div className={cn(
                          "p-2 rounded-lg shrink-0",
                          doc.type === 'DIAGRAM' || doc.type === 'CANVAS'
                            ? isDark ? "bg-[#E85002]/10" : "bg-[#E85002]/20"
                            : isDark ? "bg-[#F16001]/10" : "bg-[#F16001]/20"
                        )}>
                          {getDocIcon(doc.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className={cn("font-medium truncate", isDark ? "text-white" : "text-slate-900")}>
                            {doc.title}
                          </h3>
                        </div>

                        <Badge variant="outline" className={cn(
                          "text-[10px] shrink-0",
                          doc.type === 'DIAGRAM' || doc.type === 'CANVAS'
                            ? "border-[#E85002]/20 text-[#E85002]"
                            : "border-[#F16001]/20 text-[#F16001]"
                        )}>
                          {doc.type}
                        </Badge>

                        <span className={cn(
                          "text-xs shrink-0",
                          isDark ? "text-neutral-500" : "text-slate-500"
                        )}>
                          {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                        </span>

                        {doc.isFavorite && (
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
                        )}

                        <ChevronRight className={cn(
                          "h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
                          isDark ? "text-neutral-600" : "text-slate-400"
                        )} />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="tasks" className="flex-1 overflow-hidden m-0">
            <TaskManager projectId={project.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
