'use client'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Sparkles,
  Zap,
  Crown,
  Lock,
  ArrowRight,
  Brain,
  Infinity,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface UpgradePromptProps {
  feature: string
  description?: string
  currentUsage?: number
  limit?: number
  onClose?: () => void
  variant?: 'modal' | 'inline' | 'banner'
}

export function UpgradePrompt({
  feature,
  description,
  currentUsage,
  limit,
  onClose,
  variant = 'inline',
}: UpgradePromptProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [isVisible, setIsVisible] = useState(true)

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible) return null

  if (variant === 'banner') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          "relative px-4 py-3 flex items-center justify-between",
          "bg-gradient-to-r from-[#C10801] to-[#F16001] text-white"
        )}
      >
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5" />
          <span className="text-sm font-medium">
            {description || `Upgrade to unlock ${feature}`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/pricing">
            <Button
              size="sm"
              className="bg-white text-[#F16001] hover:bg-white/90 h-8"
            >
              View Plans
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
          {onClose && (
            <button onClick={handleClose} className="p-1 hover:bg-white/20 rounded">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>
    )
  }

  if (variant === 'modal') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full max-w-md rounded-2xl p-6 shadow-2xl",
              isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white"
            )}
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className={cn(
                "absolute top-4 right-4 p-1.5 rounded-lg transition-colors",
                isDark ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-slate-100 text-slate-500"
              )}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C10801] to-[#F16001] mb-6 mx-auto">
              <Lock className="h-8 w-8 text-white" />
            </div>

            {/* Content */}
            <div className="text-center mb-6">
              <h3 className={cn(
                "text-xl font-bold mb-2",
                isDark ? "text-white" : "text-slate-900"
              )}>
                Upgrade to unlock {feature}
              </h3>
              <p className={cn(
                "text-sm",
                isDark ? "text-zinc-400" : "text-slate-600"
              )}>
                {description || `This feature is available on Pro and higher plans. Upgrade now to get access.`}
              </p>
            </div>

            {/* Usage indicator */}
            {currentUsage !== undefined && limit !== undefined && (
              <div className={cn(
                "p-4 rounded-xl mb-6",
                isDark ? "bg-zinc-800/50" : "bg-slate-50"
              )}>
                <div className="flex justify-between text-sm mb-2">
                  <span className={isDark ? "text-zinc-400" : "text-slate-600"}>
                    Current usage
                  </span>
                  <span className={cn(
                    "font-medium",
                    currentUsage >= limit ? "text-red-500" : isDark ? "text-white" : "text-slate-900"
                  )}>
                    {currentUsage} / {limit}
                  </span>
                </div>
                <div className={cn(
                  "h-2 rounded-full overflow-hidden",
                  isDark ? "bg-zinc-700" : "bg-slate-200"
                )}>
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      currentUsage >= limit
                        ? "bg-red-500"
                        : "bg-gradient-to-r from-[#C10801] to-[#F16001]"
                    )}
                    style={{ width: `${Math.min((currentUsage / limit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className={cn(
              "p-4 rounded-xl mb-6",
              isDark ? "bg-zinc-800/50" : "bg-slate-50"
            )}>
              <p className={cn(
                "text-xs font-medium uppercase tracking-wider mb-3",
                isDark ? "text-zinc-500" : "text-slate-500"
              )}>
                Pro plan includes
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <Infinity className="h-4 w-4 text-emerald-500" />
                  <span className={isDark ? "text-zinc-300" : "text-slate-700"}>
                    Unlimited projects
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Brain className="h-4 w-4 text-emerald-500" />
                  <span className={isDark ? "text-zinc-300" : "text-slate-700"}>
                    500 AI credits per month
                  </span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  <span className={isDark ? "text-zinc-300" : "text-slate-700"}>
                    Advanced diagrams & templates
                  </span>
                </li>
              </ul>
            </div>

            {/* CTA */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className={cn("flex-1", isDark && "border-zinc-700 hover:bg-zinc-800")}
                onClick={handleClose}
              >
                Maybe Later
              </Button>
              <Link href="/pricing" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001] text-white">
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Inline variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-xl border p-4",
        isDark
          ? "bg-gradient-to-r from-[#C10801]/10 to-[#F16001]/10 border-orange-500/20"
          : "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#C10801] to-[#F16001] shrink-0">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            "font-semibold mb-1",
            isDark ? "text-white" : "text-slate-900"
          )}>
            Upgrade to unlock {feature}
          </h4>
          <p className={cn(
            "text-sm mb-3",
            isDark ? "text-zinc-400" : "text-slate-600"
          )}>
            {description || `Get access to ${feature} and other premium features.`}
          </p>
          <Link href="/pricing">
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00701] hover:to-[#D15001] text-white"
            >
              View Plans
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// Simple inline upgrade badge for buttons/links
export function UpgradeBadge({ className }: { className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium",
      "bg-gradient-to-r from-[#C10801] to-[#F16001] text-white",
      className
    )}>
      <Crown className="h-3 w-3" />
      PRO
    </span>
  )
}

// Hook to check feature access
export function useFeatureGate(feature: string) {
  const [showUpgrade, setShowUpgrade] = useState(false)

  const checkAccess = async (): Promise<boolean> => {
    try {
      const res = await fetch(`/api/subscription/check?feature=${feature}`)
      const data = await res.json()
      if (!data.allowed) {
        setShowUpgrade(true)
        return false
      }
      return true
    } catch {
      return true // Allow on error
    }
  }

  return {
    showUpgrade,
    setShowUpgrade,
    checkAccess,
  }
}
