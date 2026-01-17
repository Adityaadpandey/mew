'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted/60 dark:bg-muted/40",
        className
      )}
    />
  )
}

// Premium shimmer skeleton with gradient effect
function ShimmerSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted/40 dark:bg-muted/30",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:animate-[shimmer_2s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        className
      )}
    />
  )
}

// Card skeleton
function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  )
}

// Stat card skeleton
function StatCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("rounded-xl border bg-card p-5 flex items-center gap-4", className)}>
      <Skeleton className="h-12 w-12 rounded-2xl" />
      <div className="space-y-2">
        <Skeleton className="h-7 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

// List item skeleton
function ListItemSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center gap-3 p-3", className)}>
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

// Table row skeleton
function TableRowSkeleton({ columns = 4, className }: SkeletonProps & { columns?: number }) {
  return (
    <div className={cn("flex items-center gap-4 p-4 border-b", className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-4", i === 0 ? "w-40" : "flex-1")}
        />
      ))}
    </div>
  )
}

// Dashboard skeleton
function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Large card */}
        <div className="lg:col-span-2 rounded-xl border bg-card">
          <div className="p-6 border-b">
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <ListItemSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Side cards */}
        <div className="rounded-xl border bg-card">
          <div className="p-6 border-b">
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="p-6 border-b">
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="p-4 space-y-2">
            {[1, 2, 3, 4].map(i => (
              <ListItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Project page skeleton
function ProjectSkeleton() {
  return (
    <div className="h-full">
      {/* Header */}
      <div className="px-8 py-6 border-b">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-6">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <StatCardSkeleton key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton className="h-80" />
          <CardSkeleton className="h-80" />
        </div>
      </div>
    </div>
  )
}

// Animated loading spinner
function LoadingSpinner({ className, size = 'md' }: SkeletonProps & { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-primary/30 border-t-primary",
        sizeClasses[size],
        className
      )}
    />
  )
}

// Branded Mew logo loading animation
function BrandLoading({ message = 'Loading...', size = 'md' }: { message?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: { container: 'h-8 w-8', ring: 'h-10 w-10' },
    md: { container: 'h-12 w-12', ring: 'h-14 w-14' },
    lg: { container: 'h-16 w-16', ring: 'h-20 w-20' },
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Outer spinning ring */}
        <div
          className={cn(
            "absolute inset-0 rounded-full border-2 border-transparent border-t-[#C10801] border-r-[#F16001] animate-spin",
            sizeClasses[size].ring
          )}
          style={{ margin: '-4px' }}
        />
        {/* Inner gradient logo container */}
        <div
          className={cn(
            "rounded-xl bg-gradient-to-br from-[#C10801] to-[#F16001] flex items-center justify-center",
            sizeClasses[size].container
          )}
        >
          <span className="text-white font-bold text-lg">M</span>
        </div>
      </div>
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      )}
    </div>
  )
}

// Dots loading animation
function DotsLoading({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 rounded-full bg-gradient-to-r from-[#C10801] to-[#F16001]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  )
}

// Pulse ring animation
function PulseRing({ className }: SkeletonProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#C10801] to-[#F16001] animate-ping opacity-20" />
      <div className="relative h-3 w-3 rounded-full bg-gradient-to-r from-[#C10801] to-[#F16001]" />
    </div>
  )
}

// Full page loading
function PageLoading({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <BrandLoading message={message} size="lg" />
      </motion.div>
    </div>
  )
}

// Inline button loading state
function ButtonLoading({ className }: SkeletonProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
    </div>
  )
}

// Success animation
function SuccessAnimation({ className, onComplete }: SkeletonProps & { onComplete?: () => void }) {
  return (
    <motion.div
      className={cn("flex items-center justify-center", className)}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 10 }}
      onAnimationComplete={onComplete}
    >
      <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
        <motion.svg
          className="h-6 w-6 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <motion.path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </motion.svg>
      </div>
    </motion.div>
  )
}

export {
  Skeleton,
  ShimmerSkeleton,
  CardSkeleton,
  StatCardSkeleton,
  ListItemSkeleton,
  TableRowSkeleton,
  DashboardSkeleton,
  ProjectSkeleton,
  LoadingSpinner,
  BrandLoading,
  DotsLoading,
  PulseRing,
  PageLoading,
  ButtonLoading,
  SuccessAnimation,
}
