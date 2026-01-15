
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useApp } from '@/lib/app-context'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Filter,
  Folder,
  FolderOpen,
  GitBranch,
  Grid3X3,
  LayoutGrid,
  List,
  ListTodo,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Users
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CreateProjectDialog } from './create-project-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

// ============================================================================
// Types
// ============================================================================
interface Stats {
  totalDocuments: number
  totalProjects: number
  totalTasks: number
  completedTasks: number
}

// ============================================================================
// Animated Background Component
// ============================================================================
function AnimatedBackground({ isDark }: { isDark: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient orbs */}
      <div className={cn(
        "absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl opacity-20",
        isDark ? "bg-purple-500" : "bg-purple-300"
      )} />
      <div className={cn(
        "absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl opacity-20",
        isDark ? "bg-blue-500" : "bg-blue-300"
      )} />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(${isDark ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#fff' : '#000'} 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
    </div>
  )
}

// ============================================================================
// Project Card Component - Premium Design
// ============================================================================
function ProjectCard({
  project,
  index,
  onClick,
  isDark
}: {
  project: {
    id: string
    name: string
    description: string | null
    updatedAt: string
    _count?: { documents: number; tasks: number }
  }
  index: number
  onClick: () => void
  isDark: boolean
}) {
  const colors = [
    { gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-500/10', text: 'text-violet-500' },
    { gradient: 'from-blue-500 to-cyan-600', bg: 'bg-blue-500/10', text: 'text-blue-500' },
    { gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
    { gradient: 'from-orange-500 to-amber-600', bg: 'bg-orange-500/10', text: 'text-orange-500' },
    { gradient: 'from-pink-500 to-rose-600', bg: 'bg-pink-500/10', text: 'text-pink-500' },
    { gradient: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-500/10', text: 'text-indigo-500' },
  ]
  const color = colors[index % colors.length]

  const docCount = project._count?.documents || 0
  const taskCount = project._count?.tasks || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300",
        "hover:shadow-2xl",
        isDark
          ? "bg-neutral-900/80 border-neutral-800 hover:border-neutral-700 backdrop-blur-sm"
          : "bg-white/80 border-slate-200 hover:border-slate-300 backdrop-blur-sm"
      )}>
        {/* Colored top accent */}
        <div className={cn("h-1 w-full bg-gradient-to-r", color.gradient)} />

        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "flex items-center justify-center h-12 w-12 rounded-xl transition-transform group-hover:scale-110",
              color.bg
            )}>
              <Folder className={cn("h-6 w-6", color.text)} />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                    isDark ? "hover:bg-neutral-800" : "hover:bg-slate-100"
                  )}
                  onClick={e => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={isDark ? "bg-neutral-900 border-neutral-800" : ""}>
                <DropdownMenuItem>Edit Project</DropdownMenuItem>
                <DropdownMenuItem>Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Title & Description */}
          <h3 className={cn(
            "font-semibold text-lg mb-1 truncate",
            isDark ? "text-white" : "text-slate-900"
          )}>
            {project.name}
          </h3>
          <p className={cn(
            "text-sm line-clamp-2 min-h-[40px] mb-4",
            isDark ? "text-neutral-400" : "text-slate-500"
          )}>
            {project.description || "No description"}
          </p>

          {/* Stats */}
          <div className={cn(
            "flex items-center gap-4 pt-4 border-t",
            isDark ? "border-neutral-800" : "border-slate-100"
          )}>
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "flex items-center justify-center h-6 w-6 rounded-md",
                isDark ? "bg-neutral-800" : "bg-slate-100"
              )}>
                <FileText className={cn("h-3.5 w-3.5", isDark ? "text-neutral-400" : "text-slate-500")} />
              </div>
              <span className={cn("text-sm font-medium", isDark ? "text-neutral-300" : "text-slate-600")}>
                {docCount}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className={cn(
                "flex items-center justify-center h-6 w-6 rounded-md",
                isDark ? "bg-neutral-800" : "bg-slate-100"
              )}>
                <ListTodo className={cn("h-3.5 w-3.5", isDark ? "text-neutral-400" : "text-slate-500")} />
              </div>
              <span className={cn("text-sm font-medium", isDark ? "text-neutral-300" : "text-slate-600")}>
                {taskCount}
              </span>
            </div>

            <div className={cn(
              "flex items-center gap-1.5 ml-auto text-xs",
              isDark ? "text-neutral-500" : "text-slate-400"
            )}>
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
            </div>
          </div>
        </CardContent>

        {/* Hover arrow */}
        <div className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100",
          "transition-all group-hover:translate-x-1",
          isDark ? "text-neutral-600" : "text-slate-300"
        )}>
          <ChevronRight className="h-5 w-5" />
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================================================
// Empty State Component
// ============================================================================
function EmptyState({ isDark, hasSearch }: { isDark: boolean; hasSearch: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl py-20 px-8",
        isDark ? "bg-neutral-900/50" : "bg-white/50"
      )}
    >
      <div className={cn(
        "relative flex h-24 w-24 items-center justify-center rounded-2xl mb-6",
        isDark ? "bg-neutral-800" : "bg-slate-100"
      )}>
        <FolderOpen className={cn("h-12 w-12", isDark ? "text-neutral-600" : "text-slate-400")} />
        <div className="absolute -top-2 -right-2">
          <Sparkles className={cn("h-6 w-6", isDark ? "text-purple-400" : "text-purple-500")} />
        </div>
      </div>

      <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
        {hasSearch ? 'No projects found' : 'Create your first project'}
      </h3>
      <p className={cn("text-center max-w-md mb-8", isDark ? "text-neutral-400" : "text-slate-500")}>
        {hasSearch
          ? 'Try adjusting your search or filter to find what you\'re looking for.'
          : 'Projects help you organize your documents, diagrams, and tasks in one place. Get started by creating your first project.'}
      </p>

      {!hasSearch && <CreateProjectDialog />}
    </motion.div>
  )
}

