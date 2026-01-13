'use client'

import { useCanvasStore } from '@/lib/store'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { useCallback, useEffect, useRef, useState } from 'react'

interface MiniMapProps {
  width?: number
  height?: number
}

export function MiniMap({ width = 150, height = 100 }: MiniMapProps) {
  const { objects, zoom, pan, setPan } = useCanvasStore()
  const { resolvedTheme } = useTheme()
  const darkMode = resolvedTheme === 'dark'
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 })
  const initialized = useRef(false)

  const isDraggingRef = useRef(false)
  const svgRef = useRef<SVGSVGElement>(null)

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

  // Calculate bounds with some padding
  const getBounds = useCallback(() => {
    return objects.reduce(
      (acc, obj) => ({
        minX: Math.min(acc.minX, obj.x),
        minY: Math.min(acc.minY, obj.y),
        maxX: Math.max(acc.maxX, obj.x + obj.width),
        maxY: Math.max(acc.maxY, obj.y + obj.height),
      }),
      { minX: 0, minY: 0, maxX: 1000, maxY: 800 }
    )
  }, [objects])

  const bounds = getBounds()
  // Add padding to the "world"
  const padding = 2000 // Large padding to allow scrolling far away
  const worldMinX = bounds.minX - padding
  const worldMinY = bounds.minY - padding
  const worldMaxX = bounds.maxX + padding
  const worldMaxY = bounds.maxY + padding

  const worldWidth = worldMaxX - worldMinX
  const worldHeight = worldMaxY - worldMinY

  // Scale to fit the world into the minimap
  const scale = Math.min(width / worldWidth, height / worldHeight)

  // Map a world coordinate to minimap coordinate
  const toMiniMap = (x: number, y: number) => ({
    x: (x - worldMinX) * scale,
    y: (y - worldMinY) * scale
  })

  // Map a minimap coordinate to world coordinate
  const toWorld = (mx: number, my: number) => ({
    x: mx / scale + worldMinX,
    y: my / scale + worldMinY
  })

  // Viewport rectangle calculation
  // Pan.x/y is the offset of the canvas.
  // Viewport top-left in world coords is: -pan.x / zoom, -pan.y / zoom
  const viewportWorldX = -pan.x / zoom
  const viewportWorldY = -pan.y / zoom
  const viewportWorldW = windowSize.width / zoom
  const viewportWorldH = windowSize.height / zoom

  const viewportRect = {
    ...toMiniMap(viewportWorldX, viewportWorldY),
    w: viewportWorldW * scale,
    h: viewportWorldH * scale
  }

  const handleInteraction = (e: React.MouseEvent) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    // Center the viewport on the clicked/dragged point
    const worldPos = toWorld(mx, my)

    // We want the clicked point to be the center of the viewport
    const newPanX = -(worldPos.x * zoom - windowSize.width / 2)
    const newPanY = -(worldPos.y * zoom - windowSize.height / 2)

    setPan({ x: newPanX, y: newPanY })
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true
    handleInteraction(e)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      handleInteraction(e)
    }
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border-2 shadow-2xl transition-all duration-200",
        darkMode ? "bg-neutral-900 border-neutral-700" : "bg-white border-slate-300",
        "backdrop-blur-md"
      )}
      style={{ width, height }}
      onMouseLeave={handleMouseUp}
      onMouseUp={handleMouseUp}
    >
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="cursor-crosshair active:cursor-grabbing block"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
      >
        {/* Background Grid/Context hint (Optional) */}

        {/* Objects */}
        {objects.map((obj) => {
          const pos = toMiniMap(obj.x, obj.y)
          const w = obj.width * scale
          const h = obj.height * scale

          return (
            <rect
              key={obj.id}
              x={pos.x}
              y={pos.y}
              width={Math.max(w, 2)}
              height={Math.max(h, 2)}
              fill={darkMode ? '#a3a3a3' : '#64748b'} // High contrast colors
              opacity={0.8} // Higher opacity
              rx={1}
            />
          )
        })}

        {/* Viewport indicator */}
        <rect
          x={viewportRect.x}
          y={viewportRect.y}
          width={viewportRect.w}
          height={viewportRect.h}
          fill="rgba(59, 130, 246, 0.1)"
          stroke="#3B82F6"
          strokeWidth={2}
          rx={2}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  )
}
