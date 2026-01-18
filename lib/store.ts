import { create } from 'zustand'

export interface CanvasObject {
  id: string
  type: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'text' | 'line' | 'arrow' | 'sticky' | 'hexagon'
  x: number
  y: number
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
  rotation: number
  opacity: number
  borderRadius?: number
  zIndex: number
  text?: string
  fontSize?: number
  fontFamily?: string
  points?: { x: number; y: number }[]
  isGroup?: boolean
  groupLabel?: string
  groupColor?: string
  // Advanced styling properties
  badge?: string
  badgeColor?: string
  status?: 'active' | 'inactive' | 'warning' | 'error' | 'success'
  glow?: boolean
  pulse?: boolean
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'glow'
  importance?: 'low' | 'normal' | 'high' | 'critical'
  gradient?: boolean
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double'
}

export interface Connection {
  id: string
  from: string
  to: string
  fromPort?: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'
  toPort?: 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw'
  type: 'line' | 'arrow'
  label?: string
  stroke?: string
  strokeWidth?: number
  animated?: boolean
  dashArray?: string
}

interface CanvasState {
  zoom: number
  pan: { x: number; y: number }
  selectedIds: string[]
  objects: CanvasObject[]
  connections: Connection[]
  gridEnabled: boolean
  gridSize: number
  snapToGrid: boolean
  tool: 'select' | 'hand' | 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'line' | 'arrow' | 'text' | 'sticky' | 'connector' | 'hexagon'
  lastModified: number
  setZoom: (zoom: number) => void
  setPan: (pan: { x: number; y: number }) => void
  setSelectedIds: (ids: string[]) => void
  addObject: (obj: CanvasObject) => void
  addConnection: (conn: Connection) => void
  updateObject: (id: string, updates: Partial<CanvasObject>) => void
  updateConnection: (id: string, updates: Partial<Connection>) => void
  deleteObjects: (ids: string[]) => void
  deleteConnection: (id: string) => void
  clearCanvas: () => void
  loadCanvas: (objects: CanvasObject[], connections: Connection[]) => void
  setTool: (tool: CanvasState['tool']) => void
  toggleGrid: () => void
  toggleSnapToGrid: () => void
  // Z-index manipulation
  bringToFront: (ids: string[]) => void
  sendToBack: (ids: string[]) => void
  bringForward: (ids: string[]) => void
  sendBackward: (ids: string[]) => void
  duplicateObjects: (ids: string[]) => string[]
}

import { temporal } from 'zundo'

export const useCanvasStore = create<CanvasState>()(
  temporal(
    (set) => ({
      zoom: 1,
      pan: { x: 0, y: 0 },
      selectedIds: [],
      objects: [],
      connections: [],
      gridEnabled: true,
      gridSize: 20,
      snapToGrid: true,
      tool: 'select',
      lastModified: 0,
      setZoom: (zoom) => set({ zoom }),
      setPan: (pan) => set({ pan }),
      setSelectedIds: (selectedIds) => set({ selectedIds }),
      addObject: (obj) => set((state) => ({ objects: [...state.objects, obj], lastModified: Date.now() })),
      addConnection: (conn) => set((state) => ({ connections: [...state.connections, conn], lastModified: Date.now() })),
      updateObject: (id, updates) =>
        set((state) => ({
          objects: state.objects.map((obj) =>
            obj.id === id ? { ...obj, ...updates } : obj
          ),
          lastModified: Date.now(),
        })),
      updateConnection: (id, updates) =>
        set((state) => ({
          connections: state.connections.map((conn) =>
            conn.id === id ? { ...conn, ...updates } : conn
          ),
          lastModified: Date.now(),
        })),
      deleteObjects: (ids) =>
        set((state) => ({
          objects: state.objects.filter((obj) => !ids.includes(obj.id)),
          connections: state.connections.filter(
            (conn) => !ids.includes(conn.from) && !ids.includes(conn.to)
          ),
          selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
          lastModified: Date.now(),
        })),
      deleteConnection: (id) =>
        set((state) => ({
          connections: state.connections.filter((conn) => conn.id !== id),
          lastModified: Date.now(),
        })),
      clearCanvas: () => set({ objects: [], connections: [], selectedIds: [], lastModified: Date.now() }),
      loadCanvas: (objects, connections) => set({ objects, connections, selectedIds: [], lastModified: 0 }),
      setTool: (tool) => set({ tool }),
      toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),
      toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
      // Z-index manipulation functions
      bringToFront: (ids) =>
        set((state) => {
          const maxZ = Math.max(...state.objects.map(o => o.zIndex), 0)
          return {
            objects: state.objects.map((obj) =>
              ids.includes(obj.id) ? { ...obj, zIndex: maxZ + 1 + ids.indexOf(obj.id) } : obj
            ),
            lastModified: Date.now(),
          }
        }),
      sendToBack: (ids) =>
        set((state) => {
          const minZ = Math.min(...state.objects.map(o => o.zIndex), 0)
          return {
            objects: state.objects.map((obj) =>
              ids.includes(obj.id) ? { ...obj, zIndex: minZ - 1 - ids.indexOf(obj.id) } : obj
            ),
            lastModified: Date.now(),
          }
        }),
      bringForward: (ids) =>
        set((state) => {
          const sorted = [...state.objects].sort((a, b) => a.zIndex - b.zIndex)
          const newObjects = [...state.objects]
          ids.forEach(id => {
            const obj = newObjects.find(o => o.id === id)
            if (!obj) return
            // Find next object above this one
            const above = sorted.find(o => o.zIndex > obj.zIndex && !ids.includes(o.id))
            if (above) {
              const temp = obj.zIndex
              obj.zIndex = above.zIndex
              above.zIndex = temp
            } else {
              obj.zIndex = Math.max(...newObjects.map(o => o.zIndex)) + 1
            }
          })
          return { objects: newObjects, lastModified: Date.now() }
        }),
      sendBackward: (ids) =>
        set((state) => {
          const sorted = [...state.objects].sort((a, b) => b.zIndex - a.zIndex)
          const newObjects = [...state.objects]
          ids.forEach(id => {
            const obj = newObjects.find(o => o.id === id)
            if (!obj) return
            // Find next object below this one
            const below = sorted.find(o => o.zIndex < obj.zIndex && !ids.includes(o.id))
            if (below) {
              const temp = obj.zIndex
              obj.zIndex = below.zIndex
              below.zIndex = temp
            } else {
              obj.zIndex = Math.min(...newObjects.map(o => o.zIndex)) - 1
            }
          })
          return { objects: newObjects, lastModified: Date.now() }
        }),
      duplicateObjects: (ids) => {
        const newIds: string[] = []
        set((state) => {
          const maxZ = Math.max(...state.objects.map(o => o.zIndex), 0)
          const newObjects = [...state.objects]
          ids.forEach((id, i) => {
            const obj = state.objects.find(o => o.id === id)
            if (obj) {
              const newId = `${obj.id}-copy-${Date.now()}-${i}`
              newIds.push(newId)
              newObjects.push({
                ...obj,
                id: newId,
                x: obj.x + 20,
                y: obj.y + 20,
                zIndex: maxZ + 1 + i,
              })
            }
          })
          return { objects: newObjects, selectedIds: newIds, lastModified: Date.now() }
        })
        return newIds
      },
    }),
    {
      partialize: (state) => ({
        objects: state.objects,
        connections: state.connections,
      }),
    }
  )
)

