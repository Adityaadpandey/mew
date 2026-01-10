'use client'

import { useCanvasStore } from '@/lib/store'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'

interface MiniMapProps {
  width?: number
  height?: number
}

export function MiniMap({ width = 150, height = 100 }: MiniMapProps) {
  const { objects, zoom, pan } = useCanvasStore()
  const { resolvedTheme } = useTheme()
  const darkMode = resolvedTheme === 'dark'
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 })
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Calculate bounds of all objects
  const bounds = objects.reduce(
    (acc, obj) => ({
      minX: Math.min(acc.minX, obj.x),
      minY: Math.min(acc.minY, obj.y),
      maxX: Math.max(acc.maxX, obj.x + obj.width),
      maxY: Math.max(acc.maxY, obj.y + obj.height),
    }),
    { minX: 0, minY: 0, maxX: 1000, maxY: 800 }
  )

  const canvasWidth = bounds.maxX - bounds.minX + 200
  const canvasHeight = bounds.maxY - bounds.minY + 200

  const scale = Math.min(width / canvasWidth, height / canvasHeight)

  // Viewport rectangle
  const viewportWidth = (windowSize.width / zoom) * scale
  const viewportHeight = (windowSize.height / zoom) * scale
  const viewportX = (-pan.x / zoom - bounds.minX + 100) * scale
  const viewportY = (-pan.y / zoom - bounds.minY + 100) * scale

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border shadow-lg",
        darkMode ? "bg-neutral-950 border-neutral-800" : "bg-white border-slate-200"
      )}
      style={{ width, height }}
    >
      <svg width={width} height={height} className={darkMode ? "bg-neutral-900" : "bg-gray-50"}>
        {/* Objects */}
        {objects.map((obj) => {
          const x = (obj.x - bounds.minX + 100) * scale
          const y = (obj.y - bounds.minY + 100) * scale
          const w = obj.width * scale
          const h = obj.height * scale

          return (
            <rect
              key={obj.id}
              x={x}
              y={y}
              width={Math.max(w, 2)}
              height={Math.max(h, 2)}
              fill={darkMode ? '#525252' : obj.fill}
              stroke={darkMode ? '#737373' : obj.stroke}
              strokeWidth={0.5}
              rx={obj.type === 'circle' ? Math.max(w, h) / 2 : 1}
            />
          )
        })}

        {/* Viewport indicator */}
        <rect
          x={viewportX}
          y={viewportY}
          width={viewportWidth}
          height={viewportHeight}
          fill="rgba(59, 130, 246, 0.15)"
          stroke="#3B82F6"
          strokeWidth={1.5}
          rx={2}
        />
      </svg>
    </div>
  )
}
