import { create } from 'zustand'

export interface CanvasObject {
  id: string
  type: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'text' | 'line' | 'arrow' | 'sticky'
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
}

export interface Connection {
  id: string
  from: string
  to: string
  fromPort?: 'n' | 'e' | 's' | 'w'
  toPort?: 'n' | 'e' | 's' | 'w'
  type: 'line' | 'arrow'
  label?: string
  stroke?: string
  strokeWidth?: number
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
  }>
  [key: string]: unknown
}

interface DocumentState {
  currentDocument: {
    id: string
    title: string
    type: 'DOCUMENT' | 'DIAGRAM' | 'CANVAS'
    content: DocumentContent
  } | null
  isDirty: boolean
  isSaving: boolean
  setCurrentDocument: (doc: DocumentState['currentDocument']) => void
  setIsDirty: (dirty: boolean) => void
  setIsSaving: (saving: boolean) => void
  updateTitle: (title: string) => void
  updateContent: (content: DocumentContent) => void
}

export const useDocumentStore = create<DocumentState>((set) => ({
  currentDocument: null,
  isDirty: false,
  isSaving: false,
  setCurrentDocument: (currentDocument) => set({ currentDocument, isDirty: false }),
  setIsDirty: (isDirty) => set({ isDirty }),
  setIsSaving: (isSaving) => set({ isSaving }),
  updateTitle: (title) =>
    set((state) => ({
      currentDocument: state.currentDocument
        ? { ...state.currentDocument, title }
        : null,
      isDirty: true,
    })),
  updateContent: (content) =>
    set((state) => ({
      currentDocument: state.currentDocument
        ? { ...state.currentDocument, content: { ...state.currentDocument.content, ...content } }
        : null,
      isDirty: true,
    })),
}))
