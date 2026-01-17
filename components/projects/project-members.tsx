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
import {
  Crown,
  MoreHorizontal,
  Shield,
  Eye,
  MessageSquare,
  Loader2,
  Users
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
  },
  ADMIN: {
    label: 'Admin',
    icon: Shield,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  MEMBER: {
    label: 'Member',
    icon: MessageSquare,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  VIEWER: {
    label: 'Viewer',
    icon: Eye,
    color: 'text-zinc-500',
    bg: 'bg-zinc-500/10',
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
        setMembers(data.members || [])
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
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>
              Team Members
            </h2>
            <p className={cn("text-sm", isDark ? "text-zinc-500" : "text-gray-500")}>
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
        {members.length === 0 ? (
          <div className={cn(
            "text-center py-16 rounded-xl border-2 border-dashed",
            isDark ? "border-zinc-800" : "border-gray-200"
          )}>
            <Users className={cn("h-10 w-10 mx-auto mb-3", isDark ? "text-zinc-700" : "text-gray-300")} />
            <h3 className={cn("text-base font-medium mb-1", isDark ? "text-white" : "text-gray-900")}>
              No members yet
            </h3>
            <p className={cn("text-sm mb-5", isDark ? "text-zinc-500" : "text-gray-500")}>
              Invite team members to collaborate
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
        ) : (
          <div className="space-y-2">
            {members.map((member) => {
              const roleConfig = ROLE_CONFIG[member.role]
              const RoleIcon = roleConfig.icon
              const isCurrentUser = member.user.id === user?.id

              return (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-colors",
                    isDark
                      ? "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage src={member.user.image || undefined} />
                      <AvatarFallback className={cn("text-sm", isDark ? "bg-zinc-800" : "bg-gray-100")}>
                        {member.user.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(
                          "font-medium truncate text-sm",
                          isDark ? "text-white" : "text-gray-900"
                        )}>
                          {member.user.name || 'Unknown User'}
                        </p>
                        {isCurrentUser && (
                          <Badge variant="secondary" className={cn("text-[10px] h-4 px-1.5", isDark ? "bg-zinc-800" : "")}>
                            You
                          </Badge>
                        )}
                      </div>
                      <p className={cn(
                        "text-xs truncate",
                        isDark ? "text-zinc-500" : "text-gray-500"
                      )}>
                        {member.user.email}
                      </p>
                    </div>

                    {/* Role Badge */}
                    <div className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-md shrink-0",
                      roleConfig.bg
                    )}>
                      <RoleIcon className={cn("h-3.5 w-3.5", roleConfig.color)} />
                      <span className={cn("text-xs font-medium", roleConfig.color)}>
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
                          className={cn("h-8 w-8 ml-2 shrink-0", isDark && "hover:bg-zinc-800")}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className={isDark ? "bg-zinc-900 border-zinc-800" : ""}>
                        <div className="px-2 py-1.5">
                          <p className={cn("text-xs font-medium", isDark ? "text-zinc-400" : "text-gray-500")}>
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
                        <DropdownMenuSeparator className={isDark ? "bg-zinc-800" : ""} />
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
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10 ml-2 shrink-0 h-8"
                      onClick={() => handleRemoveMember(member.id, 'yourself')}
                    >
                      Leave
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </ScrollArea>
  )
}
