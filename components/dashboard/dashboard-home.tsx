
'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useApp } from '@/lib/app-context'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  ChevronRight,
  Clock,
  FileText,
  Folder,
  FolderOpen,
  LayoutGrid, List,
  Search
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CreateProjectDialog } from './create-project-dialog'

export function DashboardHome() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const { projects, user, isLoading } = useApp()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const router = useRouter()

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const handleOpenProject = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  if (isLoading) return null

  return (
    <div className={cn("flex h-full flex-col", isDark ? "bg-black" : "bg-slate-50")}>
      {/* Hero Header */}
      <div className={cn(
        "relative overflow-hidden border-b px-8 py-8",
        isDark ? "bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900 border-neutral-800" : "bg-gradient-to-br from-white via-indigo-50/30 to-blue-50/50 border-slate-200"
      )}>
        <div className="relative">
          <div className="flex items-start justify-between">
            <div>
              <h1 className={cn("text-3xl font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}>
                {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
              </h1>
              <p className={cn("mt-2 text-base", isDark ? "text-slate-400" : "text-slate-600")}>
                You have {projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace
              </p>
            </div>

            <CreateProjectDialog />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Toolbar */}
        <div className={cn(
          "sticky top-0 z-10 flex items-center justify-between gap-4 border-b px-8 py-3",
          isDark ? "bg-black/95 backdrop-blur border-neutral-800" : "bg-slate-50/95 backdrop-blur border-slate-200"
        )}>
          <div className="flex items-center gap-2">
            <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-slate-800")}>
                My Projects
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className={cn("absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2", isDark ? "text-neutral-500" : "text-slate-400")} />
              <Input
                placeholder="Search projects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "h-9 w-64 pl-9 text-sm",
                  isDark ? "bg-neutral-900 border-neutral-700 placeholder:text-neutral-500" : "bg-white border-slate-200"
                )}
              />
            </div>

            <div className={cn("flex rounded-lg border", isDark ? "border-neutral-700" : "border-slate-200")}>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-9 w-9 rounded-r-none", viewMode === 'grid' && (isDark ? "bg-neutral-800" : "bg-slate-100"))}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-9 w-9 rounded-l-none", viewMode === 'list' && (isDark ? "bg-neutral-800" : "bg-slate-100"))}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        <div className="px-8 py-6">
          {filteredProjects.length === 0 ? (
            <div className={cn(
              "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-16 px-8",
              isDark ? "border-neutral-700 bg-neutral-900/50" : "border-slate-200 bg-white"
            )}>
              <div className={cn("flex h-20 w-20 items-center justify-center rounded-2xl mb-6", isDark ? "bg-neutral-800" : "bg-slate-100")}>
                <FolderOpen className={cn("h-10 w-10", isDark ? "text-neutral-600" : "text-slate-400")} />
              </div>
              <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
                {search ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className={cn("text-center max-w-sm mb-6", isDark ? "text-neutral-500" : "text-slate-500")}>
                {search ? `Try searching for something else.` : 'Create a project to organize your documents and tasks.'}
              </p>
              {!search && <CreateProjectDialog />}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleOpenProject(project.id)}
                  className={cn(
                    "group cursor-pointer rounded-xl border p-5 transition-all hover:shadow-lg",
                    isDark
                      ? "bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50"
                      : "bg-white border-slate-200 hover:border-slate-300",
                    viewMode === 'list' && "flex items-center gap-6"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center rounded-xl",
                    viewMode === 'grid' ? "mb-4 h-12 w-12" : "h-12 w-12 shrink-0",
                    isDark ? "bg-neutral-800 text-blue-500" : "bg-blue-50 text-blue-600"
                  )}>
                    <Folder className="h-6 w-6 fill-current" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className={cn("text-lg font-semibold truncate", isDark ? "text-white" : "text-slate-900")}>
                      {project.name}
                    </h3>
                    <p className={cn("text-sm line-clamp-2 mt-1", isDark ? "text-neutral-500" : "text-slate-500")}>
                      {project.description || "No description"}
                    </p>

                    <div className={cn("flex items-center gap-4 mt-4 text-xs font-medium", isDark ? "text-neutral-500" : "text-slate-500")}>
                        <div className="flex items-center gap-1.5">
                            <FileText className="h-3.5 w-3.5" />
                            {project._count?.documents || 0} Docs
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                        </div>
                    </div>
                  </div>

                  <div className={cn(
                        "opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center",
                        viewMode === 'list' ? "h-8 w-8" : "absolute top-4 right-4"
                  )}>
                     <ChevronRight className={cn("h-5 w-5", isDark ? "text-neutral-500" : "text-slate-400")} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
