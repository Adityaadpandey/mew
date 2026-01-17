'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import {
  hasFeatureAccess,
  PREMIUM_FEATURES,
  type SubscriptionPlan,
} from '@/lib/premium-features'
import { Crown, Lock, Sparkles, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState, ReactNode } from 'react'

interface FeatureGateProps {
  featureId: string
  userPlan: SubscriptionPlan
  children: ReactNode
  fallback?: ReactNode
  showLock?: boolean
}

export function FeatureGate({
  featureId,
  userPlan,
  children,
  fallback,
  showLock = true,
}: FeatureGateProps) {
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const hasAccess = hasFeatureAccess(userPlan, featureId)
  const feature = PREMIUM_FEATURES[featureId]

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (!showLock) {
    return null
  }

  return (
    <>
      <LockedFeatureButton
        feature={feature}
        onClick={() => setShowUpgradeDialog(true)}
      />
      <UpgradeDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        feature={feature}
        userPlan={userPlan}
      />
    </>
  )
}

function LockedFeatureButton({
  feature,
  onClick,
}: {
  feature: (typeof PREMIUM_FEATURES)[string]
  onClick: () => void
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-3 w-full p-4 rounded-xl border-2 border-dashed transition-all',
        isDark
          ? 'border-zinc-700 hover:border-orange-500/50 bg-zinc-900/50'
          : 'border-slate-300 hover:border-orange-500/50 bg-slate-50'
      )}
    >
      <div
        className={cn(
          'h-10 w-10 rounded-lg flex items-center justify-center',
          'bg-gradient-to-br from-amber-500/20 to-orange-500/20'
        )}
      >
        <Lock className="h-5 w-5 text-orange-500" />
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-medium text-sm',
              isDark ? 'text-white' : 'text-slate-900'
            )}
          >
            {feature.name}
          </span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            {feature.minPlan}
          </span>
        </div>
        <p
          className={cn(
            'text-xs mt-0.5',
            isDark ? 'text-zinc-400' : 'text-slate-500'
          )}
        >
          {feature.description}
        </p>
      </div>
      <div
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
          'bg-gradient-to-r from-[#C10801] to-[#F16001] text-white',
          'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0'
        )}
      >
        <Zap className="h-3 w-3" />
        Upgrade
      </div>
    </button>
  )
}

function UpgradeDialog({
  open,
  onOpenChange,
  feature,
  userPlan,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  feature: (typeof PREMIUM_FEATURES)[string]
  userPlan: SubscriptionPlan
}) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const planBenefits: Record<SubscriptionPlan, string[]> = {
    FREE: [],
    PRO: [
      'Unlimited documents & diagrams',
      'AI Writing Assistant',
      'AI Task Suggestions',
      'Advanced export options',
      'Version history',
      'Priority support',
    ],
    TEAM: [
      'Everything in Pro',
      'Unlimited team members',
      'Task dependencies & Gantt charts',
      'Time tracking',
      'API access & Webhooks',
      'Team analytics',
    ],
    ENTERPRISE: [
      'Everything in Team',
      'Single Sign-On (SSO)',
      'Audit logs',
      'Custom branding',
      'Dedicated support',
      'Custom contracts',
    ],
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'sm:max-w-[480px]',
          isDark ? 'bg-zinc-950 border-zinc-800' : ''
        )}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className={isDark ? 'text-white' : ''}>
                Upgrade to {feature.minPlan}
              </DialogTitle>
              <DialogDescription>
                Unlock {feature.name} and more
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Feature highlight */}
          <div
            className={cn(
              'p-4 rounded-xl border',
              isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-slate-50 border-slate-200'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#C10801] to-[#F16001] flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4
                  className={cn(
                    'font-semibold text-sm',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  {feature.name}
                </h4>
                <p
                  className={cn(
                    'text-xs mt-1',
                    isDark ? 'text-zinc-400' : 'text-slate-500'
                  )}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          </div>

          {/* Plan benefits */}
          <div>
            <h4
              className={cn(
                'text-sm font-medium mb-3',
                isDark ? 'text-zinc-300' : 'text-slate-700'
              )}
            >
              What you get with {feature.minPlan}:
            </h4>
            <ul className="space-y-2">
              {planBenefits[feature.minPlan].map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="h-3 w-3 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span
                    className={cn(
                      'text-sm',
                      isDark ? 'text-zinc-300' : 'text-slate-600'
                    )}
                  >
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
          <Link href="/settings/billing" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00601] hover:to-[#E85002]">
              <Zap className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Badge component for premium features
export function PremiumBadge({ plan }: { plan: SubscriptionPlan }) {
  if (plan === 'FREE') return null

  const colors: Record<SubscriptionPlan, string> = {
    FREE: '',
    PRO: 'from-blue-500 to-cyan-500',
    TEAM: 'from-amber-500 to-orange-500',
    ENTERPRISE: 'from-purple-500 to-pink-500',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold text-white',
        `bg-gradient-to-r ${colors[plan]}`
      )}
    >
      <Crown className="h-2.5 w-2.5" />
      {plan}
    </span>
  )
}

// Hook to check feature access
export function useFeatureAccess(featureId: string, userPlan: SubscriptionPlan) {
  const hasAccess = hasFeatureAccess(userPlan, featureId)
  const feature = PREMIUM_FEATURES[featureId]

  return {
    hasAccess,
    feature,
    requiredPlan: feature?.minPlan,
  }
}