interface SidebarState {
  leftSidebarOpen: boolean
  leftSidebarCollapsed: boolean
  rightSidebarOpen: boolean
  rightSidebarTab: 'comments' | 'history' | 'ai'
  darkMode: boolean
  toggleLeftSidebar: () => void
  toggleLeftSidebarCollapse: () => void
  toggleRightSidebar: () => void
  setRightSidebarTab: (tab: 'comments' | 'history' | 'ai') => void
  toggleDarkMode: () => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  leftSidebarOpen: true,
  leftSidebarCollapsed: false,
  rightSidebarOpen: false,
  rightSidebarTab: 'comments',
  darkMode: false,
  toggleLeftSidebar: () => set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
  toggleLeftSidebarCollapse: () => set((state) => ({ leftSidebarCollapsed: !state.leftSidebarCollapsed })),
  toggleRightSidebar: () => set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
  setRightSidebarTab: (tab) => set({ rightSidebarTab: tab, rightSidebarOpen: true }),
  toggleDarkMode: () => set((state) => {
    const newMode = !state.darkMode
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', newMode)
    }
    return { darkMode: newMode }
  }),
}))

interface DocumentContent {
  blocks?: Array<{
    id: string
    type: string
    content: string
    checked?: boolean
    calloutType?: string
    imageUrl?: string
    language?: string
    color?: string
    bgColor?: string
    collapsed?: boolean
    children?: any[]
    indent?: number
  }>
  coverImage?: string | null
  icon?: string | null
  [key: string]: unknown
}

interface DocumentState {
  currentDocument: {
    id: string
    title: string
    type: 'DOCUMENT' | 'DIAGRAM' | 'CANVAS'
    content: DocumentContent
    updatedAt?: Date
  } | null
  setCurrentDocument: (doc: DocumentState['currentDocument']) => void
  updateTitle: (title: string) => void
  updateContent: (content: DocumentContent) => void
  resetDocument: () => void
}

export const useDocumentStore = create<DocumentState>((set) => ({
  currentDocument: null,
  setCurrentDocument: (currentDocument) => set({ currentDocument }),
  updateTitle: (title) =>
    set((state) => ({
      currentDocument: state.currentDocument
        ? { ...state.currentDocument, title }
        : null,
    })),
  updateContent: (content) =>
    set((state) => {
      if (!state.currentDocument) return state

      return {
        currentDocument: {
          ...state.currentDocument,
          content: { ...state.currentDocument.content, ...content }
        },
      }
    }),
  resetDocument: () => set({ currentDocument: null }),
}))
