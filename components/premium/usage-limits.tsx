'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import {
  PLAN_LIMITS,
  type SubscriptionPlan,
} from '@/lib/premium-features'
import {
  FileText,
  FolderOpen,
  HardDrive,
  Users,
  Zap,
} from 'lucide-react'
import Link from 'next/link'

interface UsageLimitsProps {
  plan: SubscriptionPlan
  usage: {
    projects: number
    documents: number
    members: number
    storageUsedGB: number
  }
}

export function UsageLimits({ plan, usage }: UsageLimitsProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const limits = PLAN_LIMITS[plan]

  const usageItems = [
    {
      label: 'Projects',
      icon: FolderOpen,
      used: usage.projects,
      limit: limits.maxProjects,
      color: 'orange',
    },
    {
      label: 'Documents',
      icon: FileText,
      used: usage.documents,
      limit: limits.maxDocumentsPerProject,
      color: 'blue',
    },
    {
      label: 'Team Members',
      icon: Users,
      used: usage.members,
      limit: limits.maxMembersPerWorkspace,
      color: 'emerald',
    },
    {
      label: 'Storage',
      icon: HardDrive,
      used: usage.storageUsedGB,
      limit: limits.maxStorageGB,
      color: 'amber',
      unit: 'GB',
    },
  ]

  const getPercentage = (used: number, limit: number) => {
    if (limit === -1) return 0
    return Math.min(100, (used / limit) * 100)
  }

  const getProgressColor = (percentage: number, color: string) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-amber-500'
    return `bg-${color}-500`
  }

  return (
    <Card
      className={cn(
        'overflow-hidden',
        isDark ? 'bg-zinc-900/50 border-zinc-800' : ''
      )}
    >
      <CardHeader
        className={cn(
          'pb-3 border-b',
          isDark ? 'border-zinc-800' : 'border-slate-100'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'p-2 rounded-lg',
                isDark ? 'bg-orange-500/10' : 'bg-orange-50'
              )}
            >
              <Zap className="h-4 w-4 text-orange-500" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                Usage & Limits
              </CardTitle>
              <p
                className={cn(
                  'text-xs',
                  isDark ? 'text-zinc-500' : 'text-slate-500'
                )}
              >
                Your {plan} plan usage
              </p>
            </div>
          </div>
          <Link href="/settings/billing">
            <Button
              size="sm"
              variant="outline"
              className={cn(
                'text-xs',
                isDark ? 'border-zinc-700' : ''
              )}
            >
              Upgrade Plan
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {usageItems.map((item) => {
          const percentage = getPercentage(item.used, item.limit)
          const isUnlimited = item.limit === -1
          const isNearLimit = percentage >= 75

          return (
            <div key={item.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <item.icon
                    className={cn(
                      'h-4 w-4',
                      isDark ? 'text-zinc-400' : 'text-slate-500'
                    )}
                  />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isDark ? 'text-zinc-300' : 'text-slate-700'
                    )}
                  >
                    {item.label}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-sm',
                    isNearLimit && !isUnlimited
                      ? 'text-amber-500 font-medium'
                      : isDark
                      ? 'text-zinc-400'
                      : 'text-slate-500'
                  )}
                >
                  {item.used}
                  {item.unit ? ` ${item.unit}` : ''} /{' '}
                  {isUnlimited ? '∞' : `${item.limit}${item.unit ? ` ${item.unit}` : ''}`}
                </span>
              </div>
              <Progress
                value={isUnlimited ? 0 : percentage}
                className={cn('h-2', isDark ? 'bg-zinc-800' : 'bg-slate-100')}
              />
              {isNearLimit && !isUnlimited && (
                <p className="text-xs text-amber-500">
                  {percentage >= 90
                    ? 'You\'re almost at your limit!'
                    : 'Approaching limit'}
                </p>
              )}
            </div>
          )
        })}

        {plan === 'FREE' && (
          <div
            className={cn(
              'mt-4 p-4 rounded-xl border-2 border-dashed',
              isDark
                ? 'border-orange-500/30 bg-orange-500/5'
                : 'border-orange-500/30 bg-orange-50'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#C10801] to-[#F16001] flex items-center justify-center flex-shrink-0">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4
                  className={cn(
                    'font-semibold text-sm',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Need more capacity?
                </h4>
                <p
                  className={cn(
                    'text-xs mt-1',
                    isDark ? 'text-zinc-400' : 'text-slate-500'
                  )}
                >
                  Upgrade to Pro for unlimited documents and more features
                </p>
                <Link href="/settings/billing">
                  <Button
                    size="sm"
                    className="mt-3 bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00601] hover:to-[#E85002]"
                  >
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Compact usage indicator for headers/sidebars
export function UsageIndicator({
  plan,
  used,
  limit,
  label,
}: {
  plan: SubscriptionPlan
  used: number
  limit: number
  label: string
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const isUnlimited = limit === -1
  const percentage = isUnlimited ? 0 : (used / limit) * 100
  const isNearLimit = percentage >= 75

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs',
        isDark ? 'bg-zinc-800' : 'bg-slate-100'
      )}
    >
      <span className={isDark ? 'text-zinc-400' : 'text-slate-500'}>
        {label}:
      </span>
      <span
        className={cn(
          'font-medium',
          isNearLimit && !isUnlimited
            ? 'text-amber-500'
            : isDark
            ? 'text-white'
            : 'text-slate-900'
        )}
      >
        {used}/{isUnlimited ? '∞' : limit}
      </span>
      {isNearLimit && !isUnlimited && (
        <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
      )}
    </div>
  )
}
