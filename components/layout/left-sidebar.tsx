'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useApp } from '@/lib/app-context'
import { useDocumentStore, useSidebarStore } from '@/lib/store'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import {
    BookOpen,
    ChevronRight,
    Clock,
    FileText,
    Folder,
    GitBranch,
    LayoutDashboard,
    Loader2,
    MoreVertical,
    PanelLeft,
    PanelLeftClose,
    Plus,
    Search,
    Settings,
    Star
} from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

// ============================================================================
// Navigation Items
// ============================================================================
interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
  badge?: number
}

export function LeftSidebar() {
  const { leftSidebarOpen, leftSidebarCollapsed, toggleLeftSidebarCollapse } = useSidebarStore()
  const { setCurrentDocument } = useDocumentStore()
  const { documents, recentDocuments, favoriteDocuments, projects, currentWorkspace, isLoading, refreshDocuments } = useApp()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const router = useRouter()
  const pathname = usePathname()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState({ favorites: true, recent: true, projects: true, workspace: false })
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  if (!leftSidebarOpen) return null

  const isCollapsed = leftSidebarCollapsed

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const handleSelectDocument = (doc: { id: string; title: string; type: string }) => {
    setSelectedId(doc.id)
    setCurrentDocument({ id: doc.id, title: doc.title, type: doc.type as 'DOCUMENT' | 'DIAGRAM' | 'CANVAS', content: {} })
    // Use proper routes based on document type
    if (doc.type === 'DIAGRAM' || doc.type === 'CANVAS') {
      router.push(`/designs/${doc.id}`)
    } else {
      router.push(`/documents/${doc.id}`)
    }
  }

  const handleDuplicate = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/duplicate`, { method: 'POST' })
      if (res.ok) refreshDocuments()
    } catch (error) { console.error('Failed to duplicate:', error) }
  }

  const handleToggleFavorite = async (docId: string) => {
    try {
      await fetch(`/api/documents/${docId}/favorite`, { method: 'POST' })
      refreshDocuments()
    } catch (error) { console.error('Failed to toggle favorite:', error) }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm('Delete this document?')) return
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' })
      if (res.ok) {
        if (selectedId === docId) { setSelectedId(null); setCurrentDocument(null) }
        refreshDocuments()
      }
    } catch (error) { console.error('Failed to delete:', error) }
  }

  const createDocument = async (type: 'DOCUMENT' | 'DIAGRAM') => {
    if (!currentWorkspace) return
    setIsCreating(true)
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: type === 'DIAGRAM' ? 'Untitled Diagram' : 'Untitled Document', type, workspaceId: currentWorkspace.id }),
      })
      if (res.ok) {
        const doc = await res.json()
        handleSelectDocument(doc)
        refreshDocuments()
      }
    } catch (error) { console.error('Failed to create document:', error) }
    finally { setIsCreating(false) }
  }

  const getIcon = (type: string) => {
    if (type === 'DIAGRAM' || type === 'CANVAS') return <GitBranch className="h-4 w-4 text-primary" />
    return <FileText className="h-4 w-4 text-muted-foreground" />
  }

  // Filter documents by search
  const filteredDocs = documents.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Navigation items
  const mainNavItems: NavItem[] = [
    { id: 'home', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, href: '/' },
    { id: 'invitations', label: 'Invitations', icon: <Star className="h-4 w-4" />, href: '/invitations' },
    { id: 'api-docs', label: 'API Docs', icon: <BookOpen className="h-4 w-4" />, href: '/api-docs' },
  ]

  // Sidebar styling classes
  const sidebarClasses = cn(
    "flex h-full flex-col border-r transition-all duration-300 ease-in-out relative z-50",
    "bg-background/95 backdrop-blur-xl border-border supports-[backdrop-filter]:bg-background/60",
    isCollapsed ? "w-16" : "w-64"
  )

  return (
    <TooltipProvider delayDuration={0}>
      <motion.div
        layout
        className={sidebarClasses}
        initial={false}
      >
        {/* Helper for rendering content based on collapse state */}
        <AnimatePresence mode="wait">
          {isCollapsed ? (
             // COLLAPSED CONTENT
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2 p-3 h-full w-full"
            >
              <Tooltip>
                 <TooltipTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-accent hover:text-accent-foreground" onClick={toggleLeftSidebarCollapse}>
                     <PanelLeft className="h-5 w-5" />
                   </Button>
                 </TooltipTrigger>
                 <TooltipContent side="right">Expand sidebar</TooltipContent>
              </Tooltip>

              <div className="h-px w-8 bg-border my-2" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" className="h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" onClick={() => createDocument('DIAGRAM')}>
                    <Plus className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">New</TooltipContent>
              </Tooltip>

              <ScrollArea className="flex-1 w-full flex flex-col items-center gap-2 mt-2">
                 {mainNavItems.map(item => (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn("h-10 w-10 hover:bg-accent", pathname === item.href && "bg-accent/50 text-accent-foreground")}
                          onClick={() => {
                            if (item.href) router.push(item.href)
                            if (item.onClick) item.onClick()
                          }}
                        >
                          {item.icon}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                 ))}

                 <div className="h-px w-8 bg-border my-2 mx-auto" />

                 {recentDocuments.slice(0, 4).map((doc) => (
                   <Tooltip key={doc.id}>
                     <TooltipTrigger asChild>
                       <Button
                         variant="ghost"
                         size="icon"
                         className={cn("h-10 w-10 p-0 rounded-full border border-transparent hover:border-border hover:bg-accent", selectedId === doc.id && "border-primary/50 bg-primary/10")}
                         onClick={() => handleSelectDocument(doc)}
                       >
                         <span className="text-[10px] font-bold text-muted-foreground">{doc.title.substring(0, 2).toUpperCase()}</span>
                       </Button>
                     </TooltipTrigger>
                     <TooltipContent side="right">{doc.title}</TooltipContent>
                   </Tooltip>
                 ))}
              </ScrollArea>

               <div className="flex flex-col items-center gap-2 mt-auto">
                 <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground" onClick={() => router.push('/settings')}>
                    <Settings className="h-5 w-5" />
                 </Button>
               </div>
            </motion.div>
          ) : (
            // EXPANDED CONTENT
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full w-full"
            >
          
              {/* Search & New */}
              <div className="p-4 space-y-3">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                   <Input
                     placeholder="Search..."
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="pl-9 h-9 bg-accent/50 border-transparent focus:bg-background transition-all"
                   />
                 </div>
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="w-full justify-start gap-2 bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001] transition-all shadow-md shadow-[#E85002]/20" disabled={isCreating || !currentWorkspace}>
                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        <span className="font-semibold">Create New</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 p-2">
                      <DropdownMenuItem onClick={() => createDocument('DOCUMENT')} className="gap-2 p-2 cursor-pointer">
                        <div className="p-1.5 rounded bg-[#E85002]/10 text-[#E85002]"><FileText className="h-4 w-4" /></div>
                        <div className="flex flex-col">
                           <span className="font-medium">Document</span>
                           <span className="text-xs text-muted-foreground">Rich text & notes</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => createDocument('DIAGRAM')} className="gap-2 p-2 cursor-pointer mt-1">
                        <div className="p-1.5 rounded bg-[#E85002]/10 text-[#E85002]"><GitBranch className="h-4 w-4" /></div>
                          <div className="flex flex-col">
                           <span className="font-medium">Diagram</span>
                           <span className="text-xs text-muted-foreground">Flowcharts & diagrams</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                 </DropdownMenu>
              </div>

              {/* Main Nav */}
              <div className="px-3 pb-4">
                {mainNavItems.map((item) => (
                  <Button
                    key={item.id}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start gap-3 mb-1 px-3 py-2 h-auto text-muted-foreground hover:text-foreground hover:bg-accent/50",
                      pathname === item.href && "bg-accent text-accent-foreground font-medium"
                    )}
                    onClick={() => {
                      if (item.href) router.push(item.href)
                      if (item.onClick) item.onClick()
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                ))}
              </div>

               <div className="h-px bg-border/50 mx-4 mb-4" />

              {/* Sections */}
              <ScrollArea className="flex-1 px-3">
                <div className="space-y-4 pb-4">
                  {/* Projects */}
                  {projects.length > 0 && (
                    <CollapsibleSection
                       title="Projects"
                       icon={<Folder className="h-3.5 w-3.5" />}
                       isOpen={expandedSections.projects}
                       onToggle={() => toggleSection('projects')}
                    >
                      {projects.map((project) => (
                         <button
                           key={project.id}
                           onClick={() => router.push(`/projects/${project.id}`)}
                           className={cn(
                             "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-left group",
                             pathname === `/projects/${project.id}`
                               ? "bg-primary/10 text-primary"
                               : "text-muted-foreground hover:bg-accent hover:text-foreground"
                           )}
                         >
                            <span className={cn("h-1.5 w-1.5 rounded-full bg-muted-foreground/30 group-hover:bg-primary transition-colors", pathname === `/projects/${project.id}` && "bg-primary")} />
                            <span className="truncate flex-1">{project.name}</span>
                         </button>
                      ))}
                    </CollapsibleSection>
                  )}

                  {/* Recent */}
                  {recentDocuments.length > 0 && (
                    <CollapsibleSection
                       title="Recent"
                       icon={<Clock className="h-3.5 w-3.5" />}
                       isOpen={expandedSections.recent}
                       onToggle={() => toggleSection('recent')}
                    >
                       {recentDocuments.slice(0, 5).map(doc => (
                          <DocItem key={doc.id} doc={doc} selected={selectedId === doc.id} onClick={() => handleSelectDocument(doc)}
                          onDuplicate={() => handleDuplicate(doc.id)} onFavorite={() => handleToggleFavorite(doc.id)}
                          onDelete={() => handleDelete(doc.id)} getIcon={getIcon} />
                       ))}
                    </CollapsibleSection>
                  )}

                  {/* Favorites */}
                  {favoriteDocuments.length > 0 && (
                    <CollapsibleSection
                       title="Favorites"
                       icon={<Star className="h-3.5 w-3.5" />}
                       isOpen={expandedSections.favorites}
                       onToggle={() => toggleSection('favorites')}
                    >
                       {favoriteDocuments.map(doc => (
                          <DocItem key={doc.id} doc={doc} selected={selectedId === doc.id} onClick={() => handleSelectDocument(doc)}
                          onDuplicate={() => handleDuplicate(doc.id)} onFavorite={() => handleToggleFavorite(doc.id)}
                          onDelete={() => handleDelete(doc.id)} getIcon={getIcon} showStar />
                       ))}
                    </CollapsibleSection>
                  )}

                  {/* All Docs */}
                  <CollapsibleSection
                       title="Documents"
                       icon={<FileText className="h-3.5 w-3.5" />}
                       isOpen={expandedSections.workspace}
                       onToggle={() => toggleSection('workspace')}
                    >
                       {(searchQuery ? filteredDocs : documents).map(doc => (
                          <DocItem key={doc.id} doc={doc} selected={selectedId === doc.id} onClick={() => handleSelectDocument(doc)}
                          onDuplicate={() => handleDuplicate(doc.id)} onFavorite={() => handleToggleFavorite(doc.id)}
                          onDelete={() => handleDelete(doc.id)} getIcon={getIcon} />
                       ))}
                       {documents.length === 0 && <p className="text-xs text-muted-foreground px-2 py-1">No documents found</p>}
                    </CollapsibleSection>

                </div>
              </ScrollArea>

               {/* Footer */}
               <div className="p-3 border-t border-border/50 bg-background/50 backdrop-blur-sm">
                 <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground" onClick={() => router.push('/settings')}>
                    <Settings className="h-4 w-4" /> <span className="text-xs">Preferences</span>
                 </Button>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  )
}

// ============================================================================
// Helper Components
// ============================================================================

function CollapsibleSection({ title, icon, isOpen, onToggle, children }: {
  title: string
  icon: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 px-2 py-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
      >
        <motion.div animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="h-3 w-3" />
        </motion.div>
        <span className="flex-1 text-left flex items-center gap-2">
           {title}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
             <div className="pl-2 space-y-0.5 mt-1 border-l border-border/40 ml-2.5">
                {children}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function DocItem({ doc, selected, onClick, onDuplicate, onFavorite, onDelete, getIcon, showStar }: {
  doc: { id: string; title: string; type: string; isFavorite?: boolean }
  selected: boolean
  onClick: () => void
  onDuplicate: () => void
  onFavorite: () => void
  onDelete: () => void
  getIcon: (type: string) => React.ReactNode
  showStar?: boolean
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-all",
        selected
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      {getIcon(doc.type)}
      <span className="truncate flex-1">{doc.title}</span>
      {showStar && doc.isFavorite && <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-background rounded transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-3 w-3 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate() }}>Duplicate</DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFavorite() }}>
            {doc.isFavorite ? 'Unfavorite' : 'Favorite'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete() }}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
