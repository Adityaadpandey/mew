
'use client'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useApp } from '@/lib/app-context'
import { useTheme } from '@/lib/theme-provider'
import { cn } from '@/lib/utils'
import { FileText, ListTodo, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { DocumentCard } from '../dashboard/document-list'
import { TaskManager } from './task-manager'

interface ProjectViewProps {
  project: {
    id: string
    name: string
    description: string | null
    updatedAt: Date
  }
}

export function ProjectView({ project }: ProjectViewProps) {
  const [activeTab, setActiveTab] = useState('documents')
  const { documents, refreshDocuments, currentWorkspace } = useApp()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const router = useRouter()

  // Filter docs for this project
  const projectDocs = documents.filter(d => d.projectId === project.id)

  const handleCreateDocument = async (type: 'DOCUMENT' | 'DIAGRAM') => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: type === 'DIAGRAM' ? 'Untitled Diagram' : 'Untitled Document',
          type,
          workspaceId: currentWorkspace?.id,
          projectId: project.id
        }),
      })
      if (res.ok) {
        const newDoc = await res.json()
        await refreshDocuments()
        // Optionally navigate or just refresh
      }
    } catch (error) {
      console.error('Failed to create doc', error)
    }
  }

  const handleOpenDocument = (docId: string) => {
    // Navigate to document editor
    // Hypothetical route, or maybe we use query param?
    // Current app uses home page + state.
    // Ideally we should use /documents/[docId] page, but getting EditorView to work there is complex refactor.
    // For now, let's try to set document?
    // Actually, user wants "redesign". Navigating to /documents/[id] is best practice.
    // But I haven't created that route.
    // I'll stick to what DashboardHome did: setCurrentDocument.
    // BUT ProjectView is on a different route (/projects/...).
    // So if I just set state, it won't show the editor unless I redirect to /.
    // OR I reuse EditorView here? No.
    // I will assume /documents/[docId] page route needs to exist or I redirect to /?documentId=...
    // I'll redirect to /?documentId=... for compat first.
    router.push(`/?documentId=${docId}`)
  }

  return (
    <div className={cn("flex h-screen flex-col", isDark ? "bg-black" : "bg-slate-50")}>
      {/* Header */}
      <div className={cn("border-b px-8 py-6", isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-slate-200")}>
        <h1 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>{project.name}</h1>
        {project.description && (
          <p className={cn("mt-1", isDark ? "text-neutral-400" : "text-slate-500")}>{project.description}</p>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="documents" className="h-full flex flex-col">
          <div className={cn("px-8 border-b", isDark ? "border-neutral-800" : "border-slate-200")}>
            <TabsList className={isDark ? "bg-transparent" : "bg-transparent"}>
              <TabsTrigger value="documents" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-blue-500 rounded-none px-4 py-3">
                <FileText className="mr-2 h-4 w-4" />
                Documents ({projectDocs.length})
              </TabsTrigger>
              <TabsTrigger value="tasks" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-blue-500 rounded-none px-4 py-3">
                <ListTodo className="mr-2 h-4 w-4" />
                Tasks
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="documents" className="flex-1 overflow-auto p-8">
            <div className="mb-6 flex justify-end">
                <Button onClick={() => handleCreateDocument('DIAGRAM')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    New Diagram
                </Button>
            </div>

            {projectDocs.length === 0 ? (
                <div className="text-center py-20 opacity-50">No documents in this project</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectDocs.map(doc => (
                    <DocumentCard
                        key={doc.id}
                        document={doc}
                        isDark={isDark}
                        onClick={() => handleOpenDocument(doc.id)}
                        onDuplicate={(e) => {}}
                        onDelete={(e) => {}}
                        onToggleFavorite={(e) => {}}
                    />
                ))}
                </div>
            )}
          </TabsContent>

          <TabsContent value="tasks" className="flex-1 overflow-hidden">
            <TaskManager projectId={project.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
