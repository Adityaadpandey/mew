'use client'

import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  FileText,
  FolderOpen,
  Inbox,
  ListTodo,
  LucideIcon,
  MessageCircle,
  Plus,
  Search,
  Users,
} from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const sizeClasses = {
    sm: {
      container: 'py-8 px-4',
      icon: 'h-10 w-10',
      iconWrapper: 'h-16 w-16',
      title: 'text-base',
      description: 'text-xs',
    },
    md: {
      container: 'py-12 px-6',
      icon: 'h-12 w-12',
      iconWrapper: 'h-20 w-20',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16 px-8',
      icon: 'h-16 w-16',
      iconWrapper: 'h-24 w-24',
      title: 'text-xl',
      description: 'text-base',
    },
  }

  const sizes = sizeClasses[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className={cn(
          'rounded-2xl flex items-center justify-center mb-4',
          sizes.iconWrapper,
          isDark
            ? 'bg-zinc-800/50 border border-zinc-700/50'
            : 'bg-slate-100 border border-slate-200'
        )}
      >
        <Icon
          className={cn(
            sizes.icon,
            isDark ? 'text-zinc-500' : 'text-slate-400'
          )}
        />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          'font-semibold mb-2',
          sizes.title,
          isDark ? 'text-white' : 'text-slate-900'
        )}
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={cn(
          'max-w-sm mb-6',
          sizes.description,
          isDark ? 'text-zinc-400' : 'text-slate-500'
        )}
      >
        {description}
      </motion.p>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={action.onClick}
            className="bg-gradient-to-r from-[#C10801] to-[#F16001] hover:from-[#A00601] hover:to-[#E85002]"
          >
            {action.icon && <action.icon className="h-4 w-4 mr-2" />}
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

// Pre-configured empty states for common use cases
export function NoProjectsEmpty({ onCreateProject }: { onCreateProject: () => void }) {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No projects yet"
      description="Create your first project to get started organizing your work and collaborating with your team."
      action={{
        label: 'Create Project',
        onClick: onCreateProject,
        icon: Plus,
      }}
    />
  )
}

export function NoTasksEmpty({ onCreateTask }: { onCreateTask: () => void }) {
  return (
    <EmptyState
      icon={ListTodo}
      title="No tasks yet"
      description="Create tasks to track your work and stay organized. Break down your projects into actionable items."
      action={{
        label: 'Create Task',
        onClick: onCreateTask,
        icon: Plus,
      }}
    />
  )
}

export function NoDocumentsEmpty({ onCreateDocument }: { onCreateDocument: () => void }) {
  return (
    <EmptyState
      icon={FileText}
      title="No documents yet"
      description="Create documents to capture your ideas, notes, and important information for your project."
      action={{
        label: 'Create Document',
        onClick: onCreateDocument,
        icon: Plus,
      }}
    />
  )
}

export function NoMembersEmpty({ onInvite }: { onInvite: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="No team members"
      description="Invite team members to collaborate on this project together."
      action={{
        label: 'Invite Members',
        onClick: onInvite,
        icon: Plus,
      }}
    />
  )
}

export function NoCommentsEmpty() {
  return (
    <EmptyState
      icon={MessageCircle}
      title="No comments yet"
      description="Be the first to start the discussion by adding a comment."
      size="sm"
    />
  )
}

export function NoSearchResultsEmpty({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`We couldn't find anything matching "${query}". Try a different search term.`}
    />
  )
}

export function NoNotificationsEmpty() {
  return (
    <EmptyState
      icon={Inbox}
      title="All caught up!"
      description="You have no new notifications. We'll let you know when something needs your attention."
      size="sm"
    />
  )
}
