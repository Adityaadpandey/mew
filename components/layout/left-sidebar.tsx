'use client'

import { useState } from 'react'
import {
  Plus, FileText, GitBranch, Star, Clock, Folder, ChevronRight,
  ChevronDown, MoreVertical, Settings, HelpCircle,
  Loader2, Home, PanelLeftClose, PanelLeft, Zap, ListTodo,
  Search, Sparkles, LayoutDashboard, BookOpen, Key
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useSidebarStore, useDocumentStore } from '@/lib/store'
import { useApp } from '@/lib/app-context'
import { useTheme } from '@/lib/theme-provider'
import { useRouter, usePathname } from 'next/navigation'

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
    router.push(`/?documentId=${doc.id}`)
  }

  const handleGoHome = () => {
    setSelectedId(null)
    setCurrentDocument(null)
    router.push('/')
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
    if (type === 'DIAGRAM' || type === 'CANVAS') return <GitBranch className="h-4 w-4 text-blue-500" />
    return <FileText className="h-4 w-4 text-slate-500" />
  }

  // Filter documents by search
  const filteredDocs = documents.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Navigation items
  const mainNavItems: NavItem[] = [
    { id: 'home', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" />, href: '/' },
    { id: 'api-docs', label: 'API Docs', icon: <BookOpen className="h-4 w-4" />, href: '/api-docs' },
  ]

  // Collapsed sidebar
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className={cn(
          "flex h-full w-14 flex-col border-r",
          isDark ? "bg-neutral-950 border-neutral-800" : "bg-slate-50 border-slate-200"
        )}>
          <div className="flex flex-col items-center gap-1 p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={toggleLeftSidebarCollapse}>
                  <PanelLeft className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-10 w-10", pathname === '/' && !selectedId && (isDark ? "bg-neutral-800" : "bg-slate-200"))}
                  onClick={handleGoHome}
                >
                  <LayoutDashboard className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" className="h-10 w-10 bg-blue-600 hover:bg-blue-700" onClick={() => createDocument('DIAGRAM')}>
                  <Plus className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">New document</TooltipContent>
            </Tooltip>
          </div>

          <div className={cn("mx-2 my-1 border-t", isDark ? "border-neutral-800" : "border-slate-200")} />

          <ScrollArea className="flex-1">
            <div className="flex flex-col items-center gap-1 p-2">
              {recentDocuments.slice(0, 6).map((doc) => (
                <Tooltip key={doc.id}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-10 w-10", selectedId === doc.id && (isDark ? "bg-neutral-800" : "bg-slate-200"))}
                      onClick={() => handleSelectDocument(doc)}
                    >
                      {getIcon(doc.type)}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">{doc.title}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </ScrollArea>

          <div className={cn("flex flex-col items-center gap-1 p-2 border-t", isDark ? "border-neutral-800" : "border-slate-200")}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => router.push('/api-docs')}>
                  <BookOpen className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">API Docs</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    )
  }

  // Expanded sidebar
  return (
    <div className={cn(
      "flex h-full w-64 flex-col border-r transition-all",
      isDark ? "bg-neutral-950 border-neutral-800" : "bg-slate-50 border-slate-200"
    )}>
      {/* Header */}
      <div className={cn("flex items-center justify-between p-3 border-b", isDark ? "border-neutral-800" : "border-slate-200")}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg font-bold text-white",
            "bg-gradient-to-br from-blue-500 to-indigo-600"
          )}>
            E
          </div>
          <span className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>
            {currentWorkspace?.name || 'Erasor'}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleLeftSidebarCollapse}>
          <PanelLeftClose className="h-4 w-4" />
        </Button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className={cn("absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2", isDark ? "text-neutral-500" : "text-slate-400")} />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "h-9 pl-9 text-sm",
              isDark ? "bg-neutral-900 border-neutral-800 placeholder:text-neutral-500" : "bg-white border-slate-200"
            )}
          />
        </div>
      </div>

      {/* New Doc Button */}
      <div className="px-3 pb-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700" disabled={isCreating || !currentWorkspace}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className={cn("w-48", isDark && "bg-neutral-900 border-neutral-700")}>
            <DropdownMenuItem onClick={() => createDocument('DOCUMENT')}>
              <FileText className="mr-2 h-4 w-4 text-purple-500" /> Document
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => createDocument('DIAGRAM')}>
              <GitBranch className="mr-2 h-4 w-4 text-blue-500" /> Diagram
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Navigation */}
      <div className="px-3 pb-2">
        {mainNavItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start gap-2 mb-1",
              pathname === item.href && !selectedId && (isDark ? "bg-neutral-800 text-white" : "bg-slate-100 text-slate-900"),
              isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            )}
            onClick={() => {
              if (item.href) router.push(item.href)
              if (item.onClick) item.onClick()
              if (item.id === 'home') {
                setSelectedId(null)
                setCurrentDocument(null)
              }
            }}
          >
            {item.icon}
            {item.label}
            {item.badge !== undefined && (
              <span className={cn(
                "ml-auto px-1.5 py-0.5 text-[10px] font-medium rounded-full",
                isDark ? "bg-neutral-800 text-neutral-400" : "bg-slate-200 text-slate-600"
              )}>
                {item.badge}
              </span>
            )}
          </Button>
        ))}
      </div>

      <div className={cn("mx-3 border-t", isDark ? "border-neutral-800" : "border-slate-200")} />

      <ScrollArea className="flex-1 px-2 py-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            {/* Favorites */}
            {favoriteDocuments.length > 0 && (
              <SidebarSection
                title="Favorites"
                icon={<Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                expanded={expandedSections.favorites}
                onToggle={() => toggleSection('favorites')}
                isDark={isDark}
                count={favoriteDocuments.length}
              >
                {favoriteDocuments.map((doc) => (
                  <DocItem key={doc.id} doc={doc} selected={selectedId === doc.id} onClick={() => handleSelectDocument(doc)}
                    onDuplicate={() => handleDuplicate(doc.id)} onFavorite={() => handleToggleFavorite(doc.id)}
                    onDelete={() => handleDelete(doc.id)} getIcon={getIcon} isDark={isDark} showStar />
                ))}
              </SidebarSection>
            )}

            {/* Recent */}
            {recentDocuments.length > 0 && (
              <SidebarSection
                title="Recent"
                icon={<Clock className="h-3 w-3 text-blue-500" />}
                expanded={expandedSections.recent}
                onToggle={() => toggleSection('recent')}
                isDark={isDark}
                count={recentDocuments.length}
              >
                {recentDocuments.map((doc) => (
                  <DocItem key={doc.id} doc={doc} selected={selectedId === doc.id} onClick={() => handleSelectDocument(doc)}
                    onDuplicate={() => handleDuplicate(doc.id)} onFavorite={() => handleToggleFavorite(doc.id)}
                    onDelete={() => handleDelete(doc.id)} getIcon={getIcon} isDark={isDark} />
                ))}
              </SidebarSection>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <SidebarSection
                title="Projects"
                icon={<Folder className="h-3 w-3 text-purple-500" />}
                expanded={expandedSections.projects}
                onToggle={() => toggleSection('projects')}
                isDark={isDark}
                count={projects.length}
              >
                {projects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors text-left",
                      pathname === `/projects/${project.id}`
                        ? isDark ? "bg-neutral-800 text-white" : "bg-blue-50 text-blue-700"
                        : isDark ? "text-neutral-300 hover:bg-neutral-800" : "text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <Folder className={cn("h-4 w-4 shrink-0", isDark ? "text-purple-400" : "text-purple-500")} />
                    <span className="truncate flex-1">{project.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full",
                        isDark ? "bg-neutral-800 text-neutral-500" : "bg-slate-100 text-slate-500"
                      )}>
                        {project._count?.documents || 0}
                      </span>
                    </div>
                  </button>
                ))}
              </SidebarSection>
            )}

            {/* All Documents */}
            <SidebarSection
              title="Documents"
              icon={<FileText className="h-3 w-3 text-slate-500" />}
              expanded={expandedSections.workspace}
              onToggle={() => toggleSection('workspace')}
              isDark={isDark}
              count={documents.length}
            >
              {(searchQuery ? filteredDocs : documents).map((doc) => (
                <DocItem key={doc.id} doc={doc} selected={selectedId === doc.id} onClick={() => handleSelectDocument(doc)}
                  onDuplicate={() => handleDuplicate(doc.id)} onFavorite={() => handleToggleFavorite(doc.id)}
                  onDelete={() => handleDelete(doc.id)} getIcon={getIcon} isDark={isDark} />
              ))}
              {documents.length === 0 && (
                <p className={cn("px-3 py-2 text-xs", isDark ? "text-neutral-600" : "text-slate-400")}>No documents yet</p>
              )}
            </SidebarSection>
          </>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className={cn("border-t p-2 space-y-1", isDark ? "border-neutral-800" : "border-slate-200")}>
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full justify-start gap-2", isDark ? "text-neutral-500 hover:text-neutral-300" : "text-slate-500 hover:text-slate-700")}
          onClick={() => router.push('/api-docs')}
        >
          <Zap className="h-4 w-4 text-amber-500" />
          API & Integrations
        </Button>
        <Button variant="ghost" size="sm" className={cn("w-full justify-start gap-2", isDark ? "text-neutral-500 hover:text-neutral-300" : "text-slate-500 hover:text-slate-700")}>
          <Settings className="h-4 w-4" /> Settings
        </Button>
        <Button variant="ghost" size="sm" className={cn("w-full justify-start gap-2", isDark ? "text-neutral-500 hover:text-neutral-300" : "text-slate-500 hover:text-slate-700")}>
          <HelpCircle className="h-4 w-4" /> Help & Support
        </Button>
      </div>
    </div>
  )
}

