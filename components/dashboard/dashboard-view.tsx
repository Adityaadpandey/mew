'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { LayoutGrid, List, Plus, Search } from 'lucide-react'
import { ProjectCard } from './project-card'

// ... (imports remain)
import { useApp } from '@/lib/app-context'
import { useEffect, useState } from 'react'

interface Project {
  id: string
  name: string
  description: string
  updatedAt: string
  _count: {
    documents: number
    tasks: number
  }
}

export function DashboardView() {
  const { currentWorkspace } = useApp()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      if (!currentWorkspace?.id) return
      try {
        const res = await fetch(`/api/projects?workspaceId=${currentWorkspace.id}`)
        if (res.ok) {
          const data = await res.json()
          setProjects(data)
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProjects()
  }, [currentWorkspace?.id])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto bg-background/50">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back. Here's what's happening in {currentWorkspace?.name}.</p>
          </div>
          <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
            <Plus className="h-4 w-4" /> New Project
          </Button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search projects..." className="pl-9 bg-background/50 border-white/10" />
          </div>

          <Tabs defaultValue="grid" className="w-[100px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid"><LayoutGrid className="h-4 w-4" /></TabsTrigger>
              <TabsTrigger value="list"><List className="h-4 w-4" /></TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="bg-transparent border-b border-border w-full justify-start rounded-none h-auto p-0 pb-1 gap-6">
          <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-0 px-1 font-medium">All Projects</TabsTrigger>
          <TabsTrigger value="recent" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-0 px-1 font-medium">Recent</TabsTrigger>
          <TabsTrigger value="favorites" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 pt-0 px-1 font-medium">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="m-0">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {projects.map((project, index) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.name}
                description={project.description}
                lastEdited={new Date(project.updatedAt).toLocaleDateString()}
                memberCount={(project._count.tasks > 0 ? project._count.tasks : 1)} // Proxy member count
                type="hybrid"
                index={index}
                // Randomize color for visual variety based on ID
                color={['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500'][project.id.charCodeAt(0) % 4]}
              />
            ))}

            {/* New Project Placeholder */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              className="group h-48 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors gap-2"
            >
              <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">Create New Project</p>
            </motion.div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
