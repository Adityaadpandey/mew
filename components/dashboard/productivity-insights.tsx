'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface ProductivityStats {
  tasksCompletedToday: number
  tasksCompletedThisWeek: number
  currentStreak: number
  productivityScore: number
  weeklyGoal: number
  weeklyProgress: number
  mostProductiveDay: string
  averageCompletionTime: string
}

export function ProductivityInsights() {
  const [stats, setStats] = useState<ProductivityStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats/productivity')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch productivity stats:', error)
      // Set default stats for demo
      setStats({
        tasksCompletedToday: 5,
        tasksCompletedThisWeek: 23,
        currentStreak: 7,
        productivityScore: 85,
        weeklyGoal: 30,
        weeklyProgress: 23,
        mostProductiveDay: 'Tuesday',
        averageCompletionTime: '2.5 hours',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !stats) {
    return (
      <Card className={cn(
        "animate-pulse",
        isDark ? "bg-zinc-900/50 border-zinc-800" : ""
      )}>
        <CardContent className="h-[200px]" />
      </Card>
    )
  }

  const weeklyProgressPercent = (stats.weeklyProgress / stats.weeklyGoal) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn(
        "overflow-hidden",
        isDark ? "bg-zinc-900/50 border-zinc-800" : ""
      )}>
        <CardHeader className={cn(
          "pb-3 border-b",
          isDark ? "border-zinc-800" : "border-slate-100"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-lg",
                isDark ? "bg-emerald-500/10" : "bg-emerald-50"
              )}>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Productivity Insights</CardTitle>
                <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-slate-500")}>
                  Your performance this week
                </p>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-[#C10801] to-[#F16001] text-white border-0">
              Score: {stats.productivityScore}%
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-5">
          {/* Weekly Goal Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={cn("text-sm font-medium", isDark ? "text-zinc-300" : "text-slate-700")}>
                Weekly Goal
              </span>
              <span className={cn("text-sm", isDark ? "text-zinc-400" : "text-slate-500")}>
                {stats.weeklyProgress}/{stats.weeklyGoal} tasks
              </span>
            </div>
            <Progress
              value={weeklyProgressPercent}
              className={cn("h-2", isDark ? "bg-zinc-800" : "bg-slate-100")}
            />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className={cn(
              "p-3 rounded-xl",
              isDark ? "bg-zinc-800/50" : "bg-slate-50"
            )}>
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className={cn("text-xs", isDark ? "text-zinc-400" : "text-slate-500")}>
                  Today
                </span>
              </div>
              <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                {stats.tasksCompletedToday}
              </p>
              <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-slate-400")}>
                tasks completed
              </p>
            </div>

            <div className={cn(
              "p-3 rounded-xl",
              isDark ? "bg-zinc-800/50" : "bg-slate-50"
            )}>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className={cn("text-xs", isDark ? "text-zinc-400" : "text-slate-500")}>
                  Streak
                </span>
              </div>
              <p className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
                {stats.currentStreak}
              </p>
              <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-slate-400")}>
                days in a row
              </p>
            </div>

            <div className={cn(
              "p-3 rounded-xl",
              isDark ? "bg-zinc-800/50" : "bg-slate-50"
            )}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className={cn("text-xs", isDark ? "text-zinc-400" : "text-slate-500")}>
                  Best Day
                </span>
              </div>
              <p className={cn("text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>
                {stats.mostProductiveDay}
              </p>
              <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-slate-400")}>
                most productive
              </p>
            </div>

            <div className={cn(
              "p-3 rounded-xl",
              isDark ? "bg-zinc-800/50" : "bg-slate-50"
            )}>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-purple-500" />
                <span className={cn("text-xs", isDark ? "text-zinc-400" : "text-slate-500")}>
                  Avg Time
                </span>
              </div>
              <p className={cn("text-lg font-bold", isDark ? "text-white" : "text-slate-900")}>
                {stats.averageCompletionTime}
              </p>
              <p className={cn("text-xs", isDark ? "text-zinc-500" : "text-slate-400")}>
                per task
              </p>
            </div>
          </div>

          {/* Motivational Message */}
          {stats.currentStreak >= 5 && (
            <div className={cn(
              "flex items-center gap-3 p-3 rounded-xl",
              "bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20"
            )}>
              <Award className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className={cn("text-sm font-medium", isDark ? "text-white" : "text-slate-900")}>
                  You're on fire! 🔥
                </p>
                <p className={cn("text-xs", isDark ? "text-zinc-400" : "text-slate-500")}>
                  {stats.currentStreak} day streak - keep the momentum going!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
