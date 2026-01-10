'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface Collaborator {
  id: string
  name: string
  avatar?: string
  color: string
  isActive: boolean
}

interface PresenceAvatarsProps {
  collaborators: Collaborator[]
  maxVisible?: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
  lg: 'h-10 w-10 text-base',
}

export function PresenceAvatars({
  collaborators,
  maxVisible = 3,
  size = 'md',
}: PresenceAvatarsProps) {
  const visible = collaborators.slice(0, maxVisible)
  const remaining = collaborators.length - maxVisible

  return (
    <TooltipProvider>
      <div className="flex -space-x-2">
        {visible.map((collaborator) => (
          <Tooltip key={collaborator.id}>
            <TooltipTrigger>
              <div className="relative">
                <Avatar
                  className={cn(
                    sizeClasses[size],
                    'border-2 border-white ring-2 transition-transform hover:z-10 hover:scale-110',
                    collaborator.isActive ? 'ring-green-400' : 'ring-transparent'
                  )}
                  style={{ borderColor: collaborator.color }}
                >
                  <AvatarImage src={collaborator.avatar} />
                  <AvatarFallback
                    style={{ backgroundColor: collaborator.color }}
                    className="text-white"
                  >
                    {collaborator.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {collaborator.isActive && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-400" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{collaborator.name}</p>
              <p className="text-xs text-muted-foreground">
                {collaborator.isActive ? 'Active now' : 'Away'}
              </p>
            </TooltipContent>
          </Tooltip>
        ))}

        {remaining > 0 && (
          <Tooltip>
            <TooltipTrigger>
              <div
                className={cn(
                  sizeClasses[size],
                  'flex items-center justify-center rounded-full border-2 border-white bg-muted font-medium'
                )}
              >
                +{remaining}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{remaining} more collaborators</p>
              <ul className="mt-1 text-xs text-muted-foreground">
                {collaborators.slice(maxVisible).map((c) => (
                  <li key={c.id}>{c.name}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  )
}
