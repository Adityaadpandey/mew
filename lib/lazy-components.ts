'use client'

import dynamic from 'next/dynamic'
import { ComponentType, Suspense } from 'react'
import { PageLoading, DashboardSkeleton, ProjectSkeleton } from '@/components/ui/loading'

// Dynamic import options
const defaultOptions = {
  ssr: false,
}

// ============================================
// Lazy loaded heavy components
// ============================================

// Diagram Canvas - heavy component with canvas rendering
export const DiagramCanvas = dynamic(
  () => import('@/components/editor/diagram-canvas').then(mod => mod.DiagramCanvas),
  {
    ...defaultOptions,
    loading: () => <PageLoading message="Loading canvas..." />,
  }
)

// Notion Editor - heavy component with rich text editing
export const NotionEditor = dynamic(
  () => import('@/components/editor/notion-editor').then(mod => mod.NotionEditor),
  {
    ...defaultOptions,
    loading: () => <PageLoading message="Loading editor..." />,
  }
)

// Recharts - heavy charting library
export const RechartsComponents = {
  AreaChart: dynamic(() => import('recharts').then(mod => mod.AreaChart), defaultOptions),
  BarChart: dynamic(() => import('recharts').then(mod => mod.BarChart), defaultOptions),
  LineChart: dynamic(() => import('recharts').then(mod => mod.LineChart), defaultOptions),
  PieChart: dynamic(() => import('recharts').then(mod => mod.PieChart), defaultOptions),
}

// AI Diagram Generator
export const AIDiagramGenerator = dynamic(
  () => import('@/components/ai/ai-diagram-generator').then(mod => mod.AIDiagramGenerator),
  {
    ...defaultOptions,
    loading: () => <PageLoading message="Loading AI assistant..." />,
  }
)

// Template Gallery
export const TemplateGallery = dynamic(
  () => import('@/components/template-gallery').then(mod => mod.TemplateGallery),
  {
    ...defaultOptions,
    loading: () => <PageLoading message="Loading templates..." />,
  }
)

// Version History
export const VersionHistory = dynamic(
  () => import('@/components/version-history').then(mod => mod.VersionHistory),
  defaultOptions
)

// Export Dialog
export const ExportDialog = dynamic(
  () => import('@/components/export-dialog').then(mod => mod.ExportDialog),
  defaultOptions
)

// Share Dialog
export const ShareDialog = dynamic(
  () => import('@/components/share-dialog').then(mod => mod.ShareDialog),
  defaultOptions
)

// Kanban Board
export const KanbanBoard = dynamic(
  () => import('@/components/tasks/kanban-board').then(mod => mod.KanbanBoard),
  {
    ...defaultOptions,
    loading: () => <PageLoading message="Loading tasks..." />,
  }
)

// ============================================
// Helper function for lazy loading with suspense
// ============================================

interface LazyComponentOptions {
  fallback?: React.ReactNode
  ssr?: boolean
}

export function lazyLoad<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T } | T>,
  options: LazyComponentOptions = {}
) {
  const { fallback = <PageLoading />, ssr = false } = options

  const LazyComponent = dynamic(
    async () => {
      const mod = await importFn()
      return 'default' in mod ? mod : { default: mod as T }
    },
    { ssr, loading: () => <>{fallback}</> }
  )

  return LazyComponent
}

// ============================================
// Preload utilities for critical paths
// ============================================

// Preload a dynamic component
export function preloadComponent(importFn: () => Promise<unknown>) {
  if (typeof window !== 'undefined') {
    importFn()
  }
}

// Preload commonly used components on app load
export function preloadCriticalComponents() {
  if (typeof window !== 'undefined') {
    // Preload after initial render
    requestIdleCallback(() => {
      // Preload editor components after a delay
      setTimeout(() => {
        import('@/components/editor/notion-editor')
        import('@/components/editor/diagram-canvas')
      }, 2000)
    })
  }
}

// RequestIdleCallback polyfill
if (typeof window !== 'undefined' && !window.requestIdleCallback) {
  (window as any).requestIdleCallback = (cb: () => void) => setTimeout(cb, 1)
}
