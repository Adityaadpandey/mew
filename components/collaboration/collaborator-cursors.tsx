'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Cursor {
  userId: string
  name: string
  avatar?: string
  color: string
  x: number
  y: number
}

interface CollaboratorCursorsProps {
  cursors: Cursor[]
  zoom: number
  pan: { x: number; y: number }
}

const cursorColors = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#E85002', // orange (brand)
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
]

export function CollaboratorCursors({ cursors, zoom, pan }: CollaboratorCursorsProps) {
  return (
    <>
      {cursors.map((cursor) => (
        <div
          key={cursor.userId}
          className="pointer-events-none absolute z-50 transition-all duration-75"
          style={{
            left: cursor.x * zoom + pan.x,
            top: cursor.y * zoom + pan.y,
          }}
        >
          {/* Cursor SVG */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="drop-shadow-md"
          >
            <path
              d="M5.65376 12.4563L5.65376 12.4563L5.65314 12.4525C5.64132 12.3804 5.64132 12.3069 5.65314 12.2348L5.65376 12.231L5.65376 12.231L8.97939 3.65376L8.97939 3.65376L8.98315 3.64439C9.01903 3.55574 9.07862 3.47893 9.15536 3.42218C9.2321 3.36543 9.32296 3.33095 9.41808 3.32236C9.5132 3.31377 9.60879 3.33141 9.69436 3.37337C9.77993 3.41533 9.85213 3.47997 9.90314 3.56001L9.90314 3.56001L9.90752 3.56689L15.6538 12.2231L15.6538 12.2231L15.6575 12.2287C15.7054 12.3004 15.7308 12.3844 15.7308 12.4702C15.7308 12.556 15.7054 12.64 15.6575 12.7117L15.6538 12.7173L15.6538 12.7173L9.90752 21.3735L9.90314 21.3804L9.90314 21.3804C9.85213 21.4604 9.77993 21.5251 9.69436 21.567C9.60879 21.609 9.5132 21.6266 9.41808 21.618C9.32296 21.6095 9.2321 21.575 9.15536 21.5182C9.07862 21.4615 9.01903 21.3847 8.98315 21.296L8.97939 21.2866L5.65376 12.7094L5.65376 12.7094L5.65314 12.7056C5.64132 12.6335 5.64132 12.56 5.65314 12.4879L5.65376 12.4841L5.65376 12.4563Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1.5"
            />
          </svg>

          {/* Name label */}
          <div
            className="absolute left-4 top-4 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium text-white shadow-md"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </>
  )
}

// Hook to generate consistent colors for users
export function useCollaboratorColor(userId: string): string {
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc)
  }, 0)
  return cursorColors[Math.abs(hash) % cursorColors.length]
}
