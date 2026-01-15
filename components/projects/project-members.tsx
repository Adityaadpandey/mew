'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { InviteDialog } from '@/components/collaboration/invite-dialog'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import {
  Crown,
  MoreHorizontal,
  Shield,
  Eye,
  MessageSquare,
  Loader2
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import { useApp } from '@/lib/app-context'

interface Member {
  id: string
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
  joinedAt: string
  user: {
    id: string
    name: string | null
    email: string | null
    image: string | null
  }
}

interface ProjectMembersProps {
  projectId: string
  projectName: string
}

const ROLE_CONFIG = {
  OWNER: {
    label: 'Owner',
    icon: Crown,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    description: 'Full control over the project',
  },
  ADMIN: {
    label: 'Admin',
    icon: Shield,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    description: 'Can manage members and settings',
  },
  MEMBER: {
    label: 'Member',
    icon: MessageSquare,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    description: 'Can edit and contribute',
  },
  VIEWER: {
    label: 'Viewer',
    icon: Eye,
    color: 'text-slate-500',
    bg: 'bg-slate-500/10',
    description: 'Read-only access',
  },
}

export function ProjectMembers({ projectId, projectName }: ProjectMembersProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { resolvedTheme } = useTheme()
  const { user } = useApp()
  const isDark = resolvedTheme === 'dark'

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members`)
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [projectId])

  const currentUserMember = members.find(m => m.user.id === user?.id)
  const canManageMembers = currentUserMember && (currentUserMember.role === 'OWNER' || currentUserMember.role === 'ADMIN')

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (res.ok) {
        toast.success('Member role updated')
        fetchMembers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update role')
      }
    } catch (error) {
      console.error('Failed to update role:', error)
      toast.error('Failed to update role')
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Remove ${memberName} from this project?`)) return

    try {
      const res = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast.success('Member removed')
        fetchMembers()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to remove member')
      }
    } catch (error) {
      console.error('Failed to remove member:', error)
      toast.error('Failed to remove member')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="max-w-4xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>
              Team Members
            </h2>
            <p className={cn("text-sm mt-1", isDark ? "text-neutral-400" : "text-slate-500")}>
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </p>
          </div>

          {canManageMembers && (
            <InviteDialog
              type="project"
              targetId={projectId}
              targetName={projectName}
              onInviteSent={fetchMembers}
            />
          )}
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {members.map((member, index) => {
            const roleConfig = ROLE_CONFIG[member.role]
            const RoleIcon = roleConfig.icon
            const isCurrentUser = member.user.id === user?.id

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all",
                  isDark
                    ? "bg-neutral-900/50 border-neutral-800 hover:border-neutral-700"
                    : "bg-white/70 border-slate-200 hover:border-slate-300"
                )}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={member.user.image || undefined} />
                    <AvatarFallback className="text-sm font-semibold">
                      {member.user.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        "font-semibold truncate",
                        isDark ? "text-white" : "text-slate-900"
                      )}>
                        {member.user.name || 'Unknown User'}
                      </p>
                      {isCurrentUser && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className={cn(
                      "text-sm truncate",
                      isDark ? "text-neutral-400" : "text-slate-500"
                    )}>
                      {member.user.email}
                    </p>
                    <p className={cn(
                      "text-xs mt-1",
                      isDark ? "text-neutral-500" : "text-slate-400"
                    )}>
                      Joined {formatDistanceToNow(new Date(member.joinedAt), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Role Badge */}
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg",
                    roleConfig.bg
                  )}>
                    <RoleIcon className={cn("h-4 w-4", roleConfig.color)} />
                    <span className={cn("text-sm font-medium", roleConfig.color)}>
                      {roleConfig.label}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                {canManageMembers && !isCurrentUser && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-8 w-8 ml-2", isDark && "hover:bg-neutral-800")}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className={isDark ? "bg-neutral-900 border-neutral-800" : ""}>
                      <div className="px-2 py-1.5">
                        <p className={cn("text-xs font-medium", isDark ? "text-neutral-400" : "text-slate-500")}>
                          Change Role
                        </p>
                      </div>
                      {Object.entries(ROLE_CONFIG).map(([role, config]) => (
                        <DropdownMenuItem
                          key={role}
                          onClick={() => handleChangeRole(member.id, role)}
                          disabled={member.role === role}
                        >
                          <config.icon className={cn("h-4 w-4 mr-2", config.color)} />
                          {config.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => handleRemoveMember(member.id, member.user.name || 'this member')}
                      >
                        Remove from project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {isCurrentUser && member.role !== 'OWNER' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    onClick={() => handleRemoveMember(member.id, 'yourself')}
                  >
                    Leave Project
                  </Button>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Empty State */}
        {members.length === 0 && (
          <div className={cn(
            "flex flex-col items-center justify-center rounded-2xl py-20 px-8",
            isDark ? "bg-neutral-900/50" : "bg-white/50"
          )}>
            <div className={cn(
              "flex h-20 w-20 items-center justify-center rounded-2xl mb-6",
              isDark ? "bg-neutral-800" : "bg-slate-100"
            )}>
              <Shield className={cn("h-10 w-10", isDark ? "text-neutral-600" : "text-slate-400")} />
            </div>
            <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-white" : "text-slate-900")}>
              No members yet
            </h3>
            <p className={cn("text-center max-w-md mb-6", isDark ? "text-neutral-400" : "text-slate-500")}>
              Invite team members to collaborate on this project
            </p>
            {canManageMembers && (
              <InviteDialog
                type="project"
                targetId={projectId}
                targetName={projectName}
                onInviteSent={fetchMembers}
              />
            )}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