// ============================================================================
// Main Dashboard Component
// ============================================================================
export function DashboardHome() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'created'>('recent')
  const [stats, setStats] = useState<Stats>({ totalDocuments: 0, totalProjects: 0, totalTasks: 0, completedTasks: 0 })
  const { projects, documents, user, isLoading, currentWorkspace } = useApp()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const router = useRouter()

  // Filter and sort projects
  const filteredProjects = projects
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'created') return new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime()
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Load stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!currentWorkspace) return
      try {
        const tasksRes = await fetch(`/api/tasks?limit=1000`)
        if (tasksRes.ok) {
          const data = await tasksRes.json()
          const tasks = data.data || []
          setStats({
            totalDocuments: documents.length,
            totalProjects: projects.length,
            totalTasks: tasks.length,
            completedTasks: tasks.filter((t: { status: string }) => t.status === 'DONE').length
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    fetchStats()
  }, [currentWorkspace, documents.length, projects.length])

  const handleOpenProject = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const taskProgress = stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0

  if (isLoading) {
    return (
      <div className={cn("flex h-full flex-col", isDark ? "bg-black" : "bg-slate-50")}>
        <div className="p-8 space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="flex gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 flex-1 rounded-xl" />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex h-full flex-col relative", isDark ? "bg-black" : "bg-slate-50")}>
      <AnimatedBackground isDark={isDark} />

      {/* Hero Header */}
      <div className={cn(
        "relative z-10 px-8 py-10 border-b",
        isDark ? "border-neutral-800/50" : "border-slate-200/50"
      )}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-2"
              >
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600"
                )}>
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <Badge variant="secondary" className={cn(
                  "px-3 py-1",
                  isDark ? "bg-neutral-800/50 text-neutral-300" : "bg-slate-100 text-slate-600"
                )}>
                  {currentWorkspace?.name || 'Workspace'}
                </Badge>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cn("text-3xl font-bold tracking-tight", isDark ? "text-white" : "text-slate-900")}
              >
                {getGreeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className={cn("mt-2", isDark ? "text-neutral-400" : "text-slate-500")}
              >
                Welcome back! Here's what's happening with your projects.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CreateProjectDialog />
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-4 gap-4 mt-8"
          >
            {[
              { label: 'Projects', value: stats.totalProjects, icon: Folder, color: 'text-purple-500', bg: 'bg-purple-500/10' },
              { label: 'Documents', value: stats.totalDocuments, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Tasks', value: stats.totalTasks, icon: ListTodo, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { label: 'Completed', value: `${taskProgress}%`, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' }
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-md",
                  isDark
                    ? "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
                    : "bg-white/70 border-slate-200 hover:border-slate-300"
                )}
              >
                <div className={cn("flex items-center justify-center h-10 w-10 rounded-lg", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </div>
                <div>
                  <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                    {stat.value}
                  </p>
                  <p className={cn("text-sm", isDark ? "text-neutral-500" : "text-slate-500")}>
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-7xl mx-auto px-8 py-8">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-slate-900")}>
                All Projects
              </h2>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className={cn(
                    "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                    isDark ? "text-neutral-500" : "text-slate-400"
                  )} />
                  <Input
                    placeholder="Search projects..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={cn(
                      "h-10 w-64 pl-10",
                      isDark
                        ? "bg-neutral-900/50 border-neutral-800 placeholder:text-neutral-500"
                        : "bg-white/70 border-slate-200"
                    )}
                  />
                </div>

                {/* Sort */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-10",
                        isDark ? "border-neutral-800 bg-neutral-900/50" : "bg-white/70"
                      )}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {sortBy === 'recent' ? 'Recent' : sortBy === 'name' ? 'Name' : 'Created'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={isDark ? "bg-neutral-900 border-neutral-800" : ""}>
                    <DropdownMenuItem onClick={() => setSortBy('recent')}>
                      <Clock className="h-4 w-4 mr-2" /> Recently Updated
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('name')}>
                      <FileText className="h-4 w-4 mr-2" /> Name
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('created')}>
                      <Calendar className="h-4 w-4 mr-2" /> Created Date
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* View Mode */}
                <div className={cn(
                  "flex rounded-lg border p-1",
                  isDark ? "border-neutral-800 bg-neutral-900/50" : "border-slate-200 bg-white/70"
                )}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-md",
                      viewMode === 'grid' && (isDark ? "bg-neutral-800" : "bg-slate-100")
                    )}
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 rounded-md",
                      viewMode === 'list' && (isDark ? "bg-neutral-800" : "bg-slate-100")
                    )}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Projects Grid/List */}
            <AnimatePresence mode="wait">
              {filteredProjects.length === 0 ? (
                <EmptyState isDark={isDark} hasSearch={search.length > 0} />
              ) : viewMode === 'grid' ? (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {filteredProjects.map((project, index) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      index={index}
                      onClick={() => handleOpenProject(project.id)}
                      isDark={isDark}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {filteredProjects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleOpenProject(project.id)}
                      className={cn(
                        "group flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                        "hover:shadow-lg",
                        isDark
                          ? "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
                          : "bg-white/70 border-slate-200 hover:border-slate-300"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600"
                      )}>
                        <Folder className="h-6 w-6 text-white" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={cn("font-semibold truncate", isDark ? "text-white" : "text-slate-900")}>
                          {project.name}
                        </h3>
                        <p className={cn("text-sm truncate", isDark ? "text-neutral-400" : "text-slate-500")}>
                          {project.description || "No description"}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4">
                          <div className={cn("flex items-center gap-1.5 text-sm", isDark ? "text-neutral-400" : "text-slate-500")}>
                            <FileText className="h-4 w-4" />
                            {project._count?.documents || 0}
                          </div>
                          <div className={cn("flex items-center gap-1.5 text-sm", isDark ? "text-neutral-400" : "text-slate-500")}>
                            <ListTodo className="h-4 w-4" />
                            {project._count?.tasks || 0}
                          </div>
                        </div>

                        <span className={cn("text-sm", isDark ? "text-neutral-500" : "text-slate-400")}>
                          {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
                        </span>

                        <ChevronRight className={cn(
                          "h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity",
                          isDark ? "text-neutral-600" : "text-slate-400"
                        )} />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
