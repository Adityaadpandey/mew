'use client'

import { useCanvasStore, type CanvasObject, type Connection } from '@/lib/store'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { nanoid } from 'nanoid'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CanvasNode } from './canvas-node'

interface Point { x: number; y: number }
type Port = 'n' | 'e' | 's' | 'w'

export function DiagramCanvas() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const dragDataRef = useRef<{ startX: number; startY: number; objects: { id: string; x: number; y: number }[] } | null>(null)

  const [connectionDragHandle, setConnectionDragHandle] = useState<{ id: string; handle: 'from' | 'to'; targetObj?: string } | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<{ objectId: string; port: Port } | null>(null)
  const [connectionPreview, setConnectionPreview] = useState<Point | null>(null)
  const [hoveredPort, setHoveredPort] = useState<{ objectId: string; port: Port } | null>(null)

  const { resolvedTheme } = useTheme()
  const darkMode = resolvedTheme === 'dark'

  const {
    zoom, pan, setPan, selectedIds, setSelectedIds, objects, connections,
    addObject, addConnection, updateObject, updateConnection, deleteObjects, deleteConnection,
    tool, setTool, gridEnabled, gridSize, snapToGrid,
  } = useCanvasStore()

  const [isDragging, setIsDragging] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawStart, setDrawStart] = useState<Point | null>(null)
  const [tempObject, setTempObject] = useState<CanvasObject | null>(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Point | null>(null)
  const [selectionBox, setSelectionBox] = useState<{ start: Point; end: Point } | null>(null)
  const [hoveredObject, setHoveredObject] = useState<string | null>(null)

  const snapValue = useCallback((value: number) => {
    if (!snapToGrid) return value
    return Math.round(value / gridSize) * gridSize
  }, [snapToGrid, gridSize])

  const getCanvasPoint = useCallback((e: MouseEvent | React.MouseEvent): Point => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    }
  }, [pan, zoom])

  const getPortPoint = useCallback((obj: CanvasObject, port: Port): Point => {
    const cx = obj.x + obj.width / 2
    const cy = obj.y + obj.height / 2
    switch (port) {
      case 'n': return { x: cx, y: obj.y }
      case 'e': return { x: obj.x + obj.width, y: cy }
      case 's': return { x: cx, y: obj.y + obj.height }
      case 'w': return { x: obj.x, y: cy }
    }
  }, [])

  const getClosestPort = useCallback((point: Point, obj: CanvasObject): Port => {
    const ports: Port[] = ['n', 'e', 's', 'w']
    let min = Infinity, best: Port = 'n'
    ports.forEach(p => {
      const pp = getPortPoint(obj, p)
      const dist = (pp.x - point.x) ** 2 + (pp.y - point.y) ** 2
      if (dist < min) { min = dist; best = p }
    })
    return best
  }, [getPortPoint])

  const findObjectAtPoint = useCallback((point: Point): CanvasObject | undefined => {
    return [...objects].reverse().find(obj =>
      point.x >= obj.x && point.x <= obj.x + obj.width &&
      point.y >= obj.y && point.y <= obj.y + obj.height
    )
  }, [objects])

  const getConnectionPoints = useCallback((conn: Connection) => {
    const fromObj = objects.find(o => o.id === conn.from)
    const toObj = objects.find(o => o.id === conn.to)
    if (!fromObj || !toObj) return null

    let fromPort: Port = conn.fromPort || 's'
    let toPort: Port = conn.toPort || 'n'

    if (!conn.fromPort || !conn.toPort) {
      let minDist = Infinity
      const ports: Port[] = ['n', 'e', 's', 'w']
      ports.forEach(p1 => {
        if (conn.fromPort && p1 !== conn.fromPort) return
        const pt1 = getPortPoint(fromObj, p1)
        ports.forEach(p2 => {
          if (conn.toPort && p2 !== conn.toPort) return
          const pt2 = getPortPoint(toObj, p2)
          const dist = (pt2.x - pt1.x) ** 2 + (pt1.y - pt2.y) ** 2
          if (dist < minDist) { minDist = dist; fromPort = p1; toPort = p2 }
        })
      })
    }
    return { from: getPortPoint(fromObj, fromPort), to: getPortPoint(toObj, toPort), fromPort, toPort }
  }, [objects, getPortPoint])

  // Handle drop from shape library
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const shapeType = e.dataTransfer.getData('shape')
    if (!shapeType) return

    const point = getCanvasPoint(e as unknown as MouseEvent)
    const newObject: CanvasObject = {
      id: nanoid(),
      type: shapeType === 'diamond' ? 'diamond' : shapeType === 'circle' ? 'circle' : 'rectangle',
      x: snapValue(point.x - 80),
      y: snapValue(point.y - 35),
      width: 160,
      height: 70,
      fill: '#FFFFFF',
      stroke: '#E2E8F0',
      strokeWidth: 1,
      rotation: 0,
      opacity: 1,
      zIndex: objects.length,
      text: shapeType.charAt(0).toUpperCase() + shapeType.slice(1).replace(/-/g, ' '),
    }
    addObject(newObject)
    setSelectedIds([newObject.id])
    setTool('select')
  }, [getCanvasPoint, snapValue, objects.length, addObject, setSelectedIds, setTool])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  // Optimized mouse move with RAF for smooth dragging
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    
    rafRef.current = requestAnimationFrame(() => {
      const point = getCanvasPoint(e)

      if (isPanning && panStart) {
        setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
        return
      }

      if (isConnecting && connectionStart) {
        setConnectionPreview(point)
        const targetObj = findObjectAtPoint(point)
        setHoveredObject(targetObj?.id || null)
        // Find closest port on hovered object
        if (targetObj && targetObj.id !== connectionStart.objectId) {
          const closestPort = getClosestPort(point, targetObj)
          setHoveredPort({ objectId: targetObj.id, port: closestPort })
        } else {
          setHoveredPort(null)
        }
        return
      }

      if (connectionDragHandle) {
        setConnectionPreview(point)
        const conn = connections.find(c => c.id === connectionDragHandle.id)
        if (conn) {
          // Find target object under cursor for reconnection
          const targetObj = findObjectAtPoint(point)
          const sourceId = connectionDragHandle.handle === 'from' ? conn.to : conn.from
          if (targetObj && targetObj.id !== sourceId) {
            setHoveredObject(targetObj.id)
            setHoveredPort({ objectId: targetObj.id, port: getClosestPort(point, targetObj) })
          } else {
            setHoveredObject(null)
            setHoveredPort(null)
          }
        }
        return
      }

      if (selectionBox) {
        setSelectionBox({ ...selectionBox, end: point })
        return
      }

      // Super smooth dragging using initial positions
      if (isDragging && dragDataRef.current) {
        const dx = point.x - dragDataRef.current.startX
        const dy = point.y - dragDataRef.current.startY
        
        dragDataRef.current.objects.forEach(({ id, x, y }) => {
          updateObject(id, { 
            x: snapValue(x + dx), 
            y: snapValue(y + dy) 
          })
        })
        return
      }

      if (isDrawing && drawStart && tempObject) {
        const width = point.x - drawStart.x
        const height = point.y - drawStart.y
        setTempObject({
          ...tempObject,
          x: width < 0 ? snapValue(point.x) : tempObject.x,
          y: height < 0 ? snapValue(point.y) : tempObject.y,
          width: Math.abs(snapValue(width)),
          height: Math.abs(snapValue(height)),
        })
      }
    })
  }, [isPanning, panStart, isConnecting, connectionStart, connectionDragHandle, selectionBox, isDragging, isDrawing, drawStart, tempObject, getCanvasPoint, setPan, findObjectAtPoint, connections, objects, getClosestPort, updateConnection, updateObject, snapValue])

  // Global mouse up handler
  const handleGlobalMouseUp = useCallback((e: MouseEvent) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const point = getCanvasPoint(e)

    if (isPanning) { setIsPanning(false); setPanStart(null) }
    
    // Handle connection endpoint dragging (reconnection)
    if (connectionDragHandle) {
      const conn = connections.find(c => c.id === connectionDragHandle.id)
      if (conn) {
        const targetObj = findObjectAtPoint(point)
        const sourceId = connectionDragHandle.handle === 'from' ? conn.to : conn.from
        
        if (targetObj && targetObj.id !== sourceId) {
          // Reconnect to new target
          const newPort = getClosestPort(point, targetObj)
          if (connectionDragHandle.handle === 'from') {
            updateConnection(conn.id, { from: targetObj.id, fromPort: newPort })
          } else {
            updateConnection(conn.id, { to: targetObj.id, toPort: newPort })
          }
        }
      }
      setConnectionDragHandle(null)
      setConnectionPreview(null)
      setHoveredObject(null)
      setHoveredPort(null)
      return
    }

    if (isConnecting && connectionStart) {
      const targetObj = findObjectAtPoint(point)
      if (targetObj && targetObj.id !== connectionStart.objectId) {
        addConnection({
          id: nanoid(),
          from: connectionStart.objectId,
          to: targetObj.id,
          fromPort: connectionStart.port,
          toPort: getClosestPort(point, targetObj),
          type: 'arrow',
          stroke: '#94A3B8',
          strokeWidth: 1.5,
        })
      }
      setIsConnecting(false)
      setConnectionStart(null)
      setConnectionPreview(null)
      setHoveredObject(null)
      setHoveredPort(null)
    }

    if (selectionBox) {
      const minX = Math.min(selectionBox.start.x, selectionBox.end.x)
      const maxX = Math.max(selectionBox.start.x, selectionBox.end.x)
      const minY = Math.min(selectionBox.start.y, selectionBox.end.y)
      const maxY = Math.max(selectionBox.start.y, selectionBox.end.y)
      const selected = objects.filter(obj =>
        obj.x >= minX && obj.x + obj.width <= maxX &&
        obj.y >= minY && obj.y + obj.height <= maxY
      ).map(o => o.id)
      setSelectedIds(selected)
      setSelectionBox(null)
    }

    if (isDragging) { 
      setIsDragging(false)
      dragDataRef.current = null
    }

    if (isDrawing && tempObject) {
      if (tempObject.width > 20 && tempObject.height > 20) {
        addObject(tempObject)
        setSelectedIds([tempObject.id])
      }
      setIsDrawing(false)
      setDrawStart(null)
      setTempObject(null)
      setTool('select')
    }
  }, [isPanning, connectionDragHandle, isConnecting, connectionStart, selectionBox, isDragging, isDrawing, tempObject, getCanvasPoint, findObjectAtPoint, getClosestPort, addConnection, objects, setSelectedIds, addObject, setTool, connections, updateConnection])

  useEffect(() => {
    if (isDragging || isPanning || isDrawing || connectionDragHandle || isConnecting || selectionBox) {
      window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true })
      window.addEventListener('mouseup', handleGlobalMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleGlobalMouseMove)
        window.removeEventListener('mouseup', handleGlobalMouseUp)
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isDragging, isPanning, isDrawing, connectionDragHandle, isConnecting, selectionBox, handleGlobalMouseMove, handleGlobalMouseUp])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

      const key = e.key.toLowerCase()

      // Delete selected objects
      if (key === 'delete' || key === 'backspace') {
        if (selectedIds.length > 0) {
          e.preventDefault()
          deleteObjects(selectedIds)
        }
        return
      }

      // Escape - deselect and reset tool
      if (key === 'escape') {
        setSelectedIds([])
        setTool('select')
        setIsConnecting(false)
        setConnectionStart(null)
        return
      }

      // Tool shortcuts (single keys)
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        switch (key) {
          case 'v': case '1': e.preventDefault(); setTool('select'); break
          case 'h': case '2': e.preventDefault(); setTool('hand'); break
          case 'r': case '3': e.preventDefault(); setTool('rectangle'); break
          case 'o': case '4': e.preventDefault(); setTool('circle'); break
          case 'd': case '5': e.preventDefault(); setTool('diamond'); break
          case 'c': case '6': e.preventDefault(); setTool('connector'); break
          case 'a': case '7': e.preventDefault(); setTool('arrow'); break
          case 't': case '8': e.preventDefault(); setTool('text'); break
          case 'n': case '9': e.preventDefault(); setTool('sticky'); break
          case 'g': e.preventDefault(); useCanvasStore.getState().toggleGrid(); break
          case 's': e.preventDefault(); useCanvasStore.getState().toggleSnapToGrid(); break
        }
      }

      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && key === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          useCanvasStore.temporal.getState().redo()
        } else {
          useCanvasStore.temporal.getState().undo()
        }
        return
      }

      // Select all
      if ((e.metaKey || e.ctrlKey) && key === 'a') {
        e.preventDefault()
        setSelectedIds(objects.map(o => o.id))
        return
      }

      // Duplicate
      if ((e.metaKey || e.ctrlKey) && key === 'd') {
        e.preventDefault()
        if (selectedIds.length > 0) {
          const newIds: string[] = []
          selectedIds.forEach(id => {
            const obj = objects.find(o => o.id === id)
            if (obj) {
              const newId = nanoid()
              addObject({ ...obj, id: newId, x: obj.x + 20, y: obj.y + 20 })
              newIds.push(newId)
            }
          })
          setSelectedIds(newIds)
        }
        return
      }

      // Zoom shortcuts
      if ((e.metaKey || e.ctrlKey) && (key === '=' || key === '+')) {
        e.preventDefault()
        useCanvasStore.getState().setZoom(Math.min(4, useCanvasStore.getState().zoom + 0.25))
        return
      }
      if ((e.metaKey || e.ctrlKey) && key === '-') {
        e.preventDefault()
        useCanvasStore.getState().setZoom(Math.max(0.25, useCanvasStore.getState().zoom - 0.25))
        return
      }
      if ((e.metaKey || e.ctrlKey) && key === '0') {
        e.preventDefault()
        useCanvasStore.getState().setZoom(1)
        useCanvasStore.getState().setPan({ x: 0, y: 0 })
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIds, objects, deleteObjects, setSelectedIds, setTool, addObject])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && tool === 'hand')) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
      return
    }

    const point = getCanvasPoint(e)

    if (tool === 'select') {
      const clickedObject = findObjectAtPoint(point)
      if (clickedObject) {
        const newSelection = e.shiftKey
          ? (selectedIds.includes(clickedObject.id)
            ? selectedIds.filter(id => id !== clickedObject.id)
            : [...selectedIds, clickedObject.id])
          : (selectedIds.includes(clickedObject.id) ? selectedIds : [clickedObject.id])
        
        setSelectedIds(newSelection)
        setIsDragging(true)
        
        // Store initial positions for smooth dragging
        const objectsToMove = newSelection.length > 0 ? newSelection : [clickedObject.id]
        dragDataRef.current = {
          startX: point.x,
          startY: point.y,
          objects: objectsToMove.map(id => {
            const obj = objects.find(o => o.id === id)
            return { id, x: obj?.x || 0, y: obj?.y || 0 }
          })
        }
      } else {
        setSelectedIds([])
        setSelectionBox({ start: point, end: point })
      }
      return
    }

    if (tool === 'connector' || tool === 'arrow') {
      const clickedObject = findObjectAtPoint(point)
      if (clickedObject) {
        setIsConnecting(true)
        setConnectionStart({ objectId: clickedObject.id, port: getClosestPort(point, clickedObject) })
        setConnectionPreview(point)
      }
      return
    }

    if (['rectangle', 'circle', 'diamond', 'text', 'sticky'].includes(tool)) {
      setIsDrawing(true)
      setDrawStart(point)
      setTempObject({
        id: nanoid(),
        type: tool as CanvasObject['type'],
        x: snapValue(point.x),
        y: snapValue(point.y),
        width: 0,
        height: 0,
        fill: tool === 'sticky' ? '#FEF3C7' : '#FFFFFF',
        stroke: '#E2E8F0',
        strokeWidth: 1,
        rotation: 0,
        opacity: 1,
        zIndex: objects.length,
        ...(tool === 'text' && { text: 'Text', fontSize: 14 }),
        ...(tool === 'sticky' && { text: 'Note', fontSize: 13 }),
      })
    }
  }, [tool, pan, getCanvasPoint, findObjectAtPoint, selectedIds, setSelectedIds, getClosestPort, snapValue, objects])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const point = getCanvasPoint(e)
    const clickedObject = findObjectAtPoint(point)
    if (clickedObject && ['rectangle', 'text', 'sticky', 'circle', 'diamond', 'arrow'].includes(clickedObject.type)) {
      const newText = prompt('Enter text:', clickedObject.text || '')
      if (newText !== null) updateObject(clickedObject.id, { text: newText })
    }
  }, [getCanvasPoint, findObjectAtPoint, updateObject])

  const handlePortMouseDown = useCallback((objectId: string, port: Port, e: React.MouseEvent) => {
    e.stopPropagation()
    setIsConnecting(true)
    setConnectionStart({ objectId, port })
    const obj = objects.find(o => o.id === objectId)
    if (obj) setConnectionPreview(getPortPoint(obj, port))
  }, [objects, getPortPoint])

  const renderConnection = (conn: Connection) => {
    const points = getConnectionPoints(conn)
    if (!points) return null
    const { from, to, fromPort, toPort } = points
    const isSelected = selectedIds.includes(conn.id)
    const isBeingDragged = connectionDragHandle?.id === conn.id
    const stroke = isSelected ? '#3B82F6' : (conn.stroke || (darkMode ? '#737373' : '#94A3B8'))

    const getDirVector = (p: Port) => {
      switch (p) {
        case 'n': return { x: 0, y: -1 }
        case 'e': return { x: 1, y: 0 }
        case 's': return { x: 0, y: 1 }
        case 'w': return { x: -1, y: 0 }
      }
    }

    const dir1 = getDirVector(fromPort)
    const dir2 = getDirVector(toPort)
    const dist = Math.sqrt((to.x - from.x) ** 2 + (to.y - from.y) ** 2)
    const curvature = Math.min(dist * 0.4, 100)
    const cp1 = { x: from.x + dir1.x * curvature, y: from.y + dir1.y * curvature }
    const cp2 = { x: to.x + dir2.x * curvature, y: to.y + dir2.y * curvature }
    const pathData = `M ${from.x} ${from.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`

    const arrowAngle = Math.atan2(to.y - cp2.y, to.x - cp2.x)
    const arrowLen = 10
    const arrowPt1 = { x: to.x - arrowLen * Math.cos(arrowAngle - Math.PI / 6), y: to.y - arrowLen * Math.sin(arrowAngle - Math.PI / 6) }
    const arrowPt2 = { x: to.x - arrowLen * Math.cos(arrowAngle + Math.PI / 6), y: to.y - arrowLen * Math.sin(arrowAngle + Math.PI / 6) }

    // Calculate midpoint for label
    const midT = 0.5
    const midX = (1-midT)**3 * from.x + 3*(1-midT)**2*midT * cp1.x + 3*(1-midT)*midT**2 * cp2.x + midT**3 * to.x
    const midY = (1-midT)**3 * from.y + 3*(1-midT)**2*midT * cp1.y + 3*(1-midT)*midT**2 * cp2.y + midT**3 * to.y

    return (
      <g key={conn.id} style={{ cursor: 'pointer' }}>
        {/* Invisible wider path for easier clicking */}
        <path 
          d={pathData} 
          stroke="transparent" 
          strokeWidth={24} 
          fill="none" 
          style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
          onClick={(e) => { 
            e.stopPropagation()
            setSelectedIds([conn.id]) 
          }}
        />
        {/* Glow effect on hover/select */}
        {(isSelected || isBeingDragged) && (
          <path 
            d={pathData} 
            stroke="#3B82F6" 
            strokeWidth={6} 
            fill="none" 
            strokeLinecap="round" 
            opacity={0.2}
            style={{ pointerEvents: 'none' }}
          />
        )}
        {/* Main path */}
        <path 
          d={pathData} 
          stroke={stroke} 
          strokeWidth={isSelected ? 2.5 : (conn.strokeWidth || 1.5)} 
          fill="none" 
          strokeLinecap="round" 
          style={{ pointerEvents: 'none', transition: 'all 0.15s ease' }}
        />
        {/* Arrow head */}
        {conn.type === 'arrow' && (
          <path 
            d={`M ${to.x} ${to.y} L ${arrowPt1.x} ${arrowPt1.y} L ${arrowPt2.x} ${arrowPt2.y} Z`} 
            fill={stroke} 
            style={{ pointerEvents: 'none' }}
          />
        )}
        {/* Label */}
        {conn.label && (
          <g transform={`translate(${midX}, ${midY})`} style={{ pointerEvents: 'none' }}>
            <rect 
              x={-conn.label.length * 3.5 - 8} 
              y="-12" 
              width={conn.label.length * 7 + 16} 
              height="24" 
              rx="6" 
              fill={darkMode ? '#171717' : 'white'} 
              stroke={darkMode ? '#262626' : '#E2E8F0'} 
            />
            <text 
              x="0" 
              y="5" 
              textAnchor="middle" 
              fontSize={11} 
              fill={darkMode ? '#a3a3a3' : '#64748B'} 
              fontFamily="Inter"
            >
              {conn.label}
            </text>
          </g>
        )}
        {/* Connection handles - always visible when selected */}
        {isSelected && (
          <>
            {/* From handle */}
            <circle 
              cx={from.x} 
              cy={from.y} 
              r={10} 
              fill="transparent"
              style={{ cursor: 'grab', pointerEvents: 'auto' }}
              onMouseDown={(e) => { 
                e.stopPropagation()
                e.preventDefault()
                setConnectionDragHandle({ id: conn.id, handle: 'from' })
                setConnectionPreview(from)
              }} 
            />
            <circle 
              cx={from.x} 
              cy={from.y} 
              r={6} 
              fill="#3B82F6" 
              stroke="white" 
              strokeWidth={2} 
              style={{ pointerEvents: 'none' }}
            />
            {/* To handle */}
            <circle 
              cx={to.x} 
              cy={to.y} 
              r={10} 
              fill="transparent"
              style={{ cursor: 'grab', pointerEvents: 'auto' }}
              onMouseDown={(e) => { 
                e.stopPropagation()
                e.preventDefault()
                setConnectionDragHandle({ id: conn.id, handle: 'to' })
                setConnectionPreview(to)
              }} 
            />
            <circle 
              cx={to.x} 
              cy={to.y} 
              r={6} 
              fill="#3B82F6" 
              stroke="white" 
              strokeWidth={2} 
              style={{ pointerEvents: 'none' }}
            />
            {/* Delete button at midpoint */}
            <g 
              transform={`translate(${midX}, ${midY - 24})`}
              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
              onClick={(e) => { e.stopPropagation(); deleteConnection(conn.id) }}
            >
              <circle r={12} fill="#EF4444" />
              <path d="M -4 -4 L 4 4 M 4 -4 L -4 4" stroke="white" strokeWidth={2} strokeLinecap="round" />
            </g>
          </>
        )}
      </g>
    )
  }

  const renderConnectionPreview = () => {
    if (!connectionPreview) return null
    
    // For new connections
    if (isConnecting && connectionStart) {
      const fromObj = objects.find(o => o.id === connectionStart.objectId)
      if (!fromObj) return null
      const from = getPortPoint(fromObj, connectionStart.port)
      
      // If hovering over a valid target port, snap to it
      let toPoint = connectionPreview
      if (hoveredPort && hoveredPort.objectId !== connectionStart.objectId) {
        const targetObj = objects.find(o => o.id === hoveredPort.objectId)
        if (targetObj) {
          toPoint = getPortPoint(targetObj, hoveredPort.port)
        }
      }
      
      return (
        <g className="pointer-events-none">
          {/* Animated dashed line */}
          <line 
            x1={from.x} 
            y1={from.y} 
            x2={toPoint.x} 
            y2={toPoint.y} 
            stroke="#3B82F6" 
            strokeWidth={2} 
            strokeDasharray="8 4"
            className="animate-dash"
          />
          {/* End point indicator */}
          <circle 
            cx={toPoint.x} 
            cy={toPoint.y} 
            r={hoveredPort ? 8 : 4} 
            fill={hoveredPort ? '#3B82F6' : '#3B82F6'} 
            opacity={hoveredPort ? 0.3 : 0.5}
          />
          {hoveredPort && (
            <circle 
              cx={toPoint.x} 
              cy={toPoint.y} 
              r={5} 
              fill="#3B82F6" 
              stroke="white"
              strokeWidth={2}
            />
          )}
        </g>
      )
    }
    
    // For dragging existing connection endpoints
    if (connectionDragHandle) {
      const conn = connections.find(c => c.id === connectionDragHandle.id)
      if (!conn) return null
      
      const sourceId = connectionDragHandle.handle === 'from' ? conn.to : conn.from
      const sourceObj = objects.find(o => o.id === sourceId)
      if (!sourceObj) return null
      
      const sourcePort = connectionDragHandle.handle === 'from' ? conn.toPort : conn.fromPort
      const from = getPortPoint(sourceObj, sourcePort || 'n')
      
      let toPoint = connectionPreview
      if (hoveredPort) {
        const targetObj = objects.find(o => o.id === hoveredPort.objectId)
        if (targetObj) {
          toPoint = getPortPoint(targetObj, hoveredPort.port)
        }
      }
      
      return (
        <g className="pointer-events-none">
          <line 
            x1={from.x} 
            y1={from.y} 
            x2={toPoint.x} 
            y2={toPoint.y} 
            stroke="#3B82F6" 
            strokeWidth={2} 
            strokeDasharray="8 4"
          />
          <circle 
            cx={toPoint.x} 
            cy={toPoint.y} 
            r={hoveredPort ? 8 : 4} 
            fill="#3B82F6" 
            opacity={hoveredPort ? 0.3 : 0.5}
          />
          {hoveredPort && (
            <circle 
              cx={toPoint.x} 
              cy={toPoint.y} 
              r={5} 
              fill="#3B82F6" 
              stroke="white"
              strokeWidth={2}
            />
          )}
        </g>
      )
    }
    
    return null
  }

  const renderPorts = (obj: CanvasObject) => {
    const showPorts = hoveredObject === obj.id || selectedIds.includes(obj.id) || tool === 'connector' || tool === 'arrow' || isConnecting || connectionDragHandle
    if (!showPorts) return null
    const ports: Port[] = ['n', 'e', 's', 'w']
    return ports.map(port => {
      const point = getPortPoint(obj, port)
      const isHovered = hoveredPort?.objectId === obj.id && hoveredPort?.port === port
      const isValidTarget = (isConnecting && connectionStart?.objectId !== obj.id) || 
                           (connectionDragHandle && connections.find(c => c.id === connectionDragHandle.id)?.[connectionDragHandle.handle === 'from' ? 'to' : 'from'] !== obj.id)
      
      return (
        <g key={`${obj.id}-${port}`}>
          {/* Larger invisible hit area */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r={14} 
            fill="transparent"
            style={{ cursor: 'crosshair', pointerEvents: 'auto' }}
            onMouseDown={(e) => handlePortMouseDown(obj.id, port, e)}
            onMouseEnter={() => {
              if ((isConnecting || connectionDragHandle) && isValidTarget) {
                setHoveredPort({ objectId: obj.id, port })
              }
            }}
            onMouseLeave={() => setHoveredPort(null)}
          />
          {/* Visual port */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r={isHovered ? 8 : 5} 
            fill={isHovered ? '#3B82F6' : 'white'} 
            stroke="#3B82F6" 
            strokeWidth={2}
            style={{ pointerEvents: 'none', transition: 'all 0.15s ease' }}
          />
          {/* Pulse effect when valid target */}
          {isValidTarget && isHovered && (
            <circle 
              cx={point.x} 
              cy={point.y} 
              r={14} 
              fill="none"
              stroke="#3B82F6" 
              strokeWidth={2}
              opacity={0.4}
              style={{ pointerEvents: 'none' }}
            />
          )}
        </g>
      )
    })
  }

  return (
    <div
      ref={canvasRef}
      className={cn(
        'relative h-full w-full overflow-hidden select-none',
        tool === 'hand' && 'cursor-grab',
        isPanning && 'cursor-grabbing',
        tool === 'connector' && 'cursor-crosshair',
        ['rectangle', 'circle', 'diamond', 'text', 'sticky', 'arrow'].includes(tool) && 'cursor-crosshair'
      )}
      style={{ backgroundColor: darkMode ? '#0a0a0a' : '#FAFBFC' }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Dot Grid */}
      {gridEnabled && (
        <svg className="pointer-events-none absolute inset-0 w-full h-full">
          <defs>
            <pattern id="dotGrid" width={gridSize * zoom} height={gridSize * zoom} patternUnits="userSpaceOnUse"
              x={pan.x % (gridSize * zoom)} y={pan.y % (gridSize * zoom)}>
              <circle cx={1} cy={1} r={0.8} fill={darkMode ? '#404040' : '#D1D5DB'} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotGrid)" />
        </svg>
      )}

      {/* SVG Layer for connections */}
      <svg 
        className="absolute inset-0" 
        style={{ 
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
          transformOrigin: '0 0', 
          overflow: 'visible',
          pointerEvents: 'none'
        }}
      >
        <g style={{ pointerEvents: 'auto' }}>
          {connections.map(renderConnection)}
          {renderConnectionPreview()}
          {objects.map(obj => renderPorts(obj))}
        </g>
      </svg>

      {/* Objects Layer - GPU accelerated */}
      <div 
        className="absolute inset-0"
        style={{ 
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, 
          transformOrigin: '0 0',
          willChange: isDragging ? 'transform' : 'auto'
        }}
      >
        {objects.map(obj => (
          <CanvasNode 
            key={obj.id} 
            obj={obj} 
            isSelected={selectedIds.includes(obj.id)} 
            isDragging={isDragging && selectedIds.includes(obj.id)} 
          />
        ))}
        {tempObject && <CanvasNode obj={tempObject} isSelected={true} isDragging={false} isTemp />}
      </div>

      {/* Selection Box */}
      {selectionBox && (
        <div
          className="absolute border-2 border-blue-500 bg-blue-500/10 pointer-events-none rounded"
          style={{
            left: pan.x + Math.min(selectionBox.start.x, selectionBox.end.x) * zoom,
            top: pan.y + Math.min(selectionBox.start.y, selectionBox.end.y) * zoom,
            width: Math.abs(selectionBox.end.x - selectionBox.start.x) * zoom,
            height: Math.abs(selectionBox.end.y - selectionBox.start.y) * zoom,
          }}
        />
      )}

      {/* Selection Handles */}
      {selectedIds.length === 1 && objects.find(o => o.id === selectedIds[0]) && (
        <SelectionHandles object={objects.find(o => o.id === selectedIds[0])!} zoom={zoom} pan={pan} onResize={(updates) => updateObject(selectedIds[0], updates)} />
      )}
    </div>
  )
}

