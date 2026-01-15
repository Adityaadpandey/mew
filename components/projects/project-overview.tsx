'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Clock, FileText } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ProjectOverview({ projectId }: { projectId: string }) {
  const [stats, setStats] = useState([
    { label: 'Pending Tasks', value: '0', icon: <Clock className="h-4 w-4 text-orange-500" />, change: 'No recent activity' },
    { label: 'Completed', value: '0%', icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, change: 'No data' },
    { label: 'Total Files', value: '0', icon: <FileText className="h-4 w-4 text-blue-500" />, change: 'Docs & Designs' },
  ])

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/projects/${projectId}`)
        const tasksRes = await fetch(`/api/projects/${projectId}/tasks`)

        if (res.ok && tasksRes.ok) {
          const projectData = await res.json()
          const tasks: any[] = await tasksRes.json()

          const totalPromise = tasks.length
          const completed = tasks.filter((t: any) => t.status === 'DONE').length
          const todo = tasks.filter((t: any) => t.status !== 'DONE').length
          const percentage = totalPromise > 0 ? Math.round((completed / totalPromise) * 100) : 0

          const docCount = projectData._count?.documents || 0

          setStats([
            { label: 'Pending Tasks', value: todo.toString(), icon: <Clock className="h-4 w-4 text-orange-500" />, change: `Total: ${totalPromise}` },
            { label: 'Completed', value: `${percentage}%`, icon: <CheckCircle2 className="h-4 w-4 text-green-500" />, change: `${completed} tasks done` },
            { label: 'Total Files', value: docCount.toString(), icon: <FileText className="h-4 w-4 text-blue-500" />, change: 'Docs & Designs' },
          ])
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    fetchStats()
  }, [projectId])

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow dark:bg-zinc-900/50 dark:border-white/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Button variant="ghost" size="sm" className="text-xs">View All</Button>
          </div>

          <Card className="dark:bg-zinc-900/50 dark:border-white/10">
            <CardContent className="p-0">
               <div className="p-8 text-center text-muted-foreground text-sm">
                 No recent activity data available
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Quick Access</h2>
          <Card className="dark:bg-zinc-900/50 dark:border-white/10">
            <CardContent className="p-2 space-y-1">
              {['Product Requirements', 'Q1 Roadmap', 'Design System', 'User Personas'].map((item) => (
                 <Button key={item} variant="ghost" className="w-full justify-start h-10 font-normal">
                   <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                   {item}
                   <ArrowRight className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-50" />
                 </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
