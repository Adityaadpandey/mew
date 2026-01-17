'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  Edit3,
  FileText,
  FolderPlus,
  MessageCircle,
  PenTool,
  Plus,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface Activity {
  id: string
  action: string
  targetType: string
  targetId: string
  createdAt: string
  metadata?: Record<string, unknown>
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

const actionIcons: Record<string, React.ElementType> = {
  created: Plus,
  updated: Edit3,
  completed: CheckCircle2,
  commented: MessageCircle,
  joined: Users,
  document: FileText,
  design: PenTool,
  project: FolderPlus,
}

const actionColors: Record<string, string> = {
  created: 'bg-emerald-500/10 text-emerald-500',
  updated: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
  commented: 'bg-purple-500/10 text-purple-500',
  joined: 'bg-orange-500/10 text-orange-500',
}

function getActivityDetails(activity: Activity) {
  const action = activity.action.toLowerCase()
  let Icon = actionIcons[action] || Edit3
  let color = actionColors[action] || 'bg-slate-500/10 text-slate-500'
  let verb = action

  // Parse action and determine icon/color
  if (action.includes('create')) {
    Icon = Plus
    color = 'bg-emerald-500/10 text-emerald-500'
    verb = 'created'
  } else if (action.includes('update') || action.includes('edit')) {
    Icon = Edit3
    color = 'bg-blue-500/10 text-blue-500'
    verb = 'updated'
  } else if (action.includes('complete') || action.includes('done')) {
    Icon = CheckCircle2
    color = 'bg-green-500/10 text-green-500'
    verb = 'completed'
  } else if (action.includes('comment')) {
    Icon = MessageCircle
    color = 'bg-purple-500/10 text-purple-500'
    verb = 'commented on'
  } else if (action.includes('join')) {
    Icon = Users
    color = 'bg-orange-500/10 text-orange-500'
    verb = 'joined'
  }

  // Get target type display
  let targetDisplay = activity.targetType.toLowerCase()
  if (targetDisplay === 'document') targetDisplay = 'document'
  if (targetDisplay === 'task') targetDisplay = 'task'
  if (targetDisplay === 'project') targetDisplay = 'project'

  return { Icon, color, verb, targetDisplay }
}

export function TeamActivityFeed({ workspaceId }: { workspaceId?: string }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    fetchActivities()
    // Poll for new activities every 30 seconds
    const interval = setInterval(fetchActivities, 30000)
    return () => clearInterval(interval)
  }, [workspaceId])

  const fetchActivities = async () => {
    try {
      const url = workspaceId
        ? `/api/activities?workspaceId=${workspaceId}&limit=15`
        : `/api/activities?limit=15`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        // Handle both array and object with activities property
        setActivities(Array.isArray(data) ? data : (data.activities || []))
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
      // Keep empty array on error - UI will show "No recent activity"
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className={cn(
        "h-full",
        isDark ? "bg-zinc-900/50 border-zinc-800" : ""
      )}>
        <CardHeader className={cn(
          "pb-3 border-b",
          isDark ? "border-zinc-800" : "border-slate-100"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "p-2 rounded-lg",
              isDark ? "bg-blue-500/10" : "bg-blue-50"
            )}>
              <Users className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Team Activity</CardTitle>
              <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-slate-500")}>
                Real-time updates from your team
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-5 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className={cn("h-8 w-8 rounded-full", isDark ? "bg-zinc-800" : "bg-slate-200")} />
                  <div className="flex-1 space-y-2">
                    <div className={cn("h-4 w-3/4 rounded", isDark ? "bg-zinc-800" : "bg-slate-200")} />
                    <div className={cn("h-3 w-1/2 rounded", isDark ? "bg-zinc-800" : "bg-slate-200")} />
                  </div>
                </div>
              ))}
            </div>
          ) : activities.length === 0 ? (
            <div className="p-8 text-center">
              <Users className={cn("h-8 w-8 mx-auto mb-2", isDark ? "text-zinc-600" : "text-slate-400")} />
              <p className={cn("text-sm", isDark ? "text-zinc-500" : "text-slate-500")}>
                No recent activity
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="p-4 space-y-1">
                {activities.map((activity, index) => {
                  const { Icon, color, verb, targetDisplay } = getActivityDetails(activity)

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "flex gap-3 p-2 rounded-lg transition-colors",
                        isDark ? "hover:bg-zinc-800/50" : "hover:bg-slate-50"
                      )}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage src={activity.user.image || undefined} />
                        <AvatarFallback className={cn(
                          "text-xs",
                          isDark ? "bg-zinc-700" : "bg-slate-200"
                        )}>
                          {activity.user.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm", isDark ? "text-zinc-300" : "text-slate-700")}>
                          <span className="font-medium">{activity.user.name || 'Someone'}</span>
                          {' '}{verb}{' '}a{' '}
                          <span className="font-medium">{targetDisplay}</span>
                        </p>
                        <p className={cn("text-xs mt-0.5", isDark ? "text-zinc-500" : "text-slate-400")}>
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className={cn("h-6 w-6 rounded flex items-center justify-center flex-shrink-0", color)}>
                        <Icon className="h-3 w-3" />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