// ============================================================================
// Sub-components
// ============================================================================
function SidebarSection({ title, icon, expanded, onToggle, children, isDark, count }: {
  title: string
  icon: React.ReactNode
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
  isDark: boolean
  count?: number
}) {
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className={cn(
          "flex w-full items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-md transition-colors",
          isDark ? "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        )}
      >
        {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        {icon}
        <span className="flex-1 text-left">{title}</span>
        {count !== undefined && (
          <span className={cn(
            "px-1.5 py-0.5 text-[10px] font-medium rounded-full",
            isDark ? "bg-neutral-800 text-neutral-500" : "bg-slate-100 text-slate-500"
          )}>
            {count}
          </span>
        )}
      </button>
      {expanded && <div className="mt-1">{children}</div>}
    </div>
  )
}

function DocItem({ doc, selected, onClick, onDuplicate, onFavorite, onDelete, getIcon, isDark, showStar }: {
  doc: { id: string; title: string; type: string; isFavorite?: boolean }
  selected: boolean
  onClick: () => void
  onDuplicate: () => void
  onFavorite: () => void
  onDelete: () => void
  getIcon: (type: string) => React.ReactNode
  isDark: boolean
  showStar?: boolean
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        selected
          ? isDark ? "bg-neutral-800 text-white" : "bg-blue-50 text-blue-700"
          : isDark ? "text-neutral-300 hover:bg-neutral-800" : "text-slate-700 hover:bg-slate-100"
      )}
    >
      {getIcon(doc.type)}
      <span className="truncate flex-1">{doc.title}</span>
      {showStar && doc.isFavorite && <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded opacity-0 group-hover:opacity-100 transition-opacity",
              isDark ? "hover:bg-neutral-700" : "hover:bg-slate-200"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-3.5 w-3.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={isDark ? "bg-neutral-900 border-neutral-700" : ""}>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate() }}>Duplicate</DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onFavorite() }}>
            {doc.isFavorite ? 'Unfavorite' : 'Favorite'}
          </DropdownMenuItem>
          <DropdownMenuSeparator className={isDark ? "bg-neutral-700" : ""} />
          <DropdownMenuItem className="text-red-500" onClick={(e) => { e.stopPropagation(); onDelete() }}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