interface SelectionHandlesProps {
  object: CanvasObject
  zoom: number
  pan: Point
  onResize: (updates: Partial<CanvasObject>) => void
}

function SelectionHandles({ object, zoom, pan, onResize }: SelectionHandlesProps) {
  const [resizing, setResizing] = useState<string | null>(null)
  const startRef = useRef<{ x: number; y: number; width: number; height: number; mouseX: number; mouseY: number } | null>(null)

  const handles = [
    { pos: 'nw', cursor: 'nwse-resize', x: 0, y: 0 },
    { pos: 'n', cursor: 'ns-resize', x: 0.5, y: 0 },
    { pos: 'ne', cursor: 'nesw-resize', x: 1, y: 0 },
    { pos: 'e', cursor: 'ew-resize', x: 1, y: 0.5 },
    { pos: 'se', cursor: 'nwse-resize', x: 1, y: 1 },
    { pos: 's', cursor: 'ns-resize', x: 0.5, y: 1 },
    { pos: 'sw', cursor: 'nesw-resize', x: 0, y: 1 },
    { pos: 'w', cursor: 'ew-resize', x: 0, y: 0.5 },
  ]

  useEffect(() => {
    if (!resizing) return
    const handleMouseMove = (e: MouseEvent) => {
      if (!startRef.current) return
      const dx = (e.clientX - startRef.current.mouseX) / zoom
      const dy = (e.clientY - startRef.current.mouseY) / zoom
      let newX = startRef.current.x, newY = startRef.current.y
      let newWidth = startRef.current.width, newHeight = startRef.current.height
      if (resizing.includes('w')) { newX += dx; newWidth -= dx }
      if (resizing.includes('e')) { newWidth += dx }
      if (resizing.includes('n')) { newY += dy; newHeight -= dy }
      if (resizing.includes('s')) { newHeight += dy }
      if (newWidth > 20 && newHeight > 20) onResize({ x: newX, y: newY, width: newWidth, height: newHeight })
    }
    const handleMouseUp = () => { setResizing(null); startRef.current = null }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp) }
  }, [resizing, zoom, onResize])

  return (
    <>
      <div className="absolute border-2 border-blue-500 pointer-events-none rounded-lg" style={{
        left: pan.x + object.x * zoom - 1, top: pan.y + object.y * zoom - 1,
        width: object.width * zoom + 2, height: object.height * zoom + 2,
      }} />
      {handles.map(h => (
        <div key={h.pos} className="absolute w-2.5 h-2.5 bg-white border-2 border-blue-500 rounded-sm z-50 hover:bg-blue-100 transition-colors"
          style={{ left: pan.x + (object.x + object.width * h.x) * zoom - 5, top: pan.y + (object.y + object.height * h.y) * zoom - 5, cursor: h.cursor }}
          onMouseDown={(e) => { e.stopPropagation(); setResizing(h.pos); startRef.current = { x: object.x, y: object.y, width: object.width, height: object.height, mouseX: e.clientX, mouseY: e.clientY } }} />
      ))}
    </>
  )
}
