'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface TeamMember {
  id: string
  name: string | null
  email: string
  image: string | null
}

interface MentionSelectorProps {
  workspaceId?: string
  projectId?: string
  onSelect: (member: TeamMember) => void
  trigger: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function MentionSelector({
  workspaceId,
  projectId,
  onSelect,
  trigger,
  open,
  onOpenChange,
}: MentionSelectorProps) {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  useEffect(() => {
    fetchMembers()
  }, [workspaceId, projectId])

  const fetchMembers = async () => {
    try {
      let url = '/api/members'
      if (projectId) {
        url = `/api/projects/${projectId}/members`
      } else if (workspaceId) {
        url = `/api/workspaces/${workspaceId}/members`
      }

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setMembers(data.members || data || [])
      }
    } catch (error) {
      console.error('Failed to fetch members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase()
    return (
      member.name?.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query)
    )
  })

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        className={cn('w-64 p-0', isDark ? 'bg-zinc-900 border-zinc-800' : '')}
        align="start"
      >
        <Command className={isDark ? 'bg-zinc-900' : ''}>
          <CommandInput
            placeholder="Search team members..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            className={isDark ? 'border-zinc-800' : ''}
          />
          <CommandList>
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : (
              <>
                <CommandEmpty>No members found.</CommandEmpty>
                <CommandGroup>
                  {filteredMembers.map((member) => (
                    <CommandItem
                      key={member.id}
                      value={member.name || member.email}
                      onSelect={() => {
                        onSelect(member)
                        onOpenChange?.(false)
                        setSearchQuery('')
                      }}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={member.image || undefined} />
                        <AvatarFallback
                          className={cn(
                            'text-xs',
                            isDark ? 'bg-zinc-700' : 'bg-slate-200'
                          )}
                        >
                          {member.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-medium truncate',
                            isDark ? 'text-white' : 'text-slate-900'
                          )}
                        >
                          {member.name || 'Anonymous'}
                        </p>
                        <p
                          className={cn(
                            'text-xs truncate',
                            isDark ? 'text-zinc-500' : 'text-slate-500'
                          )}
                        >
                          {member.email}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// Hook for detecting @mention triggers in input
export function useMentionTrigger(value: string, cursorPosition: number) {
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionStart, setMentionStart] = useState<number>(-1)

  useEffect(() => {
    // Find @ symbol before cursor
    const textBeforeCursor = value.slice(0, cursorPosition)
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')

    if (lastAtIndex === -1) {
      setMentionQuery(null)
      setMentionStart(-1)
      return
    }

    // Check if @ is at start or preceded by whitespace
    const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' '
    if (!/\s/.test(charBeforeAt) && lastAtIndex !== 0) {
      setMentionQuery(null)
      setMentionStart(-1)
      return
    }

    // Check if there's a space after the @ (mention ended)
    const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1)
    if (textAfterAt.includes(' ')) {
      setMentionQuery(null)
      setMentionStart(-1)
      return
    }

    setMentionQuery(textAfterAt)
    setMentionStart(lastAtIndex)
  }, [value, cursorPosition])

  return { mentionQuery, mentionStart, isActive: mentionQuery !== null }
}

// Function to insert mention at position
export function insertMention(
  text: string,
  mentionStart: number,
  cursorPosition: number,
  memberName: string
): { newText: string; newCursorPosition: number } {
  const beforeMention = text.slice(0, mentionStart)
  const afterCursor = text.slice(cursorPosition)
  const mention = `@${memberName} `
  const newText = beforeMention + mention + afterCursor

  return {
    newText,
    newCursorPosition: mentionStart + mention.length,
  }
}
