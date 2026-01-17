'use client'

import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { KeyboardShortcuts } from '@/components/keyboard-shortcuts'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SearchModal } from '@/components/search-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useApp } from '@/lib/app-context'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowUpRight,
  Clock,
  FileText,
  FolderKanban,
  Grid3X3,
  LayoutList,
  ListTodo,
  Plus,
  Search,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Project {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    documents: number
    tasks: number
    members: number
  }
}

export default function ProjectsPage() {
  const { refreshDocuments, isLoading: appLoading } = useApp()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'tasks'>('recent')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const router = useRouter()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects')
      if (res.ok) {
        setProjects(await res.json())
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects
    .filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'tasks': return (b._count?.tasks || 0) - (a._count?.tasks || 0)
        default: return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

  const totalTasks = projects.reduce((sum, p) => sum + (p._count?.tasks || 0), 0)
  const totalDocs = projects.reduce((sum, p) => sum + (p._count?.documents || 0), 0)

  if (loading || appLoading) {
    return (
      <>
        <SearchModal />
        <KeyboardShortcuts />
        <DashboardLayout>
          <div className="p-6 max-w-[1200px] mx-auto space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
            </div>
          </div>
        </DashboardLayout>
      </>
    )
  }

  return (
    <>
      <SearchModal />
      <KeyboardShortcuts />
      <DashboardLayout>
        <ScrollArea className="h-full">
          <div className={cn("min-h-full", isDark ? "bg-zinc-950" : "bg-gray-50/50")}>
            <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-6">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className={cn("text-2xl font-semibold tracking-tight", isDark ? "text-white" : "text-gray-900")}>
                    Projects
                  </h1>
                  <p className={cn("text-sm mt-1", isDark ? "text-zinc-500" : "text-gray-500")}>
                    {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace
                  </p>
                </div>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className={cn(
                    "gap-2 h-9",
                    isDark ? "bg-white text-black hover:bg-gray-100" : "bg-gray-900 text-white hover:bg-gray-800"
                  )}
                >
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Projects" value={projects.length} icon={<FolderKanban className="h-4 w-4" />} isDark={isDark} />
                <StatCard label="Total Tasks" value={totalTasks} icon={<ListTodo className="h-4 w-4" />} isDark={isDark} />
                <StatCard label="Total Documents" value={totalDocs} icon={<FileText className="h-4 w-4" />} isDark={isDark} />
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", isDark ? "text-zinc-500" : "text-gray-400")} />
                  <Input
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn("pl-10 h-9", isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200")}
                  />
                </div>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                  <SelectTrigger className={cn("w-[140px] h-9", isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-gray-200")}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="tasks">Tasks</SelectItem>
                  </SelectContent>
                </Select>
                <div className={cn("flex rounded-lg border p-0.5", isDark ? "border-zinc-800 bg-zinc-900" : "border-gray-200 bg-white")}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={cn("h-8 w-8 p-0", viewMode === 'grid' && (isDark ? "bg-zinc-800" : "bg-gray-100"))}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={cn("h-8 w-8 p-0", viewMode === 'list' && (isDark ? "bg-zinc-800" : "bg-gray-100"))}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Projects */}
              {filteredProjects.length === 0 ? (
                <div className={cn(
                  "text-center py-20 rounded-xl border-2 border-dashed",
                  isDark ? "border-zinc-800" : "border-gray-200"
                )}>
                  <FolderKanban className={cn("h-12 w-12 mx-auto mb-4", isDark ? "text-zinc-700" : "text-gray-300")} />
                  <h3 className={cn("text-lg font-medium mb-2", isDark ? "text-white" : "text-gray-900")}>
                    {searchQuery ? 'No projects found' : 'No projects yet'}
                  </h3>
                  <p className={cn("text-sm mb-6", isDark ? "text-zinc-500" : "text-gray-500")}>
                    {searchQuery ? `No results for "${searchQuery}"` : 'Create your first project to get started'}
                  </p>
                  {!searchQuery && (
                    <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" /> Create Project
                    </Button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} isDark={isDark} onClick={() => router.push(`/projects/${project.id}`)} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProjects.map((project) => (
                    <ProjectRow key={project.id} project={project} isDark={isDark} onClick={() => router.push(`/projects/${project.id}`)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <CreateProjectDialog
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open)
            if (!open) {
              fetchProjects()
              refreshDocuments()
            }
          }}
        />
      </DashboardLayout>
    </>
  )
}

function StatCard({ label, value, icon, isDark }: { label: string; value: number; icon: React.ReactNode; isDark: boolean }) {
  return (
    <div className={cn(
      "p-4 rounded-xl border",
      isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-gray-200"
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className={cn("text-xs font-medium uppercase tracking-wider mb-1", isDark ? "text-zinc-500" : "text-gray-500")}>{label}</p>
          <p className={cn("text-2xl font-semibold", isDark ? "text-white" : "text-gray-900")}>{value}</p>
        </div>
        <div className={cn("p-2 rounded-lg", isDark ? "bg-zinc-800 text-zinc-400" : "bg-gray-100 text-gray-500")}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ project, isDark, onClick }: { project: Project; isDark: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-5 rounded-xl border transition-all group",
        isDark
          ? "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700"
          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("p-2 rounded-lg", isDark ? "bg-zinc-800" : "bg-gray-100")}>
          <FolderKanban className={cn("h-5 w-5", isDark ? "text-zinc-400" : "text-gray-500")} />
        </div>
        <ArrowUpRight className={cn(
          "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
          isDark ? "text-zinc-500" : "text-gray-400"
        )} />
      </div>

      <h3 className={cn("font-medium mb-1 truncate", isDark ? "text-white" : "text-gray-900")}>
        {project.name}
      </h3>
      <p className={cn("text-sm line-clamp-2 mb-4 min-h-[40px]", isDark ? "text-zinc-500" : "text-gray-500")}>
        {project.description || 'No description'}
      </p>

      <div className={cn("flex items-center gap-4 pt-3 border-t", isDark ? "border-zinc-800" : "border-gray-100")}>
        <span className={cn("flex items-center gap-1.5 text-xs", isDark ? "text-zinc-400" : "text-gray-500")}>
          <FileText className="h-3.5 w-3.5" /> {project._count?.documents || 0} docs
        </span>
        <span className={cn("flex items-center gap-1.5 text-xs", isDark ? "text-zinc-400" : "text-gray-500")}>
          <ListTodo className="h-3.5 w-3.5" /> {project._count?.tasks || 0} tasks
        </span>
        <span className={cn("flex items-center gap-1.5 text-xs ml-auto", isDark ? "text-zinc-500" : "text-gray-400")}>
          <Clock className="h-3.5 w-3.5" /> {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true }).replace('about ', '')}
        </span>
      </div>
    </button>
  )
}

function ProjectRow({ project, isDark, onClick }: { project: Project; isDark: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
        isDark
          ? "bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700"
          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
      )}
    >
      <div className={cn("p-2 rounded-lg shrink-0", isDark ? "bg-zinc-800" : "bg-gray-100")}>
        <FolderKanban className={cn("h-5 w-5", isDark ? "text-zinc-400" : "text-gray-500")} />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className={cn("font-medium truncate", isDark ? "text-white" : "text-gray-900")}>
          {project.name}
        </h3>
        <p className={cn("text-sm truncate", isDark ? "text-zinc-500" : "text-gray-500")}>
          {project.description || 'No description'}
        </p>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <span className={cn("flex items-center gap-1.5 text-sm", isDark ? "text-zinc-400" : "text-gray-500")}>
          <FileText className="h-4 w-4" /> {project._count?.documents || 0}
        </span>
        <span className={cn("flex items-center gap-1.5 text-sm", isDark ? "text-zinc-400" : "text-gray-500")}>
          <ListTodo className="h-4 w-4" /> {project._count?.tasks || 0}
        </span>
        <span className={cn("text-sm", isDark ? "text-zinc-500" : "text-gray-400")}>
          {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true }).replace('about ', '')}
        </span>
        <ArrowUpRight className={cn(
          "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
          isDark ? "text-zinc-500" : "text-gray-400"
        )} />
      </div>
    </button>
  )
}
